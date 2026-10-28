<?php
// Additional review contracts; run only in the disposable Clock lab.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These tests require the isolated Clock lab.');
}

$GLOBALS['sdcw_final_review_checks'] = array();
$foreign_probe = null;
function sdcw_review_assert($name, $passed, $details = null) {
    $GLOBALS['sdcw_final_review_checks'][] = array('name' => $name, 'passed' => (bool) $passed, 'details' => $passed ? null : $details);
}

function sdcw_review_dom_caption($html) {
    // Core 6.3 uses PHP's default decoder flags, which differ before PHP 8.1.
    // These fixtures use HTML4/numeric escapes; read their actual DOM value.
    $previous = libxml_use_internal_errors(true);
    $document = new DOMDocument('1.0', 'UTF-8');
    $loaded = $document->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_NONET);
    libxml_clear_errors();
    libxml_use_internal_errors($previous);
    if (!$loaded) {
        throw new RuntimeException('Unable to parse the isolated caption fixture.');
    }
    $elements = $document->getElementsByTagName('timenow-zone-sdcw');
    return $elements->length && $elements->item(0)->hasAttribute('caption') ? $elements->item(0)->getAttribute('caption') : null;
}

$block_name = 'simple-digital-clock-block/widget-block';
$captions = array(
    'zero' => '0',
    'literal entities' => '&amp; &lt; &#34; &#x1F552;',
    'quotes and slashes' => '"quoted" \'single\' C:\\clock\\UTC \\"',
    'unicode' => 'Київ 🕒 العربية 日本語',
    'line breaks' => "first\nsecond\tthird",
    'HTML and comment delimiters' => '<img src=x onerror=alert(1)> --><script>alert(1)</script><!--',
    'block delimiter as text' => '<!-- wp:paragraph -->text<!-- /wp:paragraph -->',
    'empty' => '',
);
$baseline = json_decode(file_get_contents('/lab/packages/regression-fixtures.json'), true)['blocks'][0]['content'];
$prefix = serialize_block(array('blockName' => 'core/paragraph', 'attrs' => array('className' => 'before-clock'), 'innerBlocks' => array(), 'innerContent' => array('<p class="before-clock">Before &amp; unchanged</p>')));
$suffix = serialize_block(array('blockName' => 'vendor/unknown', 'attrs' => array('label' => 'Чужой блок & <text>', 'nested' => array('x' => 'value'), 'enabled' => true), 'innerBlocks' => array(), 'innerContent' => array('<div data-unknown="keep">Unchanged unknown block</div>')));
$dynamic = '<!-- wp:block {"ref":987654} /-->';
$plain = "\nUnwrapped text &amp; HTML <strong>keep</strong>\n";

