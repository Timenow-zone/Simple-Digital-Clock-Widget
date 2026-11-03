<?php
// Fresh disposable lab fixtures and native Core contracts; never use on owner sites.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' ||
    get_option('blogname') !== 'SDCW reproducible release lab') {
    throw new RuntimeException('The asset contract requires the disposable lab');
}
$clock = '<timenow-zone-sdcw class="wp-block-simple-digital-clock-block-widget-block" second width="200" caption="Asset contract"></timenow-zone-sdcw>';
$block = '<!-- wp:simple-digital-clock-block/widget-block -->' . $clock . '<!-- /wp:simple-digital-clock-block/widget-block -->';
$mode = isset($args[0]) ? $args[0] : '';
if ($mode === 'seed') {
    if (get_option('sdcw_asset_contract')) { throw new RuntimeException('Fixture evidence already exists'); }
    wp_set_current_user(get_user_by('login', 'lab_admin')->ID);
    $pattern = wp_insert_post(array('post_type' => 'wp_block', 'post_status' => 'publish',
        'post_title' => 'Asset contract synced pattern', 'post_content' => $block), true);
    if (is_wp_error($pattern)) { throw new RuntimeException($pattern->get_error_message()); }
    $cases = array(
        'empty' => array('<p>No clock on this page.</p>', 0),
        'one' => array($block, 1),
        'many' => array(str_repeat($block, 3), 3),
        'nested' => array('<!-- wp:group --><div class="wp-block-group">' . $block . '</div><!-- /wp:group -->', 1),
        'pattern' => array('<!-- wp:block {"ref":' . $pattern . '} /-->', 1),
        'raw' => array($clock, 1),
        'custom-html' => array('<!-- wp:html -->' . $clock . '<!-- /wp:html -->', 1),
        'shortcode' => array('[sdcw_contract_clock]', 1),
        'dynamic' => array('<!-- wp:sdcw-contract/clock /-->', 1),
        'escaped' => array('<pre>&lt;timenow-zone-sdcw second&gt;&lt;/timenow-zone-sdcw&gt;</pre>', 0),
        'comment' => array('<!-- ' . $clock . ' --><p>Comment only.</p>', 0),
        'attribute' => array('<div data-example="&lt;timenow-zone-sdcw&gt;">Attribute only.</div>', 0),
        'inactive-widget' => array('<p>Inactive widgets are not displayed.</p>', 0),
        'widget-block' => array('<p>Sidebar clock below.</p>', 1),
        'widget-html' => array('<p>Custom HTML sidebar below.</p>', 1),
        'widget-text' => array('<p>Legacy Text sidebar below.</p>', 1),
        'mixed' => array(str_repeat($block, 2), 3),
        'excerpt' => array('[sdcw_contract_excerpt]', 0),
        'excerpt-rendered' => array('<p>A manually rendered clock excerpt follows.</p>', 1),
        'draft' => array($block, 0),
        'parent-suppressed' => array('<!-- wp:sdcw-contract/suppress -->' . $block . '<!-- /wp:sdcw-contract/suppress -->', 0),
        'parent-escaped' => array('<!-- wp:sdcw-contract/escape -->' . $block . '<!-- /wp:sdcw-contract/escape -->', 0),
        'parent-kept' => array('<!-- wp:sdcw-contract/keep -->' . $block . '<!-- /wp:sdcw-contract/keep -->', 1),
        'parent-mixed' => array('<!-- wp:sdcw-contract/suppress -->' . $block . '<!-- /wp:sdcw-contract/suppress -->' . $block, 1),
        'content-suppressed' => array($block, 0),
        'inert-template' => array('<template>' . $clock . '</template><p>Inert clock.</p>', 0),
        'script-example' => array('<script type="application/json">' . wp_json_encode(array('example' => $clock)) . '</script><p>Script example.</p>', 0),
        'textarea-example' => array('<textarea>' . $clock . '</textarea>', 0),
        'late-clock' => array('<p>A late footer clock follows.</p>', 1),
        'flushed-clock' => array('<p>A flushed footer clock follows.</p>', 1),
        'noscript' => array('<noscript>' . $clock . '</noscript>', 0),
        'xmp' => array('<xmp>' . $clock . '</xmp>', 0),
        'plaintext' => array('<plaintext>' . $clock, 0),
        'after-noscript' => array('<noscript>' . $clock . '</noscript>' . $clock, 1),
        'after-xmp' => array('<xmp>' . $clock . '</xmp>' . $clock, 1),
        'noscript-quoted-closer' => array('<noscript data-example="</noscript>">' . $clock . '</noscript>', 0),
        'xmp-quoted-closer' => array('<xmp data-example="</xmp>">' . $clock . '</xmp>', 0),
        'noscript-fake-script' => array('<noscript><script>' . $clock . '</noscript>' . $clock, 1),
        'xmp-fake-script' => array('<xmp><script>' . $clock . '</xmp>' . $clock, 1),
        'select-script-example' => array('<select><script>window.sdcwSelectExample = ' . wp_json_encode('</select>' . $clock, JSON_UNESCAPED_SLASHES) . ';</script></select>', 0),
        'after-select-script' => array('<select><script>window.sdcwSelectExample = ' . wp_json_encode('</select>' . $clock, JSON_UNESCAPED_SLASHES) . ';</script></select>' . $clock, 1),
        'raw-in-template' => array('<template><noscript>' . $clock . '</noscript></template>', 0),
    );
    $rows = array();
    foreach ($cases as $name => $case) {
        $id = wp_insert_post(array('post_type' => 'page', 'post_status' => $name === 'draft' ? 'draft' : 'publish',
            'post_title' => 'Asset contract ' . $name, 'post_content' => wp_slash($case[0])), true);
        if (is_wp_error($id)) { throw new RuntimeException($id->get_error_message()); }
        // Literal script fixtures must survive Core's unslashing byte-for-byte.
        // Legacy block fixtures may intentionally acquire canonical metadata.
        if (in_array($name, array('script-example', 'select-script-example', 'after-select-script'), true) &&
            get_post_field('post_content', $id, 'raw') !== $case[0]) {
            throw new RuntimeException('Stored fixture source differs: ' . $name);
        }
        $rows[$name] = array('id' => $id, 'url' => home_url('/?page_id=' . $id), 'clocks' => $case[1]);
    }
    $excerpt_source = wp_insert_post(array('post_type' => 'page', 'post_status' => 'publish',
        'post_title' => 'Asset contract manual excerpt source', 'post_content' => '<p>No body clock.</p>', 'post_excerpt' => $clock), true);
    if (is_wp_error($excerpt_source)) { throw new RuntimeException($excerpt_source->get_error_message()); }
    update_option('sdcw_asset_excerpt_source', $excerpt_source, false);
    update_option('widget_block', array(7 => array('content' => $block), 8 => array('content' => $block), '_multiwidget' => 1));
    update_option('widget_custom_html', array(7 => array('title' => '', 'content' => $clock), '_multiwidget' => 1));
    update_option('widget_text', array(7 => array('title' => '', 'text' => $clock, 'filter' => false), '_multiwidget' => 1));
    update_option('sidebars_widgets', array('wp_inactive_widgets' => array('block-8'),
        'sdcw-contract-block' => array('block-7'), 'sdcw-contract-html' => array('custom_html-7'),
        'sdcw-contract-text' => array('text-7'), 'array_version' => 3));
    update_option('sdcw_asset_contract', $rows, false);
    echo wp_json_encode($rows), "\n";
} elseif ($mode === 'checks') {
    $checks = array();
    $assert = function ($ok, $label) use (&$checks) {
        $checks[] = array('passed' => (bool) $ok, 'label' => $label);
    };
    $assert(!wp_script_is('simple-digital-clock', 'enqueued'), 'Registration alone adds no frontend runtime');
    $assert(!wp_style_is('simple-digital-clock-block-style', 'enqueued'), 'Registration alone adds no frontend stylesheet');
    $style = wp_styles()->registered['simple-digital-clock-block-style'];
    $assert($style->src === false, 'Inline integration style has no external URL');
    $assert(count($style->extra['after']) === 1, 'Integration rule is registered once');
    foreach (array('plain text', '<!-- ' . $clock . ' -->', '&lt;timenow-zone-sdcw&gt;', '<div data-x="&lt;timenow-zone-sdcw&gt;"></div>', '<template>' . $clock . '</template>', '<script>var example = ' . wp_json_encode($clock) . ';</script>', '<textarea>' . $clock . '</textarea>') as $html) {
        $assert(!SDCW_output_has_clock($html), 'Inert or example HTML has no live clock');
        $assert(!wp_script_is('simple-digital-clock', 'enqueued'), 'Detection does not enqueue resources');
    }
    $assert(SDCW_output_has_clock($clock), 'A live clock is detected');
    $assert(SDCW_output_has_clock('<template>' . $clock . '</template>' . $clock), 'A live clock after a template is detected');
    $assert(!has_filter('render_block', 'SDCW_enqueue_rendered_clock_assets'), 'No intermediate render enqueue hook remains');
    $events = array();
    add_action('sdcw_metadata_diagnostic', function ($code) use (&$events) { $events[] = func_get_args(); });
    $unsupported = fopen('php://memory', 'r');
    $assert(SDCW_serialize_clock_block_attributes(array('caption' => $unsupported)) === null, 'Unsupported JSON value fails closed');
    fclose($unsupported);
    $assert($events === array(array('metadata_encoding_failed')), 'Diagnostic event contains one fixed code and no user content');
    echo wp_json_encode(array('checks' => $checks, 'failed' => count(array_filter($checks, function ($row) { return !$row['passed']; })))), "\n";
    WP_CLI::halt(count(array_filter($checks, function ($row) { return !$row['passed']; })) ? 1 : 0);
} else {
    throw new RuntimeException('Unknown contract mode');
}
