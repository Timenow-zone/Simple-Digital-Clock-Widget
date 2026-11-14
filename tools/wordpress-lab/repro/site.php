<?php
// Only WP-CLI in the newly provisioned, disposable loopback lab may write data.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' ||
    get_option('blogname') !== 'SDCW reproducible release lab' ||
    !preg_match('~^http://127\.0\.0\.1:\d+$~', home_url())) {
    throw new RuntimeException('Refusing to operate outside the disposable lab');
}
require_once ABSPATH . 'wp-admin/includes/plugin.php';

$mode = isset($args[0]) ? $args[0] : '';
$plugin = 'simple-digital-clock/widget_init.php';
if ($mode === 'seed') {
    $credentials = json_decode(file_get_contents('/lab/credentials.json'), true);
    foreach (array('editor', 'author') as $role) {
        $id = wp_insert_user(array('user_login' => 'lab_' . $role, 'user_pass' => $credentials[$role],
            'user_email' => $role . '@example.invalid', 'role' => $role));
        if (is_wp_error($id)) { throw new RuntimeException($id->get_error_message()); }
    }
    wp_set_current_user(get_user_by('login', 'lab_admin')->ID);
    $attributes = array('width' => 180, 'caption' => 'Stored caption', 'date' => true, 'second' => true,
        'unknown' => array('nested' => array('0' => 'literal \\u0022', 'count' => 7)), 'lock' => array('move' => true));
    $html = '<timenow-zone-sdcw width="180" caption="Stored caption" date second></timenow-zone-sdcw>';
    $content = '<!-- wp:simple-digital-clock-block/widget-block ' . wp_json_encode($attributes) . ' -->' . $html . '<!-- /wp:simple-digital-clock-block/widget-block -->';
    $post = wp_insert_post(array('post_type' => 'post', 'post_status' => 'publish',
        'post_title' => 'Reproducible clock fixture', 'post_content' => $content), true);
    if (is_wp_error($post)) { throw new RuntimeException($post->get_error_message()); }
    update_option('widget_block', array(2 => array('content' => $content), '_multiwidget' => 1));
    update_option('widget_text', array(2 => array('title' => 'Clock fixture', 'text' => $html), '_multiwidget' => 1));
    update_option('blog_public', 0);
    echo wp_json_encode(array('post_id' => $post)), "\n";
} elseif ($mode === 'snapshot') {
    global $wpdb;
    $posts = $wpdb->get_results("SELECT * FROM {$wpdb->posts} ORDER BY ID", ARRAY_A);
    $options = array();
    foreach (array('widget_block', 'widget_text', 'sidebars_widgets', 'show_on_front', 'page_on_front', 'template', 'stylesheet', 'active_plugins') as $name) {
        $options[$name] = get_option($name, null);
    }
    $directory = WP_PLUGIN_DIR . '/simple-digital-clock/';
    $files = array();
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if ($file->isLink()) { throw new RuntimeException('Unexpected plugin symlink'); }
        $files[substr($file->getPathname(), strlen($directory))] = hash_file('sha256', $file->getPathname());
    }
    ksort($files);
    $metadata = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin, false, false);
    echo wp_json_encode(array('wordpress' => $GLOBALS['wp_version'], 'php' => PHP_VERSION,
        'version' => $metadata['Version'], 'active' => is_plugin_active($plugin), 'files' => $files,
        'posts_sha256' => hash('sha256', wp_json_encode($posts)),
        'options_sha256' => hash('sha256', wp_json_encode($options)), 'posts' => $posts, 'options' => $options)), "\n";
} elseif ($mode === 'update') {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
    $manifest = json_decode(file_get_contents('/lab/manifest.json'), true);
    $package = '/lab/downloads/candidate.zip';
    $metadata = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin, false, false);
    if ($metadata['Version'] !== '1.1.2' || hash_file('sha256', $package) !== $manifest['archive_sha256']) {
        throw new RuntimeException('Wrong predecessor or candidate archive');
    }
    wp_set_current_user(get_user_by('login', 'lab_admin')->ID);
    $prior = get_site_transient('update_plugins');
    $temp = wp_tempnam('sdcw-local-update.zip');
    if (!copy($package, $temp) || hash_file('sha256', $temp) !== $manifest['archive_sha256']) {
        throw new RuntimeException('Failed to copy the exact candidate');
    }
    $skin = new WP_Ajax_Upgrader_Skin();
    ob_start();
    try {
        set_site_transient('update_plugins', (object) array('last_checked' => time(), 'checked' => array($plugin => '1.1.2'),
            'response' => array($plugin => (object) array('slug' => 'simple-digital-clock', 'plugin' => $plugin,
                'new_version' => $manifest['version'], 'package' => $temp, 'url' => home_url()))));
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
        $skin->get_errors()->has_errors() || $after['Version'] !== $manifest['version'] || !is_plugin_active($plugin)) {
        throw new RuntimeException('Core local updater failed: ' . $output . wp_json_encode($skin->get_errors()->get_error_messages()));
    }
    echo wp_json_encode(array('passed' => true, 'method' => 'Plugin_Upgrader::bulk_upgrade',
        'private_local_offer' => true, 'public_update_offer_tested' => false)), "\n";
} elseif ($mode === 'save') {
    // Candidate-only role saves; never run the old writer on the minimum Core.
    $row = $GLOBALS['wpdb']->get_row("SELECT ID,post_content FROM {$GLOBALS['wpdb']->posts} WHERE post_title='Reproducible clock fixture'");
    if (!$row) { throw new RuntimeException('Missing fixture'); }
    foreach (array('editor', 'author') as $role) {
        wp_set_current_user(get_user_by('login', 'lab_' . $role)->ID);
        $id = wp_update_post(wp_slash(array('ID' => $row->ID, 'post_title' => 'Reproducible clock fixture', 'post_content' => $row->post_content)), true);
        if (is_wp_error($id) || get_post($row->ID)->post_content !== $row->post_content) {
            throw new RuntimeException('Candidate role save changed clock metadata: ' . $role);
        }
    }
    echo wp_json_encode(array('role_saves' => 2, 'content_unchanged' => true)), "\n";
} else {
    throw new RuntimeException('Unknown fixture mode');
}
