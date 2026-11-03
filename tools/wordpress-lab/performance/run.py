"""Local exact-ZIP performance comparison; never changes accepted plugin source."""
import argparse
import hashlib
from html.parser import HTMLParser
import importlib.util
import itertools
import json
from pathlib import Path
import random
import shutil
import subprocess
import time
import urllib.parse
import uuid

SOURCE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('repro', SOURCE.parent / 'repro/run.py')
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)
VARIANTS = ['legacy', 'buffered', 'candidate']
PACKAGES = [('legacy-clock', 'predecessor.zip'), ('buffered-clock', 'buffered.zip'), ('simple-digital-clock', 'candidate.zip')]
THEMES = ['twentytwentyone', 'twentytwentythree']


class ResourceCounter(HTMLParser):
    def __init__(self):
        super().__init__()
        self.clocks = self.scripts = self.styles = self.inline = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.clocks += tag == 'timenow-zone-sdcw'
        self.scripts += tag == 'script' and 'simple-digital-clock.min.js' in attrs.get('src', '')
        self.styles += tag == 'link' and 'simple-digital-clock.css' in attrs.get('href', '')
        self.inline += tag == 'style' and attrs.get('id') == 'simple-digital-clock-block-style-inline-css'


def validate_warm_html(lab, rows):
    checks = []
    for row in rows:
        if row['phase'] != 'warmup' or row['repetition'] != 0:
            continue
        html = (lab.directory / 'performance/bodies' / (row['id'] + '.html')).read_text()
        counter = ResourceCounter()
        counter.feed(html)
        legacy = row['variant'] == 'legacy'
        needed = int(row['clocks'] > 0)
        legacy_css = int(legacy and (needed or (row['site'] == 'minimum' and row['theme'] == 'twentytwentyone')))
        expected = (row['clocks'], 1 if legacy else needed, legacy_css, 0 if legacy else needed)
        actual = (counter.clocks, counter.scripts, counter.styles, counter.inline)
        if actual != expected or '<!-- sdcw-assets-' in html:
            raise ValueError(f'Invalid resource output: {row["id"]}: {actual} != {expected}')
        checks.append({'id': row['id'], 'variant': row['variant'], 'actual': actual, 'passed': True})
    r.write_json(lab.directory / 'performance/warm-html-validation.json', checks)


def progress(label, done, total, started):
    elapsed = time.monotonic() - started
    rate = done / max(elapsed, .001)
    print(f'{label} [{done}/{total}] {done/total:.1%}; elapsed={elapsed:.1f}s; '
          f'rate={rate:.2f} requests/s; ETA={(total-done)/max(rate,.001):.1f}s', flush=True)


def request(lab, site, page, theme, variant, phase, repetition, delay=0, save=False):
    rid = uuid.uuid4().hex
    params = {'page_id': page['id'], 'b_variant': variant, 'b_theme': theme, 'b_id': rid}
    if delay: params['b_delay'] = delay
    url = site['url'] + '/?' + urllib.parse.urlencode(params)
    target = lab.directory / 'performance' / 'bodies' / (rid + '.html') if save else Path('/dev/null')
    cmd = ['curl', '--silent', '--show-error', '--fail', '--noproxy', '*', '--http1.1',
           '--connect-timeout', '2', '--max-time', '30', '-H', 'Accept-Encoding: identity',
           '-H', 'Connection: close', '--output', str(target), '--write-out', '%{json}', url]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=35)
    if result.returncode:
        raise RuntimeError('HTTP benchmark failed: ' + result.stderr)
    timing = json.loads(result.stdout)
    if timing['http_code'] != 200 or timing['num_redirects'] or timing['size_download'] < page['content_bytes'] * .8:
        raise RuntimeError('Unexpected HTTP response: ' + result.stdout)
    row = {'id': rid, 'site': site['name'], 'theme': theme, 'variant': variant,
           'body_kib': page['body_kib'], 'clocks': page['clocks'], 'phase': phase,
           'repetition': repetition, 'delay_ms': delay, 'ttfb_ms': timing['time_starttransfer']*1000,
           'total_ms': timing['time_total']*1000, 'connect_ms': timing['time_connect']*1000,
           'response_bytes': timing['size_download'], 'http_status': timing['http_code']}
    with (lab.directory / 'performance/client.jsonl').open('a') as out:
        out.write(json.dumps(row) + '\n')
    return row


