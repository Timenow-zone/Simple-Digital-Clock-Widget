<?php
// Exercise the standard slashed save pipeline with every named HTML5 entity.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These tests require the isolated Clock lab.');
}
$cases = json_decode(file_get_contents('/lab/packages/html5-entity-cases.json'), true);
if (!is_array($cases) || count($cases) !== 8500) {
    throw new RuntimeException('Expected the immutable 8500-case HTML5 fixture.');
}
$input = implode("\n", array_column($cases, 'input'));
wp_set_current_user(get_user_by('login', 'clock_lab_admin')->ID);
kses_init();
$admin = wp_unslash(apply_filters('content_save_pre', wp_slash($input)));
wp_set_current_user(get_user_by('login', 'clock_patch_author')->ID);
kses_init();
$output = wp_unslash(apply_filters('content_save_pre', wp_slash($input)));
$output = wp_unslash(SDCW_preserve_clock_post_metadata(array('post_content' => wp_slash($output)))['post_content']);
$again = wp_unslash(apply_filters('content_save_pre', wp_slash($output)));
$again = wp_unslash(SDCW_preserve_clock_post_metadata(array('post_content' => wp_slash($again)))['post_content']);
$checks = array(
    array('name' => 'unfiltered administrator content untouched', 'passed' => $admin === $input),
    array('name' => 'second author save stable', 'passed' => $again === $output),
    array('name' => 'recursive KSES frames balanced', 'passed' => SDCW_clock_kses_frames() === array()),
);
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'checks' => $checks, 'failed' => $failed, 'names' => array_column($cases, 'name'), 'input' => $input, 'output' => $output, 'again' => $again === $output ? null : $again)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
