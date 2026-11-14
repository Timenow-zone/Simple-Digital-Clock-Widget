<?php
// Post-benchmark calibration endpoint, restricted by the lab's loopback listener.
if (isset($_GET['bootstrap']) && $_GET['bootstrap'] === '1') { require __DIR__ . '/wp-load.php'; }
function sdcw_calibration_sample() {
    return array('used' => memory_get_usage(false), 'allocated' => memory_get_usage(true),
        'peak_used' => memory_get_peak_usage(false), 'peak_allocated' => memory_get_peak_usage(true));
}
$before = sdcw_calibration_sample();
$allocation = str_repeat('x', 32 * 1024 * 1024);
$after = sdcw_calibration_sample();
$length = strlen($allocation);
unset($allocation);
$released = sdcw_calibration_sample();
header('Content-Type: application/json');
echo json_encode(array('php' => PHP_VERSION, 'bootstrap' => isset($_GET['bootstrap']) && $_GET['bootstrap'] === '1',
    'length' => $length, 'before' => $before, 'after' => $after, 'released' => $released));
