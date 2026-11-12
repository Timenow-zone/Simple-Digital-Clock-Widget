"""Prepare and operate a fresh, exact-artifact WordPress acceptance lab.

This provisions evidence-producing infrastructure; it does not assert that the
acceptance matrix passed. Historical pinned runners are intentionally independent.
"""

import argparse
import hashlib
import ipaddress
import json
from pathlib import Path, PurePosixPath
import re
import secrets
import shutil
import socket
import stat
import subprocess
import time
import zipfile

SOURCE = Path(__file__).resolve().parent
ROOT = SOURCE.parents[2]
LOCK = json.loads((SOURCE / 'lock.json').read_text())
SLUG = 'simple-digital-clock'
SITES = ('minimum', 'current')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, value):
    with path.open('x', encoding='utf-8') as handle:
        json.dump(value, handle, indent=2, ensure_ascii=False)
        handle.write('\n')


def archive_files(path, prefix):
    """Validate the complete archive before returning any extraction payload."""
    result = {}
    names = set()
    with zipfile.ZipFile(path) as archive:
        for entry in archive.infolist():
            name = entry.filename
            parts = PurePosixPath(name).parts
            mode = entry.external_attr >> 16
            if (name in names or '\\' in name or name.startswith('/') or
                    not parts or parts[0] != prefix or '..' in parts or
                    stat.S_ISLNK(mode) or entry.flag_bits & 1):
                raise ValueError('Unsafe ZIP entry: ' + name)
            names.add(name)
            if entry.is_dir():
                continue
            relative = '/'.join(parts[1:])
            if not relative or (prefix == SLUG and any(part.startswith('.') for part in parts[1:])):
                raise ValueError('Hidden or invalid ZIP entry: ' + name)
            if stat.S_IFMT(mode) not in (0, stat.S_IFREG):
                raise ValueError('Non-regular ZIP entry: ' + name)
            result[relative] = archive.read(entry)
    if not result:
        raise ValueError('Empty archive')
    return result


def verify_candidate(archive, manifest_path, expected_sha):
    if not re.fullmatch(r'[a-f0-9]{64}', expected_sha):
        raise ValueError('A full lowercase SHA-256 is required')
    manifest = json.loads(manifest_path.read_text())
    if digest(archive) != expected_sha or manifest['archive_sha256'] != expected_sha:
        raise ValueError('Candidate archive / expected SHA / frozen manifest disagree')
    files = archive_files(archive, SLUG)
    actual = {name: hashlib.sha256(data).hexdigest() for name, data in files.items()}
    if actual != manifest['files'] or manifest['file_count'] != len(actual):
        raise ValueError('Candidate file allowlist or hashes differ from frozen manifest')
    with zipfile.ZipFile(archive) as handle:
        if any(entry.is_dir() for entry in handle.infolist()):
            raise ValueError('Candidate ZIP must contain regular files only')
    if archive.stat().st_size != manifest['archive_bytes']:
        raise ValueError('Candidate archive size differs from manifest')
    header = re.search(rb'^Version:\s*(\d+\.\d+\.\d+)\s*$', files['widget_init.php'], re.M)
    if not header or header.group(1).decode() != manifest['version']:
        raise ValueError('Candidate plugin header differs from manifest')
    return manifest


def extract_new(archive, target, prefix):
    files = archive_files(archive, prefix)
    if target.exists():
        raise ValueError('Extraction target must be new: ' + str(target))
    target.mkdir(parents=True)
    for name, data in files.items():
        output = target / name
        output.parent.mkdir(parents=True, exist_ok=True)
        with output.open('xb') as handle:
            handle.write(data)
        output.chmod(0o644)


def validate_directory(path):
    absolute = path.absolute()
    if absolute != absolute.resolve() or absolute.parent != ROOT / '.local':
        raise ValueError('Run directory must be a direct, non-symlink child of repository .local')
    if not re.fullmatch(r'candidate-[a-z0-9][a-z0-9-]{1,70}', absolute.name):
        raise ValueError('Run directory requires a unique candidate-* name')
    return absolute


