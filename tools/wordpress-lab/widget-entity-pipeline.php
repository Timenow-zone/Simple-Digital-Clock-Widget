<?php
// Compare the widget save path with the immutable, browser-derived entity corpus.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These tests require the isolated Clock lab.');
}
$kind = isset($args[0]) ? $args[0] : '';
if (!in_array($kind, array('named', 'numeric'), true)) { throw new RuntimeException('Invalid entity corpus.'); }
$file = 'named' === $kind ? 'html5' : 'numeric';
$cases = json_decode(file_get_contents('/lab/packages/' . $file . '-entity-cases.json'), true);
if (count($cases) !== ('named' === $kind ? 8500 : 9684)) { throw new RuntimeException('Unexpected entity fixture count.'); }
global $wp_widget_factory, $wpdb;
$widget = $wp_widget_factory->widgets['WP_Widget_Block'];
$save = function ($content) use ($widget) {
    $new = array('content' => $content);
    $instance = apply_filters('widget_update_callback', $widget->update($new, array()), $new, array(), $widget);
    return $instance['content'];
};
$input = implode("\n", array_column($cases, 'input'));
wp_set_current_user(get_user_by('login', 'clock_lab_admin')->ID);
kses_init();
$admin = $save($input);
wp_set_current_user(get_user_by('login', is_multisite() ? 'clock_site_admin' : 'clock_patch_author')->ID);
kses_init();
$output = $save($input);
$again = $save($output);
if (false === $wpdb->query('CREATE TEMPORARY TABLE sdcw_widget_entities (value LONGTEXT CHARACTER SET utf8mb3)')) { throw new RuntimeException($wpdb->last_error); }
$inserted = $wpdb->insert('sdcw_widget_entities', array('value' => $output));
$readback = $wpdb->get_var('SELECT value FROM sdcw_widget_entities');
$checks = array(
    array('name' => 'unfiltered widget input unchanged', 'passed' => $admin === $input),
    array('name' => 'repeated filtered widget save stable', 'passed' => $again === $output),
    array('name' => 'widget entity representation stays ASCII', 'passed' => 0 === preg_match('/[^\x00-\x7f]/', $output)),
    array('name' => 'widget entities utf8mb3 exact round trip', 'passed' => 1 === $inserted && $readback === $output),
    array('name' => 'recursive KSES frames balanced', 'passed' => SDCW_clock_kses_frames() === array()),
);
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'checks' => $checks, 'failed' => $failed, 'names' => array_column($cases, 'name'), 'input' => $input, 'output' => $output)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
