<?php
// Offline routing and Core queue doubles. Native WordPress/browser checks remain separate.
define('ABSPATH', __DIR__);
$assets_root = isset($argv[1]) ? realpath($argv[1]) : false;
if (!$assets_root) { throw new RuntimeException('Invalid assets root'); }
define('SDCW_PATH', $assets_root . '/');
define('SDCW_URL', 'https://fixture.invalid/plugin/');
$GLOBALS['test_actions'] = array();
$GLOBALS['test_filters'] = array();
function add_action($hook, $callback, $priority = 10) { $GLOBALS['test_actions'][$hook][$priority][$callback] = $callback; }
function add_filter($hook, $callback, $priority = 10) { $GLOBALS['test_filters'][$hook][$priority][$callback] = $callback; }
function do_action($hook, $value) { $GLOBALS['test_diagnostics'][] = array($hook, $value); }
function is_admin() { return !empty($GLOBALS['test_admin']); }
function is_feed() { return !empty($GLOBALS['test_feed']); }
function is_robots() { return !empty($GLOBALS['test_robots']); }
function is_trackback() { return !empty($GLOBALS['test_trackback']); }
function wp_is_json_request() { return !empty($GLOBALS['test_json']); }
function doing_filter($hook) { return $hook === 'get_the_excerpt' && !empty($GLOBALS['test_excerpt']); }
function did_action($hook) { return $hook === 'wp_print_footer_scripts' && !empty($GLOBALS['test_footer']); }
function get_current_screen() { return isset($GLOBALS['test_screen']) ? $GLOBALS['test_screen'] : null; }
function test_escape($value) { return htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); }

class SDCW_Test_Scripts {
    public $registered = array();
    public $queue = array();
    public $to_do = array();
    public $done = array();
    public $groups = array();
    public $in_footer = array();
    public $do_concat = true;

    public function depends_on($handles, $target, $seen = array()) {
        foreach ($handles as $handle) {
            if ($handle === $target) { return true; }
            if (isset($seen[$handle]) || !isset($this->registered[$handle])) { continue; }
            $seen[$handle] = true;
            if ($this->depends_on($this->registered[$handle]->deps, $target, $seen)) { return true; }
        }
        return false;
    }

    private function resolve($handle, $seen = array()) {
        if (isset($seen[$handle]) || !isset($this->registered[$handle]) || in_array($handle, $this->done, true)) { return; }
        $seen[$handle] = true;
        foreach ($this->registered[$handle]->deps as $dependency) { $this->resolve($dependency, $seen); }
        if (!in_array($handle, $this->to_do, true)) { $this->to_do[] = $handle; }
    }

    public function do_items($handles, $group) {
        if ($group !== 1) { throw new RuntimeException('Wrong footer group'); }
        if ($this->do_concat) { throw new RuntimeException('Private capture must not invoke the global concatenation printer'); }
        foreach ($handles as $handle) { $this->resolve($handle); }
        foreach ($this->to_do as $handle) {
            if (in_array($handle, $this->done, true) || !isset($this->registered[$handle])) { continue; }
            $dependency = $this->registered[$handle];
            // Make dependency-object isolation observable, separately from copied arrays.
            $dependency->extra['fixture_rendered'] = true;
            if (!empty($dependency->extra['fixture_throw'])) {
                echo '<!-- incomplete fixture output -->';
                throw new RuntimeException('Fixture render failure');
            }
            foreach (isset($dependency->extra['before']) ? $dependency->extra['before'] : array() as $data) {
                wp_print_inline_script_tag($data, array('nonce' => 'fixture-nonce'));
            }
            $source = $dependency->src . '?ver=' . rawurlencode($dependency->ver);
            echo '<script async nonce="fixture-nonce" data-core-filter="kept" id="', test_escape($handle), '-js" src="', test_escape($source), '"></script>';
            foreach (isset($dependency->extra['after']) ? $dependency->extra['after'] : array() as $data) {
                wp_print_inline_script_tag($data, array('nonce' => 'fixture-nonce'));
            }
            $this->done[] = $handle;
            $this->groups[$handle] = $group;
        }
        $this->to_do = array();
        return $this->done;
    }
}

