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
        wp_register_style('simple-digital-clock-block-style', false, array(), '1.1.5');
        wp_add_inline_style(
            'simple-digital-clock-block-style',
            'timenow-zone-sdcw.wp-block-simple-digital-clock-block-widget-block{display:block;}'
        );
    }
}
add_action('init', 'SDCW_register_assets', 9);

/** Editors enqueue normally; frontend runtime delivery follows actual HTML. */
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

require_once SDCW_PATH . 'includes/simple-digital-clock-output.php';

/** Only ordinary HTML may receive generated script tags. */
function SDCW_is_frontend_html() {
    foreach (headers_list() as $header) {
        if (0 === stripos($header, 'Content-Type:') && !preg_match('~^Content-Type:\s*text/html(?:\s*;|\s*$)~i', $header)) {
            return false;
        }
    }
    return true;
}

/** Insertion changes response length; never retain a stale fixed length. */
function SDCW_prepare_frontend_length() {
    foreach (headers_list() as $header) {
        if (0 === stripos($header, 'Content-Length:')) {
            if (headers_sent()) {
                $GLOBALS['SDCW_frontend_output_blocker'] = 'content_length_already_sent';
                return false;
            }
            header_remove('Content-Length');
            break;
        }
    }
    return true;
}

/** Observe delivered chunks; cleaned writes never change lexical history. */
function SDCW_filter_frontend_output($html, $phase) {
    if (($phase & PHP_OUTPUT_HANDLER_CLEAN) || !empty($GLOBALS['SDCW_frontend_assets_delivered'])) {
        return $html;
    }
    if (!SDCW_is_frontend_html() || !SDCW_prepare_frontend_length()) {
        return $html;
    }
    $ready = isset($GLOBALS['SDCW_frontend_asset_markup']);
    $position = $GLOBALS['SDCW_frontend_observer']->feed($html, $ready);
    if ($ready && null !== $position) {
        $GLOBALS['SDCW_frontend_assets_delivered'] = true;
        return substr($html, 0, $position) . $GLOBALS['SDCW_frontend_asset_markup'] . substr($html, $position);
    }
    return $html;
}

function SDCW_start_frontend_output() {
    if (is_admin() || is_feed() || is_robots() || is_trackback() || wp_is_json_request() ||
        isset($GLOBALS['SDCW_frontend_observer']) || !SDCW_is_frontend_html()) {
        return;
    }
    if (!SDCW_prepare_frontend_length()) {
        return;
    }
    $GLOBALS['SDCW_frontend_observer'] = new SDCW_Clock_Output_Observer();
    ob_start('SDCW_filter_frontend_output', 1);
    add_action('wp_footer', 'SDCW_capture_frontend_assets', 19);
}
add_action('template_redirect', 'SDCW_start_frontend_output', PHP_INT_MAX);

/** Capture only Core-generated runtime tags, not page content or layout CSS. */
function SDCW_capture_frontend_assets() {
    if (isset($GLOBALS['SDCW_frontend_asset_markup']) || !SDCW_is_frontend_html() ||
        !SDCW_prepare_frontend_length()) {
        return;
    }
    SDCW_register_assets();
    ob_start();
    wp_scripts()->do_items(array('simple-digital-clock'), 1);
    $GLOBALS['SDCW_frontend_asset_markup'] = ob_get_clean();
    // A late owned render must still print its layout after footer priority 19.
    add_action('wp_footer', 'SDCW_print_clock_styles', PHP_INT_MAX);
    echo '<!-- -->';
}

function SDCW_enqueue_editor_clock_assets() {
    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    if (is_admin() && $screen && $screen->is_block_editor()) {
        SDCW_enqueue_scripts();
    }
}
add_action('enqueue_block_assets', 'SDCW_enqueue_editor_clock_assets');
