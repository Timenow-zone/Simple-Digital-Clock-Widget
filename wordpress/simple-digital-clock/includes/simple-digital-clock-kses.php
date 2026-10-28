<?php
// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Accept the HEX and RGB formats supported by the bundled widget.
 */
function SDCW_is_safe_clock_color($value) {
    $value = trim(html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    return (bool) preg_match('/^(?:#(?:[a-f0-9]{3}|[a-f0-9]{4}|[a-f0-9]{6}|[a-f0-9]{8})|rgba?\([0-9.,%+\s-]+\))$/i', $value);
}

/**
 * Validate custom CSS attributes without changing the global KSES URL rules.
 */
function SDCW_is_safe_clock_background($value) {
    $value = trim(html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    if (SDCW_is_safe_clock_color($value) || in_array(strtolower($value), array('none', 'transparent'), true)) {
        return true;
    }
    // Clock backgrounds support colors and gradients, not URL resources or extra rules.
    if (!preg_match('/^(?:repeating-)?(?:linear|radial|conic)-gradient\(/', $value) || preg_match('/url\s*\(|\/\*|[;{}<>\\\\\x00-\x1f]/i', $value)) {
        return false;
    }

    $css = 'background:' . $value;
    return safecss_filter_attr($css) === $css;
}

/**
 * Preserve the clock markup for users whose post content is filtered by KSES.
 */
function SDCW_allow_clock_post_html($tags, $context) {
    if ('post' !== $context) {
        return $tags;
    }

    $attributes = array_fill_keys(array(
        'class',
        'width',
        'locale',
        'rounded',
        'align',
        'shadow',
        'date',
        'second',
        'hundredths',
        'border',
        'period',
        'caption',
        'time-zone',
        'font-family',
    ), true);
    $attributes['background'] = array('value_callback' => 'SDCW_is_safe_clock_background');
    $attributes['background-color'] = array('value_callback' => 'SDCW_is_safe_clock_color');
    $tags['timenow-zone-sdcw'] = $attributes;

    return $tags;
}

add_filter('wp_kses_allowed_html', 'SDCW_allow_clock_post_html', 10, 2);

/**
 * Edit only complete clock blocks. Foreign comments and HTML remain untouched.
 * Decode objects as objects, including unknown attributes with numeric keys.
 */
function SDCW_map_clock_blocks($content, $callback) {
    if (false === strpos($content, 'wp:simple-digital-clock-block/widget-block')) {
        return $content;
    }
    $pattern = '~(<!--\s+wp:simple-digital-clock-block/widget-block\s+)(.*?)(-->)(.*?)(<!--\s+/wp:simple-digital-clock-block/widget-block\s+-->)~s';
    $updated = preg_replace_callback($pattern, function ($match) use ($callback) {
        $json = trim($match[2]);
        $attributes = '' === $json ? new stdClass() : json_decode($json);
        // Static clock blocks have no child blocks. Leave malformed input alone.
        if (!is_object($attributes) || preg_match('~<!--\s+/?wp:~', $match[4])) {
            return $match[0];
        }
        $before = serialize_block_attributes($attributes);
        $callback($attributes, $match[4]);
        $after = serialize_block_attributes($attributes);
        if ($before === $after) {
            return $match[0];
        }
        return $match[1] . $after . ' -->' . $match[4] . $match[5];
    }, $content);
    if (null === $updated) {
        error_log('Simple Digital Clock: unable to parse block metadata; original content retained.');
        return $content;
    }
    return $updated;
}

function SDCW_sync_clock_content_metadata($content) {
    return SDCW_map_clock_blocks($content, function ($attributes, $html) {
        $processor = new WP_HTML_Tag_Processor($html);
        if (!$processor->next_tag('TIMENOW-ZONE-SDCW')) {
            return;
        }
        if (!property_exists($attributes, 'timeZone')) {
            $time_zone = $processor->get_attribute('time-zone');
            $attributes->timeZone = is_string($time_zone) ? $time_zone : '';
        }
        // Keep optional HTML-only captions in HTML. The editor reads them through
        // its DOM fallback; older Core/PHP decoders can synthesize incorrect JSON.
    });
}

/**
 * KSES recursively filters JSON strings. Keep a separate frame for every call.
 * Only the clock's known plain-text caption is restored after that JSON pass.
 */
function &SDCW_clock_kses_frames() {
    static $frames = array();
    return $frames;
}

function SDCW_allows_clock_html($allowed_html) {
    return 'post' === $allowed_html || (is_array($allowed_html) && isset($allowed_html['timenow-zone-sdcw']));
}

/**
 * Extend the native lexer to escape raw caption syntax without decoding entities.
 * WordPress 6.3's decoded attribute API does not recognize HTML5 &apos;.
 */
class SDCW_Clock_HTML_Tag_Processor extends WP_HTML_Tag_Processor {
    public function escape_caption_angle_brackets() {
        $this->rewrite_caption_source(function ($raw_attribute) {
            return strtr($raw_attribute, array('<' => '&lt;', '>' => '&gt;'));
        });
    }

    public function normalize_caption_entities() {
        $this->rewrite_caption_source('SDCW_encode_clock_caption_entities');
    }

    public function encode_caption_unicode() {
        $this->rewrite_caption_source(function ($raw_attribute) {
            $encoded = preg_replace_callback('/[\r\x{a0}-\x{10ffff}]/u', 'SDCW_caption_character_reference', $raw_attribute);
            if (null === $encoded) {
                error_log('Simple Digital Clock: unable to encode caption Unicode; original attribute retained.');
                return $raw_attribute;
            }
            return $encoded;
        });
    }

    private function rewrite_caption_source($transform) {
        if (!is_string(parent::get_attribute('caption'))) {
            return;
        }
        // Let the native lexer locate the current attribute's exact source span.
        if (!parent::set_attribute('caption', '')) {
            error_log('Simple Digital Clock: unable to locate caption attribute.');
            return;
        }
        $update = $this->lexical_updates['caption'];
        // WordPress 6.5 changed replacement spans from start/end to start/length.
        $length = isset($update->length) ? $update->length : $update->end - $update->start;
        $raw_attribute = substr($this->html, $update->start, $length);
        $update->text = $transform($raw_attribute);
    }
}

/**
 * Encode one valid UTF-8 character without requiring mbstring or iconv.
 */
function SDCW_caption_character_reference($match) {
    $character = $match[0];
    $length = strlen($character);
    $codepoint = ord($character[0]);
    if ($length > 1) {
        $codepoint &= 0x7f >> $length;
        for ($index = 1; $index < $length; $index++) {
            $codepoint = ($codepoint << 6) | (ord($character[$index]) & 0x3f);
        }
    }
    // HTML5 remaps C1 numeric references; retain literal controls and core exclusions.
    if (($codepoint >= 0x80 && $codepoint <= 0x9f) || !valid_unicode($codepoint)) {
        return $character;
    }
    return '&#' . $codepoint . ';';
}

/**
 * Convert only named references that KSES would turn into literal entity text.
 * A single pass leaves &amp;Name; and deeper literal layers distinct.
 */
function SDCW_encode_clock_caption_entities($raw_attribute) {
    // HTML input preprocessing turns raw CR/CRLF into LF before decoding references.
    $raw_attribute = str_replace(array("\r\n", "\r"), "\n", $raw_attribute);
    // KSES strips a literal backslash before a closing quote on the next save.
    $protected = str_replace('\\', '&#92;', $raw_attribute);
    $updated = preg_replace_callback('/&amp;(?=(#[0-9]+;|#[xX][0-9a-fA-F]+;))|&[a-zA-Z][a-zA-Z0-9]*;/', function ($match) {
        // Older KSES restores &amp; and then decodes the newly exposed numeric reference.
        if (isset($match[1]) && '' !== $match[1]) {
            return '&#38;';
        }
        if (wp_kses_normalize_entities($match[0]) === $match[0]) {
            return $match[0];
        }
        $decoded = html_entity_decode($match[0], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        if ($decoded === $match[0]) {
            return $match[0];
        }
        // Numeric references preserve old database charsets and unquoted syntax.
        $numeric = preg_replace_callback('/./us', 'SDCW_caption_character_reference', $decoded);
        if (null === $numeric) {
            error_log('Simple Digital Clock: unable to encode a caption character reference.');
            return $match[0];
        }
        return $numeric;
    }, $protected);
    if (null === $updated) {
        error_log('Simple Digital Clock: unable to normalize caption entities; original attribute retained.');
        return $raw_attribute;
    }
    return $updated;
}

/**
 * Prepare unslashed HTML before Core KSES normalizes caption entities.
 */
function SDCW_prepare_clock_caption_html($html) {
    if (false === stripos($html, '<timenow-zone-sdcw')) {
        return $html;
    }
    if (false === strpos($html, '&') && false === strpos($html, '\\') && false === strpos($html, "\r")) {
        return $html;
    }
    $processor = new SDCW_Clock_HTML_Tag_Processor($html);
    while ($processor->next_tag('TIMENOW-ZONE-SDCW')) {
        $processor->normalize_caption_entities();
    }
    return $processor->get_updated_html();
}

/**
 * These WordPress save filters receive and return slashed strings.
 */
function SDCW_prepare_clock_caption_entities_for_save($content) {
    if (false === has_filter(current_filter(), 'wp_filter_post_kses')) {
        return $content;
    }
    $html = wp_unslash($content);
    $updated = SDCW_prepare_clock_caption_html($html);
    return $updated === $html ? $content : wp_slash($updated);
}
foreach (array('content_save_pre', 'excerpt_save_pre', 'content_filtered_save_pre') as $sdcw_save_filter) {
    add_filter($sdcw_save_filter, 'SDCW_prepare_clock_caption_entities_for_save', 8);
}

function SDCW_prepare_clock_post_html($content, $allowed_html) {
    $frames =& SDCW_clock_kses_frames();
    $captions = array();
    if (SDCW_allows_clock_html($allowed_html)) {
        // Escape literal angle brackets before the HTML tokenizer sees them.
        if (false !== stripos($content, '<timenow-zone-sdcw')) {
            $processor = new SDCW_Clock_HTML_Tag_Processor($content);
            while ($processor->next_tag('TIMENOW-ZONE-SDCW')) {
                $processor->escape_caption_angle_brackets();
            }
            $content = $processor->get_updated_html();
        }
        SDCW_map_clock_blocks($content, function ($attributes, $html) use (&$captions) {
            $captions[] = array(
                'html' => hash('sha256', $html),
                'caption' => isset($attributes->caption) && is_string($attributes->caption) ? $attributes->caption : null,
            );
        });
    }
    $frames[] = $captions;
    return $content;
}
add_filter('pre_kses', 'SDCW_prepare_clock_post_html', 9, 2);

function SDCW_preserve_clock_metadata_for_kses($content, $allowed_html) {
    $frames =& SDCW_clock_kses_frames();
    $captions = array_pop($frames);
    if (!SDCW_allows_clock_html($allowed_html)) {
        return $content;
    }
    $index = 0;
    $content = SDCW_map_clock_blocks($content, function ($attributes, $html) use ($captions, &$index) {
        $original = isset($captions[$index]) ? $captions[$index] : null;
        $index++;
        if (null !== $original && null !== $original['caption'] && $original['html'] === hash('sha256', $html)) {
            $attributes->caption = $original['caption'];
        }
    });
    // JSON serialization escapes comment delimiters; actual HTML still runs KSES.
    return SDCW_sync_clock_content_metadata($content);
}
add_filter('pre_kses', 'SDCW_preserve_clock_metadata_for_kses', 11, 2);

/**
 * Keep caption references stable after newer KSES decodes them to Unicode.
 */
function SDCW_encode_clock_caption_html($html) {
    if (false === stripos($html, '<timenow-zone-sdcw') || !preg_match('/[\r\x80-\xff]/', $html)) {
        return $html;
    }
    $processor = new SDCW_Clock_HTML_Tag_Processor($html);
    while ($processor->next_tag('TIMENOW-ZONE-SDCW')) {
        $processor->encode_caption_unicode();
    }
    return $processor->get_updated_html();
}

/**
 * Core block widgets sanitize independently of the slashed post-save pipeline.
 */
function SDCW_preserve_clock_widget_content($instance, $new_instance, $old_instance, $widget) {
    if (!is_array($instance) || !is_object($widget) || 'WP_Widget_Block' !== get_class($widget) || current_user_can('unfiltered_html')) {
        return $instance;
    }
    if (!isset($instance['content'], $new_instance['content']) || !is_string($instance['content']) || !is_string($new_instance['content']) || false === stripos($new_instance['content'], '<timenow-zone-sdcw')) {
        return $instance;
    }
    // Never undo a prior widget callback's replacement or stricter policy.
    if ($instance['content'] !== wp_kses_post($new_instance['content'])) {
        return $instance;
    }
    // Use the original unslashed input because Core's first pass can lose entities.
    // Run before normal widget callbacks, retaining Core KSES for all actual HTML.
    $prepared = SDCW_prepare_clock_caption_html($new_instance['content']);
    $instance['content'] = SDCW_encode_clock_caption_html(wp_kses_post($prepared));
    return $instance;
}
add_filter('widget_update_callback', 'SDCW_preserve_clock_widget_content', 0, 4);

/**
 * Cover post saves by all roles, including programmatically created blocks.
 */
function SDCW_preserve_clock_post_metadata($data) {
    // Newer KSES versions can serialize numeric references as Unicode again.
    foreach (array('post_content' => 'content_save_pre', 'post_excerpt' => 'excerpt_save_pre', 'post_content_filtered' => 'content_filtered_save_pre') as $field => $filter) {
        if (!isset($data[$field]) || !is_string($data[$field]) || false === has_filter($filter, 'wp_filter_post_kses')) {
            continue;
        }
        $html = wp_unslash($data[$field]);
        $data[$field] = wp_slash(SDCW_encode_clock_caption_html($html));
    }
    if (isset($data['post_content']) && is_string($data['post_content'])) {
        $content = wp_unslash($data['post_content']);
        $updated = SDCW_sync_clock_content_metadata($content);
        if ($updated !== $content) {
            $data['post_content'] = wp_slash($updated);
        }
    }
    return $data;
}
add_filter('wp_insert_post_data', 'SDCW_preserve_clock_post_metadata');