def validate_project(project):
    if not re.fullmatch(r'sdcw-candidate-[a-z0-9][a-z0-9-]{1,48}', project):
        raise ValueError('Project requires a unique sdcw-candidate-* name')


def check_ports(ports):
    if len(set(ports)) != len(ports) or any(port < 1024 or port > 65535 for port in ports):
        raise ValueError('Distinct unprivileged TCP ports are required')
    for port in ports:
        with socket.socket() as listener:
            listener.bind(('127.0.0.1', port))


def prepare(args):
    directory = validate_directory(args.run_dir)
    validate_project(args.project)
    if directory.exists():
        raise ValueError('Refusing to prepare over an existing run')
    manifest = verify_candidate(args.zip, args.manifest, args.sha256)
    check_ports((args.minimum_port, args.current_port))
    sources = {'candidate.zip': args.zip, 'manifest.json': args.manifest}
    identity = {}
    for name, pin in LOCK['downloads'].items():
        source = args.cache / name
        if not source.is_file() or digest(source) != pin['sha256'] or source.stat().st_size != pin['bytes']:
            raise ValueError('Missing or mismatched pinned input: ' + str(source))
        sources[name] = source
        identity[name] = pin
    directory.mkdir()
    for child in ('inputs', 'evidence', 'backups', 'lab'):
        (directory / child).mkdir()
    for name, source in sources.items():
        shutil.copyfile(source, directory / 'inputs' / name)
        (directory / 'inputs' / name).chmod(0o444)
    shutil.copytree(SOURCE, directory / 'harness', ignore=shutil.ignore_patterns('__pycache__'))
    credentials = {name: secrets.token_hex(24) for name in ('admin', 'author', 'db')}
    write_json(directory / 'lab/credentials.json', credentials)
    (directory / 'lab/credentials.json').chmod(0o600)
    (directory / 'lab/init.sql').write_text('CREATE DATABASE minimum;\nCREATE DATABASE current;\n')
    services = {'db': {
        'image': LOCK['images']['db'], 'environment': {'MARIADB_ROOT_PASSWORD': credentials['db']},
        'volumes': [str(directory / 'lab/data/db') + ':/var/lib/mysql', str(directory / 'lab/init.sql') + ':/docker-entrypoint-initdb.d/lab.sql:ro'],
        'restart': 'no', 'read_only': True,
        'tmpfs': ['/tmp:rw,size=128m', '/run/mysqld:rw,size=32m,mode=1777'],
        'healthcheck': {'test': ['CMD', 'healthcheck.sh', '--connect', '--innodb_initialized'], 'interval': '2s', 'timeout': '3s', 'retries': 30},
    }}
    sites = {}
    for site, port in zip(SITES, (args.minimum_port, args.current_port)):
        target = directory / 'lab/data' / site
        extract_new(directory / 'inputs' / ('wordpress-' + site + '.zip'), target, 'wordpress')
        values = {'DB_NAME': site, 'DB_USER': 'root', 'DB_PASSWORD': credentials['db'], 'DB_HOST': 'db', 'DB_CHARSET': 'utf8mb4', 'DB_COLLATE': '', 'WP_HOME': f'http://127.0.0.1:{port}', 'WP_SITEURL': f'http://127.0.0.1:{port}', 'WP_ENVIRONMENT_TYPE': 'local', 'FS_METHOD': 'direct', 'SDCW_CANDIDATE_PROJECT': args.project}
        config = '<?php\n' + ''.join("define('%s', '%s');\n" % (key, value) for key, value in values.items())
        flags = {'WP_DEBUG': True, 'WP_DEBUG_LOG': True, 'WP_DEBUG_DISPLAY': False, 'WP_HTTP_BLOCK_EXTERNAL': True, 'DISABLE_WP_CRON': True, 'AUTOMATIC_UPDATER_DISABLED': True, 'WP_AUTO_UPDATE_CORE': False}
        config += ''.join("define('%s', %s);\n" % (key, str(value).lower()) for key, value in flags.items())
        config += "$table_prefix = 'wp_';\nif (!defined('ABSPATH')) { define('ABSPATH', __DIR__ . '/'); }\nrequire_once ABSPATH . 'wp-settings.php';\n"
        (target / 'wp-config.php').write_text(config)
        services[site] = {'image': LOCK['images'][site], 'depends_on': ['db'], 'ports': [f'127.0.0.1:{port}:80'], 'volumes': [str(target) + ':/var/www/html', str(directory) + ':/audit:ro'], 'restart': 'no', 'read_only': True, 'tmpfs': ['/tmp:rw,size=128m', '/run:rw,size=32m']}
        sites[site] = {'url': f'http://127.0.0.1:{port}', 'core': LOCK['versions'][site + '_core'], 'php': LOCK['versions'][site + '_php'], 'port': port}
    for service in services.values():
        service['labels'] = {'org.timenow.sdcw.candidate-run': str(directory)}
    # Current Core no longer ships a classic theme. Reuse the exact classic
    # theme bundled in the separately hash-verified minimum Core archive.
    classic = directory / 'lab/data/minimum/wp-content/themes/twentytwentyone'
    current_classic = directory / 'lab/data/current/wp-content/themes/twentytwentyone'
    if classic.is_dir() and not current_classic.exists():
        shutil.copytree(classic, current_classic)
    compose = {'name': args.project, 'services': services}
    write_json(directory / 'lab/compose.json', compose)
    (directory / 'lab/compose.json').chmod(0o600)
    receipt = {'schema': 1, 'run_dir': str(directory), 'project': args.project, 'archive_sha256': args.sha256, 'manifest_sha256': digest(directory / 'inputs/manifest.json'), 'compose_sha256': digest(directory / 'lab/compose.json'), 'version': manifest['version'], 'sites': sites, 'inputs': identity, 'matrix_status': 'NOT_RUN', 'publication_performed': False}
    write_json(directory / 'run.json', receipt)
    print(json.dumps({'prepared': True, 'services_started': False, 'output': str(directory), 'sites': sites, 'candidate_sha256': args.sha256}, indent=2))


