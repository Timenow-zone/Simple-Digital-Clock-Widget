<?php
// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/** Register stable handles without sending frontend resources. */
function SDCW_register_assets() {
    if (!wp_script_is('simple-digital-clock', 'registered')) {
        wp_register_script(
            'simple-digital-clock',
            SDCW_URL . 'assets/public/js/simple-digital-clock.min.js',
            array(),
            '0.8.1',
            array('strategy' => 'async', 'in_footer' => true)
        );
    }
    if (!wp_style_is('simple-digital-clock-block-style', 'registered')) {
        wp_register_style('simple-digital-clock-block-style', false, array(), '1.1.6');
        wp_add_inline_style(
            'simple-digital-clock-block-style',
            'timenow-zone-sdcw.wp-block-simple-digital-clock-block-widget-block{display:block;}'
        );
    }
}
add_action('init', 'SDCW_register_assets', 9);

/** Editors enqueue normally; frontend clocks are discovered in the browser. */
function SDCW_enqueue_scripts() {
    SDCW_register_assets();
    if (is_admin()) {
        wp_enqueue_script('simple-digital-clock');
    }
    wp_enqueue_style('simple-digital-clock-block-style');
    if (!is_admin()) {
        add_action('wp_footer', 'SDCW_print_clock_styles', 19);
        if (did_action('wp_print_footer_scripts')) {
            SDCW_print_clock_styles();
        }
    }
}

/** Preserve the owned block's layout policy without leaking frontend scripts. */
function SDCW_enqueue_rendered_clock_assets($block_content) {
    if ('' !== trim($block_content) && !is_admin() && !is_feed() && !is_robots() &&
        !is_trackback() && !wp_is_json_request() && !doing_filter('get_the_excerpt')) {
        SDCW_enqueue_scripts();
    }
    return $block_content;
}
add_filter('render_block_simple-digital-clock-block/widget-block', 'SDCW_enqueue_rendered_clock_assets');

/** Inline layout may remain after a later filter discards an owned block. */
function SDCW_print_clock_styles() {
    if (wp_style_is('simple-digital-clock-block-style', 'enqueued') &&
        !wp_style_is('simple-digital-clock-block-style', 'done')) {
        wp_print_styles(array('simple-digital-clock-block-style'));
    }
}

/** Only ordinary frontend HTML may receive the compatibility loader. */
function SDCW_is_frontend_html() {
    if (is_admin() || is_feed() || is_robots() || is_trackback() || wp_is_json_request()) {
        return false;
    }
    foreach (headers_list() as $header) {
        if (0 === stripos($header, 'Content-Type:') && !preg_match('~^Content-Type:\s*text/html(?:\s*;|\s*$)~i', $header)) {
            return false;
        }
    }
    return true;
}

/** Render only the requested Core handles, without consuming the live queue. */
function SDCW_get_runtime_markup() {
    $scripts = clone wp_scripts();
    foreach ($scripts->registered as $handle => $dependency) {
        $scripts->registered[$handle] = clone $dependency;
    }
    $scripts->queue = array('simple-digital-clock');
    $scripts->to_do = array();
    $scripts->in_footer = array();
    // Concatenation can invoke the global printer; this capture must stay local.
    $scripts->do_concat = false;
    ob_start();
    try {
        $scripts->do_items(array('simple-digital-clock'), 1);
        return ob_get_contents();
    } finally {
        ob_end_clean();
    }
}

/** Emit inert JSON and one small loader; never buffer the page response. */
function SDCW_print_frontend_loader() {
    if (!empty($GLOBALS['SDCW_frontend_loader_printed']) || !SDCW_is_frontend_html()) {
        return;
    }
    SDCW_register_assets();
    // Explicit enqueues and dependencies retain normal Core execution semantics.
    if (wp_script_is('simple-digital-clock', 'done')) {
        return;
    }
    if (wp_script_is('simple-digital-clock', 'enqueued')) {
        // A late integration may enqueue after Core's usual footer printer.
        wp_print_scripts(array('simple-digital-clock'));
        return;
    }
    $GLOBALS['SDCW_frontend_loader_printed'] = true;
    $loader_path = SDCW_PATH . 'assets/public/js/simple-digital-clock-loader.js';
    $loader = is_readable($loader_path) ? file_get_contents($loader_path) : false;
    $markup = SDCW_get_runtime_markup();
    $payload = wp_json_encode(array('markup' => $markup), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    if (false === $loader || '' === trim($loader) || '' === trim($markup) || false === $payload) {
        do_action('sdcw_asset_diagnostic', 'loader_unavailable');
        wp_print_inline_script_tag('console.error("[Simple Digital Clock] Loader unavailable.");');
        return;
    }
    // JSON keeps source attributes away from speculative HTML preload scanners.
    wp_print_inline_script_tag($payload, array('id' => 'simple-digital-clock-runtime', 'type' => 'application/json'));
    wp_print_inline_script_tag($loader, array('id' => 'simple-digital-clock-loader'));
}
add_action('wp_footer', 'SDCW_print_frontend_loader', PHP_INT_MAX);

function SDCW_enqueue_editor_clock_assets() {
    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    if (is_admin() && $screen && $screen->is_block_editor()) {
        SDCW_enqueue_scripts();
    }
}
add_action('enqueue_block_assets', 'SDCW_enqueue_editor_clock_assets');
