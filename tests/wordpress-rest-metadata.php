<?php
// Bounded REST hook contracts. Real Core parsing, KSES and persistence run in the lab.
define('ABSPATH', __DIR__);
$GLOBALS['rest_test_hooks'] = array();
$GLOBALS['rest_test_stack'] = array();
$GLOBALS['rest_test_types'] = array();

function add_filter($hook, $callback, $priority = 10, $accepted_args = 1) {
    $key = is_string($callback) ? $callback : spl_object_hash($callback);
    $GLOBALS['rest_test_hooks'][$hook][$priority][$key] = array($callback, $accepted_args);
}
function add_action($hook, $callback, $priority = 10, $accepted_args = 1) {
    add_filter($hook, $callback, $priority, $accepted_args);
}
function apply_filters($hook, $value) {
    $arguments = array_slice(func_get_args(), 2);
    $GLOBALS['rest_test_stack'][] = $hook;
    try {
        $priorities = isset($GLOBALS['rest_test_hooks'][$hook]) ? $GLOBALS['rest_test_hooks'][$hook] : array();
        ksort($priorities);
        foreach ($priorities as $callbacks) {
            foreach ($callbacks as $entry) {
                $value = call_user_func_array($entry[0], array_slice(array_merge(array($value), $arguments), 0, $entry[1]));
            }
        }
        return $value;
    } finally {
        array_pop($GLOBALS['rest_test_stack']);
    }
}
function do_action($hook) {
    $arguments = array_slice(func_get_args(), 1);
    $priorities = isset($GLOBALS['rest_test_hooks'][$hook]) ? $GLOBALS['rest_test_hooks'][$hook] : array();
    ksort($priorities);
    foreach ($priorities as $callbacks) {
        foreach ($callbacks as $entry) {
            call_user_func_array($entry[0], array_slice($arguments, 0, $entry[1]));
        }
    }
}
function has_filter($hook, $callback = false) {
    if (!isset($GLOBALS['rest_test_hooks'][$hook])) { return false; }
    foreach ($GLOBALS['rest_test_hooks'][$hook] as $priority => $entries) {
        foreach ($entries as $entry) {
            if (false === $callback || $entry[0] === $callback) { return $priority; }
        }
    }
    return false;
}
function current_filter() { return end($GLOBALS['rest_test_stack']); }
function get_post_types($args = array(), $output = 'names') {
    $types = array_filter($GLOBALS['rest_test_types'], function ($type) use ($args) {
        foreach ($args as $key => $value) { if ($type->$key !== $value) { return false; } }
        return true;
    });
    return 'objects' === $output ? $types : array_keys($types);
}
function rest_test_register_type($name, $rest) {
    $object = (object) array('name' => $name, 'show_in_rest' => $rest);
    $GLOBALS['rest_test_types'][$name] = $object;
    do_action('registered_post_type', $name, $object);
}
class WP_Error { public $post_content; }
// Record delegation independently of Core's parser, which runs in native acceptance.
class WP_Block_Parser {
    public $received = array();
    public function parse($document) {
        $this->received[] = $document;
        return $GLOBALS['rest_test_parent_parser_result'];
    }
}
class Rest_Test_Custom_Block_Parser extends WP_Block_Parser {}
class Rest_Test_Late_Block_Parser extends WP_Block_Parser {}
class WP_Post {
    public $post_content;
    public $post_title = 'Stored post';
    public function __construct($content) { $this->post_content = $content; }
}
class WP_REST_Response {
    private $data;
    private $status;
    private $headers;
    private $links;
    private $set_data_calls = 0;
    public function __construct($data, $status = 200, $headers = array()) {
        $this->data = $data; $this->status = $status; $this->headers = $headers;
        $this->links = array('self' => array(array('href' => '/wp/v2/posts/42')));
    }
    public function get_data() { return $this->data; }
    public function set_data($data) { $this->data = $data; $this->set_data_calls++; }
    public function get_status() { return $this->status; }
    public function get_headers() { return $this->headers; }
    public function get_links() { return $this->links; }
    public function get_set_data_calls() { return $this->set_data_calls; }
}
function is_wp_error($value) { return $value instanceof WP_Error; }
function wp_json_encode($value, $flags = 0) { return json_encode($value, $flags); }
function wp_slash($value) { return addslashes($value); }
function wp_unslash($value) { return stripslashes($value); }
function wp_kses_normalize_entities($value) {
    return preg_match('/^&(?:amp|lt|gt|quot|copy);$/', $value) ? $value : '&amp;' . substr($value, 1);
}
function valid_unicode($point) { return $point > 0 && $point <= 0x10ffff && !($point >= 0xd800 && $point <= 0xdfff); }

