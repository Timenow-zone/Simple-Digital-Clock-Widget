<?php
// Offline routing/streaming doubles. Native WordPress acceptance remains separate.
define('ABSPATH', __DIR__);
$assets_root = isset($argv[1]) ? realpath($argv[1]) : false;
if (!$assets_root) { throw new RuntimeException('Invalid assets root'); }
define('SDCW_PATH', $assets_root . '/');
define('SDCW_URL', 'https://fixture.invalid/plugin/');
$GLOBALS['test_actions'] = array();
$GLOBALS['test_filters'] = array();
function add_action($hook, $callback, $priority = 10) { $GLOBALS['test_actions'][$hook][$priority][$callback] = $callback; }
function add_filter($hook, $callback, $priority = 10) { $GLOBALS['test_filters'][$hook][$priority][$callback] = $callback; }
function is_admin() { return !empty($GLOBALS['test_admin']); }
function is_feed() { return !empty($GLOBALS['test_feed']); }
function is_robots() { return !empty($GLOBALS['test_robots']); }
function is_trackback() { return !empty($GLOBALS['test_trackback']); }
function wp_is_json_request() { return !empty($GLOBALS['test_json']); }
function doing_filter($hook) { return $hook === 'get_the_excerpt' && !empty($GLOBALS['test_excerpt']); }
function did_action($hook) { return $hook === 'wp_print_footer_scripts' && !empty($GLOBALS['test_footer']); }
function get_current_screen() { return isset($GLOBALS['test_screen']) ? $GLOBALS['test_screen'] : null; }
function wp_register_script($handle, $src, $deps, $version, $options) {
    $GLOBALS['test_scripts'][$handle] = compact('src', 'deps', 'version', 'options');
}
function wp_register_style($handle, $src, $deps, $version) { $GLOBALS['test_styles'][$handle] = array('src' => $src, 'version' => $version, 'inline' => array()); }
function wp_add_inline_style($handle, $css) { $GLOBALS['test_styles'][$handle]['inline'][] = $css; }
function wp_enqueue_script($handle) { $GLOBALS['test_script_queue'][$handle] = true; }
function wp_enqueue_style($handle) { $GLOBALS['test_style_queue'][$handle] = true; }
function wp_add_inline_script($handle, $data, $position = 'after') {
    if (!wp_script_is($handle, 'registered')) { return false; }
    $GLOBALS['test_script_extra'][$handle][$position][] = $data;
    return true;
}
function wp_localize_script($handle, $object_name, $data) {
    if (!wp_script_is($handle, 'registered')) { return false; }
    $GLOBALS['test_script_extra'][$handle]['before'][] = 'var ' . $object_name . '=' . json_encode($data) . ';';
    return true;
}
function wp_script_is($handle, $state) {
    if ($state === 'registered') { return isset($GLOBALS['test_scripts'][$handle]); }
    return $state === 'done' ? isset($GLOBALS['test_script_done'][$handle]) : isset($GLOBALS['test_script_queue'][$handle]);
}
function wp_style_is($handle, $state) {
    if ($state === 'registered') { return isset($GLOBALS['test_styles'][$handle]); }
    return $state === 'done' ? isset($GLOBALS['test_style_done'][$handle]) : isset($GLOBALS['test_style_queue'][$handle]);
}
function wp_print_styles($handles) {
    foreach ($handles as $handle) {
        if (!wp_style_is($handle, 'done')) {
            $GLOBALS['test_style_done'][$handle] = true;
            echo '<style id="', $handle, '-inline-css">', implode('', $GLOBALS['test_styles'][$handle]['inline']), '</style>';
        }
    }
}
class SDCW_Test_Scripts {
    public function do_items($handles, $group) {
        if ($group !== 1) { throw new RuntimeException('Wrong footer group'); }
        foreach ($handles as $handle) {
            if (!wp_script_is($handle, 'done')) {
                $GLOBALS['test_script_done'][$handle] = true;
                $registered = $GLOBALS['test_scripts'][$handle];
                // Model the output of Core tag/nonce and inline-data filters.
                echo '<script nonce="fixture-nonce" id="runtime-before">window.beforeClock=1;</script>';
                foreach (isset($GLOBALS['test_script_extra'][$handle]['before']) ? $GLOBALS['test_script_extra'][$handle]['before'] : array() as $data) {
                    echo '<script nonce="fixture-nonce">', $data, '</script>';
                }
                echo '<script async nonce="fixture-nonce" data-core-filter="kept" id="', $handle, '-js" src="', $registered['src'], '?ver=', $registered['version'], '"></script>';
                foreach (isset($GLOBALS['test_script_extra'][$handle]['after']) ? $GLOBALS['test_script_extra'][$handle]['after'] : array() as $data) {
                    echo '<script nonce="fixture-nonce">', $data, '</script>';
                }
                echo '<script nonce="fixture-nonce" id="runtime-after">window.afterClock=1;</script>';
            }
        }
    }
}
function wp_scripts() { return new SDCW_Test_Scripts(); }
function wp_print_scripts($handles) { wp_scripts()->do_items($handles, 1); }
function test_reset() {
    foreach (array('scripts', 'styles', 'script_queue', 'style_queue', 'script_done', 'style_done', 'script_extra') as $name) { $GLOBALS['test_' . $name] = array(); }
    foreach (array('admin', 'feed', 'robots', 'trackback', 'json', 'excerpt', 'footer') as $name) { $GLOBALS['test_' . $name] = false; }
    if (isset($GLOBALS['test_base_actions'])) { $GLOBALS['test_actions'] = $GLOBALS['test_base_actions']; }
    foreach (array('SDCW_frontend_assets_delivered', 'SDCW_frontend_asset_markup', 'SDCW_frontend_observer', 'SDCW_frontend_output_blocker', 'test_screen') as $name) { unset($GLOBALS[$name]); }
}
test_reset();
$initial_buffer_level = ob_get_level();
require SDCW_PATH . 'includes/simple-digital-clock-assets.php';
$GLOBALS['test_base_actions'] = $GLOBALS['test_actions'];
function test_capture() {
    ob_start();
    if (function_exists('SDCW_capture_frontend_assets')) {
        SDCW_capture_frontend_assets();
    } else {
        // Model normal footer printing for the frozen r14 negative control.
        wp_scripts()->do_items(array_keys($GLOBALS['test_script_queue']), 1);
        SDCW_print_clock_styles();
    }
    return ob_get_clean();
}
function test_stream($chunks) {
    if (!class_exists('SDCW_Clock_Output_Observer')) { return implode('', $chunks); }
    $GLOBALS['SDCW_frontend_observer'] = new SDCW_Clock_Output_Observer();
    $result = '';
    foreach ($chunks as $chunk) { $result .= SDCW_filter_frontend_output($chunk, 0); }
    return $result . SDCW_filter_frontend_output('', PHP_OUTPUT_HANDLER_FINAL);
}
$clock = '<timenow-zone-sdcw class="wp-block-simple-digital-clock-block-widget-block" second></timenow-zone-sdcw>';

