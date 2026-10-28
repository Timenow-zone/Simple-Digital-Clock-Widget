<?php
// Verify numeric references and raw newline semantics through real post saves.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These tests require the isolated Clock lab.');
}
$cases = array(
    'decimal CR' => array('&#13; <clock>', "\r <clock>"),
    'hex CR' => array('&#xD; <clock>', "\r <clock>"),
    'padded decimal CR' => array('&#00013; <clock>', "\r <clock>"),
    'padded hex CR' => array('&#X000d; <clock>', "\r <clock>"),
    'literal decimal CR' => array('&amp;#13; <clock>', '&#13; <clock>'),
    'literal hex CR' => array('&amp;#xD; <clock>', '&#xD; <clock>'),
    'literal decimal quote' => array('&amp;#34; <clock>', '&#34; <clock>'),
    'literal hex quote' => array('&amp;#x22; <clock>', '&#x22; <clock>'),
    'literal padded quote' => array('&amp;#00034; <clock>', '&#00034; <clock>'),
    'literal decimal emoji' => array('&amp;#128338; <clock>', '&#128338; <clock>'),
    'literal hex emoji' => array('&amp;#x1F552; <clock>', '&#x1F552; <clock>'),
    'double literal quote' => array('&amp;amp;#34; <clock>', '&amp;#34; <clock>'),
    'triple literal quote' => array('&amp;amp;amp;#34; <clock>', '&amp;amp;#34; <clock>'),
    'double literal hex emoji' => array('&amp;amp;#x1F552; <clock>', '&amp;#x1F552; <clock>'),
    'literal uppercase amp' => array('&AMP;#34; <clock>', '&#34; <clock>'),
    'unknown mixed-case amp' => array('&Amp;#34; <clock>', '&Amp;#34; <clock>'),
    'literal invalid zero' => array('&amp;#0; <clock>', '&#0; <clock>'),
    'literal invalid surrogate' => array('&amp;#xD800; <clock>', '&#xD800; <clock>'),
    'raw CR' => array("a\rb", "a\nb"),
    'raw CRLF' => array("a\r\nb", "a\nb"),
    'raw LF' => array("a\nb", "a\nb"),
    'raw CR before numeric CR' => array("a\r&#13;b", "a\n\rb"),
    'numeric CR before raw CR' => array("a&#13;\rb", "a\r\nb"),
    'raw CRLF with literal numeric' => array("a\r\n&amp;#34;b", "a\n&#34;b"),
    'literal slash r' => array('a\\rb', 'a\\rb'),
    'raw CR and Unicode' => array("Київ\r🕒", "Київ\n🕒"),
    'literal C1' => array("\xc2\x80\r", "\xc2\x80\n"),
);
$admin = get_user_by('login', 'clock_lab_admin');
$author = get_user_by('login', 'clock_patch_author');
if (!$admin || !$author) {
    throw new RuntimeException('Missing isolated lab users.');
}
$checks = array();
$prefix = '<p title="&amp;#34;">Core control</p>';
$fields = array('post_content', 'post_excerpt', 'post_content_filtered');
foreach ($cases as $name => $case) {
    list($raw, $expected) = $case;
    $html = $prefix . '<timenow-zone-sdcw caption="' . $raw . '" time-zone="UTC" onclick="alert(1)"></timenow-zone-sdcw>';
    $content = get_comment_delimited_block_content('simple-digital-clock-block/widget-block', array('caption' => $raw, 'timeZone' => 'UTC'), $html);
    $fixture = parse_blocks($content);
    if (count($fixture) !== 1 || $fixture[0]['attrs']['caption'] !== $raw) {
        throw new RuntimeException('Invalid native JSON fixture: ' . $name);
    }
    wp_set_current_user($admin->ID);
    kses_init();
    $original = array('post_content' => $content, 'post_excerpt' => $html, 'post_content_filtered' => $html);
    $id = wp_insert_post(array_merge(array('post_title' => 'Numeric caption fixture', 'post_author' => $author->ID, 'post_status' => 'draft'), wp_slash($original)), true);
    if (is_wp_error($id)) {
        throw new RuntimeException($id->get_error_message());
    }
    foreach ($fields as $field) {
        $checks[] = array('name' => $name . '/' . $field . ': unfiltered input unchanged', 'passed' => get_post($id)->$field === $original[$field]);
    }
    wp_set_current_user($author->ID);
    kses_init();
    $updated = wp_update_post(array('ID' => $id, 'post_title' => 'Numeric title-only update'), true);
    $checks[] = array('name' => $name . ': same original ID', 'passed' => !is_wp_error($updated) && $updated === $id);
    $post = get_post($id);
    $saved = array();
    foreach ($fields as $field) {
        $saved[$field] = $post->$field;
        $processor = new WP_HTML_Tag_Processor($post->$field);
        $found = $processor->next_tag('TIMENOW-ZONE-SDCW');
        $checks[] = array('name' => $name . '/' . $field . ': caption meaning retained', 'passed' => $found && $processor->get_attribute('caption') === $expected, 'actual' => $processor->get_attribute('caption'), 'expected' => $expected);
        $checks[] = array('name' => $name . '/' . $field . ': actual unsafe attribute removed', 'passed' => null === $processor->get_attribute('onclick'));
        $expected_prefix = wp_kses_post($prefix);
        $checks[] = array('name' => $name . '/' . $field . ': unrelated Core control unchanged', 'passed' => false !== strpos($post->$field, $expected_prefix));
    }
    $parsed = parse_blocks($post->post_content);
    $checks[] = array('name' => $name . ': original JSON caption retained', 'passed' => count($parsed) === 1 && $parsed[0]['attrs']['caption'] === $raw);
    wp_update_post(array('ID' => $id, 'post_title' => 'Numeric repeated update'), true);
    foreach ($fields as $field) {
        $checks[] = array('name' => $name . '/' . $field . ': repeated save stable', 'passed' => get_post($id)->$field === $saved[$field]);
    }
}
$checks[] = array('name' => 'KSES frames balanced', 'passed' => SDCW_clock_kses_frames() === array());
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'cases' => count($cases), 'checks' => $checks, 'failed' => $failed)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
