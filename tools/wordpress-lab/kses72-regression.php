<?php
// Real save-pipeline contracts for modern KSES without changing its parser policy.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These contracts require the isolated Clock lab.');
}
$checks = array();
$assert = function ($name, $passed, $details = null) use (&$checks) {
    $checks[] = array('name' => $name, 'passed' => (bool) $passed, 'details' => $passed ? null : $details);
};
$sanitize = function ($input) {
    return function_exists('SDCW_sanitize_clock_post_html') ? SDCW_sanitize_clock_post_html($input) : wp_kses_post($input);
};
$block = function ($caption, $extra = array()) {
    return get_comment_delimited_block_content('simple-digital-clock-block/widget-block', array_merge(array('caption' => $caption, 'timeZone' => 'UTC'), $extra), '<timenow-zone-sdcw time-zone="UTC" caption="' . esc_attr($caption) . '" onclick="bad()"></timenow-zone-sdcw>');
};
$admin = get_user_by('login', 'clock_lab_admin');
$author = get_user_by('login', 'clock_patch_author');
if (!$admin || !$author) {
    throw new RuntimeException('Missing isolated test users.');
}
$modern = function_exists('wp_sanitize_html_kses') && !apply_filters('wp_kses_force_legacy_parser', true);
$cases = array('Київ & <clock> "quoted"', '&NotEqualTilde; <clock>', '&amp;#34; <clock>', "a\r\n&#13; \\u003c 🕒", '--><script>bad()</script><!--', 'sdcw-caption-literal', '');
foreach ($cases as $index => $caption) {
    $input = $block($caption, array('unknown' => '<script>drop</script>'));
    wp_set_current_user($admin->ID);
    kses_init();
    $fields = array('post_content', 'post_excerpt', 'post_content_filtered');
    $post = array('post_title' => 'KSES compatibility fixture', 'post_status' => 'draft', 'post_author' => $author->ID);
    foreach ($fields as $field) {
        $post[$field] = $input;
    }
    $id = wp_insert_post(wp_slash($post), true);
    if (is_wp_error($id)) {
        throw new RuntimeException($id->get_error_message());
    }
    wp_set_current_user($author->ID);
    kses_init();
    wp_update_post(array('ID' => $id, 'post_title' => 'Author title-only update'), true);
    foreach ($fields as $field) {
        $saved = get_post($id)->$field;
        $attrs = parse_blocks($saved)[0]['attrs'];
        $assert($index . '/' . $field . ': exact original caption after title-only update', $attrs['caption'] === $caption, $attrs);
        $assert($index . '/' . $field . ': other JSON uses current Core KSES', $attrs['unknown'] === wp_kses_post('<script>drop</script>'), $attrs);
        $assert($index . '/' . $field . ': actual event attribute removed', false === strpos($saved, 'onclick='));
        wp_update_post(array('ID' => $id, $field => wp_slash($saved)), true);
        $assert($index . '/' . $field . ': repeated save is stable', get_post($id)->$field === $saved);
        $assert($index . '/' . $field . ': temporary caption markers never persist', false === strpos($saved, 'sdcw-caption-token-'));
    }
    $safe = $sanitize($input);
    $attrs = parse_blocks($safe)[0]['attrs'];
    $assert($index . ': scoped sanitizer retains only known caption JSON', $attrs['caption'] === $caption && $attrs['unknown'] === wp_kses_post('<script>drop</script>'), $attrs);
    $assert($index . ': scoped sanitizer keeps real HTML filtering', false === strpos($safe, 'onclick=') && false === strpos($safe, '<script>'));
    global $wp_widget_factory;
    $widget = $wp_widget_factory->widgets['WP_Widget_Block'];
    $new = array('content' => $input);
    $saved_widget = apply_filters('widget_update_callback', $widget->update($new, array()), $new, array(), $widget);
    $assert($index . ': widget retains original caption', parse_blocks($saved_widget['content'])[0]['attrs']['caption'] === $caption);
}
$input = $block('<policy>');
$policy = function ($value) {
    return wp_slash(SDCW_map_clock_blocks(wp_unslash($value), function ($attrs) { $attrs->caption = 'Earlier policy replacement'; }));
};
add_filter('content_save_pre', $policy, 9);
try {
    $saved = wp_unslash(apply_filters('content_save_pre', wp_slash($input)));
    $assert('Earlier save policy remains authoritative', parse_blocks($saved)[0]['attrs']['caption'] === 'Earlier policy replacement');
} finally {
    remove_filter('content_save_pre', $policy, 9);
}
$transform = function ($value) {
    return wp_slash(SDCW_map_clock_blocks(wp_unslash($value), function ($attrs) { $attrs->caption .= ' policy'; }));
};
add_filter('content_save_pre', $transform, 9);
try {
    $saved = wp_unslash(apply_filters('content_save_pre', wp_slash($input)));
    $assert('Earlier caption transformation runs on original text', parse_blocks($saved)[0]['attrs']['caption'] === '<policy> policy');
    $assert('Earlier transformation cannot persist a temporary marker', false === strpos($saved, 'sdcw-caption-token-'));
} finally {
    remove_filter('content_save_pre', $transform, 9);
}
$nested = false;
$inner = null;
$callback = function ($value) use (&$nested, &$inner, $block) {
    if (!$nested) {
        $nested = true;
        $inner = wp_unslash(apply_filters('excerpt_save_pre', wp_slash($block('<inner> &lt;'))));
        $nested = false;
    }
    return $value;
};
add_filter('content_save_pre', $callback, 9);
try {
    $outer = wp_unslash(apply_filters('content_save_pre', wp_slash($block('<outer> &amp;'))));
} finally {
    remove_filter('content_save_pre', $callback, 9);
}
$assert('Nested save filters retain independent outer caption', parse_blocks($outer)[0]['attrs']['caption'] === '<outer> &amp;');
$assert('Nested save filters retain independent inner caption', parse_blocks($inner)[0]['attrs']['caption'] === '<inner> &lt;');
$assert('Save caption frames are balanced', !function_exists('SDCW_clock_save_caption_frames') || SDCW_clock_save_caption_frames() === array());
$assert('Core parser policy is unchanged', $modern === (function_exists('wp_sanitize_html_kses') && !apply_filters('wp_kses_force_legacy_parser', true)));
$plain = '<p onclick="bad()">Core only</p><script>drop</script><!-- wp:vendor/test {"unknown":"<script>drop</script>"} /-->';
$assert('No-clock input follows exact Core policy', $sanitize($plain) === wp_kses_post($plain));
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'modern_kses' => $modern, 'checks' => $checks, 'failed' => $failed)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