function wp_scripts() { return $GLOBALS['test_script_registry']; }
function wp_register_script($handle, $src, $deps, $version, $options) {
    wp_scripts()->registered[$handle] = (object) array('handle' => $handle, 'src' => $src, 'deps' => $deps, 'ver' => $version, 'options' => $options, 'extra' => array());
}
function wp_enqueue_script($handle) {
    if (!in_array($handle, wp_scripts()->queue, true)) { wp_scripts()->queue[] = $handle; }
}
function wp_script_is($handle, $state) {
    $scripts = wp_scripts();
    if ($state === 'registered') { return isset($scripts->registered[$handle]); }
    if ($state === 'done') { return in_array($handle, $scripts->done, true); }
    if ($state === 'enqueued') { return $scripts->depends_on($scripts->queue, $handle); }
    throw new RuntimeException('Unexpected script state: ' . $state);
}
function wp_add_inline_script($handle, $data, $position = 'after') {
    if (!wp_script_is($handle, 'registered')) { return false; }
    wp_scripts()->registered[$handle]->extra[$position][] = $data;
    return true;
}
function wp_localize_script($handle, $object_name, $data) {
    return wp_add_inline_script($handle, 'var ' . $object_name . '=' . json_encode($data) . ';', 'before');
}
function wp_json_encode($data, $options = 0) { return json_encode($data, $options); }
function wp_print_scripts($handles) {
    ++$GLOBALS['test_normal_prints'];
    wp_scripts()->do_concat = false;
    return wp_scripts()->do_items($handles, 1);
}
function wp_print_inline_script_tag($data, $attributes = array()) {
    if (!isset($attributes['nonce'])) { $attributes['nonce'] = 'fixture-inline-nonce'; }
    echo '<script';
    foreach ($attributes as $name => $value) { echo ' ', test_escape($name), '="', test_escape($value), '"'; }
    echo '>', $data, '</script>';
}
function wp_register_style($handle, $src, $deps, $version) { $GLOBALS['test_styles'][$handle] = array('src' => $src, 'version' => $version, 'inline' => array()); }
function wp_add_inline_style($handle, $css) { $GLOBALS['test_styles'][$handle]['inline'][] = $css; }
function wp_enqueue_style($handle) { $GLOBALS['test_style_queue'][$handle] = true; }
function wp_style_is($handle, $state) {
    if ($state === 'registered') { return isset($GLOBALS['test_styles'][$handle]); }
    return $state === 'done' ? isset($GLOBALS['test_style_done'][$handle]) : isset($GLOBALS['test_style_queue'][$handle]);
}
function wp_print_styles($handles) {
    foreach ($handles as $handle) {
        if (!wp_style_is($handle, 'done')) {
            $GLOBALS['test_style_done'][$handle] = true;
            echo '<style id="', test_escape($handle), '-inline-css">', implode('', $GLOBALS['test_styles'][$handle]['inline']), '</style>';
        }
    }
}
function test_reset() {
    $GLOBALS['test_script_registry'] = new SDCW_Test_Scripts();
    $GLOBALS['test_normal_prints'] = 0;
    foreach (array('styles', 'style_queue', 'style_done', 'diagnostics') as $name) { $GLOBALS['test_' . $name] = array(); }
    foreach (array('admin', 'feed', 'robots', 'trackback', 'json', 'excerpt', 'footer') as $name) { $GLOBALS['test_' . $name] = false; }
    if (isset($GLOBALS['test_base_actions'])) { $GLOBALS['test_actions'] = $GLOBALS['test_base_actions']; }
    foreach (array('SDCW_frontend_loader_printed', 'test_screen') as $name) { unset($GLOBALS[$name]); }
}
function test_capture($callback = 'SDCW_print_frontend_loader') {
    ob_start();
    try { call_user_func($callback); return ob_get_contents(); }
    finally { ob_end_clean(); }
}
function test_loader_parts($markup) {
    $matched = preg_match('~<script\b(?=[^>]*\bid="simple-digital-clock-runtime")(?=[^>]*\btype="application/json")[^>]*>(.*?)</script>~s', $markup, $matches);
    $config = $matched ? json_decode($matches[1], true) : null;
    return array(
        'runtime' => is_array($config) && isset($config['markup']) ? $config['markup'] : '',
        'encoded' => $matched ? $matches[1] : '',
        'outside' => $matched ? str_replace($matches[0], '', $markup) : $markup,
    );
}
function test_init() {
    foreach (isset($GLOBALS['test_actions']['init'][9]) ? $GLOBALS['test_actions']['init'][9] : array() as $callback) { call_user_func($callback); }
}

