"""Provision and stop a fresh, pinned, local-only WordPress upgrade/rollback lab."""

import argparse
import hashlib
import importlib.util
import ipaddress
import json
import os
from pathlib import Path, PurePosixPath
import re
import secrets
import shutil
import socket
import stat
import subprocess
import time
import urllib.request
import zipfile

SOURCE = Path(__file__).resolve().parent
ROOT = SOURCE.parents[2]
LOCK = json.loads((SOURCE / 'lock.json').read_text())


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')


def extract(archive, destination, prefix):
    """Extract only regular entries under one expected top-level directory."""
    with zipfile.ZipFile(archive) as handle:
        seen = set()
        for entry in handle.infolist():
            name = PurePosixPath(entry.filename)
            if (name.is_absolute() or '..' in name.parts or '\\' in entry.filename or
                    not name.parts or name.parts[0] != prefix or name in seen or
                    stat.S_ISLNK(entry.external_attr >> 16) or entry.flag_bits & 1):
                raise ValueError(f'Unsafe ZIP entry: {entry.filename}')
            seen.add(name)
            target = destination.joinpath(*name.parts[1:])
            if entry.is_dir():
                target.mkdir(parents=True, exist_ok=True)
            else:
                if target.exists():
                    raise ValueError(f'Refusing to overwrite ZIP entry: {target}')
                target.parent.mkdir(parents=True, exist_ok=True)
                with target.open('xb') as output:
                    output.write(handle.read(entry))


def package_files(archive):
    with zipfile.ZipFile(archive) as handle:
        return {str(PurePosixPath(entry.filename).relative_to('simple-digital-clock')):
                hashlib.sha256(handle.read(entry)).hexdigest()
                for entry in handle.infolist() if not entry.is_dir()}


def checker_findings(process):
    if process.returncode:
        raise ValueError('Plugin Check failed; inspect its original stdout/stderr')
    # Pinned PCP 2.1.0 prints this exact message instead of JSON for zero findings.
    if process.stdout.strip() == 'Success: Checks complete. No errors found.':
        return []
    findings = json.loads(process.stdout)
    if not isinstance(findings, list) or any(not isinstance(row, dict) or str(row.get('type', '')).lower() not in ['error', 'warning'] for row in findings):
        raise ValueError('Unexpected Plugin Check finding schema')
    return findings


def free_subnet(configurations):
    used = [ipaddress.ip_network(row['Subnet']) for rows in configurations
            for row in rows if row.get('Subnet')]
    for index in range(200, 251):
        candidate = ipaddress.ip_network(f'10.253.{index}.0/24')
        if all(network.version != candidate.version or not network.overlaps(candidate) for network in used):
            return str(candidate)
    raise ValueError('No unused lab subnet; inspect Docker networks without deleting historical labs')