class Lab:
    def __init__(self, directory):
        self.directory = validate_directory(directory)
        self.receipt = json.loads((self.directory / 'run.json').read_text())
        validate_project(self.receipt['project'])
        if self.receipt['run_dir'] != str(self.directory):
            raise ValueError('Run identity mismatch')
        for name, expected in [('inputs/manifest.json', self.receipt['manifest_sha256']), ('lab/compose.json', self.receipt['compose_sha256'])]:
            if digest(self.directory / name) != expected:
                raise ValueError('Frozen run configuration changed: ' + name)
        for name, pin in self.receipt['inputs'].items():
            path = self.directory / 'inputs' / name
            if path.stat().st_size != pin['bytes'] or digest(path) != pin['sha256']:
                raise ValueError('Frozen input changed: ' + name)
        verify_candidate(self.directory / 'inputs/candidate.zip', self.directory / 'inputs/manifest.json', self.receipt['archive_sha256'])
        self.compose = ['docker', 'compose', '--project-name', self.receipt['project'], '--file', str(self.directory / 'lab/compose.json')]

    def command(self, label, command, check=True, timeout=180):
        if not re.fullmatch(r'[a-z0-9][a-z0-9-]{1,100}', label):
            raise ValueError('A fresh safe evidence label is required')
        output = self.directory / 'evidence' / (label + '.json')
        if output.exists():
            raise ValueError('Refusing to overwrite evidence: ' + str(output))
        started = time.monotonic()
        try:
            result = subprocess.run(command, text=True, capture_output=True, timeout=timeout)
        except subprocess.TimeoutExpired as error:
            def decode(value):
                return value.decode('utf-8', errors='replace') if isinstance(value, bytes) else value
            write_json(output, {'command': command, 'exit': None, 'timeout_seconds': timeout, 'stdout': decode(error.stdout), 'stderr': decode(error.stderr), 'seconds': round(time.monotonic() - started, 3)})
            raise RuntimeError('Command timed out; inspect ' + str(output)) from error
        write_json(output, {'command': command, 'exit': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr, 'seconds': round(time.monotonic() - started, 3)})
        print(f'{label}: exit={result.returncode} elapsed={time.monotonic() - started:.1f}s evidence={output}', flush=True)
        if check and result.returncode:
            raise RuntimeError('Command failed; inspect ' + str(output))
        return result

    def wp(self, site, label, *arguments):
        if site not in SITES:
            raise ValueError('Unknown site')
        # Plugin Check inspects argv before WP-CLI parses global flags.
        return self.command(label, self.compose + ['exec', '-T', site, 'php', '/audit/inputs/wp-cli.phar', *arguments, '--allow-root', '--path=/var/www/html'])

    def snapshot(self, site, label):
        return json.loads(self.wp(site, label, 'eval-file', '/audit/harness/snapshot.php').stdout)

    def assert_owned(self):
        result = self.command('ownership-' + secrets.token_hex(4), ['docker', 'ps', '-aq', '--filter', 'label=com.docker.compose.project=' + self.receipt['project']])
        ids = result.stdout.split()
        if ids:
            inspected = self.command('ownership-inspect-' + secrets.token_hex(4), ['docker', 'inspect', '--format', '{{json .Config.Labels}}', *ids])
            for line in inspected.stdout.splitlines():
                if json.loads(line).get('org.timenow.sdcw.candidate-run') != str(self.directory):
                    raise ValueError('Refusing to operate on another run\'s project')
        return ids

    def start(self):
        if self.assert_owned():
            raise ValueError('Start requires a never-started project; existing evidence is retained')
        check_ports([site['port'] for site in self.receipt['sites'].values()])
        attempt_label = 'start-' + secrets.token_hex(4)
        # Docker's address pool can be exhausted by retained labs. Pick a subnet
        # only after inspecting all networks, without removing any of them.
        networks = self.command(attempt_label + '-network-list', ['docker', 'network', 'ls', '-q']).stdout.split()
        if networks:
            configs = json.loads(self.command(attempt_label + '-network-inspect', ['docker', 'network', 'inspect', *networks]).stdout)
            occupied = [ipaddress.ip_network(c['Subnet']) for n in configs for c in (n.get('IPAM', {}).get('Config') or []) if c.get('Subnet')]
        else:
            occupied = []
        subnet = next((str(ipaddress.ip_network(f'10.239.{i}.0/24')) for i in range(201, 255) if not any(ipaddress.ip_network(f'10.239.{i}.0/24').overlaps(n) for n in occupied if n.version == 4)), None)
        if subnet is None:
            raise RuntimeError('No unused lab subnet is available')
        override = self.directory / 'lab' / (attempt_label + '-network.json')
        write_json(override, {'networks': {'default': {'ipam': {'config': [{'subnet': subnet}]}}}})
        self.command(attempt_label + '-compose', self.compose + ['--file', str(override), 'up', '-d', '--pull', 'never'])
        for attempt in range(60):
            ready = self.command(f'database-ready-{attempt:02}', self.compose + ['exec', '-T', 'db', 'healthcheck.sh', '--connect', '--innodb_initialized'], check=False)
            if ready.returncode == 0:
                break
            time.sleep(1)
        else:
            raise RuntimeError('Database did not become ready')
        for index, site in enumerate(SITES, 1):
            self.command(site + '-install-core', self.compose + ['exec', '-T', site, 'php', '/audit/harness/install.php'])
            self.wp(site, site + '-install-public112', 'plugin', 'install', '/audit/inputs/public-1.1.2.zip', '--activate')
            self.wp(site, site + '-timezone', 'option', 'update', 'timezone_string', 'Europe/Kyiv')
            self.wp(site, site + '-permalinks', 'option', 'update', 'permalink_structure', '')
            snapshot = self.snapshot(site, site + '-initial-snapshot')
            expected = {n: hashlib.sha256(b).hexdigest() for n, b in archive_files(self.directory / 'inputs/public-1.1.2.zip', SLUG).items()}
            if (snapshot['core'] != self.receipt['sites'][site]['core'] or snapshot['php'] != self.receipt['sites'][site]['php'] or
                    snapshot['plugin'] != '1.1.2' or snapshot['files'] != expected or not snapshot['active']):
                raise ValueError('Actual baseline identity failed: ' + site)
            print(f'[{index}/2] ({index * 50}%) {site}: verified public 1.1.2; acceptance matrix NOT_RUN', flush=True)

    def transition(self, mode, label):
        self.assert_owned()
        archive_name = {'update': 'candidate.zip', 'rollback': 'public-1.1.2.zip', 'public115': 'public-1.1.5.zip'}[mode]
        archive = self.directory / 'inputs' / archive_name
        expected = {n: hashlib.sha256(b).hexdigest() for n, b in archive_files(archive, SLUG).items()}
        rows = []
        for index, site in enumerate(SITES, 1):
            before = self.snapshot(site, site + '-' + label + '-before')
            if mode == 'update':
                self.wp(site, site + '-' + label + '-core-upgrader', 'eval-file', '/audit/harness/update.php')
            else:
                plugin = self.directory / 'lab/data' / site / 'wp-content/plugins' / SLUG
                backup = self.directory / 'backups' / (site + '-' + label)
                if backup.exists() or plugin.is_symlink():
                    raise ValueError('Unsafe or already-used rollback location')
                plugin.rename(backup)
                extract_new(archive, plugin, SLUG)
            after = self.snapshot(site, site + '-' + label + '-after')
            changes = sorted(n for n in set(before['options']) | set(after['options']) if before['options'].get(n) != after['options'].get(n))
            stable = [n for n in changes if not n.startswith(('_transient_', '_site_transient_'))]
            tables = [name for name, row in before['tables'].items() if row['sha256'] != after['tables'][name]['sha256']]
            row = {'site': site, 'from': before['plugin'], 'to': after['plugin'], 'changed_tables': tables, 'changed_options': changes, 'changed_stable_options': stable, 'exact_files': after['files'] == expected, 'active': after['active'], 'database_restored': False}
            row['pass'] = not tables and not stable and row['exact_files'] and row['active']
            rows.append(row)
            print(f'[{index}/2] ({index * 50}%) {site}: {mode} pass={row["pass"]}', flush=True)
        write_json(self.directory / 'evidence' / (label + '-RESULT.json'), rows)
        if not all(row['pass'] for row in rows):
            raise ValueError('File-transition invariants failed')

    def stop(self, label):
        self.assert_owned()
        self.command(label + '-stop', self.compose + ['stop'])
        if self.command(label + '-running', self.compose + ['ps', '--status', 'running', '-q']).stdout.strip():
            raise RuntimeError('Owned containers remain running')
        print('Stopped owned services; retained containers, volumes, database and evidence. Output: ' + str(self.directory))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    prep = sub.add_parser('prepare')
    for name in ('zip', 'manifest', 'cache', 'run-dir'):
        prep.add_argument('--' + name, type=Path, required=True)
    prep.add_argument('--sha256', required=True)
    prep.add_argument('--project', required=True)
    prep.add_argument('--minimum-port', type=int, required=True)
    prep.add_argument('--current-port', type=int, required=True)
    for action in ('start', 'snapshot', 'update', 'rollback', 'public115', 'stop'):
        command = sub.add_parser(action)
        command.add_argument('--run-dir', required=True, type=Path)
        if action != 'start':
            command.add_argument('--label', required=True)
    args = parser.parse_args()
    if args.action == 'prepare':
        prepare(args)
        return
    lab = Lab(args.run_dir)
    if args.action == 'start':
        lab.start()
    elif args.action == 'stop':
        lab.stop(args.label)
    elif args.action == 'snapshot':
        lab.assert_owned()
        for site in SITES:
            lab.snapshot(site, site + '-' + args.label)
    else:
        lab.transition(args.action, args.label)


if __name__ == '__main__':
    main()