test_reset();
$initial_buffer_level = ob_get_level();
require SDCW_PATH . 'includes/simple-digital-clock-assets.php';
$GLOBALS['test_base_actions'] = $GLOBALS['test_actions'];
$clock = '<timenow-zone-sdcw class="wp-block-simple-digital-clock-block-widget-block" second></timenow-zone-sdcw>';
$script = 'id="simple-digital-clock-js"';
$style = 'id="simple-digital-clock-block-style-inline-css"';
$checks = array();
$group = 'registration';
$check = function ($condition, $label) use (&$checks, &$group) { $checks[] = array('group' => $group, 'passed' => (bool) $condition, 'name' => $label); };
$check(ob_get_level() === $initial_buffer_level, 'Loading assets adds no page output buffer');
$check(empty($GLOBALS['test_actions']['template_redirect']), 'No response observer is installed on template_redirect');
$check(empty($GLOBALS['test_actions']['wp_enqueue_scripts']), 'Frontend runtime is not globally enqueued');
$check(empty($GLOBALS['test_actions']['admin_enqueue_scripts']), 'Ordinary admin has no global enqueue');
$check(array_keys($GLOBALS['test_filters']) === array('render_block_simple-digital-clock-block/widget-block'), 'Only the owned block render hook requests layout');
$check(isset($GLOBALS['test_actions']['init'][9]['SDCW_register_assets']), 'Stable handles register early');
$check(isset($GLOBALS['test_actions']['wp_footer'][PHP_INT_MAX]['SDCW_print_frontend_loader']), 'Compatibility loader runs after normal footer scripts');
$check(empty(wp_scripts()->queue) && empty($GLOBALS['test_style_queue']), 'Loading assets queues no runtime or layout');
$check(!wp_add_inline_script('simple-digital-clock', 'window.early=1;'), 'Doubles reject data before handle registration');
test_init(); SDCW_register_assets();
$check(wp_script_is('simple-digital-clock', 'registered') && empty(wp_scripts()->queue), 'Early repeated registration leaves the runtime unqueued');
$registered = wp_scripts()->registered['simple-digital-clock'];
$check($registered->ver === '0.8.1' && $registered->options === array('strategy' => 'async', 'in_footer' => true), 'Published runtime version and Core loading strategy remain unchanged');
$check($GLOBALS['test_styles']['simple-digital-clock-block-style']['src'] === false && count($GLOBALS['test_styles']['simple-digital-clock-block-style']['inline']) === 1, 'Registration retains one source-free layout rule');
$registered->src = 'https://fixture.invalid/custom-runtime.js'; SDCW_register_assets();
$check(wp_scripts()->registered['simple-digital-clock']->src === $registered->src, 'Existing runtime registration is preserved');

$group = 'capture';
test_reset(); test_init();
wp_register_script('unrelated', 'https://fixture.invalid/unrelated.js', array(), '1', array());
wp_register_script('shared-done', 'https://fixture.invalid/shared-done.js', array(), '2', array());
wp_register_script('needed', 'https://fixture.invalid/needed.js', array('shared-done'), '3', array());
wp_scripts()->registered['simple-digital-clock']->deps = array('needed');
wp_scripts()->queue = array('unrelated');
wp_scripts()->to_do = array('unrelated');
wp_scripts()->done = array('shared-done');
wp_scripts()->groups = array('unrelated' => 0, 'shared-done' => 1);
wp_scripts()->in_footer = array('unrelated');
$registry = wp_scripts();
$snapshot = serialize($registry);
$level = ob_get_level();
$captured = SDCW_get_runtime_markup();
$check(strpos($captured, 'needed-js') !== false && strpos($captured, $script) !== false && strpos($captured, 'needed-js') < strpos($captured, $script), 'Capture resolves only the requested runtime dependency chain in order');
$check(strpos($captured, 'unrelated.js') === false, 'Unrelated pending and queued scripts are excluded from private capture');
$check(strpos($captured, 'shared-done.js') === false, 'Already emitted shared dependencies are not captured again');
$check(wp_scripts() === $registry && serialize(wp_scripts()) === $snapshot, 'Private capture preserves the live registry, queues, groups and dependency objects');
$check(ob_get_level() === $level, 'Successful private capture restores the caller buffer level');
$check(SDCW_get_runtime_markup() === $captured && serialize(wp_scripts()) === $snapshot, 'Repeated capture does not consume or mutate live state');
wp_scripts()->registered['simple-digital-clock']->extra['fixture_throw'] = true;
$snapshot = serialize(wp_scripts());
$thrown = false;
ob_start(); $outer_level = ob_get_level();
try { SDCW_get_runtime_markup(); } catch (RuntimeException $error) { $thrown = $error->getMessage() === 'Fixture render failure'; }
$level_after_failure = ob_get_level(); $leaked = ob_get_clean();
$check($thrown && $level_after_failure === $outer_level && $leaked === '', 'Capture failure propagates and discards partial output without leaking a buffer');
$check(serialize(wp_scripts()) === $snapshot, 'Capture failure leaves live dependencies and queues unchanged');

