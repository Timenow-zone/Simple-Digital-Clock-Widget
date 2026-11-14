<?php
// Gettext and registration doubles; the disposable Core lab verifies browser output.
define('ABSPATH', __DIR__);
define('WEEK_IN_SECONDS', 604800);
$GLOBALS['localized'] = array();
$GLOBALS['options_page'] = array();

class WP_Block_Parser {}
class WP_HTML_Tag_Processor {
    public function __construct() { throw new RuntimeException('The i18n unit test must not execute KSES'); }
}
function add_action() {}
function add_filter() {}
function plugin_dir_path($file) { return dirname($file) . '/'; }
function plugin_dir_url($file) { return 'https://fixture.invalid/plugin/'; }
function plugins_url($path, $file) { return plugin_dir_url($file) . $path; }
function get_locale() { return 'uk'; }
function wp_register_script() {}
function register_block_type() {}
function wp_localize_script($handle, $name, $data) { $GLOBALS['localized'][$name] = $data; }
function add_options_page($title, $menu) { $GLOBALS['options_page'] = array($title, $menu); }
function get_current_screen() { return (object) array('id' => 'settings_page_simple-digital-clock'); }
function get_current_user_id() { return 1; }
function get_user_meta() { return false; }
function __($text, $domain) {
    if ($domain !== 'simple-digital-clock') {
        throw new RuntimeException('Unexpected translation domain: ' . $domain);
    }
    return 'Переклад [' . $text . '] </script><img src=x onerror="alert(1)"> & "цитата" \'апостроф\'';
}
function esc_html($value) { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8', false); }
function esc_attr($value) { return esc_html($value); }
function esc_url($value) { return esc_attr($value); }
function esc_html__($text, $domain) { return esc_html(__($text, $domain)); }
function esc_attr__($text, $domain) { return esc_attr(__($text, $domain)); }

require $argv[1] . '/widget_init.php';
SDCW_block_register_block();
SDCW_digital_clock_widget::get_instance()->SDCW_add_plugin_page();
ob_start();
SDCW_Admin_Notices::get_instance()->simple_digital_clock_admin_notice();
$notice = ob_get_clean();

// Tokenization avoids matching commented examples and supports multiline calls.
function source_calls($directory) {
    $calls = array();
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if ($file->getExtension() !== 'php') { continue; }
        $tokens = array_values(array_filter(token_get_all(file_get_contents($file->getPathname())), function ($token) {
            return !is_array($token) || !in_array($token[0], array(T_WHITESPACE, T_COMMENT, T_DOC_COMMENT), true);
        }));
        foreach ($tokens as $index => $token) {
            if (!is_array($token) || $token[0] !== T_STRING || !in_array($token[1], array('__', '_e', 'esc_html__', 'esc_attr__', 'esc_html_e', 'esc_attr_e', '_x', '_ex', 'esc_html_x', 'esc_attr_x', '_n', '_nx', 'esc_html', 'esc_attr'), true) || !isset($tokens[$index + 1]) || $tokens[$index + 1] !== '(') { continue; }
            $args = array(array());
            $depth = 0;
            for ($i = $index + 2; $i < count($tokens); ++$i) {
                $current = $tokens[$i];
                if ($current === ')' && $depth === 0) { break; }
                if ($current === ',' && $depth === 0) { $args[] = array(); continue; }
                if (in_array($current, array('(', '['), true)) { ++$depth; }
                if (in_array($current, array(')', ']'), true)) { --$depth; }
                $args[count($args) - 1][] = $current;
            }
            $values = array_map(function ($argument) {
                if (count($argument) !== 1 || !is_array($argument[0]) || $argument[0][0] !== T_CONSTANT_ENCAPSED_STRING) { return null; }
                $literal = $argument[0][1];
                $content = substr($literal, 1, -1);
                return $literal[0] === "'" ? str_replace(array("\\'", "\\\\"), array("'", "\\"), $content) : stripcslashes($content);
            }, $args);
            $calls[] = array('function' => $token[1], 'arguments' => $values, 'file' => substr($file->getPathname(), strlen($directory) + 1), 'line' => $token[2]);
        }
    }
    return $calls;
}

echo json_encode(array(
    'dictionary' => $GLOBALS['localized']['blockData']['i18n'],
    'options_page' => $GLOBALS['options_page'],
    'notice' => $notice,
    'calls' => source_calls($argv[1]),
), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), "\n";
