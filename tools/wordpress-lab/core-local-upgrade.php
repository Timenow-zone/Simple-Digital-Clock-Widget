<?php
// Exercise the Core AJAX updater's bulk_upgrade path with a private local ZIP offer.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('This upgrade probe requires the isolated Clock lab.');
}
list($package, $sha) = $args;
if (!is_file($package) || hash_file('sha256', $package) !== $sha) {
    throw new RuntimeException('Unexpected local upgrade package.');
}
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';
require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
$plugin = 'simple-digital-clock/widget_init.php';
$before = get_file_data(WP_PLUGIN_DIR . '/' . $plugin, array('version' => 'Version'));
if ($before['version'] !== '1.1.1') {
    throw new RuntimeException('The Core update must start on public 1.1.1.');
}
wp_set_current_user(get_user_by('login', 'clock_lab_admin')->ID);
$previous = get_site_transient('update_plugins');
$offer = is_object($previous) ? clone $previous : new stdClass();
if (!isset($offer->response)) {
    $offer->response = array();
}
$temporary = wp_tempnam('sdcw-acceptance.zip');
if (!$temporary || !copy($package, $temporary) || hash_file('sha256', $temporary) !== $sha) {
    throw new RuntimeException('Cannot create the disposable upgrade package.');
}
$offer->response[$plugin] = (object) array('slug' => 'simple-digital-clock', 'plugin' => $plugin, 'new_version' => '1.1.2', 'package' => $temporary, 'url' => 'https://wordpress.org/plugins/simple-digital-clock/');
$skin = new WP_Ajax_Upgrader_Skin();
ob_start();
try {
    set_site_transient('update_plugins', $offer);
    $upgrader = new Plugin_Upgrader($skin);
    $results = $upgrader->bulk_upgrade(array($plugin), array('clear_update_cache' => false));
    $success = is_array($results) && isset($results[$plugin]) ? $results[$plugin] : false;
    $output = ob_get_contents();
} finally {
    ob_end_clean();
    if ($previous === false) {
        delete_site_transient('update_plugins');
    } else {
        set_site_transient('update_plugins', $previous);
    }
    if (file_exists($temporary)) {
        unlink($temporary);
    }
}
$after = get_file_data(WP_PLUGIN_DIR . '/' . $plugin, array('version' => 'Version'));
$passed = is_array($success) && !$skin->get_errors()->has_errors();
$failed = !$passed || $after['version'] !== '1.1.2' || (!is_plugin_active($plugin) && !is_plugin_active_for_network($plugin));
echo wp_json_encode(array('before' => $before['version'], 'after' => $after['version'], 'success' => $passed, 'failed' => $failed, 'wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'local_offer' => true, 'core_path' => 'Plugin_Upgrader::bulk_upgrade (wp_ajax_update_plugin)', 'package_sha256' => $sha, 'messages' => $skin->get_upgrade_messages(), 'output' => $output, 'error' => is_wp_error($success) ? $success->get_error_messages() : null)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
