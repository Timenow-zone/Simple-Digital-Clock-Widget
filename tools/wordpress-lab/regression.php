<?php
// Contract tests against the real WordPress save pipeline in the disposable lab.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These tests require the isolated Clock lab.');
}

$fixtures = json_decode(file_get_contents('/lab/packages/regression-fixtures.json'), true);
if (!is_array($fixtures) || empty($fixtures['blocks'])) {
    throw new RuntimeException('Generate the immutable 1.1.1 fixtures first.');
}
$GLOBALS['clock_patch_results'] = array();
function clock_assert($name, $passed, $details = null) {
    $GLOBALS['clock_patch_results'][] = array('name' => $name, 'passed' => (bool) $passed, 'details' => $passed ? null : $details);
}

function clock_markup_attributes($html) {
    $processor = new WP_HTML_Tag_Processor($html);
    if (!$processor->next_tag('TIMENOW-ZONE-SDCW')) {
        return null;
    }
    $attributes = array();
    foreach ($processor->get_attribute_names_with_prefix('') as $name) {
        $attributes[$name] = $processor->get_attribute($name);
    }
    ksort($attributes);
    return $attributes;
}

$admin = get_user_by('login', 'clock_lab_admin');
$author = get_user_by('login', 'clock_patch_author');
if (!$admin || !$author) {
    throw new RuntimeException('The generated test users are missing.');
}
require_once ABSPATH . WPINC . '/widgets/class-wp-widget-block.php';
$widget = new WP_Widget_Block();
foreach (array('administrator' => $admin, 'author' => $author) as $role => $user) {
    wp_set_current_user($user->ID);
    kses_init();
    clock_assert($role . ': expected unfiltered_html capability', current_user_can('unfiltered_html') === ('administrator' === $role));
    foreach ($fixtures['blocks'] as $fixture) {
        $id = wp_insert_post(array(
            'post_title' => 'Clock patch contract: ' . $role . ' / ' . $fixture['name'],
            'post_author' => $user->ID,
            'post_status' => 'draft',
            'post_content' => wp_slash($fixture['content']),
        ), true);
        if (is_wp_error($id)) {
            throw new RuntimeException($id->get_error_message());
        }
        $saved = get_post($id)->post_content;
        $expected = clock_markup_attributes($fixture['content']);
        $actual = clock_markup_attributes($saved);
        clock_assert($role . ': preserve ' . $fixture['name'], $actual === $expected, array('expected' => $expected, 'actual' => $actual, 'saved' => $saved));
        $stored = parse_blocks($saved)[0]['attrs'];
        clock_assert($role . ': legacy JSON timezone ' . $fixture['name'], isset($stored['timeZone']) && $stored['timeZone'] === $fixture['attributes']['timeZone'], $stored);
        $stored_caption = isset($stored['caption']) ? $stored['caption'] : '';
        clock_assert($role . ': legacy JSON caption ' . $fixture['name'], $stored_caption === $fixture['attributes']['caption'], $stored);
        $filtered = SDCW_sanitize_clock_post_html($fixture['content']);
        $filtered_attrs = parse_blocks($filtered)[0]['attrs'];
        clock_assert($role . ': filtered content keeps legacy JSON ' . $fixture['name'], isset($filtered_attrs['timeZone']) && $filtered_attrs['timeZone'] === $fixture['attributes']['timeZone'] && (isset($filtered_attrs['caption']) ? $filtered_attrs['caption'] : '') === $fixture['attributes']['caption'], $filtered_attrs);
        $widget_input = array('content' => $fixture['content']);
        $widget_value = apply_filters('widget_update_callback', $widget->update($widget_input, array()), $widget_input, array(), $widget);
        $widget_attrs = parse_blocks($widget_value['content'])[0]['attrs'];
        clock_assert($role . ': block widget content retained ' . $fixture['name'], clock_markup_attributes($widget_value['content']) === $expected);
        if ('administrator' === $role) {
            clock_assert($role . ': unfiltered widget input unchanged ' . $fixture['name'], $widget_value['content'] === $fixture['content']);
        } else {
            clock_assert($role . ': block widget legacy fields retained ' . $fixture['name'], isset($widget_attrs['timeZone']) && $widget_attrs['timeZone'] === $fixture['attributes']['timeZone'] && (isset($widget_attrs['caption']) ? $widget_attrs['caption'] : '') === $fixture['attributes']['caption'], $widget_attrs);
        }
    }
}

