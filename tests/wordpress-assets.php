<?php
// Routing/queue contract doubles. Native tokenization and HTTP counts run in the lab.
define('ABSPATH', __DIR__);
define('SDCW_URL', 'https://fixture.invalid/plugin/');
define('SDCW_PATH', $argv[1] . '/');
$GLOBALS['actions'] = array();
$GLOBALS['filters'] = array();
$GLOBALS['scripts'] = array();
$GLOBALS['styles'] = array();
$GLOBALS['registered'] = array();
$GLOBALS['registered_styles'] = array();
$GLOBALS['style_done'] = false;
$GLOBALS['admin'] = false;
$GLOBALS['feed'] = false;
$GLOBALS['excerpt'] = false;
$GLOBALS['tag'] = true;
$GLOBALS['screen'] = null;
function add_action($hook, $callback, $priority = 10) { $GLOBALS['actions'][$hook][] = $callback; }
function add_filter($hook, $callback, $priority = 10) { $GLOBALS['filters'][$hook][] = $callback; }
function wp_register_script($handle, $url, $deps, $version, $options) { $GLOBALS['registered'][$handle] = array($url, $deps, $version, $options); }
function wp_register_style($handle, $src, $deps, $version) { $GLOBALS['registered_styles'][$handle] = array('src' => $src, 'inline' => array()); }
function wp_add_inline_style($handle, $css) { $GLOBALS['registered_styles'][$handle]['inline'][] = $css; }
function wp_enqueue_script($handle) { $GLOBALS['scripts'][$handle] = true; }
function wp_enqueue_style($handle) { $GLOBALS['styles'][$handle] = true; }
function is_admin() { return $GLOBALS['admin']; }
function is_feed() { return $GLOBALS['feed']; }
function doing_filter($name) { return $GLOBALS['excerpt'] && $name === 'get_the_excerpt'; }
function get_current_screen() { return $GLOBALS['screen']; }
function wp_style_is($handle, $state) {
    if ($state === 'registered') { return isset($GLOBALS['registered_styles'][$handle]); }
    return $state === 'done' ? $GLOBALS['style_done'] : isset($GLOBALS['styles'][$handle]);
}
function wp_print_styles($handles) { $GLOBALS['style_done'] = true; echo 'style'; }
require SDCW_PATH . 'includes/simple-digital-clock-assets.php';
$checks = array();
$assert = function ($ok, $name) use (&$checks) { $checks[] = array('passed' => (bool) $ok, 'name' => $name); };
SDCW_register_assets();
SDCW_register_assets();
$assert(!$GLOBALS['scripts'] && !$GLOBALS['styles'], 'Registering handles creates no requests');
$assert($GLOBALS['registered_styles']['simple-digital-clock-block-style']['src'] === false, 'Integration style has no external source');
$assert(count($GLOBALS['registered_styles']['simple-digital-clock-block-style']['inline']) === 1, 'Repeated registration adds the inline rule only once');
$assert(!isset($GLOBALS['actions']['wp_enqueue_scripts']), 'No global frontend enqueue hook');
$assert(!isset($GLOBALS['actions']['admin_enqueue_scripts']), 'No global admin runtime hook');
foreach (array('render_block', 'the_content', 'the_excerpt', 'widget_block_content', 'widget_text', 'widget_text_content', 'widget_custom_html_content') as $hook) {
    $assert(empty($GLOBALS['filters'][$hook]), 'Intermediate output cannot enqueue: ' . $hook);
}
$assert(in_array('SDCW_start_frontend_output', $GLOBALS['actions']['template_redirect'], true), 'Final frontend response is observed');
$clock = '<timenow-zone-sdcw second></timenow-zone-sdcw>';
$assets = '<style>layout</style><script src="clock.js"></script>';
$vectors = array(
    array('plain text', false),
    array($clock, true),
    array(str_repeat($clock, 5), true),
    array('<!-- ' . $clock . ' -->', false),
    array('<!-->' . $clock, true),
    array('<!--->' . $clock, true),
    array('<!-- example --!>' . $clock, true),
    array('<div data-x="' . $clock . '">text</div>', false),
    array('<div data-x=unquoted"value>' . $clock, true),
    array('<template>' . $clock . '<template>' . $clock . '</template></template>', false),
    array('<template>' . $clock . '</template>' . $clock, true),
    array('<plaintext>' . $clock, false),
    array('<select>' . $clock . '</select>', false),
    array('<select><script>var example = "</select>' . $clock . '";</script></select>', false),
    array('<select><script>var example = "</select>' . $clock . '";</script></select>' . $clock, true),
    array('<select>' . $clock . '</select>' . $clock, true),
    array('<script><!--<script></script>' . $clock . '</script>', false),
    array('<script><!--<script></script></script>' . $clock, true),
    array('<script><!-- --></script>' . $clock, true),
    array('<timenow-zone-sdcw-fake></timenow-zone-sdcw-fake>', false),
    array('&lt;timenow-zone-sdcw&gt;', false),
);
foreach (array('script', 'style', 'textarea', 'title', 'iframe', 'xmp', 'noscript', 'noembed', 'noframes') as $raw) {
    $vectors[] = array('<' . $raw . ' data-example="</' . $raw . '>">' . $clock . '</' . $raw . '>', false);
    $vectors[] = array('<' . $raw . '>' . $clock . '</' . strtoupper($raw) . '>' . $clock, true);
}
foreach ($vectors as $index => $vector) {
    list($html, $expected) = $vector;
    $assert(SDCW_output_has_clock($html) === $expected, 'Standalone HTML vector ' . $index);
    // Every split includes tag-name, attribute, raw-text and comment boundaries.
    for ($split = 0; $split <= strlen($html); ++$split) {
        $observer = new SDCW_Clock_Output_Observer();
        $observer->feed(substr($html, 0, $split));
        $observer->feed(substr($html, $split));
        $assert($observer->has_clock() === $expected, 'Two-chunk vector ' . $index . '/' . $split);
    }
    $GLOBALS['SDCW_frontend_observer'] = new SDCW_Clock_Output_Observer();
    $GLOBALS['SDCW_frontend_assets_delivered'] = false;
    $GLOBALS['SDCW_frontend_asset_markup'] = $assets;
    $output = '';
    foreach (str_split($html) as $byte) { $output .= SDCW_filter_frontend_output($byte, PHP_OUTPUT_HANDLER_FLUSH); }
    $assert(substr_count($output, $assets) === (int) $expected, 'One-byte delivery asset count ' . $index);
    $assert(str_replace($assets, '', $output) === $html, 'One-byte delivery preserves all HTML bytes ' . $index);
}
$GLOBALS['SDCW_frontend_observer'] = new SDCW_Clock_Output_Observer();
$GLOBALS['SDCW_frontend_assets_delivered'] = false;
unset($GLOBALS['SDCW_frontend_asset_markup']);
$assert(SDCW_filter_frontend_output($clock, PHP_OUTPUT_HANDLER_FLUSH) === $clock, 'Clock bytes stream before footer capture');
SDCW_filter_frontend_output('discarded bytes', PHP_OUTPUT_HANDLER_CLEAN);
$GLOBALS['SDCW_frontend_asset_markup'] = $assets;
$assert(SDCW_filter_frontend_output('<!-- -->', PHP_OUTPUT_HANDLER_FINAL) === $assets . '<!-- -->', 'Clean cannot undo a clock already delivered');
$GLOBALS['SDCW_frontend_observer'] = new SDCW_Clock_Output_Observer();
$GLOBALS['SDCW_frontend_assets_delivered'] = false;
SDCW_filter_frontend_output($clock, PHP_OUTPUT_HANDLER_CLEAN);
$assert(SDCW_filter_frontend_output('empty', PHP_OUTPUT_HANDLER_FINAL) === 'empty', 'Discarded writes cannot load resources');
// Large attribute data is consumed incrementally, without retaining its value.
$observer = new SDCW_Clock_Output_Observer();
$observer->feed('<div data-value="');
$before = memory_get_usage(false);
$chunk = str_repeat('x', 8192);
for ($i = 0; $i < 4096; ++$i) { $observer->feed($chunk); }
$assert(memory_get_usage(false) - $before < 65536, '32 MiB attribute uses bounded observer memory');
$observer->feed('">' . $clock);
$assert($observer->has_clock(), 'Clock after large split attribute remains detectable');
$observer = new SDCW_Clock_Output_Observer();
$observer->feed($clock . '<textarea>example');
$assert($observer->feed('<!-- -->', true) === null, 'Capture cannot inject inside raw text');
$assert($observer->feed('</textarea>', true) === strlen('</textarea>'), 'Safe closing boundary at the exact chunk end is usable');
$assert($observer->feed('', true) === 0, 'An empty final flush retains a safe insertion boundary');
$GLOBALS['scripts'] = array(); $GLOBALS['styles'] = array();
$GLOBALS['admin'] = true;
SDCW_enqueue_editor_clock_assets();
$assert(!$GLOBALS['scripts'], 'Admin without an editor screen has no runtime');
$GLOBALS['screen'] = new class { public function is_block_editor() { return false; } };
SDCW_enqueue_editor_clock_assets();
$assert(!$GLOBALS['scripts'], 'Ordinary admin screen has no runtime');
$GLOBALS['screen'] = new class { public function is_block_editor() { return true; } };
SDCW_enqueue_editor_clock_assets();
$assert(isset($GLOBALS['scripts']['simple-digital-clock']), 'Block editor has preview assets before insertion');
$failed = count(array_filter($checks, function ($row) { return !$row['passed']; }));
echo json_encode(array('checks' => $checks, 'failed' => $failed)), "\n";
exit($failed ? 1 : 0);
