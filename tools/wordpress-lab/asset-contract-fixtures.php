<?php
// Test-only MU plugin for fresh disposable labs. Never include in the release ZIP.
if (!defined('ABSPATH')) { exit; }
if (wp_get_environment_type() !== 'local' || get_option('blogname') !== 'SDCW reproducible release lab') { return; }
add_action('widgets_init', function () {
    foreach (array('block', 'html', 'text') as $kind) {
        register_sidebar(array('id' => 'sdcw-contract-' . $kind, 'name' => 'Asset contract ' . $kind,
            'before_widget' => '<section>', 'after_widget' => '</section>'));
    }
});
function sdcw_contract_fixture_clock() {
    return '<timenow-zone-sdcw class="wp-block-simple-digital-clock-block-widget-block" second width="200" caption="Asset contract"></timenow-zone-sdcw>';
}
add_shortcode('sdcw_contract_clock', 'sdcw_contract_fixture_clock');
add_shortcode('sdcw_contract_excerpt', function () {
    $rows = get_option('sdcw_asset_contract');
    return get_the_excerpt($rows['one']['id']);
});
add_action('init', function () {
    register_block_type('sdcw-contract/clock', array('api_version' => 3, 'render_callback' => 'sdcw_contract_fixture_clock'));
    register_block_type('sdcw-contract/suppress', array('api_version' => 3, 'render_callback' => function ($attributes, $content) { return '<p>Suppressed child.</p>'; }));
    register_block_type('sdcw-contract/escape', array('api_version' => 3, 'render_callback' => function ($attributes, $content) { return '<pre>' . esc_html($content) . '</pre>'; }));
    register_block_type('sdcw-contract/keep', array('api_version' => 3, 'render_callback' => function ($attributes, $content) { return '<section>' . $content . '</section>'; }));
});
add_action('wp_footer', function () {
    $rows = get_option('sdcw_asset_contract');
    if (is_page($rows['excerpt-rendered']['id'])) {
        echo apply_filters('the_excerpt', get_the_excerpt(get_option('sdcw_asset_excerpt_source')));
    }
    foreach (array('widget-block' => 'block', 'widget-html' => 'html', 'widget-text' => 'text', 'mixed' => 'block') as $name => $kind) {
        if (is_page($rows[$name]['id'])) { dynamic_sidebar('sdcw-contract-' . $kind); }
    }
}, 5);

// A late content filter can discard even a fully rendered top-level clock.
add_filter('the_content', function ($content) {
    $rows = get_option('sdcw_asset_contract');
    return isset($rows['content-suppressed']) && is_page($rows['content-suppressed']['id']) ? '<p>Final content removed.</p>' : $content;
}, PHP_INT_MAX);
// Cover real output after Core's ordinary footer queue and an explicit chunk flush.
add_action('wp_footer', function () {
    $rows = get_option('sdcw_asset_contract');
    if (is_page($rows['late-clock']['id'])) { echo sdcw_contract_fixture_clock(); }
    if (is_page($rows['flushed-clock']['id'])) {
        echo '<timenow-';
        ob_flush();
        echo 'zone-sdcw class="wp-block-simple-digital-clock-block-widget-block" second></timenow-zone-sdcw>';
    }
}, 99);
