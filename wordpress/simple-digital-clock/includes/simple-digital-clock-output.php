<?php
// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Incremental HTML token observer. It retains lexical state, never response data.
 * The supported input is server-rendered HTML, with scripting enabled. This is
 * not a sanitizer or a replacement for a browser's HTML tree builder.
 */
class SDCW_Clock_Output_Observer {
    private $state = 'data';
    private $name = '';
    private $closing = false;
    private $raw = '';
    private $raw_escape = 0;
    private $tail = '';
    private $templates = 0;
    private $select = false;
    private $found = false;

    private function letter($char) {
        return ($char >= 'A' && $char <= 'Z') || ($char >= 'a' && $char <= 'z');
    }

    private function finish_tag() {
        $this->state = 'data';
        if ($this->raw) {
            $this->raw = '';
            $this->raw_escape = 0;
            return false;
        }
        if ($this->name === 'template') {
            $this->templates = max(0, $this->templates + ($this->closing ? -1 : 1));
        } elseif ($this->name === 'select') {
            $this->select = !$this->closing;
        } elseif (!$this->closing) {
            if ($this->name === 'timenow-zone-sdcw' && !$this->templates && !$this->select) {
                $this->found = true;
                return true;
            }
            if ($this->name === 'plaintext' && !$this->select) {
                $this->state = 'plaintext';
            } elseif (($this->name === 'script' || !$this->select) && in_array($this->name, array('script', 'style', 'textarea', 'title', 'iframe', 'xmp', 'noscript', 'noembed', 'noframes'), true)) {
                // SCRIPT is a script-supporting element even inside SELECT.
                $this->raw = $this->name;
                $this->state = 'raw';
                $this->tail = '';
            }
        }
        return false;
    }

    public function has_clock() {
        return $this->found;
    }

