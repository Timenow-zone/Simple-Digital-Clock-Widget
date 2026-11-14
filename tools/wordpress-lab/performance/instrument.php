<?php
// Test-only MU instrumentation. Never install in an owner site or release ZIP.
if (!defined('ABSPATH') || wp_get_environment_type() !== 'local' ||
    get_option('blogname') !== 'SDCW reproducible release lab' || PHP_SAPI === 'cli') {
    return;
}
$variant = isset($_GET['b_variant']) ? $_GET['b_variant'] : '';
$theme = isset($_GET['b_theme']) ? $_GET['b_theme'] : '';
$id = isset($_GET['b_id']) ? $_GET['b_id'] : '';
if (!is_string($id) || !preg_match('/^[a-f0-9]{32}$/D', $id) ||
    !in_array($variant, array('legacy', 'buffered', 'candidate'), true) ||
    !in_array($theme, array('twentytwentyone', 'twentytwentythree'), true)) {
    return;
}
$GLOBALS['sdcw_bench'] = array('id' => $id, 'variant' => $variant, 'theme' => $theme,
    'pid' => getmypid(), 'started' => $_SERVER['REQUEST_TIME_FLOAT']);
add_filter('pre_option_active_plugins', function () use ($variant) {
    return array(($variant === 'legacy' ? 'legacy-clock' : ($variant === 'buffered' ? 'buffered-clock' : 'simple-digital-clock')) . '/widget_init.php');
});
add_filter('pre_option_template', function () use ($theme) { return $theme; });
add_filter('pre_option_stylesheet', function () use ($theme) { return $theme; });
add_action('template_redirect', function () use ($variant) {
    header('Cache-Control: no-store');
    header('X-SDCW-Benchmark: ' . $variant);
    $GLOBALS['sdcw_bench']['pre_template_usage'] = memory_get_usage(false);
    $GLOBALS['sdcw_bench']['pre_template_peak'] = memory_get_peak_usage(false);
}, -PHP_INT_MAX);
add_action('wp_footer', function () {
    if (isset($_GET['b_delay']) && $_GET['b_delay'] === '200') {
        // Separate streaming diagnostic, excluded from normal latency summaries.
        usleep(200000);
    }
}, 18);
add_action('shutdown', function () {
    $GLOBALS['sdcw_bench']['peak_before_flush'] = memory_get_peak_usage(false);
    $GLOBALS['sdcw_bench']['usage_before_flush'] = memory_get_usage(false);
    $GLOBALS['sdcw_bench']['handlers_before_flush'] = ob_list_handlers();
}, 0);
add_action('shutdown', function () {
    $row = $GLOBALS['sdcw_bench'];
    $row['server_ms'] = (microtime(true) - $row['started']) * 1000;
    $row['peak_used_bytes'] = memory_get_peak_usage(false);
    $row['peak_allocated_bytes'] = memory_get_peak_usage(true);
    $row['usage_after_flush'] = memory_get_usage(false);
    $row['buffers_after_flush'] = ob_get_level();
    $row['wordpress'] = $GLOBALS['wp_version'];
    $row['php'] = PHP_VERSION;
    $row['sapi'] = PHP_SAPI;
    $row['architecture'] = php_uname('m');
    $row['output_buffering'] = ini_get('output_buffering');
    $row['zlib_output_compression'] = ini_get('zlib.output_compression');
    $row['memory_limit'] = ini_get('memory_limit');
    $row['opcache_enabled'] = function_exists('opcache_get_status') && (bool) opcache_get_status(false);
    $row['page_cache'] = defined('WP_CACHE') && WP_CACHE;
    $row['clock_count'] = (int) get_post_meta(get_queried_object_id(), '_sdcw_bench_clocks', true);
    $row['status'] = http_response_code();
    $row['last_error'] = error_get_last();
    $row['queries'] = get_num_queries();
    // Logging happens after peak/timing samples and Core's final buffer flush.
    $written = file_put_contents(WP_CONTENT_DIR . '/sdcw-benchmark.jsonl', wp_json_encode($row) . "\n", FILE_APPEND | LOCK_EX);
    if ($written === false) { error_log('SDCW benchmark observation could not be written'); }
}, PHP_INT_MAX);