foreach ($fixtures['gradients'] as $index => $gradient) {
    $html = '<timenow-zone-sdcw background="' . esc_attr($gradient) . '"></timenow-zone-sdcw>';
    clock_assert('preserve gradient preset ' . $index, wp_kses_post($html) === $html);
}

$unsafe = array(
    'event handler' => array('onmouseover', 'alert(1)'),
    'script source' => array('src', 'https://example.invalid/clock.js'),
    'unexpected attribute' => array('unknown', 'unsafe'),
    'inline style' => array('style', 'position:fixed;inset:0'),
    'CSS expression' => array('background', 'expression(alert(1))'),
    'CSS javascript URL' => array('background', 'url(javascript:alert(1))'),
    'CSS escaped URL' => array('background', 'u\\72l(https://example.invalid/x)'),
    'CSS external URL' => array('background', 'url(https://example.invalid/x)'),
    'CSS relative URL' => array('background', 'url(/tracking-pixel)'),
    'CSS comment URL' => array('background', 'u/**/rl(https://example.invalid/x)'),
    'CSS property injection' => array('background', '#fff;position:fixed'),
    'CSS entity injection' => array('background', '#fff&#59;position:fixed'),
    'CSS encoded URL' => array('background', 'u&#114;l(https://example.invalid/x)'),
    'color injection' => array('background-color', '#fff;position:fixed'),
    'color URL' => array('background-color', 'url(https://example.invalid/x)'),
);
foreach ($unsafe as $name => $attribute) {
    $html = '<timenow-zone-sdcw ' . $attribute[0] . '="' . esc_attr($attribute[1]) . '"></timenow-zone-sdcw>';
    $safe = wp_kses_post($html);
    clock_assert('remove ' . $name, false === strpos($safe, $attribute[0] . '='), $safe);
}
foreach (array('strip', 'data', 'clock-custom-context') as $context) {
    clock_assert('post context only: ' . $context, !isset(wp_kses_allowed_html($context)['timenow-zone-sdcw']));
}
$core_html = '<a href="https://example.invalid/">Link</a><strong>Text</strong>';
clock_assert('preserve unrelated core HTML', wp_kses_post($core_html) === $core_html);
clock_assert('keep script tag disallowed', !isset(wp_kses_allowed_html('post')['script']));
$caption = '<img src=x onerror=alert(1)>';
$safe_caption = wp_kses_post('<timenow-zone-sdcw caption="' . $caption . '"></timenow-zone-sdcw>');
$caption_attributes = clock_markup_attributes($safe_caption);
clock_assert('caption remains text after KSES', isset($caption_attributes['caption']) && $caption_attributes['caption'] === $caption, $safe_caption);
clock_assert('caption cannot create an event attribute', !isset($caption_attributes['onerror']), $safe_caption);
$malicious_caption = '--><script>alert(1)</script><!--';
$malicious_html = get_comment_delimited_block_content('simple-digital-clock-block/widget-block', array('caption' => $malicious_caption), '<timenow-zone-sdcw caption="' . esc_attr($malicious_caption) . '"></timenow-zone-sdcw>');
$malicious_saved = SDCW_sanitize_clock_post_html($malicious_html);
$malicious_attrs = parse_blocks($malicious_saved)[0]['attrs'];
clock_assert('plain-text caption JSON cannot break a block comment', isset($malicious_attrs['caption']) && $malicious_attrs['caption'] === $malicious_caption && false === strpos($malicious_saved, '<script>'), $malicious_saved);
$unrelated = '<!-- wp:paragraph --><p>Unrelated &amp; unchanged</p><!-- /wp:paragraph -->';
$post = wp_insert_post(array('post_title' => 'Clock unrelated contract', 'post_status' => 'draft', 'post_content' => wp_slash($unrelated)), true);
clock_assert('unrelated post content unchanged', !is_wp_error($post) && get_post($post)->post_content === $unrelated);

wp_set_current_user($admin->ID);
kses_init();
$results = $GLOBALS['clock_patch_results'];
$failed = count(array_filter($results, function ($result) { return !$result['passed']; }));
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'tests' => $results, 'failed' => $failed)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
