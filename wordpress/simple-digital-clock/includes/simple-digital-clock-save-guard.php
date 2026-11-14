<?php
// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Identify a form generated with the clock-aware Classic editor integration.
 * This session-bound marker is not authorization: Core's nonce and capabilities
 * are checked separately. Unlike that nonce, it survives Core nonce refreshes.
 */
function SDCW_classic_clock_form_token($post_id) {
    return wp_hash('sdcw-classic-editor-v1|' . get_current_blog_id() . '|' . $post_id . '|' . get_current_user_id() . '|' . wp_get_session_token(), 'nonce');
}

/**
 * Mark only native Classic post forms, including forms initially in Text mode.
 */
function SDCW_classic_clock_form($post) {
    if (!($post instanceof WP_Post) || !current_user_can('edit_post', $post->ID)) {
        return;
    }
    echo '<input type="hidden" id="sdcw-classic-editor" name="sdcw_classic_editor" value="' . esc_attr(SDCW_classic_clock_form_token($post->ID)) . '" />';
    $script = 'assets/admin/js/simple-digital-clock-save-guard.js';
    wp_enqueue_script('simple-digital-clock-save-guard', SDCW_URL . $script, array('jquery', 'autosave'), filemtime(SDCW_PATH . $script), true);
}
add_action('edit_form_top', 'SDCW_classic_clock_form');

/**
 * Count actual opening tags, excluding comments and escaped HTML examples.
 */
function SDCW_clock_element_count($content) {
    $count = 0;
    $processor = new WP_HTML_Tag_Processor($content);
    while ($processor->next_tag('TIMENOW-ZONE-SDCW')) {
        $count++;
    }
    return $count;
}

/**
 * Reject ambiguous clock removal from a pre-update native Classic document.
 * The input is unslashed; REST, CLI, widgets and generic post filters stay native.
 */
function SDCW_should_protect_classic_clock_save($data, $id_key) {
    if (!is_array($data) || !isset($data[$id_key], $data['_wpnonce']) || !array_key_exists('content', $data)
        || !(is_string($data[$id_key]) || is_int($data[$id_key]))
        || !ctype_digit((string) $data[$id_key]) || (int) $data[$id_key] < 1
        || !is_string($data['_wpnonce'])) {
        return false;
    }
    $post_id = (int) $data[$id_key];
    if (!current_user_can('edit_post', $post_id) || !wp_verify_nonce($data['_wpnonce'], 'update-post_' . $post_id)) {
        // Let Core report its own authorization failure without exposing content.
        return false;
    }
    // Older Core can turn malformed array content into an empty saved post.
    // A fresh form marker must never make that invalid payload acceptable.
    if (!is_string($data['content'])) {
        $post = get_post($post_id);
        return $post && SDCW_clock_element_count($post->post_content) > 0;
    }
    if (isset($data['sdcw_classic_editor']) && is_string($data['sdcw_classic_editor'])
        && hash_equals(SDCW_classic_clock_form_token($post_id), $data['sdcw_classic_editor'])) {
        return false;
    }
    $post = get_post($post_id);
    return $post && SDCW_clock_element_count($data['content']) < SDCW_clock_element_count($post->post_content);
}

function SDCW_classic_clock_save_message($invalid_content = false) {
    if ($invalid_content) {
        return __('Saving was stopped because the submitted content is invalid. Your saved clocks have not been replaced. Reopen the editor before saving again.', 'simple-digital-clock');
    }
    return __('Saving was stopped because this older editor would remove saved clocks. Your saved content has not been replaced. Copy your unsaved changes, then reopen the editor and apply them again. To intentionally remove clocks, reopen the editor first.', 'simple-digital-clock');
}

/**
 * Stop before edit_post() can update the post, metadata or revisions.
 * A recovery page retains the submitted text without silently merging content.
 */
function SDCW_guard_classic_clock_save() {
    if (!isset($_SERVER['REQUEST_METHOD']) || 'POST' !== $_SERVER['REQUEST_METHOD'] || isset($_POST['deletepost'])) {
        return;
    }
    $data = wp_unslash($_POST);
    if (!isset($data['post_ID'], $data['_wpnonce']) || !(is_string($data['post_ID']) || is_int($data['post_ID']))
        || !is_string($data['_wpnonce']) || !wp_verify_nonce($data['_wpnonce'], 'update-post_' . (int) $data['post_ID'])) {
        return;
    }
    // Older Core falls back to the query action when the form action is empty.
    $query_action = isset($_GET['action']) && is_string($_GET['action']) ? sanitize_text_field(wp_unslash($_GET['action'])) : '';
    $action = !empty($data['action']) ? $data['action'] : $query_action;
    $action = is_string($action) ? sanitize_text_field($action) : '';
    if (isset($data['wp-preview']) && 'dopreview' === $data['wp-preview']) {
        $action = 'preview';
    }
    if (!in_array($action, array('editpost', 'preview'), true)) {
        return;
    }
    if (isset($_GET['post']) && (!is_scalar($_GET['post']) || !isset($data['post_ID']) || !is_scalar($data['post_ID']) || (int) $_GET['post'] !== (int) $data['post_ID'])) {
        return;
    }
    if (!SDCW_should_protect_classic_clock_save($data, 'post_ID')) {
        return;
    }
    $invalid_content = !is_string($data['content']);
    $message = '<p>' . esc_html(SDCW_classic_clock_save_message($invalid_content)) . '</p>';
    $fields = array(
        'post_title' => __('Submitted title', 'simple-digital-clock'),
        'content' => __('Submitted content (HTML)', 'simple-digital-clock'),
        'excerpt' => __('Submitted excerpt', 'simple-digital-clock'),
    );
    foreach ($fields as $key => $label) {
        if (isset($data[$key]) && is_string($data[$key])) {
            $message .= '<p><label>' . esc_html($label) . '<br /><textarea readonly rows="6" style="width:100%">' . esc_textarea($data[$key]) . '</textarea></label></p>';
        }
    }
    $message .= '<p><a target="_blank" rel="noopener" href="' . esc_url(get_edit_post_link((int) $data['post_ID'], 'raw')) . '">' . esc_html__('Open the saved post in a new tab', 'simple-digital-clock') . '</a></p>';
    $allowed_html = array(
        'p' => array(), 'label' => array(), 'br' => array(),
        'textarea' => array('readonly' => true, 'rows' => true, 'style' => true),
        'a' => array('href' => true, 'target' => true, 'rel' => true),
    );
    wp_die(wp_kses($message, $allowed_html), esc_html__('Clock content protected', 'simple-digital-clock'), array('response' => $invalid_content ? 400 : 409));
}
add_action('load-post.php', 'SDCW_guard_classic_clock_save');

/**
 * Core autosave can overwrite a draft or its last autosave revision. Veto only
 * this request's destructive autosave before Core's priority-500 callback.
 * Keep other Heartbeat handlers and Core's native autosave error protocol.
 */
function SDCW_guard_classic_clock_autosave($response, $data) {
    if (!is_array($data) || !isset($data['wp_autosave']) || !SDCW_should_protect_classic_clock_save($data['wp_autosave'], 'post_id')) {
        return $response;
    }
    remove_filter('heartbeat_received', 'heartbeat_autosave', 500);
    $response['wp_autosave'] = array('success' => false, 'message' => SDCW_classic_clock_save_message(!is_string($data['wp_autosave']['content'])));
    return $response;
}
add_filter('heartbeat_received', 'SDCW_guard_classic_clock_autosave', 499, 2);
