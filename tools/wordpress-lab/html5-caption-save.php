<?php
// Verify entity preservation through real post updates and every KSES save field.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These tests require the isolated Clock lab.');
}
$cases = array(
    'entity' => array('&NotEqualTilde; <clock>', '≂̸ <clock>', false),
    'literal entity' => array('&amp;NotEqualTilde; <clock>', '&NotEqualTilde; <clock>', false),
    'double literal entity' => array('&amp;amp;NotEqualTilde; <clock>', '&amp;NotEqualTilde; <clock>', false),
    'long name' => array('&CounterClockwiseContourIntegral;', '∳', false),
    'newline' => array('&NewLine;', "\n", false),
    'tab' => array('&Tab;', "\t", false),
    'unquoted newline' => array('&NewLine;', "\n", true),
    'unquoted tab' => array('&Tab;', "\t", true),
    'unquoted quote' => array('&QUOT;', '"', true),
    'unquoted ampersand' => array('&AMP;', '&', true),
    'unquoted backtick' => array('&grave;', '`', true),
    'unquoted equals' => array('&equals;', '=', true),
    'backslash' => array('&bsol;clock&bsol;UTC', '\\clock\\UTC', false),
    'unquoted backslash' => array('&bsol;', '\\', true),
    'entity trailing backslash' => array('end&bsol;', 'end\\', false),
    'two entity trailing backslashes' => array('end&bsol;&bsol;', 'end\\\\', false),
    'literal Unicode escape' => array('path\\u003c', 'path\\u003c', false),
    'backslash and quote entity' => array('\\&quot;', '\\"', false),
    'literal backslash entity' => array('&amp;bsol;', '&bsol;', false),
    'unknown name' => array('&invalid;', '&invalid;', false),
    'literal C1 control' => array("\xc2\x80", "\xc2\x80", false),
);
$admin = get_user_by('login', 'clock_lab_admin');
$author = get_user_by('login', 'clock_patch_author');
if (!$admin || !$author) {
    throw new RuntimeException('Missing isolated lab users.');
}
$checks = array();
$prefix = '<p title="&NotEqualTilde;">Unrelated content</p>';
foreach ($cases as $name => $case) {
    list($raw, $expected, $unquoted) = $case;
    wp_set_current_user($admin->ID);
    kses_init();
    $html = '<timenow-zone-sdcw caption=' . ($unquoted ? $raw : '"' . $raw . '"') . ' time-zone="UTC" onclick="alert(1)"></timenow-zone-sdcw>';
    $paths = array('key\\path' => 'value\\path');
    $content = $prefix . get_comment_delimited_block_content('simple-digital-clock-block/widget-block', array('timeZone' => 'UTC', 'caption' => $raw, 'unknown' => '<script>drop</script>', 'paths' => $paths), $html);
    $fixture = array_values(array_filter(parse_blocks($content), function ($block) { return $block['blockName'] === 'simple-digital-clock-block/widget-block'; }));
    if (count($fixture) !== 1 || !isset($fixture[0]['attrs']['caption']) || $fixture[0]['attrs']['caption'] !== $raw || $fixture[0]['attrs']['paths'] !== $paths) {
        throw new RuntimeException('Invalid fixture before plugin filtering: ' . $name);
    }
    $id = wp_insert_post(array('post_title' => 'HTML5 save fixture', 'post_author' => $author->ID, 'post_status' => 'draft', 'post_content' => wp_slash($content)), true);
    if (is_wp_error($id)) {
        throw new RuntimeException($id->get_error_message());
    }
    $checks[] = array('name' => $name . ': administrator content unchanged', 'passed' => get_post($id)->post_content === $content);
    wp_set_current_user($author->ID);
    kses_init();
    $updated = wp_update_post(array('ID' => $id, 'post_title' => 'HTML5 title-only update'), true);
    $saved = get_post($id)->post_content;
    $processor = new WP_HTML_Tag_Processor($saved);
    $found = $processor->next_tag('TIMENOW-ZONE-SDCW');
    $checks[] = array('name' => $name . ': same original ID', 'passed' => !is_wp_error($updated) && $updated === $id);
    $checks[] = array('name' => $name . ': original caption meaning', 'passed' => $found && $processor->get_attribute('caption') === $expected, 'actual' => $processor->get_attribute('caption'), 'expected' => $expected);
    $clocks = array_values(array_filter(parse_blocks($saved), function ($block) { return $block['blockName'] === 'simple-digital-clock-block/widget-block'; }));
    $checks[] = array('name' => $name . ': original JSON caption retained', 'passed' => count($clocks) === 1 && $clocks[0]['attrs']['caption'] === $raw);
    $checks[] = array('name' => $name . ': unknown unsafe JSON still filtered', 'passed' => count($clocks) === 1 && $clocks[0]['attrs']['unknown'] === wp_kses_post('<script>drop</script>'));
    $checks[] = array('name' => $name . ': unknown JSON keys and values retained', 'passed' => count($clocks) === 1 && $clocks[0]['attrs']['paths'] === $paths);
    $checks[] = array('name' => $name . ': unsafe actual attribute still removed', 'passed' => null === $processor->get_attribute('onclick'));
    $checks[] = array('name' => $name . ': unrelated HTML uses normal KSES', 'passed' => 0 === strpos($saved, wp_kses_post($prefix)));
    wp_update_post(array('ID' => $id, 'post_content' => wp_slash($saved)), true);
    $checks[] = array('name' => $name . ': repeated save stable', 'passed' => get_post($id)->post_content === $saved);
}
foreach (array('content_save_pre', 'excerpt_save_pre', 'content_filtered_save_pre') as $filter) {
    $input = '<timenow-zone-sdcw caption="&NotEqualTilde;" onclick="alert(1)"></timenow-zone-sdcw>';
    $output = wp_unslash(apply_filters($filter, wp_slash($input)));
    $processor = new WP_HTML_Tag_Processor($output);
    $processor->next_tag('TIMENOW-ZONE-SDCW');
    $checks[] = array('name' => $filter . ': caption retained and KSES active', 'passed' => $processor->get_attribute('caption') === '≂̸' && null === $processor->get_attribute('onclick'));
}
$checks[] = array('name' => 'KSES frames balanced', 'passed' => SDCW_clock_kses_frames() === array());
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'checks' => $checks, 'failed' => $failed)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
