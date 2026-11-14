<?php
require __DIR__ . '/guard.php';
if (!defined('WP_CLI')) {
    throw new RuntimeException('WP-CLI is required');
}
$keys = array('widget_text', 'widget_custom_html');
$reuse = isset($args[0]) && $args[0] === 'reuse';
foreach ($keys as $key) {
    $existing = get_option($key, array());
    if (isset($existing[2]) && !$reuse) {
        throw new RuntimeException('Refusing to overwrite a preview fixture');
    }
    if ($reuse && !isset($existing[2])) {
        throw new RuntimeException('Existing preview fixtures are required');
    }
}
switch_theme('twentytwentyone');
$clock = '<timenow-zone-sdcw caption="Legacy preview &amp; Kyiv" time-zone="Europe/Kyiv" show-seconds="true"></timenow-zone-sdcw>';
if (!$reuse) {
    update_option('widget_text', array(2 => array('title' => 'Candidate Text preview', 'text' => $clock, 'filter' => false, 'visual' => true), '_multiwidget' => 1));
    update_option('widget_custom_html', array(2 => array('title' => 'Candidate HTML preview', 'content' => $clock), '_multiwidget' => 1));
}
$sidebars = wp_get_sidebars_widgets();
$sidebars['candidate-sidebar'] = array('text-2', 'custom_html-2');
wp_set_sidebars_widgets($sidebars);
echo json_encode(array('theme' => get_stylesheet(), 'widgets' => array('text' => get_option('widget_text'), 'custom_html' => get_option('widget_custom_html')), 'sidebars' => wp_get_sidebars_widgets()), JSON_PRETTY_PRINT), "\n";
