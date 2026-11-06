<?php
// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/** Register stable handles only when rendering or previewing an owned clock. */
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
        // A source-free handle prints only this host-layout rule, without a request.
        wp_register_style('simple-digital-clock-block-style', false, array(), '1.1.4');
        wp_add_inline_style(
            'simple-digital-clock-block-style',
            'timenow-zone-sdcw.wp-block-simple-digital-clock-block-widget-block{display:block;}'
        );
    }
}

/** WordPress deduplicates each stable handle within the current document. */
function SDCW_enqueue_scripts() {
    SDCW_register_assets();
    wp_enqueue_script('simple-digital-clock');
    wp_enqueue_style('simple-digital-clock-block-style');
    if (!is_admin()) {
        // Content and footer sidebars can enqueue the inline rule after wp_head.
        add_action('wp_footer', 'SDCW_print_clock_styles', 19);
        if (did_action('wp_print_footer_scripts')) {
            // Explicit late rendering still uses Core's filters and done lists.
            SDCW_print_clock_styles();
            if (!wp_script_is('simple-digital-clock', 'done')) {
                wp_print_scripts(array('simple-digital-clock'));
            }
        }
    }
}

/**
 * Only the owned block's render event automatically enqueues frontend assets.
 * No page, content, sidebar option or response stream is inspected.
 */
function SDCW_enqueue_rendered_clock_assets($block_content) {
    if ('' !== trim($block_content) && !is_admin() && !is_feed() && !is_robots() &&
        !is_trackback() && !wp_is_json_request() && !doing_filter('get_the_excerpt')) {
        SDCW_enqueue_scripts();
    }
    return $block_content;
}
add_filter('render_block_simple-digital-clock-block/widget-block', 'SDCW_enqueue_rendered_clock_assets');

/** Print only a pending owned inline rule; Core deduplicates head/footer output. */
function SDCW_print_clock_styles() {
    if (wp_style_is('simple-digital-clock-block-style', 'enqueued') &&
        !wp_style_is('simple-digital-clock-block-style', 'done')) {
        wp_print_styles(array('simple-digital-clock-block-style'));
    }
}

/** Empty editors still need preview assets, including their iframe canvas. */
function SDCW_enqueue_editor_clock_assets() {
    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    if (is_admin() && $screen && $screen->is_block_editor()) {
        SDCW_enqueue_scripts();
    }
}
add_action('enqueue_block_assets', 'SDCW_enqueue_editor_clock_assets');