    /** Observe a chunk; optionally return a safe insertion offset after a clock. */
    public function feed($html, $insert = false) {
        if ( $this->state === 'plaintext') {
            return null;
        }
        $length = strlen($html);
        for ($i = 0; $i < $length;) {
            if ($insert && $this->found && $this->state === 'data' && !$this->templates && !$this->select) { return $i; }
            $char = $html[$i];
            switch ($this->state) {
                case 'data':
                    // Skip batches of ordinary, complete markup in PCRE's native
                    // loop. A bounded repetition limits backtracking stack use.
                    // Interesting or incomplete tokens use the incremental states.
                    $ordinary = '~\G(?:[^<]+|</?(?!(?:timenow-zone-sdcw|template|select|script|style|textarea|title|iframe|xmp|noscript|noembed|noframes|plaintext)(?=[\t\n\f\r />]))[a-z][a-z0-9:-]*(?:[\t\n\f\r ]+[a-z_:][a-z0-9_:.-]*(?:[\t\n\f\r ]*=[\t\n\f\r ]*(?:"[^"]*"|\'[^\']*\'|[^\t\n\f\r "\'=<>`]+))?)*[\t\n\f\r ]*/?>){1,64}~i';
                    $matched = preg_match($ordinary, substr($html, $i, 8192), $match);
                    if ($matched === 1) { $i += strlen($match[0]); break; }
                    $i += strcspn($html, '<', $i);
                    if ($i < $length) { $this->state = 'open'; ++$i; }
                    break;
                case 'open':
                    $this->closing = false;
                    $this->name = '';
                    if ($char === '/') { $this->closing = true; $this->state = 'close'; ++$i; }
                    elseif ($char === '!') { $this->state = 'bang'; $this->tail = ''; ++$i; }
                    elseif ($char === '?') { $this->state = 'bogus'; ++$i; }
                    elseif ($this->letter($char)) { $this->state = 'name'; }
                    else { $this->state = 'data'; }
                    break;
                case 'close':
                    $this->state = $this->letter($char) ? 'name' : ($char === '>' ? 'data' : 'bogus');
                    if ($char === '>') { ++$i; }
                    break;
                case 'name':
                    $count = strcspn($html, "\t\n\f\r />", $i);
                    // Names longer than any interesting tag cannot become a match.
                    $this->name .= strtolower(substr($html, $i, min($count, max(0, 32 - strlen($this->name)))));
                    $i += $count;
                    if ($i < $length) { $this->state = 'before-attribute'; }
                    break;
                case 'before-attribute':
                case 'after-attribute':
                    if (strpos("\t\n\f\r /", $char) !== false) { ++$i; }
                    elseif ($char === '>') {
                        ++$i;
                        if ($this->finish_tag() && $insert) { return $i; }
                    } elseif ($char === '=' && $this->state === 'after-attribute') {
                        $this->state = 'before-value'; ++$i;
                    } else { $this->state = 'attribute'; }
                    break;
                case 'attribute':
                    // Quotes in attribute names are ordinary parse-error characters.
                    $i += strcspn($html, "\t\n\f\r /=>", $i);
                    if ($i < $length) {
                        if ($html[$i] === '=') { $this->state = 'before-value'; ++$i; }
                        else { $this->state = 'after-attribute'; }
                    }
                    break;
                case 'before-value':
                    if (strpos("\t\n\f\r ", $char) !== false) { ++$i; }
                    elseif ($char === '"' || $char === "'") { $this->state = $char; ++$i; }
                    elseif ($char === '>') { $this->state = 'before-attribute'; }
                    else { $this->state = 'unquoted'; }
                    break;
                case '"':
                case "'":
                    $end = strpos($html, $this->state, $i);
                    if ($end === false) { $i = $length; }
                    else { $i = $end + 1; $this->state = 'before-attribute'; }
                    break;
                case 'unquoted':
                    $i += strcspn($html, "\t\n\f\r >", $i);
                    if ($i < $length) { $this->state = 'before-attribute'; }
                    break;
                case 'bang':
                    $this->tail .= $char; ++$i;
                    if ($this->tail === '--') { $this->state = 'comment-start'; $this->tail = ''; }
                    elseif (strncasecmp('DOCTYPE', $this->tail, strlen($this->tail)) === 0) {
                        if (strlen($this->tail) === 7) { $this->state = 'declaration'; $this->tail = ''; }
                    } elseif ($this->tail !== '-') { $this->state = 'bogus'; --$i; }
                    break;
                case 'comment-start':
                    if ($char === '>') { $this->state = 'data'; ++$i; }
                    elseif ($char === '-') { $this->state = 'comment-start-dash'; ++$i; }
                    else { $this->state = 'comment'; }
                    break;
                case 'comment-start-dash':
                    if ($char === '>') { $this->state = 'data'; ++$i; }
                    else { $this->tail = '-'; $this->state = 'comment'; }
                    break;
                case 'comment':
                    // Only a three-byte suffix is needed across arbitrary writes.
                    if ($char === '>' && ($this->tail === '--' || $this->tail === '--!')) {
                        $this->state = 'data'; $this->tail = ''; ++$i;
                    } elseif ($char === '-' || $char === '!') {
                        $this->tail = substr($this->tail . $char, -3);
                        if (substr($this->tail, -2) === '--') { $this->tail = '--'; }
                        ++$i;
                    } else {
                        $this->tail = '';
                        $i += max(1, strcspn($html, '-!>', $i));
                    }
                    break;
                case 'bogus':
                    $end = strpos($html, '>', $i);
                    if ($end === false) { $i = $length; }
                    else { $i = $end + 1; $this->state = 'data'; }
                    break;
                case 'declaration':
                    if ($char === '"' || $char === "'") { $this->tail = $char; $this->state = 'declaration-quote'; ++$i; }
                    elseif ($char === '>') { $this->state = 'data'; ++$i; }
                    else { $i += max(1, strcspn($html, "\"'>", $i)); }
                    break;
                case 'declaration-quote':
                    $end = strpos($html, $this->tail, $i);
                    if ($end === false) { $i = $length; }
                    else { $i = $end + 1; $this->state = 'declaration'; }
                    break;
                case 'raw':
                    if ($char === '<') { $this->state = 'raw-open'; $this->name = ''; ++$i; }
                    elseif ($this->raw === 'script' && $this->raw_escape && $char === '-') {
                        $this->tail = substr($this->tail . '-', -2); ++$i;
                    } elseif ($this->raw === 'script' && $this->raw_escape && $char === '>' && $this->tail === '--') {
                        $this->raw_escape = 0; $this->tail = ''; ++$i;
                    } else {
                        $this->tail = '';
                        $i += max(1, strcspn($html, $this->raw === 'script' && $this->raw_escape ? '<->' : '<', $i));
                    }
                    break;
                case 'raw-open':
                    $this->closing = false;
                    if ($char === '/') { $this->closing = true; $this->state = 'raw-name'; ++$i; }
                    elseif ($this->raw === 'script' && !$this->raw_escape && $char === '!') { $this->state = 'script-comment'; $this->tail = ''; ++$i; }
                    elseif ($this->raw === 'script' && $this->raw_escape === 1 && $this->letter($char)) { $this->state = 'raw-name'; }
                    else { $this->state = 'raw'; $this->tail = ''; }
                    break;
                case 'script-comment':
                    if ($char === '-') {
                        $this->tail .= '-'; ++$i;
                        if ($this->tail === '--') { $this->raw_escape = 1; $this->state = 'raw'; }
                    } else { $this->tail = ''; $this->state = 'raw'; }
                    break;
                case 'raw-name':
                    if ($this->letter($char)) {
                        if (strlen($this->name) < 32) { $this->name .= strtolower($char); }
                        ++$i;
                    } elseif (strpos("\t\n\f\r />", $char) !== false && $this->name === $this->raw) {
                        if ($this->raw === 'script' && ($this->raw_escape === 2 || !$this->closing)) {
                            $this->raw_escape = $this->closing ? 1 : 2;
                            $this->state = 'raw'; $this->tail = ''; ++$i;
                        } else { $this->state = 'before-attribute'; }
                    } else { $this->state = 'raw'; $this->tail = ''; }
                    break;
                case 'plaintext':
                    return null;
            }
        }
        // A closing raw/template token may finish exactly at a write boundary.
        // An empty final flush is also a valid insertion opportunity.
        return $insert && $this->found && $this->state === 'data' && !$this->templates && !$this->select ? $length : null;
    }
}
