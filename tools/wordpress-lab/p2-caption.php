<?php
// Exercise caption normalization independently of legacy entity decoders.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These tests require the isolated Clock lab.');
}
$checks = array();
$cases = array(
    'apostrophe entity' => array('<timenow-zone-sdcw caption="&apos; <clock&gt;"></timenow-zone-sdcw>', '<timenow-zone-sdcw caption="&apos; &lt;clock&gt;"></timenow-zone-sdcw>'),
    'literal apostrophe entity' => array('<timenow-zone-sdcw caption="&amp;apos; <clock&gt;"></timenow-zone-sdcw>', '<timenow-zone-sdcw caption="&amp;apos; &lt;clock&gt;"></timenow-zone-sdcw>'),
    'multiple entity layers' => array('<timenow-zone-sdcw caption="&amp;amp;apos; <clock>"></timenow-zone-sdcw>', '<timenow-zone-sdcw caption="&amp;amp;apos; &lt;clock&gt;"></timenow-zone-sdcw>'),
    'already escaped' => array('<timenow-zone-sdcw caption="&apos; &lt;clock&gt;"></timenow-zone-sdcw>', '<timenow-zone-sdcw caption="&apos; &lt;clock&gt;"></timenow-zone-sdcw>'),
    'single quotes' => array("<timenow-zone-sdcw caption='&apos; <clock>'></timenow-zone-sdcw>", "<timenow-zone-sdcw caption='&apos; &lt;clock&gt;'></timenow-zone-sdcw>"),
    'mixed casing and spacing' => array('<TIMENOW-ZONE-SDCW CAPTION = "x <clock>" width="200"></TIMENOW-ZONE-SDCW>', '<TIMENOW-ZONE-SDCW CAPTION = "x &lt;clock&gt;" width="200"></TIMENOW-ZONE-SDCW>'),
    'unrelated attribute' => array('<timenow-zone-sdcw data-text="<untouched>" caption="<clock>"></timenow-zone-sdcw>', '<timenow-zone-sdcw data-text="<untouched>" caption="&lt;clock&gt;"></timenow-zone-sdcw>'),
    'unicode offsets' => array('Київ 🕒<timenow-zone-sdcw caption="<clock>"></timenow-zone-sdcw>', 'Київ 🕒<timenow-zone-sdcw caption="&lt;clock&gt;"></timenow-zone-sdcw>'),
    'valueless caption' => array('<timenow-zone-sdcw caption></timenow-zone-sdcw>', '<timenow-zone-sdcw caption></timenow-zone-sdcw>'),
    'missing caption' => array('<timenow-zone-sdcw width="200"></timenow-zone-sdcw>', '<timenow-zone-sdcw width="200"></timenow-zone-sdcw>'),
    'literal greater-than' => array('<timenow-zone-sdcw caption="x > y"></timenow-zone-sdcw>', '<timenow-zone-sdcw caption="x &gt; y"></timenow-zone-sdcw>'),
    'comment is not markup' => array('<!-- <timenow-zone-sdcw caption="<fake>"> -->', '<!-- <timenow-zone-sdcw caption="<fake>"> -->'),
    'foreign attribute is not markup' => array("<p title='<timenow-zone-sdcw caption=\"<fake>\">'>Text</p>", "<p title='<timenow-zone-sdcw caption=\"<fake>\">'>Text</p>"),
    'script text is not markup' => array('<script>var x=\'<timenow-zone-sdcw caption="<fake>">\';</script>', '<script>var x=\'<timenow-zone-sdcw caption="<fake>">\';</script>'),
);
$cases['many pending updates'] = array(str_repeat($cases['apostrophe entity'][0], 1001), str_repeat($cases['apostrophe entity'][1], 1001));
foreach ($cases as $name => $pair) {
    $actual = SDCW_prepare_clock_post_html($pair[0], 'post');
    SDCW_preserve_clock_metadata_for_kses($actual, 'post');
    $checks[] = array('name' => $name, 'passed' => $actual === $pair[1], 'details' => $actual === $pair[1] ? null : array('actual_sha256' => hash('sha256', $actual), 'expected_sha256' => hash('sha256', $pair[1])));
}
$unsafe = wp_kses_post('<timenow-zone-sdcw caption="<img src=x onerror=alert(1)>" onmouseover="alert(1)"></timenow-zone-sdcw>');
$processor = new WP_HTML_Tag_Processor($unsafe);
$processor->next_tag('TIMENOW-ZONE-SDCW');
$checks[] = array('name' => 'unsafe caption remains plain text', 'passed' => $processor->get_attribute('caption') === '<img src=x onerror=alert(1)>');
$checks[] = array('name' => 'actual unsafe attributes still removed', 'passed' => null === $processor->get_attribute('onmouseover') && false === strpos($unsafe, '<img'));
$checks[] = array('name' => 'KSES frames balanced', 'passed' => SDCW_clock_kses_frames() === array());
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'checks' => $checks, 'failed' => $failed)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
