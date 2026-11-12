<?php
require __DIR__ . '/guard.php';
if (!defined('WP_CLI') || !isset($args[0]) || !in_array($args[0], array('classic', 'block'), true)) {
    throw new RuntimeException('Explicit local classic or block theme mode is required');
}
$before = get_stylesheet();
$sidebars = wp_get_sidebars_widgets();
$theme = $args[0] === 'classic' ? 'twentytwentyone' : 'twentytwentythree';
switch_theme($theme);
wp_set_sidebars_widgets($sidebars);
echo json_encode(array('before' => $before, 'after' => get_stylesheet(), 'block_theme' => wp_is_block_theme(), 'sidebars_preserved' => wp_get_sidebars_widgets() === $sidebars), JSON_PRETTY_PRINT), "\n";