$checks = array();
$group = 'registration';
$check = function ($condition, $label) use (&$checks, &$group) { $checks[] = array('group' => $group, 'passed' => (bool) $condition, 'name' => $label); };
$check(ob_get_level() === $initial_buffer_level, 'Loading the plugin adds no output buffer');
$check(array_keys($GLOBALS['test_filters']) === array('render_block_simple-digital-clock-block/widget-block'), 'Only the owned block render hook requests layout');
$check(isset($GLOBALS['test_filters']['render_block_simple-digital-clock-block/widget-block'][10]['SDCW_enqueue_rendered_clock_assets']), 'Owned block hook retains its resource callback');
$check(empty($GLOBALS['test_actions']['admin_enqueue_scripts']), 'Ordinary admin has no global enqueue');
$script = 'id="simple-digital-clock-js"';
$style = 'id="simple-digital-clock-block-style-inline-css"';
$check(empty($GLOBALS['test_script_queue']) && empty($GLOBALS['test_style_queue']), 'Loading assets does not queue resources');
$check(isset($GLOBALS['test_actions']['template_redirect'][PHP_INT_MAX]['SDCW_start_frontend_output']), 'Streaming observer starts on template_redirect');
$check(empty($GLOBALS['test_actions']['wp_enqueue_scripts']), 'No global JavaScript enqueue action');
$check(isset($GLOBALS['test_actions']['init'][9]['SDCW_register_assets']), 'Stable handles register on init priority 9');
test_reset();
$check(!wp_add_inline_script('simple-digital-clock', 'window.tooEarly=1;') && !wp_localize_script('simple-digital-clock', 'TooEarly', array()), 'Doubles reject attachments to an unregistered handle');
foreach (isset($GLOBALS['test_actions']['init'][9]) ? $GLOBALS['test_actions']['init'][9] : array() as $callback) { call_user_func($callback); }
$check(wp_script_is('simple-digital-clock', 'registered') && empty($GLOBALS['test_script_queue']) && empty($GLOBALS['test_style_queue']), 'Early registration queues no script or stylesheet');
$group = 'core-data';
$attached = wp_add_inline_script('simple-digital-clock', 'window.attachedBefore=1;', 'before');
$attached = wp_localize_script('simple-digital-clock', 'ClockSettings', array('locale' => 'uk', 'caption' => 'Київ 🕒')) && $attached;
$attached = wp_add_inline_script('simple-digital-clock', 'window.attachedAfter=1;', 'after') && $attached;
$check($attached, 'Inline and localized data attach successfully before footer capture');
$marker = test_capture(); $result = test_stream(array($clock, $marker));
$before_position = strpos($result, 'window.attachedBefore=1;');
$localized_position = strpos($result, 'var ClockSettings=' . json_encode(array('locale' => 'uk', 'caption' => 'Київ 🕒')) . ';');
$after_position = strpos($result, 'window.attachedAfter=1;');
$check($before_position !== false && $localized_position !== false && $after_position !== false &&
    $before_position < strpos($result, $script) && $localized_position < strpos($result, $script) && $after_position > strpos($result, $script), 'Early attached data survives the final stream gate in order');
