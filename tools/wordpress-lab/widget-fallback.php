<?php
// Exercise the public widget filter and preserve optional HTML-sourced metadata.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These tests require the isolated Clock lab.');
}
$checks = array();
$assert = function ($name, $passed) use (&$checks) {
    $checks[] = array('name' => $name, 'passed' => (bool) $passed);
};
$dom_caption = function ($html) {
    $previous = libxml_use_internal_errors(true);
    $document = new DOMDocument('1.0', 'UTF-8');
    $loaded = $document->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_NONET);
    libxml_clear_errors();
    libxml_use_internal_errors($previous);
    if (!$loaded || !$document->getElementsByTagName('timenow-zone-sdcw')->length) {
        throw new RuntimeException('Missing isolated caption markup.');
    }
    return $document->getElementsByTagName('timenow-zone-sdcw')->item(0)->getAttribute('caption');
};
global $wp_widget_factory;
$widget = $wp_widget_factory->widgets['WP_Widget_Block'];
$save = function ($input) use ($widget) {
    $new = array('content' => $input);
    $old = array('retained_setting' => 'keep');
    return apply_filters('widget_update_callback', $widget->update($new, $old), $new, $old, $widget);
};
$role = is_multisite() ? 'clock_site_admin' : 'clock_patch_author';
wp_set_current_user(get_user_by('login', $role)->ID);
kses_init();
$assert('filtered test role has no unfiltered_html', !current_user_can('unfiltered_html'));
$captions = array(
    array('&NotEqualTilde; <clock>', "\xE2\x89\x82\xCC\xB8 <clock>"),
    array('&NewLine; <clock>', "\n <clock>"),
    array('&Tab; <clock>', "\t <clock>"),
    array('&amp;#34; <clock>', '&#34; <clock>'),
    array('&amp;apos; <clock>', '&apos; <clock>'),
    array('Київ 🕒', 'Київ 🕒'),
);
foreach ($captions as $index => $case) {
    $input = get_comment_delimited_block_content('simple-digital-clock-block/widget-block', array('caption' => $case[0], 'timeZone' => 'UTC'), '<timenow-zone-sdcw time-zone="UTC" caption="' . $case[0] . '"></timenow-zone-sdcw>');
    $result = $save($input);
    $again = $save($result['content']);
    $assert('widget ' . $index . ': caption keeps original DOM semantics', $dom_caption($result['content']) === $case[1]);
    $assert('widget ' . $index . ': original JSON caption retained', parse_blocks($result['content'])[0]['attrs']['caption'] === $case[0]);
    $assert('widget ' . $index . ': repeated save stable', $again['content'] === $result['content']);
    $assert('widget ' . $index . ': unrelated instance setting retained', $result['retained_setting'] === 'keep');
}
$unsafe = '<p onclick="bad()"><a href="javascript:bad()">Adjacent</a></p><timenow-zone-sdcw caption="<img src=x onerror=bad()>" onmouseover="bad()" style="color:red"></timenow-zone-sdcw><script>bad()</script>';
$result = $save($unsafe);
$assert('widget: unsafe real HTML removed by Core KSES', false === strpos($result['content'], '<script') && false === strpos($result['content'], 'onclick=') && false === strpos($result['content'], 'onmouseover=') && false === strpos($result['content'], 'javascript:') && false === strpos($result['content'], 'style='));
$assert('widget: dangerous-looking caption remains plain attribute text', $dom_caption($result['content']) === '<img src=x onerror=bad()>');
$plain = '<p onclick="bad()">No clock &amp; untouched</p>';
$assert('widget: content without clocks follows the original Core result', $save($plain)['content'] === wp_kses_post($plain));
$assert('widget: rejected update stays rejected', false === apply_filters('widget_update_callback', false, array('content' => $unsafe), array(), $widget));
$foreign = array('content' => $unsafe, 'other' => 'value');
$assert('widget: another widget class stays untouched', $foreign === apply_filters('widget_update_callback', $foreign, array('content' => $unsafe), array(), new stdClass()));
$earlier = function ($instance) { $instance['content'] = 'Earlier widget policy replacement'; return $instance; };
add_filter('widget_update_callback', $earlier, -10, 1);
$assert('widget: earlier content replacement remains authoritative', $save($unsafe)['content'] === 'Earlier widget policy replacement');
remove_filter('widget_update_callback', $earlier, -10);
$reject = function () { return false; };
add_filter('widget_update_callback', $reject, 20, 4);
$assert('widget: later callbacks can still reject an update', false === $save($unsafe));
remove_filter('widget_update_callback', $reject, 20);
wp_set_current_user(get_user_by('login', 'clock_lab_admin')->ID);
kses_init();
$assert('unfiltered test account capability verified', current_user_can('unfiltered_html'));
$assert('unfiltered widget content remains byte-identical', $save($unsafe)['content'] === $unsafe);
foreach (array('&#039; <clock>', '&#x27; <clock>', '&apos; <clock>', '&NotEqualTilde; <clock>', '&amp;#34; <clock>', "a\r\nb") as $index => $caption) {
    $html = '<timenow-zone-sdcw time-zone="UTC" caption="' . $caption . '"></timenow-zone-sdcw>';
    $input = get_comment_delimited_block_content('simple-digital-clock-block/widget-block', array('timeZone' => 'UTC'), $html);
    $id = wp_insert_post(wp_slash(array('post_title' => 'HTML-only optional metadata', 'post_content' => $input, 'post_status' => 'draft')), true);
    if (is_wp_error($id)) { throw new RuntimeException($id->get_error_message()); }
    wp_update_post(array('ID' => $id, 'post_title' => 'Title-only optional metadata'));
    $saved = get_post($id)->post_content;
    $assert('HTML-only ' . $index . ': title update retains original content', $saved === $input);
    $assert('HTML-only ' . $index . ': PHP does not synthesize a caption', !array_key_exists('caption', parse_blocks($saved)[0]['attrs']));
}
$assert('recursive KSES frame stack remains balanced', SDCW_clock_kses_frames() === array());
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'checks' => $checks, 'failed' => $failed)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
