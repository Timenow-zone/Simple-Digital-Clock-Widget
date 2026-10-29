<?php
// Probe content filtering only in the disposable lab, preserving the original fixture.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local') {
    throw new RuntimeException('The probe requires WP-CLI in the local lab.');
}

$fixture_id = isset($args[0]) ? absint($args[0]) : 0;
if (!$fixture_id) {
    throw new RuntimeException('Pass the generated fixture post ID as the first argument.');
}
$source = get_post($fixture_id);
if (!$source || $source->post_title !== 'Clock Local Investigation' || strpos($source->post_content, '<timenow-zone-sdcw') === false) {
    throw new RuntimeException('Run the browser smoke test first to create the source block.');
}
$author = get_user_by('login', 'clock_lab_author');
if (!$author) {
    $author_id = wp_insert_user(array(
        'user_login' => 'clock_lab_author',
        'user_pass' => wp_generate_password(32),
        'role' => 'author',
    ));
    if (is_wp_error($author_id)) {
        throw new RuntimeException($author_id->get_error_message());
    }
    $author = get_user_by('id', $author_id);
}
$admin = get_user_by('login', 'clock_lab_admin');
if (!$admin) {
    throw new RuntimeException('The generated lab administrator is missing.');
}
$results = array();
foreach (array('administrator' => $admin, 'author' => $author) as $role => $user) {
    wp_set_current_user($user->ID);
    kses_init();
    $id = wp_insert_post(array(
        'post_title' => 'Clock role probe: ' . $role,
        'post_author' => $user->ID,
        'post_status' => 'publish',
        'post_content' => wp_slash($source->post_content),
    ), true);
    if (is_wp_error($id)) {
        throw new RuntimeException($id->get_error_message());
    }
    $saved = get_post($id)->post_content;
    $results[] = array(
        'role' => $role,
        'unfiltered_html' => current_user_can('unfiltered_html'),
        'post_id' => $id,
        'clock_tag_preserved' => strpos($saved, '<timenow-zone-sdcw') !== false,
        'saved_content' => $saved,
    );
}
wp_set_current_user($admin->ID);
kses_init();
echo wp_json_encode($results) . "\n";
