<?php
// Run only through WP-CLI inside the isolated test sites.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local') {
    throw new RuntimeException('The fixture requires WP-CLI in the local lab.');
}

$id = wp_insert_post(array(
    'post_title' => 'Clock Local Investigation',
    'post_type' => 'post',
    'post_status' => 'publish',
    'post_content' => '',
), true);
if (is_wp_error($id)) {
    throw new RuntimeException($id->get_error_message());
}

update_option('blog_public', '0');
update_option('timezone_string', 'UTC');
echo wp_json_encode(array('post_id' => $id, 'wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION)) . "\n";
