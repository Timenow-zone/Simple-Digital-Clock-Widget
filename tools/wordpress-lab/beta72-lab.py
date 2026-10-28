"""Acceptance of the frozen 1.1.2 ZIP on two disposable WP 7.2 Beta 2 sites."""
import hashlib
import ipaddress
import json
import secrets
import socket
import subprocess
import sys
import time
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LAB = ROOT / '.local/wordpress-lab'
OUT = LAB / 'wp72-beta'
CORE = OUT / 'wordpress-7.2-beta2.zip'
CORE_SHA = 'b1e1257fb208b6a399a457182f20d96726f2812ff003eadeb60bb9232f623e81'
VERSION = '7.2-beta2'
PROJECT = 'sdcw-wp72-beta2-20261028'
SUBNET = '10.254.120.0/28'
SHA = '6f896d42797e6d3a4727f8ece6d13bb8f4be2ed8e9425473ef02ea5e374d8720'
BASE = 'b6afe710826e74370889773f0fb600a89614a18058b4f264ca12fc7df4f97c10'
SERVICES = {'beta83': (19533, '8.3'), 'beta85': (19534, '8.5')}
COMPOSE = ['docker', 'compose', '--env-file', str(OUT / 'env'), '-f', str(OUT / 'compose.json')]
STARTED = time.monotonic()


def run(command):
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr[-2500:] + result.stdout[-1500:])
    return result.stdout


def write(name, data):
    with (OUT / (name + '.json')).open('x') as stream:
        json.dump(data, stream, ensure_ascii=False, indent=2)
        stream.write('\n')


def progress(index, total, message):
    elapsed = time.monotonic() - STARTED
    rate = index / max(elapsed, .001)
    print(f'[{index}/{total}] {index / total:.0%} {message}; elapsed={elapsed:.1f}s; '
          f'rate={rate:.2f}/s; ETA={(total-index)/rate:.1f}s', flush=True)


def wp(service, *args):
    if service not in SERVICES:
        raise ValueError('Unknown beta lab service')
    return run(COMPOSE + ['exec', '-T', service, 'php', '/lab/wp-cli.phar', '--allow-root'] + list(args))


