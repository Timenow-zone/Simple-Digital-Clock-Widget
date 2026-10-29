<?php
// Establish the normal Core behavior without loading either plugin candidate.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab' || function_exists('SDCW_clock_kses_frames')) {
    throw new RuntimeException('This control requires the Clock lab with --skip-plugins=simple-digital-clock.');
}
$rows = array();
foreach (array('&#13;', '&#xD;', '&amp;#13;', '&amp;#34;', '&amp;#x1F552;') as $value) {
    $input = '<p title="' . $value . '">Core control</p>';
    $rows[] = array('value' => $value, 'normalized' => wp_kses_normalize_entities($value), 'input' => $input, 'output' => wp_kses_post($input));
}
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'kses_file' => (new ReflectionFunction('wp_kses_normalize_entities'))->getFileName(), 'controls' => $rows)) . "\n";
