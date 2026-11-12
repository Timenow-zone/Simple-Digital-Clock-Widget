<?php
require __DIR__ . '/guard.php';
if (!defined('WP_CLI')) {
    throw new RuntimeException('WP-CLI is required');
}
require_once ABSPATH . 'wp-admin/includes/plugin.php';
global $wpdb, $wp_version;
$plugin = WP_PLUGIN_DIR . '/simple-digital-clock/';
$metadata = get_plugin_data($plugin . 'widget_init.php', false, false);
$result = array('core' => $wp_version, 'php' => PHP_VERSION, 'plugin' => $metadata['Version'], 'active' => is_plugin_active('simple-digital-clock/widget_init.php'), 'tables' => array(), 'options' => array(), 'files' => array());
$tables = array('posts' => 'ID', 'postmeta' => 'meta_id', 'terms' => 'term_id', 'term_taxonomy' => 'term_taxonomy_id', 'term_relationships' => 'object_id,term_taxonomy_id', 'termmeta' => 'meta_id', 'comments' => 'comment_ID', 'commentmeta' => 'meta_id');
foreach ($tables as $table => $order) {
    $rows = $wpdb->get_results('SELECT * FROM ' . $wpdb->prefix . $table . ' ORDER BY ' . $order, ARRAY_A);
    if ($wpdb->last_error) {
        throw new RuntimeException($wpdb->last_error);
    }
    $result['tables'][$table] = array('count' => count($rows), 'sha256' => hash('sha256', json_encode($rows)), 'rows' => $rows);
}
foreach ($wpdb->get_results("SELECT * FROM {$wpdb->options} ORDER BY option_name", ARRAY_A) as $row) {
    $result['options'][$row['option_name']] = array('sha256' => hash('sha256', $row['option_value']), 'value' => $row['option_value'], 'autoload' => $row['autoload']);
}
if ($wpdb->last_error) {
    throw new RuntimeException($wpdb->last_error);
}
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($plugin, FilesystemIterator::SKIP_DOTS)) as $file) {
    if ($file->isLink() || !$file->isFile()) {
        throw new RuntimeException('Non-regular installed plugin file');
    }
    $result['files'][substr($file->getPathname(), strlen($plugin))] = hash_file('sha256', $file->getPathname());
}
ksort($result['files']);
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), "\n";
