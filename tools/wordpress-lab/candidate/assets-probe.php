<?php
// Read-only runtime-routing checks against a complete, disposable WordPress install.
require __DIR__ . '/guard.php';
if (!defined('WP_CLI') || !WP_CLI) { throw new RuntimeException('WP-CLI is required'); }
if (!function_exists('SDCW_enqueue_clock_markup')) { throw new RuntimeException('Candidate assets implementation is required'); }

function sdcw_candidate_asset_reset() {
    $GLOBALS['wp_scripts'] = new WP_Scripts();
    $GLOBALS['wp_styles'] = new WP_Styles();
    $GLOBALS['wp_query'] = new WP_Query();
    $GLOBALS['wp_actions']['wp_print_footer_scripts'] = 0;
    unset($GLOBALS['current_screen']);
    $_SERVER['HTTP_ACCEPT'] = 'text/html';
    unset($_SERVER['CONTENT_TYPE']);
    SDCW_register_assets();
}
function sdcw_candidate_asset_capture($callback) {
    ob_start();
    try { call_user_func($callback); return ob_get_contents(); }
    finally { ob_end_clean(); }
}
function sdcw_candidate_asset_check($name, $passed, $details = null) {
    $GLOBALS['sdcw_asset_checks'][] = array('name' => $name, 'passed' => (bool) $passed, 'details' => $details);
}
function sdcw_candidate_asset_id_position($html, $id) {
    $pattern = '~\bid\s*=\s*["\']' . preg_quote($id, '~') . '["\']~i';
    return preg_match($pattern, $html, $matches, PREG_OFFSET_CAPTURE) ? $matches[0][1] : null;
}
function sdcw_candidate_asset_payload($html) {
    if (!preg_match('~<script\b[^>]*\bid=["\']simple-digital-clock-runtime["\'][^>]*>(.*?)</script>~si', $html, $match)) { return null; }
    return json_decode($match[1], true);
}
function sdcw_candidate_asset_legacy_source($source, $handle) {
    if ($handle === 'simple-digital-clock') {
        ++$GLOBALS['sdcw_asset_source_calls'];
        return home_url('/sdcw-opaque/0.8.1.min.js');
    }
    return $source;
}
function sdcw_candidate_asset_legacy_tag($tag, $handle) {
    if ($handle === 'simple-digital-clock') {
        ++$GLOBALS['sdcw_asset_tag_calls'];
        return preg_replace('~\bsrc=["\'][^"\']*["\']~', 'src="' . esc_url(home_url('/sdcw-opaque/0.8.1.min.js')) . '"', $tag);
    }
    return $tag;
}
function sdcw_candidate_asset_active_runtime_tags($html) {
    preg_match_all('~<script\b[^>]*\bsrc=["\'][^"\']*simple-digital-clock\.min\.js[^"\']*["\'][^>]*>~i', $html, $matches);
    return count($matches[0]);
}

$GLOBALS['sdcw_asset_checks'] = array();
$mode = isset($args[0]) ? $args[0] : 'frontend';
$clock = '<timenow-zone-sdcw caption="Native asset probe" time-zone="UTC"></timenow-zone-sdcw>';
$initial_buffer_level = ob_get_level();
$artifacts = array();

