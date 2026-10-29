<?php
// Exercise real widget REST permissions and the separate block-widget save pipeline.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These tests require the isolated Clock lab.');
}
$key = isset($args[0]) ? $args[0] : '';
$all = json_decode(file_get_contents('/lab/packages/review5-posts-seed.json'), true);
$rows = array_values(array_filter($all, function ($row) use ($key) { return $row['key'] === $key; }));
if (count($rows) !== 1) {
    throw new RuntimeException('Unknown isolated widget fixture.');
}
$input = $rows[0]['records'][0]['original'];
$sidebar = 'ms85-child' === $key ? 'sidebar-1' : 'sdcw-lab';
if (!is_registered_sidebar($sidebar)) {
    throw new RuntimeException('Missing isolated widget sidebar.');
}
$results = array();
foreach (array('clock_lab_admin', 'clock_site_admin', 'clock_editor', 'clock_patch_author') as $login) {
    $user = get_user_by('login', $login);
    wp_set_current_user($user->ID);
    kses_init();
    $request = new WP_REST_Request('POST', '/wp/v2/widgets');
    $request->set_body_params(array('id_base' => 'block', 'sidebar' => $sidebar, 'instance' => array('raw' => array('content' => $input))));
    $response = rest_do_request($request);
    $data = $response->get_data();
    $results[] = array('login' => $login, 'super_admin' => is_super_admin(), 'can_edit_widgets' => current_user_can('edit_theme_options'), 'unfiltered_html' => current_user_can('unfiltered_html'), 'status' => $response->get_status(), 'widget_id' => isset($data['id']) ? $data['id'] : null, 'input' => $input, 'content' => isset($data['instance']['raw']['content']) ? $data['instance']['raw']['content'] : null, 'error' => isset($data['code']) ? $data['code'] : null);
}
echo wp_json_encode(array('key' => $key, 'wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'multisite' => is_multisite(), 'theme' => wp_get_theme()->get('Name'), 'sidebar' => $sidebar, 'results' => $results)) . "\n";
