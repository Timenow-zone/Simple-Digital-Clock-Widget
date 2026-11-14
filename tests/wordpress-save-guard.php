<?php
// Exercise request routing and safety decisions without writing any posts.
// Optional Core HTML classes verify tokenization; authorization uses explicit doubles.
define('ABSPATH', __DIR__);
define('SDCW_PATH', $argv[1] . '/');
define('SDCW_URL', 'https://example.invalid/plugin/');
$hooks = array();
$removed = array();
$identity = array('site' => 1, 'user' => 2, 'session' => 'session-a');
$allowed = true;
$valid_nonce = true;
$writes = 0;
$checks = array();
function add_action($hook, $callback, $priority = 10, $args = 1) { $GLOBALS['hooks'][$hook] = array($callback, $priority, $args); }
function add_filter($hook, $callback, $priority = 10, $args = 1) { add_action($hook, $callback, $priority, $args); }
function remove_filter($hook, $callback, $priority = 10) { $GLOBALS['removed'][] = array($hook, $callback, $priority); }
function get_current_blog_id() { return $GLOBALS['identity']['site']; }
function get_current_user_id() { return $GLOBALS['identity']['user']; }
function wp_get_session_token() { return $GLOBALS['identity']['session']; }
function wp_hash($data, $scheme) { return hash_hmac('md5', $data, 'test-salt-' . $scheme); }
function current_user_can($cap, $id) { return $GLOBALS['allowed'] && 'edit_post' === $cap && 7 === $id; }
function wp_verify_nonce($nonce, $action) { return $GLOBALS['valid_nonce'] && 'core-nonce' === $nonce && 'update-post_7' === $action; }
function get_post($id) { return isset($GLOBALS['posts'][$id]) ? $GLOBALS['posts'][$id] : null; }
function __($text, $domain = '') { return $text; }
function esc_html($text) { return htmlspecialchars($text, ENT_QUOTES, 'UTF-8'); }
function esc_attr($text) { return esc_html($text); }
function esc_textarea($text) { return esc_html($text); }
function esc_html__($text, $domain) { return esc_html($text); }
function esc_url($text) { return esc_html($text); }
function sanitize_text_field($text) { return trim(strip_tags($text)); }
// Native acceptance separately verifies Core KSES preserves the recovery fields.
function wp_kses($html, $allowed) {
    if (!isset($allowed['textarea']['readonly']) || isset($allowed['script'])) { throw new RuntimeException('Unsafe recovery allowlist'); }
    return $html;
}
function get_edit_post_link($id, $context) { return 'https://example.invalid/wp-admin/post.php?post=' . $id . '&action=edit'; }
function wp_unslash($value) { return is_array($value) ? array_map('wp_unslash', $value) : (is_string($value) ? stripslashes($value) : $value); }
function wp_enqueue_script() { $GLOBALS['enqueue'][] = func_get_args(); }
class WP_Post { public $ID = 7; public $post_content; }
class TestSaveStopped extends Exception { public $body; public $options; }
function wp_die($body, $title, $options) {
    $exception = new TestSaveStopped($title);
    $exception->body = $body;
    $exception->options = $options;
    throw $exception;
}
function guard_check($passed, $name) { $GLOBALS['checks'][] = array('passed' => (bool) $passed, 'name' => $name); }

