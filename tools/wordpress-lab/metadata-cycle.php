<?php
// Exercise raw post data outside REST response normalization.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' || get_option('blogname') !== 'Clock isolated lab') {
    throw new RuntimeException('These tests require the isolated Clock lab.');
}
list($mode, $label, $site) = $args;
if (!in_array($mode, array('seed', 'save', 'read'), true) || !preg_match('/^[a-z0-9-]+$/', $label) || !in_array($site, array('wp71', 'wp84', 'wp63', 'wp68'), true)) {
    throw new RuntimeException('Invalid metadata cycle arguments.');
}
$expected_version = 'save' === $mode ? '1.1.2' : '1.1.1';
$header = get_file_data(WP_PLUGIN_DIR . '/simple-digital-clock/widget_init.php', array('version' => 'Version'));
if ($header['version'] !== $expected_version) {
    throw new RuntimeException('Unexpected plugin version for metadata cycle.');
}
wp_set_current_user(get_user_by('login', 'clock_lab_admin')->ID);
kses_init();
$checks = array();
$records = array();
if ('seed' === $mode) {
    $clock = json_decode(file_get_contents('/lab/packages/regression-fixtures.json'), true)['blocks'][0]['content'];
    $foreign = '<!-- wp:vendor/review { "options" : {"0":"one","1":"two"}, "empty":{} } --><div>one,two</div><!-- /wp:vendor/review -->';
    $unknown = str_replace('<!-- wp:simple-digital-clock-block/widget-block -->', '<!-- wp:simple-digital-clock-block/widget-block {"unknown":{"0":"one","1":"two"},"empty":{},"items":[]} -->', $clock);
    $cases = array(
        'clock-before' => $clock . "\n\n" . $foreign,
        'clock-after' => $foreign . "\n\n" . $clock,
        'nested-group' => '<!-- wp:group --><div class="wp-block-group">' . $foreign . $clock . '</div><!-- /wp:group -->',
        'unknown-clock-fields' => $foreign . "\n\n" . $unknown,
    );
    foreach ($cases as $name => $content) {
        $id = wp_insert_post(array('post_title' => 'Clock raw metadata cycle ' . $name, 'post_status' => 'draft', 'post_content' => wp_slash($content)), true);
        if (is_wp_error($id) || get_post($id)->post_content !== $content) {
            throw new RuntimeException('Official 1.1.1 did not preserve seed data.');
        }
        $records[] = array('id' => $id, 'name' => $name, 'content' => $content, 'foreign' => $foreign);
        $checks[] = array('name' => $name . ': baseline content unchanged', 'passed' => true);
    }
} else {
    $all = json_decode(file_get_contents('/lab/packages/' . $label . '-metadata-seed.json'), true);
    $seed = array_values(array_filter($all, function ($row) use ($site) { return $row['service'] === $site; }))[0]['records'];
    $saved = null;
    if ('read' === $mode) {
        $all_saved = json_decode(file_get_contents('/lab/packages/' . $label . '-metadata-save.json'), true);
        $saved = array_values(array_filter($all_saved, function ($row) use ($site) { return $row['service'] === $site; }))[0]['records'];
    }
    foreach ($seed as $index => $record) {
        $id = $record['id'];
        if ('save' === $mode) {
            if (get_post($id)->post_content !== $record['content']) {
                throw new RuntimeException('Original metadata record changed before upgrade.');
            }
            $updated = wp_update_post(array('ID' => $id, 'post_title' => 'Clock raw title-only update'), true);
            $checks[] = array('name' => $record['name'] . ': same existing ID', 'passed' => !is_wp_error($updated) && $updated === $id);
        }
        $content = get_post($id)->post_content;
        $checks[] = array('name' => $record['name'] . ': foreign block bytes retained', 'passed' => false !== strpos($content, $record['foreign']));
        if ('save' === $mode) {
            $updated = wp_update_post(array('ID' => $id, 'post_content' => wp_slash($content)), true);
            $checks[] = array('name' => $record['name'] . ': explicit resave stable', 'passed' => !is_wp_error($updated) && get_post($id)->post_content === $content);
            preg_match('/<!-- wp:simple-digital-clock-block\/widget-block (.*?) -->/s', $content, $match);
            $attributes = json_decode($match[1]);
            $checks[] = array('name' => $record['name'] . ': legacy timezone explicit', 'passed' => $attributes->timeZone === 'UTC');
            if ('unknown-clock-fields' === $record['name']) {
                $checks[] = array('name' => 'unknown clock fields retain object/array types', 'passed' => is_object($attributes->unknown) && is_object($attributes->empty) && is_array($attributes->items));
            }
        } else {
            $checks[] = array('name' => $record['name'] . ': rollback kept database content', 'passed' => $content === $saved[$index]['content']);
        }
        $records[] = array('id' => $id, 'name' => $record['name'], 'content' => $content, 'foreign' => $record['foreign']);
    }
}
$failed = count(array_filter($checks, function ($check) { return !$check['passed']; }));
echo wp_json_encode(array('service' => $site, 'plugin_version' => $header['version'], 'checks' => $checks, 'failed' => $failed, 'records' => $records)) . "\n";
WP_CLI::halt($failed ? 1 : 0);
