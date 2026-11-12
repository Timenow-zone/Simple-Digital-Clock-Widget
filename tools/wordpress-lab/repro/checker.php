<?php
// Observe the pinned checker's real selection without replacing or filtering checks.
if (!defined('WP_CLI') || !WP_CLI) { throw new RuntimeException('WP-CLI is required'); }
WP_CLI::add_hook('after_wp_load', function () {
    $runner = \WordPress\Plugin_Check\Utilities\Plugin_Request_Utility::get_runner();
    if (!$runner) { throw new RuntimeException('Missing early Plugin Check bootstrap'); }
    $selection = array('static' => array(), 'runtime' => array());
    foreach ($runner->get_checks_to_run() as $slug => $check) {
        $kind = $check instanceof \WordPress\Plugin_Check\Checker\Runtime_Check ? 'runtime' : 'static';
        $selection[$kind][] = $slug;
    }
    fwrite(STDERR, 'SDCW_CHECK_SELECTION ' . json_encode($selection) . "\n");
});
