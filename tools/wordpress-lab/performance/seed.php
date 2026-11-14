<?php
// Only create fresh anonymous fixtures in the disposable benchmark database.
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local' ||
    get_option('blogname') !== 'SDCW reproducible release lab' || get_option('sdcw_bench_pages')) {
    throw new RuntimeException('Fresh disposable benchmark required');
}
wp_set_current_user(get_user_by('login', 'lab_admin')->ID);
$paragraph = '<p>Local benchmark paragraph with ordinary text and <strong>formatting</strong>. Identical content is used for every plugin variant. No remote images or services.</p>';
$clock = '<!-- wp:simple-digital-clock-block/widget-block {"caption":"Benchmark","second":true,"width":180} --><timenow-zone-sdcw class="wp-block-simple-digital-clock-block-widget-block" caption="Benchmark" second width="180"></timenow-zone-sdcw><!-- /wp:simple-digital-clock-block/widget-block -->';
$rows = array();
foreach (array(64, 512, 2048) as $kib) {
    $body = str_repeat($paragraph, (int) ceil($kib * 1024 / strlen($paragraph)));
    foreach (array(0, 1, 5) as $count) {
        // Clocks at the end exercise the full preceding tokenizer scan.
        $content = '<!-- wp:html -->' . $body . '<!-- /wp:html -->' . str_repeat($clock, $count);
        $id = wp_insert_post(array('post_type' => 'page', 'post_status' => 'publish',
            'post_title' => 'Benchmark ' . $kib . ' KiB / ' . $count . ' clocks',
            'post_content' => $content), true);
        if (is_wp_error($id)) { throw new RuntimeException($id->get_error_message()); }
        update_post_meta($id, '_sdcw_bench_clocks', $count);
        $rows[] = array('id' => $id, 'body_kib' => $kib, 'clocks' => $count,
            'content_bytes' => strlen($content), 'content_sha256' => hash('sha256', $content));
    }
}
update_option('blog_public', 0);
update_option('active_plugins', array());
update_option('sdcw_bench_pages', $rows, false);
echo wp_json_encode($rows), "\n";