// Only caption preimage consistency is doubled. This is not an HTML sanitizer.
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

foreach (array('post', 'page', 'wp_block', 'wp_navigation', 'wp_template', 'wp_template_part', 'book') as $name) {
    rest_test_register_type($name, true);
}
rest_test_register_type('private_record', false);
require $argv[1] . '/includes/simple-digital-clock-kses.php';
rest_test_register_type('later_book', true);
rest_test_register_type('later_private', false);
do_action('rest_api_init');
rest_test_register_type('runtime_book', true);
$registration = array();
$response_registration = array();
foreach ($GLOBALS['rest_test_types'] as $name => $type) {
    $hook = 'rest_pre_insert_' . $name;
    $callbacks = array();
    foreach (isset($GLOBALS['rest_test_hooks'][$hook]) ? $GLOBALS['rest_test_hooks'][$hook] : array() as $priority => $entries) {
        foreach ($entries as $entry) { $callbacks[] = array('priority' => $priority, 'callback' => $entry[0]); }
    }
    $registration[$name] = $callbacks;
    $response_callbacks = array();
    foreach (isset($GLOBALS['rest_test_hooks']['rest_prepare_' . $name]) ? $GLOBALS['rest_test_hooks']['rest_prepare_' . $name] : array() as $priority => $entries) {
        foreach ($entries as $entry) { $response_callbacks[] = array('priority' => $priority, 'callback' => $entry[0]); }
    }
    $response_registration[$name] = $response_callbacks;
}

