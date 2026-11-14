<?php
// Only a fresh, isolated loopback lab may use this private Core update offer.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' ||
    get_option('blogname') !== 'SDCW reproducible release lab' ||
    !preg_match('~^http://127\.0\.0\.1:\d+$~', home_url())) {
    throw new RuntimeException('Wrong rollback test environment');
}
require_once ABSPATH . 'wp-admin/includes/plugin.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
$plugin = 'simple-digital-clock/widget_init.php';
$package = '/lab/downloads/candidate.zip';
$manifest = json_decode(file_get_contents('/lab/manifest.json'), true);
$metadata = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin, false, false);
if (!in_array($metadata['Version'], array('1.1.2', '1.1.2.1'), true) ||
    hash_file('sha256', $package) !== $manifest['archive_sha256'] || $manifest['version'] !== '1.1.4') {
    throw new RuntimeException('Wrong source version or exact r8 archive');
}
wp_set_current_user(get_user_by('login', 'lab_admin')->ID);
$prior = get_site_transient('update_plugins');
$temp = wp_tempnam('sdcw-rollback-reupdate.zip');
if (!copy($package, $temp) || hash_file('sha256', $temp) !== $manifest['archive_sha256']) {
    throw new RuntimeException('Exact archive copy failed');
}
$skin = new WP_Ajax_Upgrader_Skin();
ob_start();
try {
    set_site_transient('update_plugins', (object) array('last_checked' => time(),
        'checked' => array($plugin => $metadata['Version']),
        'response' => array($plugin => (object) array('slug' => 'simple-digital-clock', 'plugin' => $plugin,
            'new_version' => '1.1.4', 'package' => $temp, 'url' => home_url()))));
    $upgrader = new Plugin_Upgrader($skin);
    $result = $upgrader->bulk_upgrade(array($plugin), array('clear_update_cache' => false));
} finally {
    $output = ob_get_clean();
    if ($prior === false) { delete_site_transient('update_plugins'); }
    else { set_site_transient('update_plugins', $prior); }
    if (file_exists($temp)) { unlink($temp); }
}
$after = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin, false, false);
if (!is_array($result) || !isset($result[$plugin]) || !is_array($result[$plugin]) ||
    $skin->get_errors()->has_errors() || $after['Version'] !== '1.1.4' || !is_plugin_active($plugin)) {
    throw new RuntimeException('Core update failed: ' . $output . wp_json_encode($skin->get_errors()->get_error_messages()));
}
echo wp_json_encode(array('passed' => true, 'from' => $metadata['Version'], 'to' => $after['Version'],
    'method' => 'Plugin_Upgrader::bulk_upgrade', 'private_local_offer' => true)), "\n";