$group = 'core-data';
test_reset(); test_init();
$locale_data = array('locale' => 'uk', 'caption' => 'Київ 🕒 </script><strong>&"\'</strong>');
$attached = wp_add_inline_script('simple-digital-clock', 'window.attachedBefore=1;', 'before');
$attached = wp_localize_script('simple-digital-clock', 'ClockSettings', $locale_data) && $attached;
$attached = wp_add_inline_script('simple-digital-clock', 'window.attachedAfter=1;', 'after') && $attached;
$parts = test_loader_parts(test_capture());
$runtime_position = strpos($parts['runtime'], $script);
$before_position = strpos($parts['runtime'], 'window.attachedBefore=1;');
$localized_position = strpos($parts['runtime'], 'var ClockSettings=' . json_encode($locale_data) . ';');
$after_position = strpos($parts['runtime'], 'window.attachedAfter=1;');
$check($attached && $runtime_position !== false && $before_position !== false && $localized_position !== false && $after_position !== false && $before_position < $runtime_position && $localized_position < $runtime_position && $after_position > $runtime_position, 'Core before, localized and after data retain their order inside inert markup');
$check(substr_count($parts['runtime'], 'nonce="fixture-nonce"') === 4 && strpos($parts['runtime'], 'data-core-filter="kept"') !== false, 'Core-filtered runtime attributes and all inline nonces survive capture');
$check($parts['encoded'] !== '' && strpos($parts['encoded'], '<') === false && strpos($parts['encoded'], '\\u003C') !== false, 'Runtime configuration hex-encodes HTML delimiters instead of exposing literal preloadable markup');
$check(strpos($parts['encoded'], '&') === false && strpos($parts['encoded'], '\\u0022') !== false && strpos($parts['encoded'], '\\u0027') !== false, 'Runtime configuration safely encodes ampersands and quotes while preserving decoded data');
$check(strpos($parts['outside'], 'attachedBefore') === false && strpos($parts['outside'], 'ClockSettings') === false && strpos($parts['outside'], 'attachedAfter') === false, 'Attached runtime data is not executed as part of the bootstrap');
$check(strpos($parts['outside'], 'nonce="fixture-inline-nonce"') !== false, 'Bootstrap uses the Core inline-tag attribute path');

$group = 'loader';
foreach (array('empty', 'raw', 'owned', 'discarded', 'explicit-helper') as $case) {
    test_reset(); test_init();
    $content = $case === 'raw' ? $clock : '<p>No clock.</p>';
    if ($case === 'owned' || $case === 'discarded') {
        $owned = SDCW_enqueue_rendered_clock_assets($clock);
        $check($owned === $clock, $case . ': owned rendering preserves markup');
        if ($case === 'owned') { $content = $owned; }
    }
    if ($case === 'explicit-helper') { SDCW_enqueue_scripts(); }
    $level = ob_get_level();
    $response = test_capture(function () use ($content) { echo $content; SDCW_print_frontend_loader(); });
    $check(substr($response, 0, strlen($content)) === $content, $case . ': previously emitted page bytes remain unchanged');
    $parts = test_loader_parts(substr($response, strlen($content)));
    $check(substr_count($parts['runtime'], $script) === 1 && substr_count($parts['outside'], 'id="simple-digital-clock-loader"') === 1, $case . ': one encoded runtime configuration and one inline compatibility loader');
    $check($parts['encoded'] !== '' && strpos($parts['encoded'], '<') === false && strpos($response, '<template id="simple-digital-clock-runtime">') === false, $case . ': serialized runtime exposes no literal script markup to speculative preload');
    $check(!preg_match('~<script\b[^>]*\bsrc\s*=~i', $parts['outside']) && empty(wp_scripts()->queue) && empty(wp_scripts()->done), $case . ': PHP emits no active external runtime or consumes its handle');
    $check(ob_get_level() === $level && test_capture() === '', $case . ': repeated footer emits nothing and preserves buffer level');
    $check(empty($GLOBALS['test_diagnostics']), $case . ': normal preparation emits no diagnostic');
    $check(empty($GLOBALS['test_style_queue']) === in_array($case, array('empty', 'raw'), true), $case . ': layout stays scoped to owned or explicitly requested output');
}
test_reset(); test_init(); $GLOBALS['test_footer'] = true;
$layout = test_capture(function () { SDCW_enqueue_scripts(); SDCW_enqueue_scripts(); });
$check(substr_count($layout, $style) === 1 && empty(wp_scripts()->queue), 'Late frontend helper prints layout once without bypassing browser detection');

