<?php
// Exercise invalid references through actual title-only saves and widget filtering.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'SDCW independent public upgrade') {
    throw new RuntimeException('This suite requires the isolated compatibility lab.');
}
$admin = get_user_by('login', 'independent_administrator');
$author = get_user_by('login', 'independent_author');
if (!$admin || !$author || !function_exists('SDCW_sanitize_clock_post_html')) {
    throw new RuntimeException('Missing test accounts or candidate sanitization.');
}
$forms = array('0', 'x0', 'X000000', '00000000', '55296', 'xD800', '56319', 'xdfff', '1114112', 'x110000', str_repeat('9', 80), 'x' . str_repeat('F', 80));
$cases = array();
foreach ($forms as $form) {
    foreach (array(';', '') as $terminator) {
        for ($layer = 0; $layer <= 2; $layer++) {
            $raw = '&' . str_repeat('amp;', $layer) . '#' . $form . $terminator;
            $expected = $layer ? '&' . str_repeat('amp;', $layer - 1) . '#' . $form . $terminator : "\xef\xbf\xbd";
            $cases[] = array('name' => $form . '/' . strlen($terminator) . '/' . $layer, 'raw' => $raw, 'expected' => $expected);
        }
    }
}
$cases[] = array('name' => 'valid decimal without semicolon', 'raw' => '&#65', 'expected' => 'A');
$cases[] = array('name' => 'valid hex without semicolon', 'raw' => '&#x41', 'expected' => 'A');
$cases[] = array('name' => 'valid replacement character', 'raw' => '&#65533;', 'expected' => "\xef\xbf\xbd");
$checks = array();
$fields = array('post_content', 'post_excerpt', 'post_content_filtered');
foreach ($cases as $case) {
    $caption = 'Numeric ' . $case['raw'] . ' <clock>';
    $expected = 'Numeric ' . $case['expected'] . ' <clock>';
    $clock = '<timenow-zone-sdcw caption="' . $caption . '" time-zone="UTC" onclick="alert(1)" background="url(javascript:alert(1))"></timenow-zone-sdcw>';
    $neighbor = '<p title="&amp;#34;">Unrelated content</p>';
    $content = $neighbor . get_comment_delimited_block_content('simple-digital-clock-block/widget-block', array('caption' => $caption, 'timeZone' => 'UTC'), $clock);
    wp_set_current_user($admin->ID);
    kses_init();
    $id = wp_insert_post(wp_slash(array('post_title' => 'Independent numeric reference regression', 'post_status' => 'draft', 'post_author' => $author->ID, 'post_content' => $content, 'post_excerpt' => $clock, 'post_content_filtered' => $clock)), true);
    if (is_wp_error($id)) { throw new RuntimeException($id->get_error_message()); }
    wp_set_current_user($author->ID);
    kses_init();
    $updated = wp_update_post(array('ID' => $id, 'post_title' => 'Independent numeric title-only update'), true);
    $checks[] = array('name' => $case['name'] . ': same post ID', 'passed' => !is_wp_error($updated) && $updated === $id);
    $saved = array();
    foreach ($fields as $field) {
        $saved[$field] = get_post($id)->$field;
        $processor = new WP_HTML_Tag_Processor($saved[$field]);
        $found = $processor->next_tag('TIMENOW-ZONE-SDCW');
        $checks[] = array('name' => $case['name'] . '/' . $field . ': browser replacement meaning retained', 'passed' => $found && $processor->get_attribute('caption') === $expected, 'actual' => $processor->get_attribute('caption'), 'expected' => $expected);
        $checks[] = array('name' => $case['name'] . '/' . $field . ': executable attributes rejected', 'passed' => null === $processor->get_attribute('onclick') && null === $processor->get_attribute('background'));
    }
    $blocks = parse_blocks($saved['post_content']);
    $native = array_values(array_filter($blocks, function ($block) { return 'simple-digital-clock-block/widget-block' === $block['blockName']; }));
    $checks[] = array('name' => $case['name'] . ': original caption JSON retained', 'passed' => 1 === count($native) && $native[0]['attrs']['caption'] === $caption);
    $checks[] = array('name' => $case['name'] . ': foreign HTML retains Core policy', 'passed' => false !== strpos($saved['post_content'], wp_kses_post($neighbor)));
    $widget = new WP_Widget_Block();
    $instance = apply_filters('widget_update_callback', $widget->update(array('content' => $content), array()), array('content' => $content), array(), $widget);
    $processor = new WP_HTML_Tag_Processor($instance['content']);
    $checks[] = array('name' => $case['name'] . ': filtered widget caption preserved', 'passed' => $processor->next_tag('TIMENOW-ZONE-SDCW') && $processor->get_attribute('caption') === $expected);
    wp_update_post(array('ID' => $id, 'post_title' => 'Independent numeric repeated update'), true);
    foreach ($fields as $field) {
        $checks[] = array('name' => $case['name'] . '/' . $field . ': repeated save stable', 'passed' => get_post($id)->$field === $saved[$field]);
    }
}
$checks[] = array('name' => 'KSES frames balanced', 'passed' => array() === SDCW_clock_kses_frames() && array() === SDCW_clock_save_caption_frames());
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'cases' => count($cases), 'checks' => $checks, 'failed' => $failed)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