$zero = '<p>Unrelated text</p>';
$one = '<p>Before<timenow-zone-sdcw caption="Kyiv"></timenow-zone-sdcw>After</p>';
$two = $one . '<timenow-zone-sdcw caption="Tokyo"></timenow-zone-sdcw>';
$attack = '</textarea><script>alert("unsafe")</script>';
$core = isset($argv[2]) ? $argv[2] : '';
if ($core) {
    if (is_file($core . '/wp-includes/html-api/class-wp-html-decoder.php')) {
        require $core . '/wp-includes/class-wp-token-map.php';
        require $core . '/wp-includes/html-api/html5-named-character-references.php';
        require $core . '/wp-includes/html-api/class-wp-html-decoder.php';
    }
    foreach (array('class-wp-html-attribute-token.php', 'class-wp-html-span.php', 'class-wp-html-text-replacement.php', 'class-wp-html-tag-processor.php') as $file) {
        require $core . '/wp-includes/html-api/' . $file;
    }
} else {
    $token_counts = array($zero => 0, $one => 1, $two => 2, '' => 0, $attack => 0);
    // Explicit token fixtures test guard decisions, not an invented HTML parser.
    class WP_HTML_Tag_Processor {
        private $remaining;
        public function __construct($html) {
            if (!isset($GLOBALS['token_counts'][$html])) { throw new RuntimeException('Unregistered token fixture'); }
            $this->remaining = $GLOBALS['token_counts'][$html];
        }
        public function next_tag($tag) { return $this->remaining-- > 0; }
    }
}
require SDCW_PATH . 'includes/simple-digital-clock-save-guard.php';
$post = new WP_Post();
$post->post_content = $two;
$posts = array(7 => $post);
$data = array('post_ID' => '7', 'content' => $zero, '_wpnonce' => 'core-nonce');
$token = SDCW_classic_clock_form_token(7);
guard_check(SDCW_should_protect_classic_clock_save($data, 'post_ID'), 'Old form cannot remove all clocks');
$partial = $data; $partial['content'] = $one;
guard_check(SDCW_should_protect_classic_clock_save($partial, 'post_ID'), 'Old form cannot remove one of multiple clocks');
$same = $data; $same['content'] = $two;
guard_check(!SDCW_should_protect_classic_clock_save($same, 'post_ID'), 'Old form can retain its clocks');
$fresh = $data; $fresh['sdcw_classic_editor'] = $token;
guard_check(!SDCW_should_protect_classic_clock_save($fresh, 'post_ID'), 'Fresh form can intentionally remove clocks');
foreach (array('', array(), 'forged', SDCW_classic_clock_form_token(8)) as $marker) {
    $invalid = $fresh; $invalid['sdcw_classic_editor'] = $marker;
    guard_check(SDCW_should_protect_classic_clock_save($invalid, 'post_ID'), 'Invalid or other-post marker cannot authorize deletion');
}
foreach (array('site' => 2, 'user' => 3, 'session' => 'session-b') as $key => $replacement) {
    $original = $identity[$key]; $identity[$key] = $replacement;
    guard_check(SDCW_should_protect_classic_clock_save($fresh, 'post_ID'), 'Marker bound to ' . $key);
    $identity[$key] = $original;
}
$valid_nonce = false;
guard_check(!SDCW_should_protect_classic_clock_save($data, 'post_ID'), 'Invalid Core nonce remains Core authorization failure');
$valid_nonce = true; $allowed = false;
guard_check(!SDCW_should_protect_classic_clock_save($data, 'post_ID'), 'Permission denial remains Core authorization failure');
$allowed = true;
foreach (array('post_ID', 'content', '_wpnonce') as $key) {
    $invalid = $data; unset($invalid[$key]);
    guard_check(!SDCW_should_protect_classic_clock_save($invalid, 'post_ID'), 'Missing ' . $key . ' is not a deletion');
    $invalid = $data; $invalid[$key] = array('unexpected');
    guard_check(('content' === $key) === SDCW_should_protect_classic_clock_save($invalid, 'post_ID'), 'Malformed ' . $key . ' follows its safe boundary');
}
foreach (array(array('unexpected'), null, 42) as $malformed) {
    $invalid = $fresh; $invalid['content'] = $malformed;
    guard_check(SDCW_should_protect_classic_clock_save($invalid, 'post_ID'), 'Fresh marker never bypasses malformed content protection');
}
$post->post_content = $zero;
guard_check(!SDCW_should_protect_classic_clock_save($data, 'post_ID'), 'Clock-free posts retain native behavior');
$post->post_content = $two;
$autosave = $data; $autosave['post_id'] = $autosave['post_ID']; unset($autosave['post_ID']);
$response = SDCW_guard_classic_clock_autosave(array('foreign' => 'retained'), array('wp_autosave' => $autosave));
guard_check(false === $response['wp_autosave']['success'] && 'retained' === $response['foreign'], 'Blocked autosave reports native error and retains foreign heartbeat data');
guard_check(array(array('heartbeat_received', 'heartbeat_autosave', 500)) === $removed, 'Blocked autosave disables only the pending Core write callback');
$removed = array(); $autosave['sdcw_classic_editor'] = $token;
guard_check(array('foreign' => 'retained') === SDCW_guard_classic_clock_autosave(array('foreign' => 'retained'), array('wp_autosave' => $autosave)) && !$removed, 'Fresh deletion autosave keeps Core callback and response unchanged');
guard_check(array('foreign' => true) === SDCW_guard_classic_clock_autosave(array('foreign' => true), array()), 'Non-autosave heartbeat remains unchanged');
$_SERVER['REQUEST_METHOD'] = 'POST'; $_GET = array();
$_POST = $data + array('action' => 'editpost', 'post_title' => $attack, 'excerpt' => $attack);
foreach (array('editpost', 'preview') as $action) {
    $_POST['action'] = $action;
    try { SDCW_guard_classic_clock_save(); guard_check(false, 'Expected blocked native save'); }
    catch (TestSaveStopped $error) {
        guard_check(409 === $error->options['response'], 'Blocked ' . $action . ' returns conflict before Core writes');
        guard_check(false === strpos($error->body, '<script>') && false !== strpos($error->body, '&lt;script&gt;'), 'Recovery values are escaped HTML text');
        guard_check(false !== strpos($error->body, 'target="_blank"') && false !== strpos($error->body, 'readonly'), 'Recovery retains submitted text and opens saved post separately');
    }
}
foreach (array('inline-save', 'trash', 'delete') as $action) {
    $_POST['action'] = $action; SDCW_guard_classic_clock_save();
    guard_check(true, 'Unrelated ' . $action . ' is not intercepted');
}
$_POST['action'] = ''; $_GET['action'] = 'preview';
try { SDCW_guard_classic_clock_save(); guard_check(false, 'Expected query action block'); }
catch (TestSaveStopped $error) { guard_check(409 === $error->options['response'], 'Query preview action with empty form action is protected'); }
$_GET = array(); $_POST['wp-preview'] = 'dopreview';
try { SDCW_guard_classic_clock_save(); guard_check(false, 'Expected native preview override block'); }
catch (TestSaveStopped $error) { guard_check(409 === $error->options['response'], 'Native preview override is protected'); }
unset($_POST['wp-preview']);
$_POST['action'] = 'editpost'; $_POST['deletepost'] = 'Delete'; SDCW_guard_classic_clock_save();
guard_check(true, 'Native deletepost override is not intercepted'); unset($_POST['deletepost']);
$_GET['post'] = 8; SDCW_guard_classic_clock_save();
guard_check(true, 'Mismatched GET/POST ID is left to Core rejection'); $_GET = array();
$_POST['sdcw_classic_editor'] = $token; SDCW_guard_classic_clock_save();
guard_check(true, 'Fresh intentional native removal is allowed');
$_POST['content'] = array('must not be reflected');
try { SDCW_guard_classic_clock_save(); guard_check(false, 'Expected malformed content rejection'); }
catch (TestSaveStopped $error) {
    guard_check(400 === $error->options['response'] && false === strpos($error->body, 'must not be reflected'), 'Malformed native content fails closed without array reflection');
}
$autosave['content'] = array('invalid'); $removed = array();
$response = SDCW_guard_classic_clock_autosave(array(), array('wp_autosave' => $autosave));
guard_check(false === $response['wp_autosave']['success'] && false !== strpos($response['wp_autosave']['message'], 'invalid') && count($removed) === 1, 'Malformed fresh autosave cannot reach Core write');
ob_start(); SDCW_classic_clock_form($post); $form = ob_get_clean();
guard_check(false !== strpos($form, esc_attr($token)), 'Fresh Classic form contains its session marker');
guard_check(array('jquery', 'autosave') === $GLOBALS['enqueue'][0][2], 'Autosave bridge is loaded with Core dependencies');
guard_check(isset($hooks['load-post.php'], $hooks['edit_form_top']) && 499 === $hooks['heartbeat_received'][1], 'Hooks run before native save and priority-500 autosave');
guard_check(!isset($hooks['wp_insert_post_data'], $hooks['save_post'], $hooks['rest_pre_insert_post']), 'No generic post persistence or REST interception');
if ($core) {
    foreach (array('<!-- ' . $one . ' -->', '<script>var clock = "' . $one . '";</script>', '<textarea>' . $one . '</textarea>', '&lt;timenow-zone-sdcw&gt;') as $html) {
        guard_check(0 === SDCW_clock_element_count($html), 'Real Core excludes inert or escaped clock-like text');
    }
    guard_check(2 === SDCW_clock_element_count($two), 'Real Core counts two distinct live opening tags');
}
$failed = count(array_filter($checks, function ($row) { return !$row['passed']; }));
echo json_encode(array('checks' => $checks, 'failed' => $failed, 'core_parser' => $core ? $core : 'explicit token fixtures'), JSON_PRETTY_PRINT), "\n";
exit($failed ? 1 : 0);
