<?php
// Verify named captions remain storable on older UTF-8 database columns.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These tests require the isolated Clock lab.');
}
$cases = json_decode(file_get_contents('/lab/packages/html5-entity-cases.json'), true);
if (count($cases) !== 8500) {
    throw new RuntimeException('Unexpected entity fixtures.');
}
// The first three variants are quoted, matching the Gutenberg serializer.
$input = implode("\n", array_column(array_slice($cases, 0, 6375), 'input'));
wp_set_current_user(get_user_by('login', 'clock_patch_author')->ID);
kses_init();
$output = wp_unslash(apply_filters('content_save_pre', wp_slash($input)));
$output = wp_unslash(SDCW_preserve_clock_post_metadata(array('post_content' => wp_slash($output)))['post_content']);
global $wpdb;
$previous = $wpdb->suppress_errors(true);
if (false === $wpdb->query('CREATE TEMPORARY TABLE sdcw_entity_charset (id INT AUTO_INCREMENT PRIMARY KEY, value LONGTEXT CHARACTER SET utf8mb3)')) {
    throw new RuntimeException($wpdb->last_error);
}
$before = $wpdb->insert('sdcw_entity_charset', array('value' => $input));
$after = $wpdb->insert('sdcw_entity_charset', array('value' => $output));
$error = $wpdb->last_error;
$readback = $wpdb->get_var('SELECT value FROM sdcw_entity_charset WHERE id = 2');
$wpdb->suppress_errors($previous);
$checks = array(
    array('name' => 'original ASCII input accepted by utf8mb3', 'passed' => 1 === $before),
    array('name' => 'entity conversion introduces no non-ASCII bytes', 'passed' => 0 === preg_match('/[^\x00-\x7f]/', $output)),
    array('name' => 'candidate accepted by utf8mb3', 'passed' => 1 === $after),
    array('name' => 'database round trip exact', 'passed' => $readback === $output),
);
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'checks' => $checks, 'failed' => $failed, 'quoted_variants' => 6375, 'input_sha256' => hash('sha256', $input), 'output_sha256' => hash('sha256', $output), 'database_error' => $error)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