def setup(lab, candidate, buffered, cache):
    expected = json.loads((r.ROOT / 'docs/releases/1.1.4/manifest-final-output-r6.json').read_text())
    if r.digest(buffered) != expected['archive_sha256'] or r.package_files(buffered) != expected['files']:
        raise ValueError('Buffered reference must be the exact preserved r6 archive')
    sites = lab.prepare(candidate, cache)
    shutil.copyfile(buffered, lab.directory / 'downloads/buffered.zip')
    out = lab.directory / 'performance'
    out.mkdir()
    (out / 'bodies').mkdir()
    for p in SOURCE.iterdir():
        if p.is_file(): shutil.copyfile(p, out / p.name)
    # Both pinned PHP environments use OPcache and a single Apache worker.
    dockerfile = lab.directory / 'harness/Dockerfile'
    dockerfile.write_text(dockerfile.read_text().replace('docker-php-ext-install mysqli', 'docker-php-ext-install mysqli opcache'))
    (out / 'benchmark.ini').write_text('opcache.enable=1\nopcache.enable_cli=0\nopcache.validate_timestamps=0\nopcache.memory_consumption=128\nopcache.max_accelerated_files=20000\nopcache.jit=0\noutput_buffering=4096\nzlib.output_compression=0\nmemory_limit=256M\n')
    (out / 'benchmark-apache.conf').write_text('<IfModule mpm_prefork_module>\nStartServers 1\nMinSpareServers 1\nMaxSpareServers 1\nServerLimit 1\nMaxRequestWorkers 1\nMaxConnectionsPerChild 0\n</IfModule>\n')
    compose = json.loads((lab.directory / 'compose.json').read_text())
    for name, site in sites.items():
        compose['services'][name]['volumes'] += [f'{out}/benchmark.ini:/usr/local/etc/php/conf.d/zz-benchmark.ini:ro', f'{out}/benchmark-apache.conf:/etc/apache2/conf-enabled/zz-benchmark.conf:ro']
        directory = Path(site['directory'])
        for theme in THEMES:
            dest = directory / 'wp-content/themes' / theme
            if name == 'current':
                # Preserve default files rather than overwrite a different theme release.
                if dest.exists(): dest.rename(lab.directory / 'backups' / ('current-' + theme))
                shutil.copytree(Path(sites['minimum']['directory']) / 'wp-content/themes' / theme, dest)
        for variant, archive in PACKAGES:
            r.extract(lab.directory / 'downloads' / archive, directory / 'wp-content/plugins' / variant, 'simple-digital-clock')
        mu = directory / 'wp-content/mu-plugins'
        mu.mkdir(exist_ok=True)
        shutil.copyfile(SOURCE / 'instrument.php', mu / 'sdcw-benchmark.php')
        site['name'] = name
    r.write_json(lab.directory / 'compose.json', compose)
    r.write_json(out / 'sites.json', sites)
    lab.command('benchmark-up', lab.compose + ['up', '-d', '--build', '--wait', '--wait-timeout', '90'])
    for name, site in sites.items():
        # Native installation creates no clock data through either old/new writer.
        lab.command(name + '-fresh-install', lab.compose + ['exec', '-T', name, 'php', '/lab/harness/install.php'])
        result = lab.wp(name, 'eval-file', '/lab/performance/seed.php')
        site['pages'] = json.loads(result.stdout)
        log = Path(site['directory']) / 'wp-content/sdcw-benchmark.jsonl'
        log.touch(mode=0o666)
        log.chmod(0o666)
    r.write_json(out / 'sites.json', sites)
    return sites