$input = json_decode(stream_get_contents(STDIN), true);
if (JSON_ERROR_NONE !== json_last_error()) { throw new RuntimeException('Invalid test input'); }
function rest_test_attributes($content) {
    preg_match_all('~<!-- wp:simple-digital-clock-block/widget-block(?:\s+(.*?))?\s+-->~s', $content, $matches);
    return array_map(function ($raw) { return json_decode($raw); }, $matches[1]);
}
// A controlled destructive parse and legacy serialization reproduce the ordering hazard.
// The native WordPress 6.8 REST regression remains a separate required acceptance gate.
function rest_test_core_transform($post) {
    if (!is_object($post) || is_wp_error($post) || !isset($post->post_content) || !is_string($post->post_content)) { return $post; }
    $post->post_content = preg_replace_callback('~<!-- wp:([a-z0-9-]+/[a-z0-9-]+)(?:\s+(.*?))?\s+-->~s', function ($match) {
        $attributes = isset($match[2]) ? json_decode($match[2]) : null;
        if (!is_object($attributes)) { return '<!-- wp:' . $match[1] . ' -->'; }
        $json = wp_json_encode($attributes, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $json = str_replace(array('--', '<', '>', '&', '\\"'), array('\\u002d\\u002d', '\\u003c', '\\u003e', '\\u0026', '\\u0022'), $json);
        return '<!-- wp:' . $match[1] . ' ' . $json . ' -->';
    }, $post->post_content);
    return $post;
}
$rows = array();
foreach ($input['rows'] as $row) {
    $early = apply_filters('rest_pre_insert_post', (object) array('post_content' => $row['content']));
    $rows[] = array('early' => $early->post_content, 'early_attributes' => rest_test_attributes($early->post_content));
}
$guard_content = $input['rows'][0]['content'];
$guards = array(
    'error' => new WP_Error(), 'null' => null, 'false' => false, 'string' => 'unchanged',
    'no_content' => (object) array('post_title' => 'Title'),
    'null_content' => (object) array('post_content' => null),
    'array_content' => (object) array('post_content' => array($guard_content)),
    'integer_content' => (object) array('post_content' => 123),
);
$guards['error']->post_content = $guard_content;
$guard_results = array();
foreach ($guards as $name => $value) {
    $before = serialize($value);
    $after = apply_filters('rest_pre_insert_post', $value);
    $guard_results[$name] = $after === $value && serialize($after) === $before;
}
$object = (object) array('post_content' => $guard_content, 'post_excerpt' => $guard_content, 'post_content_filtered' => $guard_content, 'post_title' => 'Clock', 'meta_input' => array('private' => 'retained'));
$before = clone $object;
$after = apply_filters('rest_pre_insert_post', $object);
$fields = get_object_vars($after); unset($fields['post_content']);
$expected_fields = get_object_vars($before); unset($expected_fields['post_content']);
$field_scope = array('same_object' => $after === $object, 'other_fields_exact' => $fields === $expected_fields);
foreach (array_keys($registration) as $name) { add_filter('rest_pre_insert_' . $name, 'rest_test_core_transform', 10); }
foreach ($input['rows'] as $index => $row) {
    $core = apply_filters('rest_pre_insert_post', (object) array('post_content' => $row['content']));
    $late = SDCW_preserve_clock_post_metadata(array('post_content' => wp_slash($core->post_content)));
    $rows[$index]['after_core'] = $core->post_content;
    $rows[$index]['final'] = wp_unslash($late['post_content']);
    $rows[$index]['final_attributes'] = rest_test_attributes($rows[$index]['final']);
}
$policies = array('before_calls' => 0, 'after_calls' => 0);
add_filter('rest_pre_insert_post', function ($post) use (&$policies) { $policies['before_calls']++; return new WP_Error(); }, 8);
add_filter('rest_pre_insert_post', function ($post) use (&$policies) { $policies['after_calls']++; return $post; }, 11);
$policy_result = apply_filters('rest_pre_insert_post', (object) array('post_content' => $guard_content));
$policies['error_retained'] = is_wp_error($policy_result);
// Raw editor responses are a second Core serialization boundary after persistence.
$response_guards = array(
    'error' => new WP_Error(), 'null' => null, 'plain_object' => (object) array('data' => array('content' => array('raw' => $guard_content))),
    'null_data' => new WP_REST_Response(null), 'string_data' => new WP_REST_Response('text'),
    'fields_id_only' => new WP_REST_Response(array('id' => 42)),
    'view_rendered_only' => new WP_REST_Response(array('content' => array('rendered' => '<p>Public</p>', 'protected' => true))),
    'null_content' => new WP_REST_Response(array('content' => null)),
    'string_content' => new WP_REST_Response(array('content' => 'plain')),
    'null_raw' => new WP_REST_Response(array('content' => array('raw' => null))),
    'array_raw' => new WP_REST_Response(array('content' => array('raw' => array($guard_content)))),
    'integer_raw' => new WP_REST_Response(array('content' => array('raw' => 123))),
);
$response_guard_results = array();
foreach ($response_guards as $name => $value) {
    $before = serialize($value);
    $after = apply_filters('rest_prepare_post', $value);
    $response_guard_results[$name] = $after === $value && serialize($after) === $before;
}
$response_untouched = array();
foreach ($input['untouched'] as $row) {
    $value = new WP_REST_Response(array('content' => array('raw' => $row['content'])));
    $before = serialize($value);
    $after = apply_filters('rest_prepare_post', $value);
    $response_untouched[] = $after === $value && serialize($after) === $before;
}
function rest_test_core_response($response) {
    if (!($response instanceof WP_REST_Response)) { return $response; }
    $data = $response->get_data();
    if (!is_array($data) || !isset($data['content']['raw']) || !is_string($data['content']['raw'])) { return $response; }
    $post = rest_test_core_transform((object) array('post_content' => $data['content']['raw']));
    $data['content']['raw'] = $post->post_content;
    $response->set_data($data);
    return $response;
}
add_filter('rest_prepare_post', 'rest_test_core_response', 10);
$response_rows = array();
foreach (array_slice($rows, 0, $input['repaired_count']) as $row) {
    $data = array('id' => 42, 'content' => array('raw' => $row['final'], 'rendered' => '<p>Core-rendered policy output</p>', 'protected' => true), 'excerpt' => array('raw' => $guard_content), 'meta' => array('policy' => 'retained'));
    $response = new WP_REST_Response($data, 207, array('X-Policy' => 'retained', 'Location' => '/safe'));
    $baseline = rest_test_core_response(new WP_REST_Response($data));
    $updated = apply_filters('rest_prepare_post', $response);
    $actual = $updated->get_data();
    $other = $actual; unset($other['content']['raw']);
    $expected_other = $data; unset($expected_other['content']['raw']);
    $response_rows[] = array(
        'core_raw' => $baseline->get_data()['content']['raw'], 'raw' => $actual['content']['raw'],
        'attributes' => rest_test_attributes($actual['content']['raw']), 'same_object' => $updated === $response,
        'other_fields_exact' => $other === $expected_other, 'status' => $updated->get_status(),
        'headers' => $updated->get_headers(), 'links' => $updated->get_links(),
    );
}
$response_policies = array('before_calls' => 0, 'after_calls' => 0);
add_filter('rest_prepare_post', function ($response) use (&$response_policies) { $response_policies['before_calls']++; return new WP_Error(); }, 8);
add_filter('rest_prepare_post', function ($response) use (&$response_policies) { $response_policies['after_calls']++; return $response; }, 12);
$response_policies['error_retained'] = is_wp_error(apply_filters('rest_prepare_post', new WP_REST_Response(array('content' => array('raw' => $guard_content)))));

// Newer Core invokes this filter before rest_pre_insert and also for stored WP_Post responses.
$block_hook_registration = array();
foreach (isset($GLOBALS['rest_test_hooks']['rest_block_hooks_post_types']) ? $GLOBALS['rest_test_hooks']['rest_block_hooks_post_types'] : array() as $priority => $entries) {
    foreach ($entries as $entry) { $block_hook_registration[] = array('priority' => $priority, 'accepted_args' => $entry[1]); }
}
$block_hook_rows = array();
$type_lists = array(array(), array('post', 'page'), array('private_record', 'book', 'book'), array(4 => 'book', 1 => 'page'));
foreach (array_slice($input['rows'], 0, $input['repaired_count']) as $row) {
    $lists_exact = true;
    $type_list_rows = array();
    foreach ($type_lists as $types) {
        $prepared = (object) array('post_content' => $row['content'], 'post_excerpt' => $row['content'], 'post_content_filtered' => $row['content'], 'post_title' => 'Clock', 'meta_input' => array('private' => 'retained'));
        $identity = spl_object_hash($prepared);
        $other_before = get_object_vars($prepared); unset($other_before['post_content']);
        $returned = apply_filters('rest_block_hooks_post_types', $types, 'book', $prepared);
        $lists_exact = $lists_exact && $returned === $types;
        $other_after = get_object_vars($prepared); unset($other_after['post_content']);
        $type_list_rows[] = array('types_exact' => $returned === $types, 'same_object' => spl_object_hash($prepared) === $identity, 'other_fields_exact' => $other_before === $other_after, 'attributes' => rest_test_attributes($prepared->post_content));
    }
    $block_hook_rows[] = array(
        'types_exact' => $lists_exact, 'same_object' => spl_object_hash($prepared) === $identity,
        'other_fields_exact' => $other_before === $other_after,
        'content' => $prepared->post_content, 'attributes' => rest_test_attributes($prepared->post_content),
        'type_list_rows' => $type_list_rows,
    );
}
$block_hook_guards = $guards;
$block_hook_guards['stored_wp_post'] = new WP_Post($guard_content);
$block_hook_guards['other_object'] = new ArrayObject(array('post_content' => $guard_content), ArrayObject::ARRAY_AS_PROPS);
$block_hook_guard_results = array();
foreach ($block_hook_guards as $name => $prepared) {
    $before = serialize($prepared);
    $types = array('book');
    $returned = apply_filters('rest_block_hooks_post_types', $types, 'book', $prepared);
    $block_hook_guard_results[$name] = $returned === $types && serialize($prepared) === $before;
}
$block_hook_untouched = array();
foreach ($input['untouched'] as $row) {
    $prepared = (object) array('post_content' => $row['content']);
    $returned = apply_filters('rest_block_hooks_post_types', array(), 'book', $prepared);
    $block_hook_untouched[] = array() === $returned && $prepared->post_content === $row['content'];
}
$block_hook_composition = array('before_calls' => 0, 'after_calls' => 0);
$composition_post = (object) array('post_content' => $guard_content);
add_filter('rest_block_hooks_post_types', function ($types, $post_type, $prepared) use (&$block_hook_composition, $composition_post) {
    $block_hook_composition['before_calls']++;
    $block_hook_composition['before_context_exact'] = 'book' === $post_type && $prepared === $composition_post;
    $types[] = 'before_book';
    return $types;
}, 8, 3);
add_filter('rest_block_hooks_post_types', function ($types, $post_type, $prepared) use (&$block_hook_composition, $composition_post) {
    $block_hook_composition['after_calls']++;
    $block_hook_composition['after_context_exact'] = 'book' === $post_type && $prepared === $composition_post;
    $block_hook_composition['after_attributes'] = rest_test_attributes($prepared->post_content);
    $types[] = 'after_book';
    return $types;
}, 10, 3);
$block_hook_composition['types'] = apply_filters('rest_block_hooks_post_types', array('post', 'book'), 'book', $composition_post);

$parser_hooks = isset($GLOBALS['rest_test_hooks']['block_parser_class']) ? $GLOBALS['rest_test_hooks']['block_parser_class'] : array();
$parser_registration = array();
foreach ($parser_hooks as $priority => $entries) {
    foreach ($entries as $entry) { $parser_registration[] = array('last_priority' => PHP_INT_MAX === $priority, 'accepted_args' => $entry[1]); }
}
$parser_class = apply_filters('block_parser_class', 'WP_Block_Parser');
$GLOBALS['rest_test_parent_parser_result'] = array((object) array('blockName' => 'parent/result', 'attrs' => array('retained' => true)));
$parser_rows = array();
foreach ($input['rows'] as $row) {
    $parser = new $parser_class();
    $first = $parser->parse($row['content']);
    $first_calls = count($parser->received);
    $second = $parser->parse($parser->received[0]);
    $parser_rows[] = array(
        'first_calls' => $first_calls, 'calls' => count($parser->received), 'first_document' => $parser->received[0],
        'attributes' => rest_test_attributes($parser->received[0]),
        'idempotent' => $parser->received[0] === $parser->received[1],
        'parent_result_exact' => $first === $GLOBALS['rest_test_parent_parser_result'] && $second === $first,
    );
}
$parser_non_string = array();
foreach (array('null' => null, 'false' => false, 'integer' => 123, 'array' => array($guard_content), 'object' => (object) array('content' => $guard_content)) as $name => $document) {
    $parser = new $parser_class();
    $before = serialize($document);
    $returned = $parser->parse($document);
    $parser_non_string[$name] = count($parser->received) === 1 && $parser->received[0] === $document && serialize($document) === $before && $returned === $GLOBALS['rest_test_parent_parser_result'];
}
$parser_custom_values = array();
foreach (array('Rest_Test_Custom_Block_Parser', '\\WP_Block_Parser', 'vendor/parser', '', null, false, 123) as $class) {
    $parser_custom_values[] = apply_filters('block_parser_class', $class) === $class;
}
$parser_composition = array('before_calls' => 0, 'after_calls' => 0);
add_filter('block_parser_class', function ($class) use (&$parser_composition) { $parser_composition['before_calls']++; return 'Rest_Test_Custom_Block_Parser'; }, 10);
$parser_composition['earlier_custom_class'] = apply_filters('block_parser_class', 'WP_Block_Parser');
$custom_parser_class = $parser_composition['earlier_custom_class'];
$custom_parser = new $custom_parser_class();
$custom_parser->parse($guard_content);
$parser_composition['custom_document_exact'] = $custom_parser->received[0] === $guard_content;
$GLOBALS['rest_test_hooks']['block_parser_class'] = $parser_hooks;
add_filter('block_parser_class', function ($class) use (&$parser_composition) {
    $parser_composition['after_calls']++;
    $parser_composition['later_input'] = $class;
    return 'Rest_Test_Late_Block_Parser';
}, PHP_INT_MAX);
$parser_composition['later_override_class'] = apply_filters('block_parser_class', 'WP_Block_Parser');
$GLOBALS['rest_test_hooks']['block_parser_class'] = $parser_hooks;
echo wp_json_encode(array('registration' => $registration, 'rows' => $rows, 'guards' => $guard_results, 'field_scope' => $field_scope, 'policies' => $policies, 'response_registration' => $response_registration, 'response_guards' => $response_guard_results, 'response_untouched' => $response_untouched, 'response_rows' => $response_rows, 'response_policies' => $response_policies, 'block_hook_registration' => $block_hook_registration, 'block_hook_rows' => $block_hook_rows, 'block_hook_guards' => $block_hook_guard_results, 'block_hook_untouched' => $block_hook_untouched, 'block_hook_composition' => $block_hook_composition, 'parser_registration' => $parser_registration, 'parser_class' => $parser_class, 'parser_rows' => $parser_rows, 'parser_non_string' => $parser_non_string, 'parser_custom_values' => $parser_custom_values, 'parser_composition' => $parser_composition)), "\n";