if ($mode === 'frontend') {
    sdcw_candidate_asset_reset();
    do_action('wp_enqueue_scripts');
    sdcw_candidate_asset_check('No-use frontend does not enqueue main runtime', !wp_script_is('simple-digital-clock', 'enqueued'));
    $fallback = sdcw_candidate_asset_capture('SDCW_print_frontend_loader');
    sdcw_candidate_asset_check('Fallback prints external bootstrap without active runtime', sdcw_candidate_asset_active_runtime_tags($fallback) === 0 && strpos($fallback, 'simple-digital-clock-loader.js') !== false);
    sdcw_candidate_asset_check('Fallback keeps JSON inert and before the bootstrap', strpos($fallback, 'type="application/json"') !== false && sdcw_candidate_asset_id_position($fallback, 'simple-digital-clock-runtime') !== null && sdcw_candidate_asset_id_position($fallback, 'simple-digital-clock-loader-js') !== null && sdcw_candidate_asset_id_position($fallback, 'simple-digital-clock-runtime') < sdcw_candidate_asset_id_position($fallback, 'simple-digital-clock-loader-js'));
    sdcw_candidate_asset_check('Core bootstrap handle is done and main handle remains unconsumed', wp_script_is('simple-digital-clock-loader', 'done') && !wp_script_is('simple-digital-clock', 'done'));
    sdcw_candidate_asset_check('Repeated fallback prints no additional bytes', sdcw_candidate_asset_capture('SDCW_print_frontend_loader') === '');
    $payload = sdcw_candidate_asset_payload($fallback);
    sdcw_candidate_asset_check('Default captured runtime explicitly permits deferred shell loading', is_array($payload) && isset($payload['lazy']) && $payload['lazy'] === true);
    $artifacts['fallback'] = $fallback;

    foreach (array('registered-source', 'registered-version', 'source-filter', 'tag-filter') as $policy) {
        sdcw_candidate_asset_reset();
        $GLOBALS['sdcw_asset_source_calls'] = 0;
        $GLOBALS['sdcw_asset_tag_calls'] = 0;
        if ($policy === 'registered-source') { wp_scripts()->registered['simple-digital-clock']->src = home_url('/sdcw-opaque/0.8.1.min.js'); }
        elseif ($policy === 'registered-version') { wp_scripts()->registered['simple-digital-clock']->ver = '0.8.1'; }
        elseif ($policy === 'source-filter') { add_filter('script_loader_src', 'sdcw_candidate_asset_legacy_source', 10, 2); }
        else { add_filter('script_loader_tag', 'sdcw_candidate_asset_legacy_tag', 10, 2); }
        try {
            $html = sdcw_candidate_asset_capture('SDCW_print_frontend_loader');
            $payload = sdcw_candidate_asset_payload($html);
            sdcw_candidate_asset_check($policy . ': actual Core output marks opaque runtime as non-deferred', is_array($payload) && array_key_exists('lazy', $payload) && $payload['lazy'] === false);
            sdcw_candidate_asset_check($policy . ': captured override source/version is retained', is_array($payload) && strpos($payload['markup'], '0.8.1') !== false);
            sdcw_candidate_asset_check($policy . ': repeated footer prints nothing', sdcw_candidate_asset_capture('SDCW_print_frontend_loader') === '');
            sdcw_candidate_asset_check($policy . ': classification executes the selected Core filter once', $GLOBALS['sdcw_asset_source_calls'] === ($policy === 'source-filter' ? 1 : 0) && $GLOBALS['sdcw_asset_tag_calls'] === ($policy === 'tag-filter' ? 1 : 0));
            $artifacts['policy_' . $policy] = $html;
        } finally {
            remove_filter('script_loader_src', 'sdcw_candidate_asset_legacy_source', 10);
            remove_filter('script_loader_tag', 'sdcw_candidate_asset_legacy_tag', 10);
        }
    }

    foreach (array('owned', 'helper', 'dependency') as $native) {
        sdcw_candidate_asset_reset();
        if ($native === 'owned') { SDCW_enqueue_rendered_clock_assets($clock); }
        elseif ($native === 'helper') { SDCW_enqueue_scripts(); }
        else {
            wp_register_script('sdcw-probe-consumer', '/probe-consumer.js', array('simple-digital-clock'), '1', true);
            wp_enqueue_script('sdcw-probe-consumer');
        }
        $html = sdcw_candidate_asset_capture('SDCW_print_frontend_loader');
        sdcw_candidate_asset_check($native . ': normal Core prints runtime once and omits fallback', sdcw_candidate_asset_active_runtime_tags($html) === 1 && strpos($html, 'simple-digital-clock-loader') === false && strpos($html, 'simple-digital-clock-runtime') === false);
        sdcw_candidate_asset_check($native . ': runtime is done; another footer prints nothing', wp_script_is('simple-digital-clock', 'done') && sdcw_candidate_asset_capture('SDCW_print_frontend_loader') === '');
    }
    sdcw_candidate_asset_reset();
    SDCW_enqueue_rendered_clock_assets('  ');
    sdcw_candidate_asset_check('Empty owned output has no use signal', !wp_script_is('simple-digital-clock', 'enqueued'));

    $html_cases = array(
        array('ordinary live HTML', $clock, true),
        array('escaped text', htmlspecialchars($clock, ENT_QUOTES, 'UTF-8'), false),
        array('comment', '<!-- ' . $clock . ' -->', false),
        array('script text', '<script type="application/json">' . json_encode($clock) . '</script>', false),
        array('textarea', '<textarea>' . $clock . '</textarea>', false),
        array('style', '<style>' . $clock . '</style>', false),
        array('noscript', '<noscript>' . $clock . '</noscript>', false),
        array('nested template', '<template><template>' . $clock . '</template>' . $clock . '</template>', false),
        array('live after template', '<template>' . $clock . '</template>' . $clock, true),
        array('live after noscript', '<noscript>' . $clock . '</noscript>' . $clock, true),
        array('foreign SVG', '<svg>' . $clock . '</svg>', false),
        array('foreign MathML', '<math>' . $clock . '</math>', false),
        array('plaintext', '<plaintext>' . $clock, false),
        array('XMP', '<xmp>' . $clock . '</xmp>', false),
    );
    foreach ($html_cases as $case) {
        sdcw_candidate_asset_reset();
        $result = SDCW_enqueue_clock_markup($case[1]);
        sdcw_candidate_asset_check($case[0] . ': actual Core tokenization preserves bytes and expected native use', $result === $case[1] && wp_script_is('simple-digital-clock', 'enqueued') === $case[2]);
    }

    foreach (array('json', 'feed', 'robots', 'trackback', 'dashboard', 'excerpt') as $context) {
        sdcw_candidate_asset_reset();
        if ($context === 'json') { $_SERVER['HTTP_ACCEPT'] = 'application/json'; }
        elseif ($context === 'dashboard') { require_once ABSPATH . 'wp-admin/includes/screen.php'; set_current_screen('dashboard'); }
        elseif ($context !== 'excerpt') { $GLOBALS['wp_query']->{'is_' . $context} = true; }
        if ($context === 'excerpt') { $GLOBALS['wp_current_filter'][] = 'get_the_excerpt'; }
        SDCW_enqueue_rendered_clock_assets($clock);
        SDCW_enqueue_clock_markup($clock);
        sdcw_candidate_asset_check($context . ': render paths request no runtime', !wp_script_is('simple-digital-clock', 'enqueued'));
        if ($context !== 'excerpt') { sdcw_candidate_asset_check($context . ': fallback emits no bytes', sdcw_candidate_asset_capture('SDCW_print_frontend_loader') === ''); }
        if ($context === 'excerpt') { array_pop($GLOBALS['wp_current_filter']); }
    }

    sdcw_candidate_asset_reset();
    wp_register_script('sdcw-probe-needed', '/needed.js', array(), '1', true);
    wp_register_script('sdcw-probe-unrelated', '/unrelated.js', array(), '1', true);
    wp_enqueue_script('sdcw-probe-unrelated');
    wp_scripts()->registered['simple-digital-clock']->deps[] = 'sdcw-probe-needed';
    wp_add_inline_script('simple-digital-clock', 'window.sdcwProbeBefore=1;', 'before');
    wp_localize_script('simple-digital-clock', 'sdcwProbeLocale', array('caption' => 'Київ 🕒 </script>'));
    wp_add_inline_script('simple-digital-clock', 'window.sdcwProbeAfter=1;', 'after');
    $snapshot = serialize(wp_scripts());
    $registry = wp_scripts();
    $captured = SDCW_get_runtime_markup();
    sdcw_candidate_asset_check('Private capture preserves actual Core registry identity and full state', wp_scripts() === $registry && serialize(wp_scripts()) === $snapshot);
    sdcw_candidate_asset_check('Private capture includes only runtime dependency chain', strpos($captured, '/needed.js') !== false && strpos($captured, '/unrelated.js') === false);
    $runtime_position = sdcw_candidate_asset_id_position($captured, 'simple-digital-clock-js');
    sdcw_candidate_asset_check('Core attached data preserves before/runtime/after order', $runtime_position !== null && strpos($captured, 'sdcwProbeBefore') < $runtime_position && strpos($captured, 'sdcwProbeLocale') < $runtime_position && strpos($captured, 'sdcwProbeAfter') > $runtime_position);
    $artifacts['captured'] = $captured;
} elseif ($mode === 'editor') {
    sdcw_candidate_asset_reset();
    require_once ABSPATH . 'wp-admin/includes/screen.php';
    set_current_screen('post');
    get_current_screen()->is_block_editor(true);
    $GLOBALS['pagenow'] = 'post.php';
    SDCW_enqueue_editor_clock_assets();
    $parent = wp_scripts();
    $parent_queue = $parent->queue;
    $assets = _wp_get_iframed_editor_assets();
    sdcw_candidate_asset_check('Actual Core iframe collector receives main runtime', sdcw_candidate_asset_active_runtime_tags($assets['scripts']) === 1);
    sdcw_candidate_asset_check('Actual Core restores the parent registry and its queue', wp_scripts() === $parent && $parent->queue === $parent_queue);
    sdcw_candidate_asset_check('Iframe contains owned layout and no fallback', strpos($assets['styles'], 'simple-digital-clock-block-style') !== false && strpos($assets['scripts'], 'simple-digital-clock-loader') === false);
    $artifacts['iframe_assets'] = $assets;
} elseif ($mode === 'preview') {
    if (!defined('REST_REQUEST')) { define('REST_REQUEST', true); }
    $method = new ReflectionMethod('WP_REST_Widget_Types_Controller', 'render_legacy_widget_preview_iframe');
    $method->setAccessible(true);
    $controller = new WP_REST_Widget_Types_Controller();
    foreach (array('text', 'custom_html') as $type) {
        sdcw_candidate_asset_reset();
        $_SERVER['HTTP_ACCEPT'] = 'application/json';
        $instance = $type === 'text' ? array('title' => '', 'text' => $clock, 'filter' => false, 'visual' => true) : array('title' => '', 'content' => $clock);
        $serialized = serialize($instance);
        $attributes = array('encoded' => base64_encode($serialized), 'hash' => wp_hash($serialized));
        ob_start();
        $html = $method->invoke($controller, $type, $attributes);
        $outside = ob_get_clean();
        sdcw_candidate_asset_check($type . ': actual Core preview owns a complete HTML document', strpos($html, '<!doctype html>') !== false && strpos($html, 'Native asset probe') !== false);
        sdcw_candidate_asset_check($type . ': preview runtime appears once inside the iframe', sdcw_candidate_asset_active_runtime_tags($html) === 1 && strpos($html, 'simple-digital-clock-loader') === false);
        sdcw_candidate_asset_check($type . ': no script bytes escape the Core preview buffer', $outside === '');
        $artifacts[$type . '_preview'] = $html;
    }
} else { throw new RuntimeException('Unknown asset probe mode'); }

sdcw_candidate_asset_check('Original output-buffer level is preserved', ob_get_level() === $initial_buffer_level);
$failed = count(array_filter($GLOBALS['sdcw_asset_checks'], function ($check) { return !$check['passed']; }));
$result = array('core' => $GLOBALS['wp_version'], 'php' => PHP_VERSION, 'mode' => $mode, 'scope' => 'Native Core PHP lifecycle; no browser rendering or intentional persistent writes; Core cache effects require separate snapshots', 'checks' => $GLOBALS['sdcw_asset_checks'], 'failed' => $failed, 'artifacts' => $artifacts);
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), "\n";
if ($failed) { exit(1); }
