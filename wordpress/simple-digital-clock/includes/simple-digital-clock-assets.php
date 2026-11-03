<?php
// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register stable handles without adding frontend requests.
 */
function SDCW_register_assets() {
    wp_register_script(
        'simple-digital-clock',
        SDCW_URL . 'assets/public/js/simple-digital-clock.min.js',
        array(),
        '0.8.1',
        array('strategy' => 'async', 'in_footer' => true)
    );
    if (!wp_style_is('simple-digital-clock-block-style', 'registered')) {
        // A source-free handle prints only this host-layout rule, without a request.
        wp_register_style('simple-digital-clock-block-style', false, array(), '1.1.4');
        wp_add_inline_style(
            'simple-digital-clock-block-style',
            'timenow-zone-sdcw.wp-block-simple-digital-clock-block-widget-block{display:block;}'
        );
    }
}
add_action('init', 'SDCW_register_assets', 9);

/**
 * WordPress deduplicates each stable handle within the current document.
 */
function SDCW_enqueue_scripts() {
    wp_enqueue_script('simple-digital-clock');
    wp_enqueue_style('simple-digital-clock-block-style');
}

require_once SDCW_PATH . 'includes/simple-digital-clock-output.php';

/** Inspect a standalone HTML fragment without affecting delivery state. */
function SDCW_output_has_clock($html) {
    $observer = new SDCW_Clock_Output_Observer();
    $observer->feed($html);
    return $observer->has_clock();
}

/** A capture must not append even an empty HTML comment to another media type. */
function SDCW_is_frontend_html() {
    foreach (headers_list() as $header) {
        if (0 === stripos($header, 'Content-Type:') && !preg_match('~^Content-Type:\s*text/html(?:\s*;|\s*$)~i', $header)) {
            return false;
        }
    }
    return true;
}

/**
 * Observe only bytes being delivered, including explicit flushes. A chunk size
 * of one avoids retaining the response. Cleaned writes never reach the parser.
 * Core-generated asset tags are a small private capture, not a page buffer.
 */
function SDCW_filter_frontend_output($html, $phase) {
    if (($phase & PHP_OUTPUT_HANDLER_CLEAN) || !empty($GLOBALS['SDCW_frontend_assets_delivered'])) {
        return $html;
    }
    if (!SDCW_is_frontend_html()) {
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
    if (is_admin() || is_feed() || is_robots() || is_trackback() || wp_is_json_request() || isset($GLOBALS['SDCW_frontend_observer'])) {
        return;
    }
    $GLOBALS['SDCW_frontend_observer'] = new SDCW_Clock_Output_Observer();
    ob_start('SDCW_filter_frontend_output', 1);
    add_action('wp_footer', 'SDCW_capture_frontend_assets', 19);
}
add_action('template_redirect', 'SDCW_start_frontend_output', PHP_INT_MAX);

/**
 * Preserve Core's footer lifecycle and filters. Repeated footers share one
 * capture. An empty comment provides a safe insertion point in ordinary HTML;
 * clocks appearing later are handled by the same observer without duplicates.
 */
function SDCW_capture_frontend_assets() {
    if (isset($GLOBALS['SDCW_frontend_asset_markup']) || !SDCW_is_frontend_html()) {
        return;
    }
    ob_start();
    wp_print_styles(array('simple-digital-clock-block-style'));
    wp_scripts()->do_items(array('simple-digital-clock'), 1);
    $GLOBALS['SDCW_frontend_asset_markup'] = ob_get_clean();
    echo '<!-- -->';
}

/**
 * Empty editors still need a working clock inserter/preview, including its iframe.
 * Other admin screens do not need the runtime or inline integration rule.
 */
function SDCW_enqueue_editor_clock_assets() {
    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    if (is_admin() && $screen && $screen->is_block_editor()) {
        SDCW_enqueue_scripts();
    }
}
add_action('enqueue_block_assets', 'SDCW_enqueue_editor_clock_assets');
