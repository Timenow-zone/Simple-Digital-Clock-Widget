<?php
// Seed existing HTML-sourced captions without invoking the candidate's save hooks.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab' || function_exists('SDCW_sync_clock_content_metadata')) {
    throw new RuntimeException('Run only in the Clock lab with --skip-plugins=simple-digital-clock.');
}
$key = isset($args[0]) ? $args[0] : '';
$inputs = json_decode(file_get_contents('/lab/packages/review5-fallback-inputs.json'), true);
$matches = array_values(array_filter($inputs, function ($row) use ($key) { return $row['key'] === $key; }));
if (count($matches) !== 1) {
    throw new RuntimeException('Unknown isolated fallback fixture.');
}
$user = get_user_by('login', 'clock_lab_admin');
wp_set_current_user($user->ID);
kses_init();
if (!current_user_can('unfiltered_html')) {
    throw new RuntimeException('The fixture requires an unfiltered test account.');
}
$cases = array();
foreach ($matches[0]['cases'] as $input) {
    $id = wp_insert_post(wp_slash(array('post_title' => 'Existing HTML-sourced clock caption', 'post_content' => $input['content'], 'post_status' => 'publish', 'post_author' => $user->ID)), true);
    if (is_wp_error($id) || get_post($id)->post_content !== $input['content']) {
        throw new RuntimeException('Failed to preserve the original fallback fixture.');
    }
    $input['id'] = $id;
    $cases[] = $input;
}
echo wp_json_encode(array('key' => $key, 'cases' => $cases)) . "\n";
