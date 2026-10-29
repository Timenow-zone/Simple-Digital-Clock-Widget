<?php
// Compare adjacent entity syntax and controls independently of block serialization.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These tests require the isolated Clock lab.');
}
$mode = isset($args[0]) ? $args[0] : 'candidate';
if (!in_array($mode, array('candidate', 'previous'), true)) {
    throw new RuntimeException('Unexpected review mode.');
}
if ('previous' === $mode) {
    if (function_exists('SDCW_clock_kses_frames')) {
        throw new RuntimeException('The control requires --skip-plugins=simple-digital-clock.');
    }
    require '/lab/packages/review4-previous-kses.php';
}
$cases = json_decode(file_get_contents('/lab/packages/review4-boundaries.json'), true);
if (count($cases) < 1000) {
    throw new RuntimeException('Missing boundary fixtures.');
}
wp_set_current_user(get_user_by('login', 'clock_patch_author')->ID);
kses_init();
$rows = array();
foreach ($cases as $case) {
    $save = function ($input) {
        $filtered = apply_filters('content_save_pre', wp_slash($input));
        $data = apply_filters('wp_insert_post_data', array('post_content' => $filtered), array(), array(), false);
        return wp_unslash($data['post_content']);
    };
    $saved = $save($case['input']);
    $rows[] = array('name' => $case['name'], 'input' => $case['input'], 'output' => $saved, 'again' => $save($saved));
}
echo wp_json_encode(array('mode' => $mode, 'wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'frames_balanced' => SDCW_clock_kses_frames() === array(), 'cases' => $rows)) . "\n";
