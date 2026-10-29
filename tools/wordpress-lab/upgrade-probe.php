<?php
// Read-only verification of the old fixture records immediately after ZIP upgrade.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('The upgrade probe requires the isolated Clock lab.');
}
$service = isset($args[0]) ? $args[0] : '';
$expected = json_decode(file_get_contents('/lab/packages/baseline-posts.json'), true);
$posts = null;
foreach ($expected as $site) {
    if ($site['service'] === $service) {
        $posts = $site['posts'];
    }
}
if (!$posts) {
    throw new RuntimeException('No immutable baseline posts for this service.');
}
$results = array();
foreach ($posts as $fixture) {
    $post = get_post($fixture['id']);
    $results[] = array(
        'name' => $fixture['name'],
        'post_id' => $fixture['id'],
        'unchanged' => $post && $post->post_content === $fixture['content'],
        'sha256' => $post ? hash('sha256', $post->post_content) : null,
    );
}
require_once ABSPATH . 'wp-admin/includes/plugin.php';
$plugin = get_plugin_data(WP_PLUGIN_DIR . '/simple-digital-clock/widget_init.php', false, false);
$failed = count(array_filter($results, function ($result) { return !$result['unchanged']; }));
echo wp_json_encode(array('service' => $service, 'plugin_version' => $plugin['Version'], 'active' => is_plugin_active('simple-digital-clock/widget_init.php'), 'posts' => $results, 'failed' => $failed)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
