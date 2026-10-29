<?php
// Distinguish the actual Core save callback from earlier unrelated KSES calls.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('This test requires the isolated Clock lab.');
}
wp_set_current_user(get_user_by('login', 'clock_patch_author')->ID);
kses_init();
$block = function ($caption) {
    return get_comment_delimited_block_content('simple-digital-clock-block/widget-block', array('caption' => $caption, 'timeZone' => 'UTC'), '<timenow-zone-sdcw caption="' . esc_attr($caption) . '" time-zone="UTC"></timenow-zone-sdcw>');
};
$checks = array();
$probe = $block('<foreign> &lt;');
add_filter('sdcw_lab_other_save', 'wp_filter_post_kses');
foreach (array('direct', 'slashed', 'other-hook') as $kind) {
    $sanitize = function ($value) use ($kind) {
        if ($kind === 'direct') {
            return wp_kses_post($value);
        }
        return wp_unslash($kind === 'slashed' ? wp_filter_post_kses(wp_slash($value)) : apply_filters('sdcw_lab_other_save', wp_slash($value)));
    };
    $expected = $sanitize($probe);
    $nested = null;
    $callback = function ($value) use (&$nested, $sanitize, $probe) { $nested = $sanitize($probe); return $value; };
    add_filter('content_save_pre', $callback, 9);
    try {
        $saved = wp_unslash(apply_filters('content_save_pre', wp_slash($block('<outer> &amp;'))));
    } finally {
        remove_filter('content_save_pre', $callback, 9);
    }
    $checks[] = array('name' => $kind . ': unrelated KSES output follows exact Core policy', 'passed' => $nested === $expected);
    $checks[] = array('name' => $kind . ': outer save retains its original caption', 'passed' => parse_blocks($saved)[0]['attrs']['caption'] === '<outer> &amp;');
    $checks[] = array('name' => $kind . ': no temporary caption marker escapes', 'passed' => false === strpos($nested . $saved, 'sdcw-caption-token-'));
}
remove_filter('sdcw_lab_other_save', 'wp_filter_post_kses');
foreach (array(1, 5, 10, 20, PHP_INT_MAX - 1) as $priority) {
    foreach (array('post', 'helper') as $path) {
        $expected = wp_kses_post($probe);
        $nested = null;
        $inside = false;
        $callback = function ($value) use (&$nested, &$inside, $probe) {
            if (!$inside && false !== strpos($value, 'wp:simple-digital-clock-block/widget-block')) {
                $inside = true;
                $nested = wp_kses_post($probe);
                $inside = false;
            }
            return $value;
        };
        add_filter('pre_kses', $callback, $priority);
        try {
            $saved = $path === 'post' ? wp_unslash(apply_filters('content_save_pre', wp_slash($block('<outer> &amp;')))) : SDCW_sanitize_clock_post_html($block('<outer> &amp;'));
        } finally {
            remove_filter('pre_kses', $callback, $priority);
        }
        $checks[] = array('name' => $path . '/' . $priority . ': nested KSES remains native', 'passed' => $nested === $expected);
        $checks[] = array('name' => $path . '/' . $priority . ': outer caption retained', 'passed' => parse_blocks($saved)[0]['attrs']['caption'] === '<outer> &amp;');
        $checks[] = array('name' => $path . '/' . $priority . ': no marker escapes', 'passed' => false === strpos($nested . $saved, 'sdcw-caption-token-'));
    }
}
foreach (array('post', 'helper') as $path) {
    $policy = function ($value) {
        return SDCW_map_clock_blocks($value, function ($attributes) { $attributes->caption .= ' policy'; });
    };
    add_filter('pre_kses', $policy, 20);
    try {
        $saved = $path === 'post' ? wp_unslash(apply_filters('content_save_pre', wp_slash($block('<outer> &amp;')))) : SDCW_sanitize_clock_post_html($block('<outer> &amp;'));
    } finally {
        remove_filter('pre_kses', $policy, 20);
    }
    $checks[] = array('name' => $path . ': late caption policy runs on real text', 'passed' => parse_blocks($saved)[0]['attrs']['caption'] === '<outer> &amp; policy' && false === strpos($saved, 'sdcw-caption-token-'));
}
$checks[] = array('name' => 'All Core and owned frames are balanced', 'passed' => SDCW_clock_kses_frames() === array() && SDCW_clock_save_caption_frames() === array());
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo wp_json_encode(array('wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'checks' => $checks, 'failed' => $failed)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
