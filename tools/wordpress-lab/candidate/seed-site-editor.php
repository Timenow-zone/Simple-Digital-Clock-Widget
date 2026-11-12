<?php
require __DIR__ . '/guard.php';
if (!defined('WP_CLI')) {
    throw new RuntimeException('WP-CLI is required');
}
switch_theme('twentytwentythree');
echo json_encode(array('theme' => get_stylesheet(), 'block_theme' => wp_is_block_theme(), 'template' => 'twentytwentythree//home'), JSON_PRETTY_PRINT), "\n";
