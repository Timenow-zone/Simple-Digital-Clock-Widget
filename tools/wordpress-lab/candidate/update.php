<?php
require __DIR__ . '/guard.php';
if (!defined('WP_CLI')) {
    throw new RuntimeException('WP-CLI is required');
}
require_once ABSPATH . 'wp-admin/includes/plugin.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
$plugin = 'simple-digital-clock/widget_init.php';
$metadata = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin, false, false);
$before = $metadata['Version'];
if (!in_array($before, array('1.1.2', '1.1.5'), true)) {
    throw new RuntimeException('Wrong predecessor');
}
$zip = '/audit/inputs/candidate.zip';
if (hash_file('sha256', $zip) !== $sdcw_run['archive_sha256']) {
    throw new RuntimeException('Wrong ZIP');
}
wp_set_current_user(get_user_by('login', 'audit_admin')->ID);
$prior = get_site_transient('update_plugins');
$temporary = wp_tempnam('candidate-update.zip');
if (!$temporary || !copy($zip, $temporary)) {
    throw new RuntimeException('Could not prepare the local updater archive');
}
$skin = new WP_Ajax_Upgrader_Skin();
ob_start();
try {
    set_site_transient('update_plugins', (object) array('last_checked' => time(), 'checked' => array($plugin => $before), 'response' => array($plugin => (object) array('slug' => 'simple-digital-clock', 'plugin' => $plugin, 'new_version' => $sdcw_run['version'], 'package' => $temporary, 'url' => home_url()))));
    $upgrader = new Plugin_Upgrader($skin);
    $result = $upgrader->bulk_upgrade(array($plugin), array('clear_update_cache' => false));
} finally {
    $output = ob_get_clean();
    if ($prior === false) {
        delete_site_transient('update_plugins');
    } else {
        set_site_transient('update_plugins', $prior);
    }
    if (file_exists($temporary)) {
        unlink($temporary);
    }
}
$metadata = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin, false, false);
$active = is_plugin_active($plugin);
$success = is_array($result) && isset($result[$plugin]) && is_array($result[$plugin]) && !$skin->get_errors()->has_errors() && $metadata['Version'] === $sdcw_run['version'] && $active;
echo json_encode(array('method' => 'Plugin_Upgrader::bulk_upgrade', 'from' => $before, 'to' => $metadata['Version'], 'active' => $active, 'success' => $success, 'result' => $result, 'output' => $output, 'errors' => $skin->get_errors()->get_error_messages(), 'private_local_update_offer' => true), JSON_PRETTY_PRINT), "\n";
if (!$success) {
    exit(1);
}
