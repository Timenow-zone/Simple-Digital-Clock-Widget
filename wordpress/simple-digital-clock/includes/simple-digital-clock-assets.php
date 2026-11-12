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
            '0.8.2',
            array('strategy' => 'async', 'in_footer' => true)
        );
    }
    if (!wp_script_is('simple-digital-clock-loader', 'registered')) {
        wp_register_script(
            'simple-digital-clock-loader',
            SDCW_URL . 'assets/public/js/simple-digital-clock-loader.js',
            array(),
            '1.1.6',
            true
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

/** An explicit integration request retains normal Core runtime ownership. */
function SDCW_enqueue_scripts() {
    SDCW_register_assets();
    wp_enqueue_script('simple-digital-clock');
    wp_enqueue_style('simple-digital-clock-block-style');
    if (!is_admin()) {
        add_action('wp_footer', 'SDCW_print_clock_styles', 19);
        if (did_action('wp_print_footer_scripts')) {
            SDCW_print_clock_styles();
            wp_print_scripts(array('simple-digital-clock'));
        }
    }
}

/** A nonempty owned render is a runtime-use signal, before later filters. */
function SDCW_enqueue_rendered_clock_assets($block_content) {
    if ('' !== trim($block_content) && SDCW_is_frontend_html() && !doing_filter('get_the_excerpt')) {
        SDCW_enqueue_scripts();
    }
    return $block_content;
}
add_filter('render_block_simple-digital-clock-block/widget-block', 'SDCW_enqueue_rendered_clock_assets');

/** Inspect only HTML already being rendered; leave all content bytes intact. */
function SDCW_enqueue_clock_markup($content) {
    if (!SDCW_is_frontend_html() || doing_filter('get_the_excerpt') ||
        false === stripos($content, '<timenow-zone-sdcw')) {
        return $content;
    }
    $processor = new WP_HTML_Tag_Processor($content);
    $inert = array();
    while ($processor->next_tag(array('tag_closers' => 'visit'))) {
        $tag = $processor->get_tag();
        if ('PLAINTEXT' === $tag && !$processor->is_tag_closer()) {
            break;
        }
        if (in_array($tag, array('TEMPLATE', 'SVG', 'MATH', 'XMP', 'NOSCRIPT'), true)) {
            if (!$processor->is_tag_closer()) {
                $inert[] = $tag;
            } elseif (!empty($inert) && end($inert) === $tag) {
                array_pop($inert);
            }
        } elseif (empty($inert) && 'TIMENOW-ZONE-SDCW' === $tag && !$processor->is_tag_closer()) {
            SDCW_enqueue_scripts();
            break;
        }
    }
    return $content;
}
add_filter('the_content', 'SDCW_enqueue_clock_markup', 20);
add_filter('widget_text_content', 'SDCW_enqueue_clock_markup', 20);
add_filter('widget_custom_html_content', 'SDCW_enqueue_clock_markup', 20);

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
    if (!SDCW_is_frontend_html() || wp_script_is('simple-digital-clock-loader', 'done')) {
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
    $markup = SDCW_get_runtime_markup();
    $payload = wp_json_encode(array('markup' => $markup), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    if ('' === trim($markup) || false === $payload) {
        do_action('sdcw_asset_diagnostic', 'loader_unavailable');
        return;
    }
    // JSON keeps source attributes away from speculative HTML preload scanners.
    wp_print_inline_script_tag($payload, array('id' => 'simple-digital-clock-runtime', 'type' => 'application/json'));
    wp_enqueue_script('simple-digital-clock-loader');
    wp_print_scripts(array('simple-digital-clock-loader'));
}
add_action('wp_footer', 'SDCW_print_frontend_loader', PHP_INT_MAX);

/** Core renders this complete HTML document inside a REST widget response. */
function SDCW_enqueue_preview_clock_assets() {
    if (defined('REST_REQUEST') && REST_REQUEST && defined('IFRAME_REQUEST') && IFRAME_REQUEST) {
        SDCW_enqueue_scripts();
    }
}
add_action('wp_enqueue_scripts', 'SDCW_enqueue_preview_clock_assets');

function SDCW_enqueue_editor_clock_assets() {
    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    if (is_admin() && $screen && $screen->is_block_editor()) {
        SDCW_enqueue_scripts();
    }
}
add_action('enqueue_block_assets', 'SDCW_enqueue_editor_clock_assets');