$group = 'explicit';
foreach (array('queued', 'done', 'dependency') as $case) {
    test_reset(); test_init();
    if ($case === 'queued') { wp_enqueue_script('simple-digital-clock'); }
    elseif ($case === 'done') { wp_scripts()->done[] = 'simple-digital-clock'; }
    else {
        wp_register_script('consumer', 'https://fixture.invalid/consumer.js', array('simple-digital-clock'), '1', array());
        wp_enqueue_script('consumer');
    }
    $snapshot = serialize(wp_scripts());
    $queue = wp_scripts()->queue;
    $markup = test_capture();
    if ($case === 'done') {
        $check($markup === '' && serialize(wp_scripts()) === $snapshot && $GLOBALS['test_normal_prints'] === 0, 'Already emitted runtime requires neither another Core print nor a loader');
    } else {
        $check(substr_count($markup, $script) === 1 && strpos($markup, 'simple-digital-clock-loader') === false && strpos($markup, 'simple-digital-clock-runtime') === false, $case . ': pending explicit runtime prints directly through Core without a compatibility loader');
        $check($GLOBALS['test_normal_prints'] === 1 && wp_script_is('simple-digital-clock', 'done') && wp_scripts()->queue === $queue, $case . ': late Core print marks only the requested runtime done and preserves the queue');
        $check(test_capture() === '' && $GLOBALS['test_normal_prints'] === 1, $case . ': repeated footer does not print an explicit runtime twice');
        if ($case === 'dependency') { $check(!wp_script_is('consumer', 'done') && strpos($markup, 'consumer-js') === false, 'Printing the pending runtime leaves its queued consumer for normal Core processing'); }
    }
    $check(empty($GLOBALS['SDCW_frontend_loader_printed']), $case . ': skipped loader is not recorded as printed');
}

$group = 'scope';
foreach (array('admin', 'feed', 'robots', 'trackback', 'json', 'excerpt') as $flag) {
    test_reset(); $GLOBALS['test_' . $flag] = true;
    $check(SDCW_enqueue_rendered_clock_assets($clock) === $clock && empty(wp_scripts()->queue) && empty($GLOBALS['test_style_queue']), 'Excluded owned render preserves bytes and requests no resources: ' . $flag);
    if ($flag !== 'excerpt') {
        $level = ob_get_level();
        $check(test_capture() === '' && ob_get_level() === $level && empty(wp_scripts()->registered), 'Excluded frontend request emits no bootstrap or registration: ' . $flag);
    }
}
test_reset(); SDCW_enqueue_rendered_clock_assets('  ');
$check(empty(wp_scripts()->queue) && empty($GLOBALS['test_style_queue']) && test_capture('SDCW_print_clock_styles') === '', 'Empty owned output requests and prints no layout');

$group = 'editor';
test_reset(); $GLOBALS['test_admin'] = true;
$check(isset($GLOBALS['test_actions']['enqueue_block_assets'][10]['SDCW_enqueue_editor_clock_assets']), 'Block-editor asset hook retains its preview callback');
SDCW_enqueue_editor_clock_assets();
$check(empty(wp_scripts()->queue), 'Admin without a screen has no runtime');
$GLOBALS['test_screen'] = new class { public function is_block_editor() { return false; } };
SDCW_enqueue_editor_clock_assets();
$check(empty(wp_scripts()->queue), 'Ordinary admin screen has no runtime');
$GLOBALS['test_screen'] = new class { public function is_block_editor() { return true; } };
SDCW_enqueue_editor_clock_assets(); SDCW_enqueue_editor_clock_assets();
$check(wp_scripts()->queue === array('simple-digital-clock') && count($GLOBALS['test_style_queue']) === 1, 'Empty editor preview enqueues the normal runtime and layout exactly once');
$check(test_capture() === '', 'Editor preview never receives the frontend compatibility loader');
$check(ob_get_level() === $initial_buffer_level, 'All checks preserve the original caller output-buffer level');
$failed = count(array_filter($checks, function ($row) { return !$row['passed']; }));
echo json_encode(array('checks' => $checks, 'failed' => $failed, 'scope' => 'Offline Core queue doubles and private capture lifecycle; actual Core filters, HTTP MIME and browser network execution require separate acceptance')), "\n";
exit($failed ? 1 : 0);