foreach (array('administrator' => 'clock_lab_admin', 'author' => 'clock_patch_author') as $role => $login) {
    $user = get_user_by('login', $login);
    if (!$user) {
        throw new RuntimeException('Missing lab test user.');
    }
    wp_set_current_user($user->ID);
    kses_init();
    $expected_prefix = 'author' === $role ? wp_kses_post($prefix . "\n\n") : $prefix . "\n\n";
    $expected_suffix = 'author' === $role ? wp_kses_post($suffix . $plain . $dynamic) : $suffix . $plain . $dynamic;
    foreach ($captions as $label => $caption) {
        $html = '<timenow-zone-sdcw class="wp-block-simple-digital-clock-block-widget-block" width="200" locale="en-US" rounded="0.5" align="left" second="true" time-zone="UTC"';
        if ('' !== $caption) {
            $html .= ' caption="' . htmlspecialchars($caption, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8', true) . '"';
        }
        $html .= '></timenow-zone-sdcw>';
        // Intentionally omit timezone in the legacy JSON default.
        $attrs = '' !== $caption ? array('caption' => $caption) : array();
        $clock = get_comment_delimited_block_content($block_name, $attrs, $html);
        $content = $prefix . "\n\n" . $clock . "\n\n" . $suffix . $plain . $dynamic;
        $id = wp_insert_post(array('post_title' => 'Clock final review: ' . $role . ' / ' . $label, 'post_author' => $user->ID, 'post_status' => 'draft', 'post_content' => wp_slash($content)), true);
        if (is_wp_error($id)) {
            throw new RuntimeException($id->get_error_message());
        }
        $saved = get_post($id)->post_content;
        $blocks = parse_blocks($saved);
        $clocks = array_values(array_filter($blocks, function ($block) use ($block_name) { return $block_name === $block['blockName']; }));
        $stored = isset($clocks[0]) ? $clocks[0]['attrs'] : array();
        sdcw_review_assert($role . '/' . $label . ': exact legacy JSON values', count($clocks) === 1 && isset($stored['timeZone']) && 'UTC' === $stored['timeZone'] && (isset($stored['caption']) ? $stored['caption'] : '') === $caption, $stored);
        $processor = new WP_HTML_Tag_Processor($saved);
        $found = $processor->next_tag('TIMENOW-ZONE-SDCW');
        $html_caption = sdcw_review_dom_caption($saved);
        // This fixture escapes every ampersand: its original DOM value is the caption text.
        // KSES normalization is not an oracle because older Core collapses literal numerics.
        $expected_html_caption = $caption;
        sdcw_review_assert($role . '/' . $label . ': HTML retains original input semantics', $found && 'UTC' === $processor->get_attribute('time-zone') && (is_string($html_caption) ? $html_caption : '') === $expected_html_caption, array('expected' => $expected_html_caption, 'actual' => $html_caption, 'saved' => $saved));
        sdcw_review_assert($role . '/' . $label . ': siblings match normal WordPress filtering', str_starts_with($saved, $expected_prefix) && false !== strpos($saved, $expected_suffix), $saved);
        $second_filter = SDCW_sanitize_clock_post_html(SDCW_sanitize_clock_post_html($saved));
        sdcw_review_assert($role . '/' . $label . ': repeated KSES is stable', SDCW_sanitize_clock_post_html($saved) === $second_filter);
        for ($cycle = 1; $cycle <= 3; $cycle++) {
            $updated = wp_update_post(array('ID' => $id, 'post_content' => wp_slash($saved)), true);
            sdcw_review_assert($role . '/' . $label . ': resave stable ' . $cycle, !is_wp_error($updated) && get_post($id)->post_content === $saved);
        }
        $updated = wp_update_post(array('ID' => $id, 'post_title' => 'Clock final review title only'), true);
        sdcw_review_assert($role . '/' . $label . ': title-only save preserves content', !is_wp_error($updated) && get_post($id)->post_content === $saved);
    }
    $nested = get_comment_delimited_block_content('core/group', array(), '<div class="wp-block-group">' . $baseline . $baseline . '</div>');
    $nested_id = wp_insert_post(array('post_title' => 'Clock final review nested', 'post_author' => $user->ID, 'post_status' => 'draft', 'post_content' => wp_slash($nested)), true);
    $nested_saved = get_post($nested_id)->post_content;
    $children = parse_blocks($nested_saved)[0]['innerBlocks'];
    sdcw_review_assert($role . ': two nested clocks keep independent JSON', count($children) === 2 && 'UTC' === $children[0]['attrs']['timeZone'] && 'UTC' === $children[1]['attrs']['timeZone']);
    if ('administrator' === $role) {
        $foreign = '<!-- wp:vendor/review {"options":{"0":"one","1":"two"},"empty":{}} --><div>one,two</div><!-- /wp:vendor/review -->';
        $mixed = $baseline . "\n\n" . $foreign;
        $mixed_id = wp_insert_post(array('post_title' => 'Clock review foreign JSON', 'post_status' => 'draft', 'post_content' => wp_slash($mixed)), true);
        sdcw_review_assert('administrator: foreign object JSON survives clock metadata sync', false !== strpos(get_post($mixed_id)->post_content, $foreign), get_post($mixed_id)->post_content);
        remove_filter('wp_insert_post_data', 'SDCW_preserve_clock_post_metadata');
        $control_id = wp_insert_post(array('post_title' => 'Clock review control without new post filter', 'post_status' => 'draft', 'post_content' => wp_slash($mixed)), true);
        add_filter('wp_insert_post_data', 'SDCW_preserve_clock_post_metadata');
        sdcw_review_assert('administrator: normal WordPress control preserves original object JSON', get_post($control_id)->post_content === $mixed);
        $foreign_probe = array('input' => $mixed, 'candidate_content' => get_post($mixed_id)->post_content, 'control_unchanged' => get_post($control_id)->post_content === $mixed);
        wp_update_post(array('ID' => $control_id, 'post_title' => 'Clock review title-only update'));
        sdcw_review_assert('administrator: title-only update preserves foreign object JSON', false !== strpos(get_post($control_id)->post_content, $foreign), get_post($control_id)->post_content);
        $alone_id = wp_insert_post(array('post_title' => 'Clock review foreign block alone', 'post_status' => 'draft', 'post_content' => wp_slash($foreign)), true);
        sdcw_review_assert('administrator: no-clock control preserves foreign object JSON', get_post($alone_id)->post_content === $foreign);
        // Match the original JS serializer: JSON and HTML entity spelling can differ.
        $legacy_caption = '&amp; &lt;';
        $legacy_caption_content = get_comment_delimited_block_content($block_name, array('caption' => $legacy_caption), '<timenow-zone-sdcw caption="&amp; &lt;" time-zone="UTC"></timenow-zone-sdcw>');
        $caption_id = wp_insert_post(array('post_title' => 'Clock review original caption JSON', 'post_status' => 'draft', 'post_content' => wp_slash($legacy_caption_content)), true);
        $caption_block = parse_blocks(get_post($caption_id)->post_content)[0];
        sdcw_review_assert('administrator: legacy caption JSON remains authoritative', $caption_block['attrs']['caption'] === $legacy_caption, $caption_block['attrs']);
        remove_filter('wp_insert_post_data', 'SDCW_preserve_clock_post_metadata');
        $caption_control = wp_insert_post(array('post_title' => 'Clock review caption JSON control', 'post_status' => 'draft', 'post_content' => wp_slash($legacy_caption_content)), true);
        add_filter('wp_insert_post_data', 'SDCW_preserve_clock_post_metadata');
        sdcw_review_assert('administrator: normal WordPress control preserves original caption JSON', get_post($caption_control)->post_content === $legacy_caption_content);
    }
}

wp_set_current_user(get_user_by('login', 'clock_lab_admin')->ID);
kses_init();
$own_objects = '<!-- wp:simple-digital-clock-block/widget-block {"unknown":{"0":"one","1":"two"},"empty":{},"items":[]} --><timenow-zone-sdcw time-zone="UTC"></timenow-zone-sdcw><!-- /wp:simple-digital-clock-block/widget-block -->';
$object_saved = SDCW_sync_clock_content_metadata($own_objects);
preg_match('/<!-- wp:simple-digital-clock-block\/widget-block (.*?) -->/s', $object_saved, $object_match);
$object_attrs = json_decode($object_match[1]);
sdcw_review_assert('clock metadata keeps unknown object and array types', is_object($object_attrs->unknown) && is_object($object_attrs->empty) && is_array($object_attrs->items) && 'one' === $object_attrs->unknown->{'0'});
$foreign_escaped_clock = '<!-- wp:code --><pre class="wp-block-code"><code>&lt;!-- wp:simple-digital-clock-block/widget-block --&gt;</code></pre><!-- /wp:code -->';
sdcw_review_assert('escaped clock text in foreign block remains byte-identical', SDCW_sync_clock_content_metadata($foreign_escaped_clock) === $foreign_escaped_clock);
$malformed = '<!-- wp:simple-digital-clock-block/widget-block {invalid} --><timenow-zone-sdcw></timenow-zone-sdcw><!-- /wp:simple-digital-clock-block/widget-block -->';
sdcw_review_assert('malformed clock JSON is not rewritten', SDCW_sync_clock_content_metadata($malformed) === $malformed);
$unclosed = '<!-- wp:simple-digital-clock-block/widget-block --><timenow-zone-sdcw></timenow-zone-sdcw>';
sdcw_review_assert('unclosed clock block is not rewritten', SDCW_sync_clock_content_metadata($unclosed) === $unclosed);
$values = array('A&amp;', 'A&');
$identical_html = '<timenow-zone-sdcw caption="A&amp;" time-zone="UTC"></timenow-zone-sdcw>';
$multiple = '';
foreach ($values as $value) {
    $multiple .= get_comment_delimited_block_content($block_name, array('caption' => $value), $identical_html);
}
$multiple_saved = parse_blocks(SDCW_sanitize_clock_post_html($multiple));
sdcw_review_assert('identical clock HTML retains separate original captions', $multiple_saved[0]['attrs']['caption'] === $values[0] && $multiple_saved[1]['attrs']['caption'] === $values[1]);
sdcw_review_assert('KSES frame stack empty after recursive JSON filtering', SDCW_clock_kses_frames() === array());
$nested_content = get_comment_delimited_block_content($block_name, array('caption' => '<inner> &lt;'), '<timenow-zone-sdcw caption="&lt;inner&gt; &lt;" time-zone="UTC"></timenow-zone-sdcw>');
$inside = false;
$nested_result = null;
$nested_filter = function ($content) use (&$inside, &$nested_result, $nested_content) {
    if (!$inside && false !== strpos($content, 'wp:simple-digital-clock-block/widget-block')) {
        $inside = true;
        $nested_result = SDCW_sanitize_clock_post_html($nested_content);
        $inside = false;
    }
    return $content;
};
add_filter('pre_kses', $nested_filter, 10);
try {
    $outer_result = SDCW_sanitize_clock_post_html($multiple);
} finally {
    remove_filter('pre_kses', $nested_filter, 10);
}
$outer_blocks = parse_blocks($outer_result);
sdcw_review_assert('nested KSES call keeps outer captions separate', $outer_blocks[0]['attrs']['caption'] === $values[0] && $outer_blocks[1]['attrs']['caption'] === $values[1]);
sdcw_review_assert('nested KSES call keeps inner caption separate', parse_blocks($nested_result)[0]['attrs']['caption'] === '<inner> &lt;');
sdcw_review_assert('KSES frame stack empty after external nested call', SDCW_clock_kses_frames() === array());
$escape_before = esc_attr('&lt;');
wp_kses_post('<timenow-zone-sdcw caption="<clock> &amp;lt;"></timenow-zone-sdcw>');
sdcw_review_assert('strict caption escaping does not leak into global esc_attr', esc_attr('&lt;') === $escape_before);
$unsafe_json = get_comment_delimited_block_content($block_name, array('caption' => '--><script>alert(1)</script><!--', 'unknown' => '<script>drop</script>'), '<timenow-zone-sdcw caption="safe" onclick="alert(1)"></timenow-zone-sdcw>');
$unsafe_saved = SDCW_sanitize_clock_post_html($unsafe_json);
$unsafe_attrs = parse_blocks($unsafe_saved)[0]['attrs'];
sdcw_review_assert('caption protection does not preserve foreign unsafe JSON fields', $unsafe_attrs['unknown'] === wp_kses_post('<script>drop</script>') && $unsafe_attrs['caption'] === '--><script>alert(1)</script><!--');
sdcw_review_assert('caption protection does not preserve unsafe actual HTML', false === strpos($unsafe_saved, '<script>') && false === strpos($unsafe_saved, 'onclick='));

$checks = $GLOBALS['sdcw_final_review_checks'];
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'checks' => $checks, 'failed' => $failed, 'foreign_probe' => $foreign_probe)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