def manifest(folder):
    return {str(p.relative_to(folder)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in folder.rglob('*') if p.is_file()}


def snapshot(label):
    code = """global $wpdb;
if (wp_get_environment_type()!=='local'||get_option('blogname')!=='Clock isolated lab') throw new RuntimeException('Wrong site');
echo wp_json_encode(array('posts'=>$wpdb->get_results("SELECT * FROM {$wpdb->posts} ORDER BY ID",ARRAY_A),
'options'=>$wpdb->get_results("SELECT option_name,option_value FROM {$wpdb->options} WHERE option_name LIKE 'widget\\_%' OR option_name='sidebars_widgets' OR option_name LIKE 'theme_mods\\_%' OR option_name IN ('home','siteurl','active_plugins') ORDER BY option_name",ARRAY_A)));"""
    rows = [{'key': service, 'data': json.loads(wp(service, 'eval', code))} for service in SERVICES]
    write(label, rows)
    return rows


def setup():
    if (OUT / 'compose.json').exists():
        raise RuntimeError('Refusing to overwrite an existing beta environment')
    for port in [19527] + [row[0] for row in SERVICES.values()]:
        with socket.socket() as connection:
            connection.bind(('127.0.0.1', port))
    ids = run(['docker', 'network', 'ls', '-q']).split()
    networks = json.loads(run(['docker', 'network', 'inspect'] + ids))
    target = ipaddress.ip_network(SUBNET)
    for network in networks:
        for config in network['IPAM'].get('Config') or []:
            if config.get('Subnet') and target.overlaps(ipaddress.ip_network(config['Subnet'])):
                raise RuntimeError('Beta subnet overlaps ' + network['Name'])
    if hashlib.sha256(CORE.read_bytes()).hexdigest() != CORE_SHA:
        raise RuntimeError('Unexpected Core archive hash')
    with zipfile.ZipFile(CORE) as archive:
        version = archive.read('wordpress/wp-includes/version.php').decode()
        if "$wp_version = '" + VERSION + "';" not in version:
            raise RuntimeError('Unexpected Core version')
        for service in SERVICES:
            folder = OUT / service
            folder.mkdir()
            for entry in archive.infolist():
                relative = Path(entry.filename).relative_to('wordpress')
                if '..' in relative.parts or entry.is_dir():
                    continue
                target_file = folder / relative
                target_file.parent.mkdir(parents=True, exist_ok=True)
                target_file.write_bytes(archive.read(entry))
    password = secrets.token_hex(24)
    env = OUT / 'env'
    env.write_text('SDCW_BETA_DB_PASSWORD=' + password + '\n')
    env.chmod(0o600)
    credentials = {service: {role: {'username': {'administrator': 'clock_lab_admin',
                       'editor': 'clock_beta_editor', 'author': 'clock_patch_author'}[role],
                       'password': secrets.token_urlsafe(24)}
                   for role in ['administrator', 'editor', 'author']} for service in SERVICES}
    write('accounts', credentials)
    (OUT / 'accounts.json').chmod(0o600)
    db_password = '${SDCW_BETA_DB_PASSWORD:?Set beta lab password}'
    config = {'name': PROJECT, 'services': {'db': {
        'image': 'mariadb:11.4.8',
        'environment': {'MARIADB_ROOT_PASSWORD': db_password},
        'volumes': [str(OUT / 'db') + ':/var/lib/mysql'],
        'healthcheck': {'test': ['CMD', 'healthcheck.sh', '--connect', '--innodb_initialized'],
                        'interval': '3s', 'timeout': '3s', 'retries': 30},
        'networks': ['lab']}},
        'networks': {'lab': {'ipam': {'config': [{'subnet': SUBNET}]}}}}
    guard = """<?php
// Keep only the generated acceptance environment deterministic.
if (wp_get_environment_type() !== 'local') { return; }
add_filter('pre_wp_mail', '__return_false');
add_action('widgets_init', function () { register_sidebar(array('id'=>'sdcw-acceptance','name'=>'Clock acceptance sidebar')); });
"""
    for service, (port, php) in SERVICES.items():
        mu = OUT / service / 'wp-content/mu-plugins'
        mu.mkdir(parents=True, exist_ok=True)
        (mu / 'sdcw-final-acceptance.php').write_text(guard)
        config['services'][service] = {
            'image': f'wordpress:7.1.3-php{php}-apache',
            'environment': {'WORDPRESS_DB_HOST': 'db', 'WORDPRESS_DB_USER': 'root',
                'WORDPRESS_DB_PASSWORD': db_password, 'WORDPRESS_DB_NAME': 'clock_' + service,
                'WORDPRESS_DEBUG': '1',
                'WORDPRESS_CONFIG_EXTRA': "define('WP_ENVIRONMENT_TYPE','local');define('WP_DEBUG_LOG',true);define('WP_DEBUG_DISPLAY',false);define('DISABLE_WP_CRON',true);define('AUTOMATIC_UPDATER_DISABLED',true);define('WP_AUTO_UPDATE_CORE',false);define('WP_HTTP_BLOCK_EXTERNAL',true);"},
            'ports': [f'127.0.0.1:{port}:80'],
            'volumes': [str(OUT / service) + ':/var/www/html', str(LAB / 'packages') + ':/lab/packages:ro',
                str(LAB / 'wp-cli.phar') + ':/lab/wp-cli.phar:ro', str(ROOT / 'tools/wordpress-lab') + ':/lab/source:ro'],
            'depends_on': {'db': {'condition': 'service_healthy'}}, 'networks': ['lab']}
    write('compose', config)
    run(COMPOSE + ['up', '-d', '--pull', 'never'])
    initialize()


def initialize():
    if (OUT / 'sites.json').exists():
        raise RuntimeError('Refusing to reinitialize accepted beta sites')
    credentials = json.loads((OUT / 'accounts.json').read_text())
    public = []
    for index, (service, (port, php)) in enumerate(SERVICES.items(), 1):
        run(COMPOSE + ['exec', '-T', 'db', 'sh', '-c',
            'MYSQL_PWD="$MARIADB_ROOT_PASSWORD" exec mariadb -uroot -e "$1"',
            'sh', 'CREATE DATABASE IF NOT EXISTS clock_' + service])
        admin = credentials[service]['administrator']
        wp(service, 'core', 'install', '--url=http://127.0.0.1:' + str(port), '--title=Clock isolated lab',
           '--admin_user=' + admin['username'], '--admin_password=' + admin['password'],
           '--admin_email=beta@example.invalid', '--skip-email')
        for role in ['editor', 'author']:
            user = credentials[service][role]
            wp(service, 'user', 'create', user['username'], role + '@example.invalid',
               '--role=' + role, '--user_pass=' + user['password'])
        wp(service, 'plugin', 'install', '/lab/packages/baseline.zip', '--activate')
        code = """$users=array();foreach(array('administrator'=>'clock_lab_admin','editor'=>'clock_beta_editor','author'=>'clock_patch_author')as$role=>$login){$user=get_user_by('login',$login);wp_set_current_user($user->ID);$users[$role]=array('id'=>$user->ID,'unfiltered_html'=>current_user_can('unfiltered_html'),'widgets'=>current_user_can('edit_theme_options'));}
echo wp_json_encode(array('users'=>$users,'wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'theme'=>get_stylesheet(),'block_theme'=>wp_is_block_theme()));"""
        data = json.loads(wp(service, 'eval', code))
        assert data['wordpress'] == VERSION and data['php'].startswith(php + '.')
        post_id = int(wp(service, 'post', 'create', '--post_title=Beta acceptance starter', '--post_status=draft', '--porcelain'))
        public.append({'key': service, 'runtime': service, 'url': f'http://127.0.0.1:{port}',
                       'multisite': False, 'post_id': post_id, **data})
        progress(index, len(SERVICES), service + ' ' + data['wordpress'] + ' / PHP ' + data['php'])
    write('sites', public)
    write('core', {'version': VERSION, 'url': 'https://wordpress.org/wordpress-7.2-beta2.zip',
                   'sha256': hashlib.sha256(CORE.read_bytes()).hexdigest()})
    print('Isolated beta lab ready: ' + str(OUT), flush=True)


def install(mode, label):
    package = LAB / 'packages' / ('baseline.zip' if mode == 'baseline' else 'candidate.zip')
    expected = BASE if mode == 'baseline' else SHA
    assert hashlib.sha256(package.read_bytes()).hexdigest() == expected
    with zipfile.ZipFile(package) as archive:
        files = {n.split('/', 1)[1]: hashlib.sha256(archive.read(n)).hexdigest()
                 for n in archive.namelist() if not n.endswith('/')}
    before = snapshot(label + '-before')
    results = []
    for index, service in enumerate(SERVICES, 1):
        if mode == 'upgrade':
            result = json.loads(wp(service, 'eval-file', '/lab/source/core-local-upgrade.php',
                                   '/lab/packages/candidate.zip', SHA))
            assert result['success'] and not result['failed']
        else:
            wp(service, 'plugin', 'install', '/lab/packages/' + package.name, '--force')
            result = {'mode': mode}
        assert manifest(OUT / service / 'wp-content/plugins/simple-digital-clock') == files
        results.append({'key': service, 'result': result})
        progress(index, len(SERVICES), label + ' ' + service)
    after = snapshot(label + '-after')
    assert before == after, 'Plugin replacement changed stored posts, settings, placement or activation'
    write(label, {'zip_sha256': expected, 'files': len(files), 'results': results,
                  'all_data_unchanged': True, 'post_rows': sum(len(r['data']['posts']) for r in after)})


def php(legacy=False):
    probes = [('regression.php', None, 464), ('final-review.php', None, 148), ('p2-caption.php', None, 18),
              ('html5-caption-save.php', None, 193), ('html5-entity-pipeline.php', None, 3),
              ('html5-charset.php', None, 4), ('numeric-caption-save.php', None, 460),
              ('numeric-entity-pipeline.php', None, 5), ('widget-fallback.php', None, 47),
              ('widget-entity-pipeline.php', 'named', 5), ('widget-entity-pipeline.php', 'numeric', 5),
              ('kses72-regression.php', None, 134), ('kses72-owned-pass.php', None, 42)]
    pipelines = {key: [] for key in ['named-post', 'numeric-post', 'named-widget', 'numeric-widget']}
    summary = []
    prefix = 'legacy-php-' if legacy else 'php-'
    for index, service in enumerate(SERVICES, 1):
        suites = []
        for filename, argument, count in probes:
            command = ['eval-file', '/lab/source/' + filename] + ([argument] if argument else [])
            if legacy:
                code = "add_filter('wp_kses_force_legacy_parser','__return_true',PHP_INT_MAX);"
                code += '$args=json_decode(' + json.dumps(json.dumps([argument] if argument else [])) + ',true);'
                code += 'include ' + json.dumps('/lab/source/' + filename) + ';'
                command = ['eval', code]
            process = subprocess.run(COMPOSE + ['exec', '-T', service, 'php', '/lab/wp-cli.phar', '--allow-root',
                *command], capture_output=True, text=True)
            data = json.loads(process.stdout)
            checks = data['tests'] if filename == 'regression.php' else data['checks']
            write(prefix + service + '-' + filename + ('-' + argument if argument else ''), data)
            suites.append({'file': filename, 'argument': argument, 'checks': len(checks), 'failed': data['failed'],
                           'exit_code': process.returncode, 'stderr': process.stderr})
            if len(checks) != count or process.returncode not in [0, 1]:
                raise RuntimeError(service + ': invalid test result ' + filename + ' (evidence retained)')
            kind = {'html5-entity-pipeline.php': 'named-post', 'numeric-entity-pipeline.php': 'numeric-post'}.get(filename)
            if filename == 'widget-entity-pipeline.php':
                kind = argument + '-widget'
            if kind:
                pipelines[kind].append({'service': service, **data})
        summary.append({'key': service, 'suites': suites})
        progress(index, len(SERVICES), service + ' PHP failed=' + str(sum(s['failed'] for s in suites)))
    write(prefix + 'summary', summary)
    for kind, rows in pipelines.items():
        write(('legacy-pipeline-' if legacy else 'pipeline-') + kind, rows)
    failed = sum(s['failed'] for row in summary for s in row['suites'])
    total = sum(s['checks'] for row in summary for s in row['suites'])
    print(f'PHP acceptance: {total-failed}/{total}; output={OUT}', flush=True)
    if failed:
        sys.exit(1)


if __name__ == '__main__':
    action = sys.argv[1]
    if action == 'setup':
        setup()
    elif action == 'initialize':
        initialize()
    elif action == 'php':
        if len(sys.argv) > 2 and sys.argv[2] != 'legacy':
            raise ValueError('Unknown PHP control mode')
        php(len(sys.argv) > 2)
    elif action == 'snapshot':
        snapshot(sys.argv[2])
    elif action in ['upgrade', 'baseline', 'candidate']:
        install(action, sys.argv[2])
    elif action == 'down':
        print(run(COMPOSE + ['down']))
    else:
        raise ValueError('Unknown beta lab action')
