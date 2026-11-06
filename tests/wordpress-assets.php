<?php
// Routing/queue doubles; the disposable Core lab checks actual rendering and HTTP.
define('ABSPATH', __DIR__);
define('SDCW_URL', 'https://fixture.invalid/plugin/');
define('SDCW_PATH', $argv[1] . '/');
$GLOBALS['actions'] = array();
$GLOBALS['filters'] = array();
$GLOBALS['registered'] = array();
$GLOBALS['registered_styles'] = array();
$GLOBALS['scripts'] = array();
$GLOBALS['styles'] = array();
$GLOBALS['printed_scripts'] = 0;
$GLOBALS['printed_styles'] = 0;
$GLOBALS['footer'] = false;
$GLOBALS['screen'] = null;
foreach (array('admin', 'feed', 'robots', 'trackback', 'json', 'excerpt') as $flag) { $GLOBALS[$flag] = false; }
function add_action($hook, $callback, $priority = 10) { $GLOBALS['actions'][$hook][$callback] = $priority; }
function add_filter($hook, $callback, $priority = 10) { $GLOBALS['filters'][$hook][$callback] = $priority; }
function wp_register_script($handle, $url, $deps, $version, $options) { $GLOBALS['registered'][$handle] = compact('url', 'deps', 'version', 'options'); }
function wp_register_style($handle, $src, $deps, $version) { $GLOBALS['registered_styles'][$handle] = array('src' => $src, 'inline' => array()); }
function wp_add_inline_style($handle, $css) { $GLOBALS['registered_styles'][$handle]['inline'][] = $css; }
function wp_enqueue_script($handle) { $GLOBALS['scripts'][$handle] = true; }
function wp_enqueue_style($handle) { $GLOBALS['styles'][$handle] = true; }
function is_admin() { return $GLOBALS['admin']; }
function is_feed() { return $GLOBALS['feed']; }
function is_robots() { return $GLOBALS['robots']; }
function is_trackback() { return $GLOBALS['trackback']; }
function wp_is_json_request() { return $GLOBALS['json']; }
function doing_filter($hook) { return $hook === 'get_the_excerpt' && $GLOBALS['excerpt']; }
function did_action($hook) { return $hook === 'wp_print_footer_scripts' && $GLOBALS['footer']; }
function get_current_screen() { return $GLOBALS['screen']; }
function wp_script_is($handle, $state) {
    if ($state === 'registered') { return isset($GLOBALS['registered'][$handle]); }
    return $state === 'done' ? $GLOBALS['printed_scripts'] > 0 : isset($GLOBALS['scripts'][$handle]);
}
function wp_style_is($handle, $state) {
    if ($state === 'registered') { return isset($GLOBALS['registered_styles'][$handle]); }
    return $state === 'done' ? $GLOBALS['printed_styles'] > 0 : isset($GLOBALS['styles'][$handle]);
}
function wp_print_styles($handles) { ++$GLOBALS['printed_styles']; }
function wp_print_scripts($handles) { ++$GLOBALS['printed_scripts']; }
$level = ob_get_level();
require SDCW_PATH . 'includes/simple-digital-clock-assets.php';
$checks = array();
$assert = function ($ok, $label) use (&$checks) { $checks[] = array('passed' => (bool) $ok, 'name' => $label); };
$assert(ob_get_level() === $level, 'Loading the plugin adds no output buffer');
$assert(!$GLOBALS['registered'] && !$GLOBALS['registered_styles'], 'Unused page does not register assets');
$assert(!$GLOBALS['scripts'] && !$GLOBALS['styles'], 'Unused page queues no resources');
foreach (array('init', 'template_redirect', 'wp_head', 'wp_footer', 'wp_enqueue_scripts', 'admin_enqueue_scripts', 'shutdown') as $hook) {
    $assert(empty($GLOBALS['actions'][$hook]), 'No global resource/output action: ' . $hook);
}
$assert(array_keys($GLOBALS['filters']) === array('render_block_simple-digital-clock-block/widget-block'), 'Only the owned block render hook is installed');
$source = file_get_contents(SDCW_PATH . 'includes/simple-digital-clock-assets.php');
$assert(!preg_match('/\bob_(?:start|clean|flush|get_clean)\s*\(/', $source), 'Asset code cannot install or capture an output buffer');
$assert(!file_exists(SDCW_PATH . 'includes/simple-digital-clock-output.php'), 'Global HTML observer is not shipped');
$clock = '<timenow-zone-sdcw second caption="A &amp; B"></timenow-zone-sdcw>';
foreach (array('admin', 'feed', 'robots', 'trackback', 'json', 'excerpt') as $flag) {
    $GLOBALS[$flag] = true;
    $assert(SDCW_enqueue_rendered_clock_assets($clock) === $clock, 'Excluded render preserves bytes: ' . $flag);
    $assert(!$GLOBALS['scripts'] && !$GLOBALS['registered'], 'Excluded render creates no resources: ' . $flag);
    $GLOBALS[$flag] = false;
}
SDCW_enqueue_rendered_clock_assets('  ');
$assert(!$GLOBALS['scripts'], 'Empty owned output does not enqueue');
SDCW_print_clock_styles();
$assert($GLOBALS['printed_styles'] === 0, 'No style print without an enqueue');
for ($i = 0; $i < 5; ++$i) {
    $assert(SDCW_enqueue_rendered_clock_assets($clock) === $clock, 'Owned render preserves saved bytes: ' . $i);
}
$assert(count($GLOBALS['scripts']) === 1 && count($GLOBALS['styles']) === 1, 'Five clocks share one script/style handle');
$assert(count($GLOBALS['actions']['wp_footer']) === 1, 'Only one style flush callback is installed on demand');
$assert($GLOBALS['registered_styles']['simple-digital-clock-block-style']['src'] === false, 'No external integration stylesheet');
$assert(count($GLOBALS['registered_styles']['simple-digital-clock-block-style']['inline']) === 1, 'Repeated registration keeps one inline rule');
$assert($GLOBALS['registered']['simple-digital-clock']['options'] === array('strategy' => 'async', 'in_footer' => true), 'Core retains async/footer delivery');
SDCW_print_clock_styles();
SDCW_print_clock_styles();
$assert($GLOBALS['printed_styles'] === 1, 'Repeated footers do not duplicate styles');
$GLOBALS['footer'] = true;
SDCW_enqueue_scripts();
SDCW_enqueue_scripts();
$assert($GLOBALS['printed_scripts'] === 1 && $GLOBALS['printed_styles'] === 1, 'Late explicit clocks print pending resources once');
$assert(ob_get_level() === $level, 'Rendering and late delivery add no output buffer');
$GLOBALS['scripts'] = array(); $GLOBALS['styles'] = array();
$GLOBALS['admin'] = true;
SDCW_enqueue_editor_clock_assets();
$assert(!$GLOBALS['scripts'], 'Admin without a screen has no runtime');
$GLOBALS['screen'] = new class { public function is_block_editor() { return false; } };
SDCW_enqueue_editor_clock_assets();
$assert(!$GLOBALS['scripts'], 'Ordinary admin has no runtime');
$GLOBALS['screen'] = new class { public function is_block_editor() { return true; } };
SDCW_enqueue_editor_clock_assets();
$assert(isset($GLOBALS['scripts']['simple-digital-clock']), 'Empty editor has preview resources');
$failed = count(array_filter($checks, function ($row) { return !$row['passed']; }));
echo json_encode(array('checks' => $checks, 'failed' => $failed)), "\n";
exit($failed ? 1 : 0);