class Lab:
    def __init__(self, run_id):
        if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,47}', run_id):
            raise ValueError('Run ID must contain 1-48 lowercase letters, digits or hyphens')
        self.directory = ROOT / '.local/wordpress-repro' / run_id
        self.project = 'sdcw-repro-' + run_id
        self.compose = ['docker', 'compose', '--project-name', self.project,
                        '--file', str(self.directory / 'compose.json')]
        self.started = time.monotonic()
        self.sequence = 0

    def progress(self, step, message):
        elapsed = time.monotonic() - self.started
        rate = step / max(elapsed, .001)
        eta = (6 - step) / rate if step else 0
        print(f'[{step}/6] {step / 6:.0%} {message}; elapsed={elapsed:.1f}s; '
              f'rate={rate:.2f} steps/s; ETA={eta:.1f}s', flush=True)

    def command(self, label, args, check=True):
        self.sequence = 1 + max([self.sequence] + [int(p.name.split('-')[0])
            for p in (self.directory / 'logs').glob('*.json')])
        process = subprocess.run(args, capture_output=True, text=True, timeout=600)
        # Credentials are supplied through mounted files, never command arguments.
        write_json(self.directory / 'logs' / f'{self.sequence:03}-{label}.json',
                   {'command': args, 'exit_code': process.returncode,
                    'stdout': process.stdout, 'stderr': process.stderr})
        print(f'  {label}: exit={process.returncode}', flush=True)
        if check and process.returncode:
            raise RuntimeError(f'{label} failed; inspect logs in {self.directory}')
        return process

    def wp(self, site, *args, check=True):
        return self.command(site + '-' + '-'.join(args[:2]).replace('/', '_'),
                            self.compose + ['exec', '-T', site, 'php', '/lab/downloads/wp-cli.phar',
                                            *args, '--allow-root', '--path=/var/www/html'], check)

    def stop(self):
        self.command('stop', self.compose + ['stop', '--timeout', '20'])
        running = self.command('verify-stopped', self.compose + ['ps', '--status', 'running', '-q']).stdout.strip()
        if running:
            raise RuntimeError('Owned containers are still running after stop')

    def snapshot(self, site, stage):
        row = json.loads(self.wp(site, 'eval-file', '/lab/harness/site.php', 'snapshot').stdout)
        write_json(self.directory / f'{site}-{stage}.json', row)
        return row

    def download(self, name, expected, cache):
        path = self.directory / 'downloads' / name
        cached = cache / name if cache else None
        if cached and cached.is_file():
            shutil.copyfile(cached, path)
        else:
            request = urllib.request.Request(expected['url'], headers={
                'User-Agent': 'SDCW-reproducible-local-lab/1 (pinned official downloads)'})
            with urllib.request.urlopen(request, timeout=60) as response, path.open('xb') as output:
                remaining = expected['bytes'] + 1
                while remaining:
                    chunk = response.read(min(1024 * 1024, remaining))
                    if not chunk:
                        break
                    output.write(chunk)
                    remaining -= len(chunk)
        if path.stat().st_size != expected['bytes'] or digest(path) != expected['sha256']:
            raise ValueError(f'Pinned download mismatch: {name}; refusing to execute it')
        print(f'  verified {name}: {path.stat().st_size} bytes', flush=True)

    def prepare(self, candidate, cache):
        if self.directory.exists():
            raise ValueError('Run directory already exists; use a fresh ID. Evidence is never overwritten.')
        spec = importlib.util.spec_from_file_location('verify_package', SOURCE.parent / 'verify-package.py')
        verifier = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(verifier)
        verifier.verify(candidate, False)
        self.directory.mkdir(parents=True, mode=0o700)
        for name in ['downloads', 'logs', 'lab', 'backups']:
            (self.directory / name).mkdir()
        shutil.copytree(SOURCE, self.directory / 'harness', ignore=shutil.ignore_patterns('__pycache__'))
        write_json(self.directory / 'lock.json', LOCK)
        shutil.copyfile(ROOT / 'docs/releases/1.1.4/manifest.json', self.directory / 'manifest.json')
        shutil.copyfile(candidate, self.directory / 'downloads/candidate.zip')
        for name, expected in LOCK['downloads'].items():
            self.download(name, expected, cache)
        credentials = {role: secrets.token_urlsafe(24) for role in ['admin', 'editor', 'author']}
        credentials_path = self.directory / 'credentials.json'
        with open(credentials_path, 'x', opener=lambda path, flags: os.open(path, flags, 0o600)) as output:
            json.dump(credentials, output)
        password = secrets.token_hex(24)
        write_json(self.directory / 'input-identity.json', {
            'source_commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
            'candidate_sha256': digest(candidate),
            'harness_sha256': {p.name: digest(p) for p in SOURCE.iterdir() if p.is_file()},
            'public_update_offer_tested': False})
        (self.directory / 'init.sql').write_text('CREATE DATABASE minimum;\nCREATE DATABASE current;\n')
        services = {'db': {'image': LOCK['images']['db'], 'environment': {'MARIADB_ROOT_PASSWORD': password},
                          'volumes': [f'{self.directory}/lab/db:/var/lib/mysql',
                                      f'{self.directory}/init.sql:/docker-entrypoint-initdb.d/clock.sql:ro'],
                          'healthcheck': {'test': ['CMD', 'healthcheck.sh', '--connect', '--innodb_initialized'],
                                          'interval': '2s', 'timeout': '3s', 'retries': 30},
                          'networks': ['lab'], 'restart': 'no'}}
        sites = {}
        sockets = []
        try:
            for name, archive in [('minimum', 'wordpress-minimum.zip'), ('current', 'wordpress-current.zip')]:
                listener = socket.socket()
                listener.bind(('127.0.0.1', 0))
                sockets.append(listener)
                port = listener.getsockname()[1]
                directory = self.directory / 'lab' / name
                directory.mkdir()
                extract(self.directory / 'downloads' / archive, directory, 'wordpress')
                url = f'http://127.0.0.1:{port}'
                config = "<?php\n"
                for key, value in {'DB_NAME': name, 'DB_USER': 'root', 'DB_PASSWORD': password,
                                   'DB_HOST': 'db', 'DB_CHARSET': 'utf8mb4', 'WP_HOME': url,
                                   'WP_SITEURL': url, 'WP_ENVIRONMENT_TYPE': 'local', 'FS_METHOD': 'direct'}.items():
                    config += f"define('{key}', '{value}');\n"
                for key in ['AUTH_KEY', 'SECURE_AUTH_KEY', 'LOGGED_IN_KEY', 'NONCE_KEY',
                            'AUTH_SALT', 'SECURE_AUTH_SALT', 'LOGGED_IN_SALT', 'NONCE_SALT']:
                    config += f"define('{key}', '{secrets.token_hex(32)}');\n"
                config += "define('WP_DEBUG', true);\ndefine('WP_DEBUG_LOG', true);\ndefine('WP_DEBUG_DISPLAY', false);\n"
                config += "define('WP_HTTP_BLOCK_EXTERNAL', true);\ndefine('AUTOMATIC_UPDATER_DISABLED', true);\n"
                config += "define('WP_AUTO_UPDATE_CORE', false);\ndefine('DISABLE_WP_CRON', true);\n"
                config += "$table_prefix = 'wp_';\nif (!defined('ABSPATH')) { define('ABSPATH', __DIR__ . '/'); }\nrequire ABSPATH . 'wp-settings.php';\n"
                (directory / 'wp-config.php').write_text(config)
                service = {'depends_on': ['db'], 'ports': [f'127.0.0.1:{port}:80'],
                           'volumes': [f'{directory}:/var/www/html', f'{self.directory}:/lab:ro'],
                           'networks': ['lab'], 'restart': 'no'}
                if name == 'minimum':
                    service['build'] = {'context': str(self.directory / 'harness'),
                                        'args': {'PHP_IMAGE': LOCK['images']['php70']}}
                else:
                    service['image'] = LOCK['images']['current']
                services[name] = service
                sites[name] = {'url': url, 'directory': str(directory)}
            ids = self.command('network-list', ['docker', 'network', 'ls', '-q']).stdout.split()
            configurations = []
            if ids:
                output = self.command('network-subnets', ['docker', 'network', 'inspect', '--format', '{{json .IPAM.Config}}', *ids]).stdout
                configurations = [json.loads(line) or [] for line in output.splitlines()]
            subnet = free_subnet(configurations)
            print(f'  dedicated bridge subnet: {subnet}', flush=True)
            write_json(self.directory / 'sites.json', sites)
            write_json(self.directory / 'compose.json', {'name': self.project, 'services': services,
                'networks': {'lab': {'ipam': {'config': [{'subnet': subnet}]}}}})
        finally:
            for listener in sockets:
                listener.close()
        return sites

    def run(self, candidate, cache):
        self.progress(0, 'Verify inputs and provision a fresh directory')
        sites = self.prepare(candidate, cache)
        summary = {'passed': False, 'run_id': self.project, 'sites': [], 'publication_performed': False}
        try:
            self.progress(1, 'Start only this isolated Compose project')
            self.command('up', self.compose + ['up', '-d', '--build'])
            ready = False
            for _ in range(60):
                probe = self.command('database-ready', self.compose + ['exec', '-T', 'db',
                    'healthcheck.sh', '--connect', '--innodb_initialized'], check=False)
                if probe.returncode == 0:
                    ready = True
                    break
                time.sleep(1)
            if not ready:
                raise RuntimeError('Database readiness timed out')
            for name, site in sites.items():
                for attempt in range(30):
                    try:
                        with socket.create_connection(('127.0.0.1', int(site['url'].rsplit(':', 1)[1])), timeout=2):
                            break
                    except OSError:
                        if attempt == 29:
                            raise RuntimeError(f'{name}: loopback port was not published; inspect Docker networking')
                        time.sleep(1)
            self.progress(2, 'Install pinned Core and the public predecessor; seed new fixtures')
            for name in sites:
                self.command(name + '-core-install', self.compose + ['exec', '-T', name, 'php', '/lab/harness/install.php'])
                self.wp(name, 'plugin', 'install', '/lab/downloads/predecessor.zip', '--activate')
                self.wp(name, 'eval-file', '/lab/harness/site.php', 'seed')
                initial = self.snapshot(name, 'predecessor')
                expected_core = LOCK['versions']['minimum_core' if name == 'minimum' else 'current_core']
                if initial['wordpress'] != expected_core or initial['version'] != LOCK['versions']['predecessor']:
                    raise ValueError('Unexpected initial Core or plugin version')
                if initial['files'] != package_files(self.directory / 'downloads/predecessor.zip'):
                    raise ValueError('Installed predecessor files differ')
            self.progress(3, 'Run Core update, physical rollback and Core reupdate sequentially')
            for name in sites:
                for phase in ['update', 'rollback', 'reupdate']:
                    before = self.snapshot(name, phase + '-before')
                    archive = self.directory / 'downloads' / ('predecessor.zip' if phase == 'rollback' else 'candidate.zip')
                    if phase == 'rollback':
                        plugin = self.directory / 'lab' / name / 'wp-content/plugins/simple-digital-clock'
                        plugin.rename(self.directory / 'backups' / (name + '-candidate'))
                        extract(archive, plugin, 'simple-digital-clock')
                    else:
                        self.wp(name, 'eval-file', '/lab/harness/site.php', 'update')
                    after = self.snapshot(name, phase + '-after')
                    checks = {'posts_unchanged': before['posts_sha256'] == after['posts_sha256'],
                              'options_unchanged': before['options_sha256'] == after['options_sha256'],
                              'all_installed_files_match': after['files'] == package_files(archive),
                              'version_matches': after['version'] == LOCK['versions']['predecessor' if phase == 'rollback' else 'candidate'],
                              'active': after['active']}
                    summary['sites'].append({'site': name, 'phase': phase, **checks})
                    write_json(self.directory / 'summary.json', summary)
                    if not all(checks.values()):
                        raise ValueError(f'{name} {phase} failed: {checks}')
                self.wp(name, 'eval-file', '/lab/harness/site.php', 'save')
            self.progress(4, 'Run pinned Plugin Check on its supported current PHP runtime')
            summary['plugin_check'] = {'minimum': {'executed': False, 'reason': 'Plugin Check 2.1.0 requires PHP >=7.4; plugin compatibility is tested separately on real PHP 7.0.33'}}
            for name in ['current']:
                self.wp(name, 'plugin', 'install', '/lab/downloads/plugin-check.zip', '--activate')
                result = self.wp(name, 'plugin', 'check', 'simple-digital-clock',
                    '--format=strict-json', '--fields=file,line,column,type,code,message,docs', '--mode=update',
                    '--include-low-severity-errors', '--include-low-severity-warnings',
                    '--require=/var/www/html/wp-content/plugins/plugin-check/cli.php',
                    '--require=/lab/harness/checker.php', check=False)
                # A zero CLI exit code alone is insufficient: inspect every severity.
                findings = checker_findings(result)
                write_json(self.directory / f'{name}-plugin-check.json', findings)
                if result.returncode or not isinstance(findings, list) or any(str(row.get('type', '')).lower() == 'error' for row in findings):
                    raise ValueError(f'{name}: Plugin Check errors; inspect raw output')
                selection = [json.loads(line.split(' ', 1)[1]) for line in result.stderr.splitlines()
                             if line.startswith('SDCW_CHECK_SELECTION ')]
                if len(selection) != 1 or not selection[0]['static'] or not selection[0]['runtime']:
                    raise ValueError('Plugin Check must execute both real static and runtime checks')
                summary['plugin_check'][name] = {'executed': True, 'errors': 0, 'findings': len(findings),
                                                'selection': selection[0]}
            self.progress(5, 'Record runtime identities and preserve all evidence')
            self.command('browser-smoke', ['node', str(self.directory / 'harness/smoke.mjs'), str(self.directory)])
            summary['browser_smoke'] = json.loads((self.directory / 'browser-smoke.json').read_text())
            self.command('container-identities', self.compose + ['ps', '--all', '--format', 'json'])
            summary['passed'] = True
        except Exception as error:
            summary['error'] = str(error)
            raise
        finally:
            try:
                self.stop()
                summary['stopped'] = True
            except Exception as error:
                summary['passed'] = False
                summary['stop_error'] = str(error)
                raise
            finally:
                write_json(self.directory / 'summary.json', summary)
                self.progress(6, f'passed={summary["passed"]}; transitions={len(summary["sites"])}; output={self.directory}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['run', 'stop', 'status'])
    parser.add_argument('--id', required=True, help='Fresh lowercase run ID; never reuse a previous ID')
    parser.add_argument('--candidate', type=Path, help='Exact accepted release ZIP (required for run)')
    parser.add_argument('--cache', type=Path, help='Optional folder of pinned downloads; every file is verified')
    options = parser.parse_args()
    lab = Lab(options.id)
    if options.mode == 'run':
        if not options.candidate:
            parser.error('--candidate is required for run')
        lab.run(options.candidate.resolve(), options.cache.resolve() if options.cache else None)
    else:
        if not (lab.directory / 'compose.json').is_file():
            parser.error('No provisioned lab exists for this ID')
        if options.mode == 'stop':
            lab.stop()
        else:
            lab.command('status', lab.compose + ['ps', '--all'])


if __name__ == '__main__':
    main()
