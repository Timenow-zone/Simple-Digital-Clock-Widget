<?php
// Compare the new Core sanitizer with the legacy-parser control in one request.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab' || get_bloginfo('version') !== '7.2-beta2') {
    throw new RuntimeException('This diagnostic requires the isolated beta lab.');
}
$admin = get_user_by('login', 'clock_lab_admin');
$author = get_user_by('login', 'clock_patch_author');
$rows = array();
foreach (array('default', 'legacy-control') as $mode) {
    if ($mode === 'legacy-control') {
        add_filter('wp_kses_force_legacy_parser', '__return_true', PHP_INT_MAX);
    }
    try {
        foreach (array('Київ & <clock> "quoted"', '&NotEqualTilde; <clock>', '&amp;#34; <clock>') as $caption) {
            $html = '<timenow-zone-sdcw time-zone="UTC" caption="' . str_replace('"', '&quot;', $caption) . '"></timenow-zone-sdcw>';
            $input = get_comment_delimited_block_content('simple-digital-clock-block/widget-block', array('caption' => $caption, 'timeZone' => 'UTC'), $html);
            wp_set_current_user($admin->ID);
            kses_init();
            $id = wp_insert_post(wp_slash(array('post_title' => 'Beta KSES control', 'post_author' => $author->ID, 'post_status' => 'publish', 'post_content' => $input)), true);
            if (is_wp_error($id)) {
                throw new RuntimeException($id->get_error_message());
            }
            $initial = get_post($id)->post_content;
            wp_set_current_user($author->ID);
            kses_init();
            $updated = wp_update_post(array('ID' => $id, 'post_title' => 'Beta KSES control edited by Author'), true);
            if (is_wp_error($updated)) {
                throw new RuntimeException($updated->get_error_message());
            }
            $stored = get_post($id)->post_content;
            $attrs = parse_blocks($stored)[0]['attrs'];
            $rows[] = array('mode' => $mode, 'id' => $id, 'caption' => $caption, 'stored_caption' => $attrs['caption'], 'caption_unchanged' => $attrs['caption'] === $caption, 'initial' => $initial, 'stored' => $stored);
        }
    } finally {
        if ($mode === 'legacy-control') {
            remove_filter('wp_kses_force_legacy_parser', '__return_true', PHP_INT_MAX);
        }
    }
}
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'default_legacy_parser' => apply_filters('wp_kses_force_legacy_parser', true), 'rows' => $rows));
