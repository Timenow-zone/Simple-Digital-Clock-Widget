<?php
// Install only in a fresh owned lab. The fixture changes no stored content.
if (!defined('SDCW_CANDIDATE_PROJECT') || wp_get_environment_type() !== 'local') {
    return;
}
add_action('template_redirect', function () {
    if (!isset($_GET['candidate_runtime_case'])) {
        return;
    }
    $cases = array(
        'owned' => array('healthy-1'),
        'raw-healthy' => array('healthy-1', 'healthy-2'),
        'invalid-first' => array('bad-1', 'healthy-1', 'healthy-2'),
        'invalid-middle' => array('healthy-1', 'bad-1', 'healthy-2'),
        'all-invalid' => array('bad-1', 'bad-2'),
        'dynamic-empty' => array(),
        'dynamic-invalid-first' => array(),
    );
    $case = (string) $_GET['candidate_runtime_case'];
    if (!isset($cases[$case])) {
        status_header(404);
        exit;
    }
    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: no-store');
    echo '<!doctype html><html><head><meta charset="utf-8"><title>Native runtime compatibility</title>';
    wp_head();
    echo '</head><body><main><h1>' . esc_html($case) . '</h1>';
    foreach ($cases[$case] as $id) {
        $invalid = $id === 'bad-1' ? 'invalid-color' : ($id === 'bad-2' ? '#zzzzzz' : '');
        $clock = '<timenow-zone-sdcw id="' . esc_attr($id) . '" locale="en-GB" time-zone="UTC" second="true" width="230" caption="' . esc_attr($id) . '"' . ($invalid ? ' background-color="' . esc_attr($invalid) . '"' : '') . '></timenow-zone-sdcw>';
        if ($case === 'owned') {
            echo do_blocks('<!-- wp:simple-digital-clock-block/widget-block {"caption":"healthy-1","timeZone":"UTC","locale":"en-GB","width":230,"second":true} -->' . $clock . '<!-- /wp:simple-digital-clock-block/widget-block -->');
        } else {
            echo $clock; // Fixed fixture markup: raw output deliberately bypasses content filters.
        }
    }
    echo '</main>';
    wp_footer();
    echo '</body></html>';
    exit;
}, 1);
