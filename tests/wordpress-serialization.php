<?php
// Controlled metadata contracts; actual Core/KSES behavior is tested in WordPress.
define('ABSPATH', __DIR__);
function add_filter($name, $callback) { $GLOBALS['sdcw_test_filters'][$name][] = $callback; }
function add_action($name, $callback) { $GLOBALS['sdcw_test_actions'][$name][] = $callback; }
function do_action(...$args) { $GLOBALS['sdcw_test_diagnostics'][] = $args; }
function user_can_richedit() { return $GLOBALS['sdcw_test_can_richedit']; }
function wp_enqueue_script(...$args) { $GLOBALS['sdcw_test_script_calls']['enqueue'][] = $args; }
function wp_localize_script(...$args) { $GLOBALS['sdcw_test_script_calls']['localize'][] = $args; }
function wp_print_scripts(...$args) { $GLOBALS['sdcw_test_script_calls']['print'][] = $args; }
class WP_Block_Parser {}
function wp_json_encode($value, $flags = 0) { return json_encode($value, $flags); }
function wp_kses_normalize_entities($value) {
    return preg_match('/^&(?:amp|lt|gt|quot|copy);$/', $value) ? $value : '&amp;' . substr($value, 1);
}
function valid_unicode($codepoint) { return $codepoint > 0 && $codepoint <= 0x10ffff && !($codepoint >= 0xd800 && $codepoint <= 0xdfff); }
// Exact legacy escaping order makes the previous plugin a semantic RED control.
function serialize_block_attributes($attributes) {
    $encoded = wp_json_encode($attributes, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $encoded = preg_replace('/--/', '\\u002d\\u002d', $encoded);
    $encoded = preg_replace('/</', '\\u003c', $encoded);
    $encoded = preg_replace('/>/', '\\u003e', $encoded);
    $encoded = preg_replace('/&/', '\\u0026', $encoded);
    return preg_replace('/\\\\"/', '\\u0022', $encoded);
}
// Only the caption-consistency boundary is doubled here. Full native parser,
// role, KSES and persistence contracts run in the isolated WordPress acceptance.
class WP_HTML_Tag_Processor {
    protected $html;
    protected $lexical_updates = array();
    private $visited = false;
    public function __construct($html) { $this->html = $html; }
    public function next_tag($tag) {
        if ($this->visited) { return false; }
        $this->visited = true;
        return false !== stripos($this->html, '<' . $tag);
    }
    public function get_attribute($name) {
        if (!preg_match('/\\b' . preg_quote($name, '/') . '="([^"]*)"/s', $this->html, $match)) { return null; }
        return html_entity_decode($match[1], ENT_QUOTES, 'UTF-8');
    }
    public function set_attribute($name, $value) {
        if (!preg_match('/\\b' . preg_quote($name, '/') . '="[^"]*"/s', $this->html, $match, PREG_OFFSET_CAPTURE)) { return false; }
        $this->lexical_updates[$name] = (object) array('start' => $match[0][1], 'length' => strlen($match[0][0]), 'text' => $name . '="' . $value . '"');
        return true;
    }
    public function get_updated_html() {
        $html = $this->html;
        foreach ($this->lexical_updates as $update) { $html = substr_replace($html, $update->text, $update->start, $update->length); }
        return $html;
    }
}
define('SDCW_PATH', $argv[1] . '/');
define('SDCW_URL', 'https://example.invalid/wp-content/plugins/simple-digital-clock/');
require $argv[1] . '/includes/simple-digital-clock-kses.php';
if (isset($argv[2]) && 'classic-editor-bootstrap' === $argv[2]) {
    $result = array();
    foreach (json_decode(stream_get_contents(STDIN), true) as $allowed) {
        $GLOBALS['sdcw_test_can_richedit'] = $allowed;
        $GLOBALS['sdcw_test_script_calls'] = array('enqueue' => array(), 'localize' => array(), 'print' => array());
        if (empty($GLOBALS['sdcw_test_actions']['print_default_editor_scripts'])) { throw new RuntimeException('Missing dynamic editor hook'); }
        foreach ($GLOBALS['sdcw_test_actions']['print_default_editor_scripts'] as $callback) { call_user_func($callback); }
        $result[] = array('allowed' => $allowed, 'calls' => $GLOBALS['sdcw_test_script_calls']);
    }
    echo json_encode(array('bootstrap' => $result, 'post_attributes' => SDCW_allow_clock_post_html(array(), 'post')['timenow-zone-sdcw'], 'other_context' => SDCW_allow_clock_post_html(array('foreign' => array('id' => true)), 'data'))) . "\n";
    exit(0);
}
if (isset($argv[2]) && 'classic-editor' === $argv[2]) {
    $result = array();
    foreach (json_decode(stream_get_contents(STDIN), true) as $settings) {
        $GLOBALS['sdcw_test_diagnostics'] = array();
        if (empty($GLOBALS['sdcw_test_filters']['tiny_mce_before_init']) || empty($GLOBALS['sdcw_test_filters']['teeny_mce_before_init'])) { throw new RuntimeException('Missing Classic editor filter'); }
        $updated = $settings;
        foreach ($GLOBALS['sdcw_test_filters']['tiny_mce_before_init'] as $callback) { $updated = call_user_func($callback, $updated); }
        $repeated = $updated;
        foreach ($GLOBALS['sdcw_test_filters']['teeny_mce_before_init'] as $callback) { $repeated = call_user_func($callback, $repeated); }
        $result[] = array('settings' => $updated, 'repeated' => $repeated, 'diagnostics' => $GLOBALS['sdcw_test_diagnostics']);
    }
    echo json_encode($result) . "\n";
    exit(0);
}
if (isset($argv[2]) && 'repair' === $argv[2]) {
    $rows = json_decode(stream_get_contents(STDIN), true);
    $result = array();
    foreach ($rows as $row) {
        $content = '<!-- wp:simple-digital-clock-block/widget-block ' . $row['comment'] . ' -->' . $row['html'] . '<!-- /wp:simple-digital-clock-block/widget-block -->';
        $updated = SDCW_map_clock_blocks($content, function () {});
        preg_match('/widget-block (.*?) -->/s', $updated, $match);
        $result[] = array('attributes' => json_decode($match[1]), 'htmlUnchanged' => false !== strpos($updated, $row['html']), 'unchanged' => $updated === $content);
    }
    echo json_encode($result) . "\n";
    exit(0);
}
$serialize = function_exists('SDCW_serialize_clock_block_attributes') ? 'SDCW_serialize_clock_block_attributes' : 'serialize_block_attributes';
$checks = array();
$assert = function ($condition, $name) use (&$checks) {
    $checks[] = array('passed' => (bool) $condition, 'name' => $name);
};
$cases = array('Terminal \\', 'Terminal \\\\', 'Terminal \\\\\\', 'Quote \\" and \\', 'Київ 🕒 \\', '&amp;#34; \\', 'literal \\u0022', '--><script>drop</script><!--', "line\nnext\tend");
foreach ($cases as $caption) {
    $attributes = (object) array('caption' => $caption, 'width' => 180, 'rounded' => 0, 'date' => true, 'border' => true, 'unknown' => (object) array('0' => 'nested \\'));
    $encoded = $serialize($attributes);
    $assert(wp_json_encode(json_decode($encoded)) === wp_json_encode($attributes), 'JSON roundtrip: ' . $caption);
    $assert(false === strpos($encoded, '--') && false === strpos($encoded, '<') && false === strpos($encoded, '>') && false === strpos($encoded, '&'), 'Comment delimiter safety');
    $html = '<timenow-zone-sdcw width="180"></timenow-zone-sdcw>';
    $original = '<!-- wp:simple-digital-clock-block/widget-block ' . $encoded . ' -->' . $html . '<!-- /wp:simple-digital-clock-block/widget-block -->';
    $mapped = SDCW_map_clock_blocks($original, function ($attrs) { $attrs->timeZone = 'UTC'; });
    preg_match('/widget-block (.*?) -->/s', $mapped, $match);
    $saved = json_decode($match[1]);
    $assert(is_object($saved) && $saved->caption === $caption && $saved->width === 180 && $saved->timeZone === 'UTC', 'Metadata rewrite preserves all settings');
    $assert(false !== strpos($mapped, $html), 'Metadata rewrite preserves raw HTML');
    $assert(SDCW_map_clock_blocks($mapped, function () {}) === $mapped, 'No-op is byte-identical');
}
$foreign = '<!-- wp:vendor/test {"caption":"Terminal \\\\"} --><p>Foreign</p><!-- /wp:vendor/test -->';
$assert(SDCW_map_clock_blocks($foreign, function ($attrs) { $attrs->caption = 'changed'; }) === $foreign, 'Foreign metadata untouched');
$malformed = '<!-- wp:simple-digital-clock-block/widget-block {"caption": -->x<!-- /wp:simple-digital-clock-block/widget-block -->';
$assert(SDCW_map_clock_blocks($malformed, function ($attrs) { $attrs->caption = 'changed'; }) === $malformed, 'Malformed metadata untouched');
$valid = '<!-- wp:simple-digital-clock-block/widget-block {"width":180} -->x<!-- /wp:simple-digital-clock-block/widget-block -->';
$assert(SDCW_map_clock_blocks($valid, function ($attrs) { $attrs->caption = "\xff"; }) === $valid, 'Encoding failure retains original content');
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo json_encode(array('assertions' => count($checks), 'failed' => $failed, 'checks' => $checks)) . "\n";
exit($failed ? 1 : 0);
