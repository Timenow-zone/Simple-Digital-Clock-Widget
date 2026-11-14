<?php
define('WP_INSTALLING', true);
require '/var/www/html/wp-load.php';
require __DIR__ . '/guard.php';
require_once ABSPATH . 'wp-admin/includes/upgrade.php';
if (is_blog_installed()) {
    throw new RuntimeException('A fresh database is required');
}
$credentials = json_decode(file_get_contents('/audit/lab/credentials.json'), true);
$result = wp_install('SDCW candidate acceptance', 'audit_admin', 'admin@example.invalid', false, '', $credentials['admin']);
if (is_wp_error($result)) {
    throw new RuntimeException($result->get_error_message());
}
$author = wp_insert_user(array('user_login' => 'audit_author', 'user_pass' => $credentials['author'], 'user_email' => 'author@example.invalid', 'role' => 'author'));
if (is_wp_error($author)) {
    throw new RuntimeException($author->get_error_message());
}
echo json_encode(array('core' => $GLOBALS['wp_version'], 'php' => PHP_VERSION, 'admin' => $result['user_id'], 'author' => $author)), "\n";
