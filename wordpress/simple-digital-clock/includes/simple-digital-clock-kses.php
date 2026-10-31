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
 * Serialize only clock metadata without older Core's backslash ambiguity.
 * This is the current Core escaping order; foreign blocks keep their native path.
 */
function SDCW_serialize_clock_block_attributes($attributes) {
    $encoded = wp_json_encode($attributes, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!is_string($encoded)) {
        error_log('Simple Digital Clock: unable to encode block metadata; original content retained.');
        return null;
    }
    return strtr($encoded, array(
        '\\\\' => '\\u005c',
        '--' => '\\u002d\\u002d',
        '<' => '\\u003c',
        '>' => '\\u003e',
        '&' => '\\u0026',
        '\\"' => '\\u0022',
    ));
}

/**
 * Reproduce Core 6.3's native caption token for a strict recovery preimage check.
 * Untouched unknown values need not share PHP's number serialization spelling.
 */
function SDCW_matches_legacy_clock_caption($caption, $json) {
    $encoded = wp_json_encode($caption, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!is_string($encoded)) {
        return false;
    }
    // JSON.stringify emits literal line separators; PHP 7.0 encodes them.
    // Decode only unescaped JSON line separators, leaving literal \u2028 text.
    $javascript = preg_replace_callback('/(?<!\\\\)((?:\\\\\\\\)*)\\\\u202([89])/', function ($match) {
        return $match[1] . ('8' === $match[2] ? "\xe2\x80\xa8" : "\xe2\x80\xa9");
    }, $encoded);
    foreach (array($encoded, $javascript) as $candidate) {
        if (!is_string($candidate)) {
            continue;
        }
        $candidate = str_replace(array('--', '<', '>', '&', '\\"'), array('\\u002d\\u002d', '\\u003c', '\\u003e', '\\u0026', '\\u0022'), $candidate);
        if ($candidate === $json) {
            return true;
        }
    }
    return false;
}

/**
 * Locate one top-level caption string in already validated JSON.
 * Duplicate keys or nested names cannot supply the repaired closing quote.
 */
function SDCW_clock_caption_json_span($json) {
    if (!preg_match_all('/"(?:[^"\\\\]|\\\\.)*"|[{}\[\]:,]/s', $json, $matches, PREG_OFFSET_CAPTURE)) {
        return null;
    }
    $depth = 0;
    $span = null;
    foreach ($matches[0] as $index => $token) {
        if ('{' === $token[0] || '[' === $token[0]) {
            $depth++;
        } elseif ('}' === $token[0] || ']' === $token[0]) {
            $depth--;
        } elseif (1 === $depth && '"' === $token[0][0] && isset($matches[0][$index + 1], $matches[0][$index + 2]) && ':' === $matches[0][$index + 1][0] && 'caption' === json_decode($token[0])) {
            if (null !== $span || '"' !== $matches[0][$index + 2][0][0]) {
                return null;
            }
            $span = array($matches[0][$index + 2][1], strlen($matches[0][$index + 2][0]));
        }
    }
    return $span;
}

/**
 * Recognize Core 6.3's lost closing quote on a terminal JSON caption backslash.
 * Exactly one strict caption preimage must match the saved HTML; no generic repair.
 */