$check(substr_count($result, 'nonce="fixture-nonce"') === 6, 'All captured Core and attached scripts retain their nonce');
$check(substr_count($result, 'window.attachedBefore=1;') === 1 && substr_count($result, 'window.attachedAfter=1;') === 1, 'Attached data is not duplicated');
test_reset();
foreach (isset($GLOBALS['test_actions']['init'][9]) ? $GLOBALS['test_actions']['init'][9] : array() as $callback) { call_user_func($callback); }
wp_add_inline_script('simple-digital-clock', 'window.emptyBefore=1;', 'before');
wp_localize_script('simple-digital-clock', 'EmptySettings', array('locale' => 'uk'));
wp_add_inline_script('simple-digital-clock', 'window.emptyAfter=1;', 'after');
$marker = test_capture(); $result = test_stream(array('<p>Empty.</p>', $marker));
$check(strpos($result, '<script') === false, 'Attached inline/localized data stays absent from a clock-free response');
$group = 'clockless';
foreach (array('empty' => '<p>Nothing.</p>', 'comment' => '<!-- ' . $clock . ' -->', 'attribute' => '<div data-example="<timenow-zone-sdcw>">Text</div>', 'escaped' => htmlspecialchars($clock, ENT_QUOTES, 'UTF-8'), 'select' => '<select>' . $clock . '</select>',
    'script' => '<script type="application/json">' . json_encode($clock) . '</script>', 'template' => '<template>' . $clock . '</template>',
    'textarea' => '<textarea>' . $clock . '</textarea>', 'noscript' => '<noscript>' . $clock . '</noscript>') as $name => $markup) {
    test_reset(); $marker = test_capture(); $result = test_stream(array($markup, $marker));
    $check(strpos($result, $script) === false && strpos($result, 'nonce="fixture-nonce"') === false, $name . ': zero plugin JavaScript');
    $check(strpos($result, $style) === false, $name . ': no raw-only layout rule');
}
$group = 'delivery';
test_reset(); $marker = test_capture(); $result = test_stream(array('<timenow-', substr($clock, strlen('<timenow-')), $marker));
$check(substr_count($result, $script) === 1, 'Split raw clock receives one runtime');
$check(strpos($result, $style) === false && empty($GLOBALS['test_style_queue']), 'Raw clock keeps its layout');
$check(strpos($result, 'data-core-filter="kept"') !== false && substr_count($result, 'nonce="fixture-nonce"') === 3, 'Captured Core attributes and nonce survive');
$check(strpos($result, 'runtime-before') < strpos($result, $script) && strpos($result, 'runtime-after') > strpos($result, $script), 'Core before/after inline data order survives');
$registered = isset($GLOBALS['test_scripts']['simple-digital-clock']) ? $GLOBALS['test_scripts']['simple-digital-clock'] : array();
$check(isset($registered['version']) && $registered['version'] === '0.8.1', 'Runtime cache version remains 0.8.1');
$check(isset($registered['options']) && $registered['options'] === array('strategy' => 'async', 'in_footer' => true), 'Async/footer registration is unchanged');
$group = 'clockless';
test_reset(); SDCW_enqueue_rendered_clock_assets($clock); $marker = test_capture(); $result = test_stream(array('<p>Discarded.</p>', $marker));
$check(empty($GLOBALS['test_script_queue']) && strpos($result, $script) === false, 'Discarded owned render leaks no runtime');
$check(!empty($GLOBALS['test_style_queue']), 'Discarded owned render may retain inline layout request');
$group = 'streaming';
test_reset(); $marker = test_capture(); $GLOBALS['test_footer'] = true; ob_start(); SDCW_enqueue_rendered_clock_assets($clock); SDCW_enqueue_scripts(); $layout = ob_get_clean();
$result = test_stream(array($marker, $clock, $clock));
$check(substr_count($result, $script) === 1, 'Late owned and explicit clocks share one runtime');
$check(substr_count($layout, $style) === 1, 'Late owned layout prints exactly once');
$check(empty($GLOBALS['test_script_queue']), 'Late explicit helper does not bypass final stream gate');
if (function_exists('SDCW_filter_frontend_output') && class_exists('SDCW_Clock_Output_Observer')) {
    test_reset(); test_capture(); $GLOBALS['SDCW_frontend_observer'] = new SDCW_Clock_Output_Observer();
    SDCW_filter_frontend_output('<timenow-', PHP_OUTPUT_HANDLER_CLEAN);
    $clean = SDCW_filter_frontend_output('zone-sdcw></timenow-zone-sdcw>', 0);
    $check(!$GLOBALS['SDCW_frontend_observer']->has_clock() && strpos($clean, $script) === false, 'CLEAN bytes do not pollute lexical history');
    test_reset(); $GLOBALS['SDCW_frontend_observer'] = new SDCW_Clock_Output_Observer();
    SDCW_filter_frontend_output($clock, 0);
    test_capture();
    $final = SDCW_filter_frontend_output('', PHP_OUTPUT_HANDLER_FINAL);
    $check(substr_count($final, $script) === 1 && SDCW_filter_frontend_output('', PHP_OUTPUT_HANDLER_FINAL) === '', 'Empty final flush delivers captured runtime exactly once');
} else {
    $check(false, 'CLEAN bytes do not pollute lexical history');
    $check(false, 'Empty final flush delivers captured runtime exactly once');
}
$group = 'scope';
foreach (array('admin', 'feed', 'robots', 'trackback', 'json', 'excerpt') as $flag) {
    test_reset(); $GLOBALS['test_' . $flag] = true;
    $check(SDCW_enqueue_rendered_clock_assets($clock) === $clock, 'Excluded render preserves bytes: ' . $flag);
    $check(!$GLOBALS['test_script_queue'] && !$GLOBALS['test_style_queue'], 'Excluded render requests no resources: ' . $flag);
}
test_reset(); SDCW_enqueue_rendered_clock_assets('  ');
$check(!$GLOBALS['test_script_queue'] && !$GLOBALS['test_style_queue'], 'Empty owned output requests no resources');
ob_start(); SDCW_print_clock_styles(); $unused_style = ob_get_clean();
$check($unused_style === '', 'No style print without an enqueue');
foreach (array('admin', 'feed', 'robots', 'trackback', 'json') as $flag) {
    test_reset(); $GLOBALS['test_' . $flag] = true; $level = ob_get_level(); if (function_exists('SDCW_start_frontend_output')) { SDCW_start_frontend_output(); }
    $check(ob_get_level() === $level && !isset($GLOBALS['SDCW_frontend_observer']), 'Special request skips output observer: ' . $flag);
}
$group = 'editor';
test_reset(); $GLOBALS['test_admin'] = true;
$check(isset($GLOBALS['test_actions']['enqueue_block_assets'][10]['SDCW_enqueue_editor_clock_assets']), 'Block-editor asset hook retains its preview callback');
SDCW_enqueue_editor_clock_assets();
$check(!$GLOBALS['test_script_queue'], 'Admin without a screen has no runtime');
$GLOBALS['test_screen'] = new class { public function is_block_editor() { return false; } };
SDCW_enqueue_editor_clock_assets();
$check(!$GLOBALS['test_script_queue'], 'Ordinary admin has no runtime');
$GLOBALS['test_screen'] = new class { public function is_block_editor() { return true; } };
SDCW_enqueue_editor_clock_assets();
SDCW_enqueue_editor_clock_assets();
$check(count($GLOBALS['test_script_queue']) === 1 && count($GLOBALS['test_style_queue']) === 1, 'Editor preview still enqueues runtime and layout once');
$group = 'clockless';
test_reset(); SDCW_enqueue_scripts(); $marker = test_capture(); $result = test_stream(array('<p>No server clock.</p>', $marker));
$check(strpos($result, $script) === false, 'Explicit helper alone does not authorize a client-only future clock');
$group = 'registration';
test_reset(); SDCW_register_assets(); SDCW_register_assets();
$check($GLOBALS['test_styles']['simple-digital-clock-block-style']['src'] === false && count($GLOBALS['test_styles']['simple-digital-clock-block-style']['inline']) === 1, 'Repeated registration retains one source-free layout rule');
$GLOBALS['test_scripts']['simple-digital-clock']['src'] = 'https://fixture.invalid/existing.js';
SDCW_register_assets();
$check($GLOBALS['test_scripts']['simple-digital-clock']['src'] === 'https://fixture.invalid/existing.js', 'Guarded registration preserves an existing script handle');
$group = 'delivery';
test_reset(); $rendered = '';
for ($i = 0; $i < 5; ++$i) { $rendered .= SDCW_enqueue_rendered_clock_assets($clock); }
SDCW_enqueue_scripts(); $marker = test_capture();
ob_start(); SDCW_print_clock_styles(); SDCW_print_clock_styles(); $layout = ob_get_clean();
$result = test_stream(array($rendered, $marker, $layout));
$capture = isset($GLOBALS['SDCW_frontend_asset_markup']) ? $GLOBALS['SDCW_frontend_asset_markup'] : '';
$without_capture = $capture === '' ? $result : str_replace($capture, '', $result);
$check($without_capture === $rendered . $marker . $layout && substr_count($result, $script) === 1 && substr_count($result, $style) === 1, 'Five owned clocks and explicit helper share one runtime and layout without other byte changes');
$group = 'streaming';
foreach (array('raw', 'empty', 'discarded', 'late-raw', 'late-owned', 'cleaned') as $case) {
    test_reset(); $level = ob_get_level(); ob_start();
    foreach (isset($GLOBALS['test_actions']['init'][9]) ? $GLOBALS['test_actions']['init'][9] : array() as $callback) { call_user_func($callback); }
    if (function_exists('SDCW_start_frontend_output')) { SDCW_start_frontend_output(); }
    if ($case === 'raw') {
        $check(isset($GLOBALS['test_actions']['wp_footer'][19]['SDCW_capture_frontend_assets']), 'Frontend start installs Core capture before the footer script printer');
    }
    if ($case === 'raw') { echo $clock; }
    elseif ($case === 'discarded') { SDCW_enqueue_rendered_clock_assets($clock); echo '<p>Discarded.</p>'; }
    elseif ($case === 'cleaned') { ob_start(); echo $clock; ob_end_clean(); echo '<p>Cleaned.</p>'; }
    else { echo '<p>Before footer.</p>'; }
    // The r14 control uses its normal queued footer; r2 captures Core tags privately.
    if (function_exists('SDCW_capture_frontend_assets')) { SDCW_capture_frontend_assets(); }
    else { wp_scripts()->do_items(array_keys($GLOBALS['test_script_queue']), 1); }
    $GLOBALS['test_footer'] = true;
    if ($case === 'late-raw') { echo $clock; }
    if ($case === 'late-owned') { echo SDCW_enqueue_rendered_clock_assets($clock); }
    SDCW_print_clock_styles();
    while (ob_get_level() > $level + 1) { ob_end_flush(); }
    $response = ob_get_clean();
    $expected = in_array($case, array('raw', 'late-raw', 'late-owned'), true) ? 1 : 0;
    $check(substr_count($response, $script) === $expected && substr_count($response, 'runtime-before') === $expected && substr_count($response, 'runtime-after') === $expected, 'Actual PHP output-handler lifecycle: ' . $case);
    $check(ob_get_level() === $level, 'Output-buffer level restored: ' . $case);
}
$check(ob_get_level() === $initial_buffer_level, 'All checks preserve the caller output-buffer level');
$failed = count(array_filter($checks, function ($row) { return !$row['passed']; }));
echo json_encode(array('checks' => $checks, 'failed' => $failed, 'scope' => 'Offline doubles and actual PHP output handlers; HTTP Content-Type/Content-Length and native Core filters require separate acceptance')), "\n";
exit($failed ? 1 : 0);