def collect(lab, sites):
    out = lab.directory / 'performance'
    clients = [json.loads(line) for line in (out / 'client.jsonl').read_text().splitlines()]
    observations = {}
    for name, site in sites.items():
        source = Path(site['directory']) / 'wp-content/sdcw-benchmark.jsonl'
        shutil.copyfile(source, out / (name + '-server.jsonl'))
        for line in source.read_text().splitlines():
            row = json.loads(line)
            if row['id'] in observations: raise ValueError('Duplicate request observation')
            observations[row['id']] = row
    joined = []
    for client in clients:
        server = observations.get(client['id'])
        if not server: raise ValueError('Missing shutdown observation: ' + client['id'])
        if server['variant'] != client['variant'] or server['clock_count'] != client['clocks'] or server['buffers_after_flush'] != 0 or not server['opcache_enabled'] or server['status'] != 200:
            raise ValueError('Invalid benchmark observation: ' + json.dumps(server))
        if server['last_error'] and server['last_error']['type'] in [1, 4, 16, 64, 256]:
            raise ValueError('Fatal PHP error in benchmark')
        joined.append({**client, 'server': server})
    r.write_json(out / 'observations.json', joined)
    validate_warm_html(lab, joined)
    identity = {}
    for name, site in sites.items():
        identity[name] = {}
        for dirname, archive in PACKAGES:
            plugin = Path(site['directory']) / 'wp-content/plugins' / dirname
            actual = {p.relative_to(plugin).as_posix(): r.digest(p) for p in plugin.rglob('*') if p.is_file()}
            if actual != r.package_files(lab.directory / 'downloads' / archive): raise ValueError('Installed package changed')
            identity[name][dirname] = actual
    r.write_json(out / 'installed-identity-final.json', identity)
    return joined


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--id', required=True)
    parser.add_argument('--candidate', required=True, type=Path)
    parser.add_argument('--cache', required=True, type=Path)
    parser.add_argument('--buffered', required=True, type=Path)
    parser.add_argument('--samples', default=45, type=int)
    parser.add_argument('--warmups', default=5, type=int)
    args = parser.parse_args()
    if not 5 <= args.samples <= 100 or not 1 <= args.warmups <= 10: parser.error('Samples/warmups out of bounds')
    lab = r.Lab(args.id)
    sites = None
    try:
        sites = setup(lab, args.candidate, args.buffered, args.cache)
        out = lab.directory / 'performance'
        scenarios = [(site, page, theme) for site in sites.values() for page in site['pages'] for theme in THEMES]
        rng = random.Random(20261102)
        started = time.monotonic()
        total = len(scenarios) * 3 * (args.warmups + args.samples) + len(sites) * len(THEMES) * 3 * 10
        done = 0
        for phase, repeats in [('warmup', args.warmups), ('measured', args.samples)]:
            for repetition in range(repeats):
                rng.shuffle(scenarios)
                for index, (site, page, theme) in enumerate(scenarios):
                    variants = list(itertools.permutations(VARIANTS))[(repetition + index) % 6]
                    for variant in variants:
                        request(lab, site, page, theme, variant, phase, repetition, save=phase=='warmup' and repetition==0)
                        done += 1
                    if done % 36 == 0: progress(phase, done, total, started)
                # Fail early if shutdown memory instrumentation is missing/misconfigured.
                if phase == 'warmup' and repetition == 0: collect(lab, sites)
        for repetition in range(10):
            for site in sites.values():
                page = next(p for p in site['pages'] if p['body_kib'] == 64 and p['clocks'] == 1)
                for theme in THEMES:
                    for variant in list(itertools.permutations(VARIANTS))[repetition % 6]:
                        request(lab, site, page, theme, variant, 'streaming-probe', repetition, delay=200)
                        done += 1
            progress('streaming-probe', done, total, started)
        rows = collect(lab, sites)
        r.write_json(out / 'completion.json', {'completed': True, 'requests': len(rows), 'samples_per_condition': args.samples,
            'warmups_per_condition': args.warmups, 'sequential_concurrency': 1, 'shuffle_seed': 20261102,
            'candidate_sha256': r.digest(args.candidate), 'legacy_sha256': r.digest(lab.directory / 'downloads/predecessor.zip'),
            'buffered_sha256': r.digest(args.buffered), 'variants': VARIANTS,
            'plugin_source_modified': False, 'published': False})
        print(f'PASS: requests={len(rows)}; issues=0; output={out}', flush=True)
    finally:
        if (lab.directory / 'compose.json').exists(): lab.stop()


if __name__ == '__main__': main()
