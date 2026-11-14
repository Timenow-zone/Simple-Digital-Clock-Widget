<?php
define('WP_INSTALLING', true);
require '/var/www/html/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/upgrade.php';
if (wp_get_environment_type() !== 'local' || is_blog_installed()) {
    throw new RuntimeException('Refusing to reuse an installed site');
}
$credentials = json_decode(file_get_contents('/lab/credentials.json'), true);
$result = wp_install('SDCW reproducible release lab', 'lab_admin', 'admin@example.invalid', true, '', $credentials['admin']);
if (is_wp_error($result)) { throw new RuntimeException($result->get_error_message()); }
echo wp_json_encode(array('wordpress' => $GLOBALS['wp_version'], 'php' => PHP_VERSION)), "\n";