function SDCW_recover_clock_caption_json($json, $html) {
    $count = preg_match_all('/u0022(?=\s*(?:,\s*"|}\s*$))/', $json, $matches, PREG_OFFSET_CAPTURE);
    if (!$count) {
        return null;
    }
    // Malformed untrusted input must not cause unbounded repeated JSON decoding.
    if ($count > 32) {
        error_log('Simple Digital Clock: ambiguous legacy caption metadata; original content retained.');
        return null;
    }
    $recovered = array();
    foreach ($matches[0] as $match) {
        $offset = $match[1];
        $backslashes = 0;
        for ($index = $offset - 1; $index >= 0 && '\\' === $json[$index]; $index--) {
            $backslashes++;
        }
        if ($backslashes < 2 || 0 !== $backslashes % 2) {
            continue;
        }
        $candidate = substr($json, 0, $offset) . '"' . substr($json, $offset + 5);
        $attributes = json_decode($candidate);
        if (!is_object($attributes) || !isset($attributes->caption) || !is_string($attributes->caption) || '\\' !== substr($attributes->caption, -1)) {
            continue;
        }
        $span = SDCW_clock_caption_json_span($candidate);
        if (null === $span || $span[0] + $span[1] - 1 !== $offset || !SDCW_matches_legacy_clock_caption($attributes->caption, substr($json, $span[0], $span[1] + 4))) {
            continue;
        }
        // Core's static HTML escaping leaves entity-shaped strings unchanged.
        $caption = preg_replace('/&(?!([a-z0-9]+|#[0-9]+|#x[a-f0-9]+);)/i', '&amp;', $attributes->caption);
        if (null === $caption) {
            continue;
        }
        $caption = str_replace(array('"', '>'), array('&quot;', '&gt;'), $caption);
        // The slashed save pipeline may already have normalized HTML5 references.
        // Apply that same single raw-HTML pass to both sides before comparison.
        $expected = new WP_HTML_Tag_Processor(SDCW_prepare_clock_caption_html('<timenow-zone-sdcw caption="' . $caption . '"></timenow-zone-sdcw>'));
        $actual = new WP_HTML_Tag_Processor(SDCW_prepare_clock_caption_html($html));
        if ($expected->next_tag('TIMENOW-ZONE-SDCW') && $actual->next_tag('TIMENOW-ZONE-SDCW') && $expected->get_attribute('caption') === $actual->get_attribute('caption')) {
            $recovered[] = $attributes;
        }
    }
    if (1 === count($recovered)) {
        return $recovered[0];
    }
    error_log('Simple Digital Clock: unrecognized legacy caption metadata; original content retained.');
    return null;
}

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
        // Static clock blocks have no child blocks. Do not repair foreign markup.
        // Native static captions can contain a literal comment prefix, but their
        // closing angle bracket is escaped. Reject complete child block comments.
        if (preg_match('~<!--\s+/?wp:.*?-->~s', $match[4])) {
            return $match[0];
        }
        $recovered = false;
        if (!is_object($attributes)) {
            $attributes = SDCW_recover_clock_caption_json($json, $match[4]);
            if (!is_object($attributes)) {
                return $match[0];
            }
            $recovered = true;
        }
        $before = SDCW_serialize_clock_block_attributes($attributes);
        $callback($attributes, $match[4]);
        $after = SDCW_serialize_clock_block_attributes($attributes);
        if (null === $before || null === $after) {
            return $match[0];
        }
        if (!$recovered && $before === $after) {
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
 * Preserve browser semantics for references KSES would change or reject.
 * A single pass leaves &amp;Name; and deeper literal layers distinct.
 */
function SDCW_encode_clock_caption_entities($raw_attribute) {
    // HTML input preprocessing turns raw CR/CRLF into LF before decoding references.
    $raw_attribute = str_replace(array("\r\n", "\r"), "\n", $raw_attribute);
    // KSES strips a literal backslash before a closing quote on the next save.
    $protected = str_replace('\\', '&#92;', $raw_attribute);
    $updated = preg_replace_callback('/&amp;(?=(#[0-9]+;|#[xX][0-9a-fA-F]+;))|&#([xX][0-9a-fA-F]+|[0-9]+);?|&[a-zA-Z][a-zA-Z0-9]*;/', function ($match) {
        // Older KSES restores &amp; and then decodes the newly exposed numeric reference.
        if (isset($match[1]) && '' !== $match[1]) {
            return '&#38;';
        }
        if (isset($match[2]) && '' !== $match[2]) {
            $number = $match[2];
            $hex = 'x' === $number[0] || 'X' === $number[0];
            $codepoint = $hex ? intval(substr($number, 1), 16) : intval($number, 10);
            // HTML replaces null, surrogate and out-of-range references with U+FFFD.
            if (0 === $codepoint || $codepoint > 0x10ffff || ($codepoint >= 0xd800 && $codepoint <= 0xdfff)) {
                return '&#65533;';
            }
            // A missing semicolon still terminates a numeric reference in HTML.
            return rtrim($match[0], ';') . ';';
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
 * Shield only known plain-text JSON captions during the complete Core pass.
 * Tokens are private to this call and never replace actual HTML attributes.
 */
function SDCW_protect_clock_caption_metadata($html, &$captions) {
    $captions = array();
    if (false === strpos($html, 'wp:simple-digital-clock-block/widget-block')) {
        return $html;
    }
    $prefix = 'sdcw-caption-token-' . wp_generate_uuid4() . '-';
    return SDCW_map_clock_blocks($html, function ($attributes) use (&$captions, $prefix) {
        if (isset($attributes->caption) && is_string($attributes->caption)) {
            $token = $prefix . count($captions);
            $captions[$token] = $attributes->caption;
            $attributes->caption = $token;
        }
    });
}

function SDCW_restore_clock_caption_metadata($html, $captions) {
    if (!$captions) {
        return $html;
    }
    return SDCW_map_clock_blocks($html, function ($attributes) use ($captions) {
        if (isset($attributes->caption) && is_string($attributes->caption) && array_key_exists($attributes->caption, $captions)) {
            $attributes->caption = $captions[$attributes->caption];
        }
    });
}

/**
 * Keep each nested slashed save-field call independent, including unfiltered calls.
 */
function &SDCW_clock_save_caption_frames() {
    static $frames = array();
    return $frames;
}

/**
 * These WordPress save filters receive and return slashed strings.
 */
function SDCW_prepare_clock_caption_entities_for_save($content) {
    $frames =& SDCW_clock_save_caption_frames();
    $filter = current_filter();
    $frames[] = array(
        'filter' => $filter,
        'depth' => count(SDCW_clock_kses_frames()),
        'protected' => false,
        'captions' => array(),
        'enabled' => false !== has_filter($filter, 'wp_filter_post_kses'),
    );
    if (false === has_filter(current_filter(), 'wp_filter_post_kses')) {
        return $content;
    }
    $html = wp_unslash($content);
    $updated = SDCW_prepare_clock_caption_html($html);
    return $updated === $html ? $content : wp_slash($updated);
}

/**
 * Core exposes no after-KSES hook. Identify its registered save callback without
 * reading arguments, so unrelated sanitization in earlier callbacks stays native.
 */
function SDCW_is_owned_clock_kses_pass($filter) {
    if ('sdcw-sanitize' !== $filter && !isset($GLOBALS['wp_filter'][$filter])) {
        return false;
    }
    $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS | DEBUG_BACKTRACE_PROVIDE_OBJECT, 12);
    foreach ($trace as $index => $call) {
        if (isset($call['function']) && 'wp_kses' === $call['function']) {
            $parent = isset($trace[$index + 1]) ? $trace[$index + 1] : array();
            $caller = isset($trace[$index + 2]) ? $trace[$index + 2] : array();
            if ('sdcw-sanitize' === $filter) {
                return isset($parent['function'], $caller['function']) && 'wp_kses_post' === $parent['function'] && 'SDCW_sanitize_clock_post_html' === $caller['function'];
            }
            return isset($parent['function'], $caller['object']) && 'wp_filter_post_kses' === $parent['function'] && $caller['object'] === $GLOBALS['wp_filter'][$filter];
        }
    }
    return false;
}

function SDCW_protect_scoped_clock_caption_metadata($content) {
    $frames =& SDCW_clock_save_caption_frames();
    $index = count($frames) - 1;
    if ($index < 0 || !$frames[$index]['enabled'] || $frames[$index]['protected'] || $frames[$index]['depth'] !== count(SDCW_clock_kses_frames()) || !isset($GLOBALS['wp_kses_operating_mode']) || 'html-api' !== $GLOBALS['wp_kses_operating_mode']) {
        return $content;
    }
    if (!SDCW_is_owned_clock_kses_pass($frames[$index]['filter'])) {
        return $content;
    }
    // Protect the outer owned pass only; unrelated recursive KSES calls stay native.
    $frames[$index]['protected'] = true;
    return SDCW_protect_clock_caption_metadata($content, $frames[$index]['captions']);
}

function SDCW_restore_clock_caption_entities_after_save($content) {
    $frames =& SDCW_clock_save_caption_frames();
    $index = count($frames) - 1;
    if ($index < 0 || $frames[$index]['filter'] !== current_filter()) {
        return $content;
    }
    $frame = array_pop($frames);
    if (!$frame['captions']) {
        return $content;
    }
    return wp_slash(SDCW_restore_clock_caption_metadata(wp_unslash($content), $frame['captions']));
}
foreach (array('content_save_pre', 'excerpt_save_pre', 'content_filtered_save_pre') as $sdcw_save_filter) {
    add_filter($sdcw_save_filter, 'SDCW_prepare_clock_caption_entities_for_save', 8);
    add_filter($sdcw_save_filter, 'SDCW_restore_clock_caption_entities_after_save', 11);
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
        $content = SDCW_map_clock_blocks($content, function ($attributes, $html) use (&$captions) {
            $caption = isset($attributes->caption) && is_string($attributes->caption) ? $attributes->caption : null;
            $captions[] = array(
                'html' => hash('sha256', $html),
                'caption' => $caption,
            );
            // Older Core corrupts escaped backslashes while reserializing JSON.
            // Restore this plain-text field after that pass only if HTML is unchanged.
            if (null !== $caption && false !== strpos($caption, '\\') && (!isset($GLOBALS['wp_kses_operating_mode']) || 'html-api' !== $GLOBALS['wp_kses_operating_mode'])) {
                unset($attributes->caption);
            }
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
    if (!isset($GLOBALS['wp_kses_operating_mode']) || 'html-api' !== $GLOBALS['wp_kses_operating_mode']) {
        $index = 0;
        $content = SDCW_map_clock_blocks($content, function ($attributes, $html) use ($captions, &$index) {
            $original = isset($captions[$index]) ? $captions[$index] : null;
            $index++;
            if (null !== $original && null !== $original['caption'] && $original['html'] === hash('sha256', $html)) {
                $attributes->caption = $original['caption'];
            }
        });
    }
    // JSON serialization escapes comment delimiters; actual HTML still runs KSES.
    return SDCW_sync_clock_content_metadata($content);
}
add_filter('pre_kses', 'SDCW_preserve_clock_metadata_for_kses', 11, 2);
// Run after normal policies; modern Core processes block JSON after this hook.
add_filter('pre_kses', 'SDCW_protect_scoped_clock_caption_metadata', PHP_INT_MAX);

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
 * Sanitize clock HTML with the site's Core parser, retaining only caption JSON.
 */
function SDCW_sanitize_clock_post_html($html) {
    $prepared = SDCW_prepare_clock_caption_html($html);
    $frames =& SDCW_clock_save_caption_frames();
    $frames[] = array(
        'filter' => 'sdcw-sanitize',
        'depth' => count(SDCW_clock_kses_frames()),
        'protected' => false,
        'captions' => array(),
        'enabled' => true,
    );
    try {
        $filtered = wp_kses_post($prepared);
    } finally {
        $frame = array_pop($frames);
    }
    return SDCW_encode_clock_caption_html(SDCW_restore_clock_caption_metadata($filtered, $frame['captions']));
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
    $instance['content'] = SDCW_sanitize_clock_post_html($new_instance['content']);
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
    foreach (array('post_content', 'post_excerpt', 'post_content_filtered') as $field) {
        if (!isset($data[$field]) || !is_string($data[$field])) {
            continue;
        }
        $content = wp_unslash($data[$field]);
        $updated = 'post_content' === $field ? SDCW_sync_clock_content_metadata($content) : SDCW_map_clock_blocks($content, function () {});
        if ($updated !== $content) {
            $data[$field] = wp_slash($updated);
        }
    }
    return $data;
}
add_filter('wp_insert_post_data', 'SDCW_preserve_clock_post_metadata');
