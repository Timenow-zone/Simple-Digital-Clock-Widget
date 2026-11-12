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
function sdcw_contract_explicit_clock() {
    SDCW_enqueue_scripts();
    return sdcw_contract_fixture_clock();
}
add_shortcode('sdcw_contract_clock', 'sdcw_contract_explicit_clock');
add_shortcode('sdcw_contract_excerpt', function () {
    $rows = get_option('sdcw_asset_contract');
    return get_the_excerpt($rows['one']['id']);
});
add_action('init', function () {
    register_block_type('sdcw-contract/clock', array('api_version' => 3, 'render_callback' => 'sdcw_contract_explicit_clock'));
    register_block_type('sdcw-contract/suppress', array('api_version' => 3, 'render_callback' => function ($attributes, $content) { return '<p>Suppressed child.</p>'; }));
    register_block_type('sdcw-contract/escape', array('api_version' => 3, 'render_callback' => function ($attributes, $content) { return '<pre>' . esc_html($content) . '</pre>'; }));
    register_block_type('sdcw-contract/keep', array('api_version' => 3, 'render_callback' => function ($attributes, $content) { return '<section>' . $content . '</section>'; }));
});
add_action('wp_footer', function () {
    $rows = get_option('sdcw_asset_contract');
    if (is_page($rows['excerpt-rendered']['id'])) {
        SDCW_enqueue_scripts();
        echo apply_filters('the_excerpt', get_the_excerpt(get_option('sdcw_asset_excerpt_source')));
    }
    foreach (array('widget-block' => 'block', 'widget-html' => 'html', 'widget-text' => 'text', 'mixed' => 'block') as $name => $kind) {
        if (is_page($rows[$name]['id'])) {
            if ($kind !== 'block') { SDCW_enqueue_scripts(); }
            dynamic_sidebar('sdcw-contract-' . $kind); }
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
    if (is_page($rows['late-clock']['id'])) {
        echo do_blocks('<!-- wp:simple-digital-clock-block/widget-block -->' . sdcw_contract_fixture_clock() . '<!-- /wp:simple-digital-clock-block/widget-block -->');
    }
    if (is_page($rows['flushed-clock']['id'])) {
        SDCW_enqueue_scripts();
        echo '<timenow-';
        if (ob_get_level()) { ob_flush(); }
        flush();
        echo 'zone-sdcw class="wp-block-simple-digital-clock-block-widget-block" second></timenow-zone-sdcw>';
    }
}, 99);

// Explicit integrations enqueue only when their own renderer emits a clock.
add_filter('the_content', function ($content) {
    $rows = get_option('sdcw_asset_contract');
    foreach (array('raw', 'custom-html', 'after-noscript', 'after-xmp', 'noscript-fake-script', 'xmp-fake-script', 'after-select-script') as $name) {
        if (is_page($rows[$name]['id'])) { SDCW_enqueue_scripts(); break; }
    }
    return $content;
}, 9);
add_filter('pre_render_block', function ($pre, $parsed) {
    $rows = get_option('sdcw_asset_contract');
    if (!empty($rows['own-suppressed']) && is_page($rows['own-suppressed']['id']) &&
        $parsed['blockName'] === 'simple-digital-clock-block/widget-block') { return ''; }
    return $pre;
}, 10, 2);
add_action('wp_enqueue_scripts', function () {
    $rows = get_option('sdcw_asset_contract');
    if (!empty($rows['head-clock']) && is_page($rows['head-clock']['id'])) {
        $GLOBALS['sdcw_contract_head_clock'] = do_blocks('<!-- wp:simple-digital-clock-block/widget-block -->' . sdcw_contract_fixture_clock() . '<!-- /wp:simple-digital-clock-block/widget-block -->');
    }
});
add_action('wp_footer', function () {
    if (isset($GLOBALS['sdcw_contract_head_clock'])) { echo $GLOBALS['sdcw_contract_head_clock']; }
}, 5);
