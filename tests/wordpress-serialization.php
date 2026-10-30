<?php
// Controlled metadata contracts; actual Core/KSES behavior is tested in WordPress.
define('ABSPATH', __DIR__);
function add_filter() {}
function wp_json_encode($value, $flags = 0) { return json_encode($value, $flags); }
// Exact legacy escaping order makes the previous plugin a semantic RED control.
function serialize_block_attributes($attributes) {
    $encoded = wp_json_encode($attributes, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $encoded = preg_replace('/--/', '\\u002d\\u002d', $encoded);
    $encoded = preg_replace('/</', '\\u003c', $encoded);
    $encoded = preg_replace('/>/', '\\u003e', $encoded);
    $encoded = preg_replace('/&/', '\\u0026', $encoded);
    return preg_replace('/\\\\"/', '\\u0022', $encoded);
}
class WP_HTML_Tag_Processor {}
require $argv[1] . '/includes/simple-digital-clock-kses.php';
$serialize = function_exists('SDCW_serialize_clock_block_attributes') ? 'SDCW_serialize_clock_block_attributes' : 'serialize_block_attributes';
$checks = array();
$assert = function ($condition, $name) use (&$checks) {
    $checks[] = array('passed' => (bool) $condition, 'name' => $name);
};
$cases = array('Terminal \\', 'Terminal \\\\', 'Terminal \\\\\\', 'Quote \\" and \\', 'Київ 🕒 \\', '&amp;#34; \\', 'literal \\u0022', '--><script>drop</script><!--', "line\nnext\tend");
foreach ($cases as $caption) {
    $attributes = (object) array('caption' => $caption, 'width' => 180, 'rounded' => 0, 'date' => true, 'border' => true, 'unknown' => (object) array('0' => 'nested \\'));
    $encoded = $serialize($attributes);
    $assert(json_decode($encoded) == $attributes, 'JSON roundtrip: ' . $caption);
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
