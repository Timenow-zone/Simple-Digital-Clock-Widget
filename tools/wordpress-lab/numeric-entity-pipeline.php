<?php
// Compare literal numeric layers independently of PHP's entity decoder.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These tests require the isolated Clock lab.');
}
$cases = json_decode(file_get_contents('/lab/packages/numeric-entity-cases.json'), true);
if (count($cases) !== 9684) {
    throw new RuntimeException('Unexpected numeric entity corpus.');
}
$input = implode("\n", array_column($cases, 'input'));
wp_set_current_user(get_user_by('login', 'clock_lab_admin')->ID);
kses_init();
$admin = wp_unslash(apply_filters('content_save_pre', wp_slash($input)));
wp_set_current_user(get_user_by('login', 'clock_patch_author')->ID);
kses_init();
$save = function ($html) {
    $filtered = apply_filters('content_save_pre', wp_slash($html));
    return wp_unslash(SDCW_preserve_clock_post_metadata(array('post_content' => $filtered))['post_content']);
};
$output = $save($input);
$again = $save($output);
global $wpdb;
$previous = $wpdb->suppress_errors(true);
if (false === $wpdb->query('CREATE TEMPORARY TABLE sdcw_numeric_charset (id INT AUTO_INCREMENT PRIMARY KEY, value LONGTEXT CHARACTER SET utf8mb3)')) {
    throw new RuntimeException($wpdb->last_error);
}
$inserted = $wpdb->insert('sdcw_numeric_charset', array('value' => $output));
$readback = $wpdb->get_var('SELECT value FROM sdcw_numeric_charset WHERE id = 1');
$wpdb->suppress_errors($previous);
$checks = array(
    array('name' => 'unfiltered administrator content untouched', 'passed' => $admin === $input),
    array('name' => 'second author save stable', 'passed' => $again === $output),
    array('name' => 'literal numeric representation stays ASCII', 'passed' => 0 === preg_match('/[^\x00-\x7f]/', $output)),
    array('name' => 'utf8mb3 exact round trip', 'passed' => 1 === $inserted && $readback === $output),
    array('name' => 'recursive KSES frames balanced', 'passed' => SDCW_clock_kses_frames() === array()),
);
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'checks' => $checks, 'failed' => $failed, 'names' => array_column($cases, 'name'), 'input' => $input, 'output' => $output)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
