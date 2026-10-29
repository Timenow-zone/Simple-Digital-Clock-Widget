<?php
require_once '/wordpress/wp-load.php';
require_once WPMU_PLUGIN_DIR . '/sdc-preview/clock.php';

// This setup runs only in the disposable Playground, outside the plugin ZIP.
wp_set_current_user( 1 );
if ( ! current_user_can( 'unfiltered_html' ) || ! wp_get_theme()->is_block_theme() ) {
    throw new RuntimeException( 'The preview requires an administrator and a block theme.' );
}

$configuration = <<<'SDC_CONFIG'
/* SDC_PREVIEW_CONFIG */
SDC_CONFIG;
$config = json_decode( $configuration, true );
if ( ! is_array( $config ) || JSON_ERROR_NONE !== json_last_error() ) {
    throw new RuntimeException( 'Invalid preview configuration.' );
}

$existing_page = get_page_by_path( 'simple-digital-clock-demo', OBJECT, 'page' );
$page_data = array(
    'post_title' => 'Build your clock — Simple Digital Clock',
    'post_name' => 'simple-digital-clock-demo',
    'post_status' => 'publish', 'post_type' => 'page', 'post_author' => 1,
);
if ( $existing_page ) {
    $page_data['ID'] = $existing_page->ID;
}
$page_id = wp_insert_post( wp_slash( $page_data ), true );
if ( is_wp_error( $page_id ) ) {
    throw new RuntimeException( $page_id->get_error_message() );
}
$config['postId'] = (int) $page_id;
update_option( 'sdc_preview_config', $config, false );
$clock = $config['presets'][0]['clock'];
$clock['locale'] = 'uk';
$edit_url = esc_url( admin_url( 'post.php?post=' . $page_id . '&action=edit' ) );

$content = <<<'HTML'
<!-- wp:html -->
<style>
/* SDC_PREVIEW_CSS */
</style>
<header class="sdc-demo-header"><a class="sdc-brand" href="#sdc-preview-builder"><span class="sdc-brand-icon" aria-hidden="true">12:34</span>Simple Digital Clock</a><span class="sdc-header-note">Free WordPress plugin</span></header>
<div class="sdc-demo-intro"><p class="sdc-eyebrow">A SMALL BLOCK. A PERSONAL TOUCH.</p><h1>A clock that feels like yours.</h1><p>Pick a look. Find your city. Watch it come to life.</p></div>
<ol class="sdc-steps" aria-label="Build your clock"><li data-sdc-step="1" data-state="current"><span>1</span>Choose a style</li><li data-sdc-step="2" data-state="pending"><span>2</span>Set your city</li><li data-sdc-step="3" data-state="pending"><span>3</span>See it live</li><li data-sdc-step="4" data-state="pending"><span>4</span>Add to WordPress</li></ol>
<!-- /wp:html -->
<!-- wp:group {"anchor":"sdc-preview-builder","className":"sdc-preview-workspace"} -->
<div id="sdc-preview-builder" class="wp-block-group sdc-preview-workspace">
<!-- wp:columns {"className":"sdc-builder-columns"} -->
<div class="wp-block-columns sdc-builder-columns">
<!-- wp:column {"className":"sdc-preview-controls"} -->
<div class="wp-block-column sdc-preview-controls">
<!-- wp:html -->
<form id="sdc-preview-form" novalidate>
  <fieldset id="sdc-builder-fields" disabled>
    <legend class="sdc-visually-hidden">Customize your clock</legend>
    <div class="sdc-control-heading"><span class="sdc-step-number">1</span><h2>Choose your look</h2></div>
    <div class="sdc-style-options" role="group" aria-label="Clock style">
      <button type="button" data-sdc-preset="classic" aria-pressed="true"><span class="sdc-style-swatch sdc-swatch-classic" aria-hidden="true">12:34</span><span>Classic</span></button>
      <button type="button" data-sdc-preset="minimal" aria-pressed="false"><span class="sdc-style-swatch sdc-swatch-minimal" aria-hidden="true">12:34</span><span>Minimal</span></button>
      <button type="button" data-sdc-preset="bold" aria-pressed="false"><span class="sdc-style-swatch sdc-swatch-bold" aria-hidden="true">12:34</span><span>Bold</span></button>
    </div>
    <div class="sdc-control-heading sdc-city-heading"><span class="sdc-step-number">2</span><span>Make it local</span></div>
    <label class="sdc-visually-hidden" for="sdc-city">City</label>
    <input id="sdc-city" name="city" type="text" value="Kyiv" list="sdc-city-options" autocomplete="off" spellcheck="false" maxlength="100" placeholder="Search a city or enter a time zone" aria-describedby="sdc-city-hint sdc-city-error">
    <datalist id="sdc-city-options"></datalist>
    <p id="sdc-city-hint" class="sdc-field-hint">Choose a city, or enter a time zone such as Europe/Kyiv.</p>
    <p id="sdc-city-error" class="sdc-error" role="alert" hidden></p>
    <div class="sdc-display-options"><label><input type="checkbox" name="show-date" checked>Show date</label><label><input type="checkbox" name="use-24-hour" checked>24-hour time</label></div>
    <button id="sdc-show-clock" class="sdc-primary-button" type="submit" disabled>Show my clock <span aria-hidden="true">→</span></button>
  </fieldset>
</form>
<noscript><p>This preview needs JavaScript to show and customize the clock. <a href="https://wordpress.org/plugins/simple-digital-clock/">View the plugin on WordPress.org</a>.</p></noscript>
<!-- /wp:html -->
</div>
<!-- /wp:column -->
<!-- wp:column {"className":"sdc-preview-result"} -->
<div class="wp-block-column sdc-preview-result">
<!-- wp:html -->
<div class="sdc-result-heading"><span class="sdc-live-indicator"><span aria-hidden="true"></span>LIVE PREVIEW</span><button id="sdc-preview-reset" type="button">Reset</button></div>
<div class="sdc-result-stage-title"><h2 id="sdc-result-city">Kyiv</h2><span id="sdc-result-timezone">Europe/Kyiv</span></div>
<!-- /wp:html -->
<!-- wp:group {"className":"sdc-live-result"} -->
<div class="wp-block-group sdc-live-result">
HTML;
$content .= "\n" . sdc_clock_block( $clock ) . "\n";
$content .= <<<'HTML'
</div>
<!-- /wp:group -->
<!-- wp:html -->
<div class="sdc-result-meta"><span id="sdc-result-style">Classic</span><span>Real plugin block · Live device time</span></div>
<p id="sdc-result-status" class="sdc-result-status" role="status" aria-live="polite">Your clock is running. Try a style or choose another city.</p>
<a id="sdc-install-toggle" class="sdc-install-button" href="#sdc-install" aria-expanded="false" aria-controls="sdc-install">Add this clock to my site <span aria-hidden="true">→</span></a>
<a id="sdc-editor-link" class="sdc-editor-link" href="SDC_EDIT_URL">Try these settings in the WordPress editor ↗</a>
<p id="sdc-editor-error" class="sdc-error" role="alert" hidden></p>
<!-- /wp:html -->
</div>
<!-- /wp:column -->
</div>
<!-- /wp:columns -->
</div>
<!-- /wp:group -->
<!-- wp:html -->
<section id="sdc-install" class="sdc-install-panel" aria-labelledby="sdc-install-title" hidden>
  <div><p class="sdc-eyebrow">READY FOR YOUR OWN WEBSITE?</p><h2 id="sdc-install-title" tabindex="-1">Your clock. On your WordPress site.</h2><p>The plugin is already active in this temporary demo. Here is how to add it to your own site.</p></div>
  <ol><li><strong>Install the free plugin.</strong><span>In your WordPress dashboard, open Plugins → Add New. Search for “Simple Digital Clock”, then Install and Activate.</span></li><li><strong>Add one block.</strong><span>Open a page or the Widgets editor. Insert the “Simple Digital Clock” block.</span></li><li><strong>Make it yours.</strong><span>Choose the same time zone and style in the Block settings. Save and publish when you are ready.</span></li></ol>
  <a class="sdc-primary-button" href="https://wordpress.org/plugins/simple-digital-clock/" target="_blank" rel="noopener noreferrer">Get Simple Digital Clock — free ↗</a>
  <p class="sdc-install-note">This demo does not install anything on your website. Each clock has independent settings.</p>
</section>
<ul class="sdc-proof-points" aria-label="Plugin benefits"><li>One Gutenberg block</li><li>Independent time zones</li><li>Local dates &amp; AM/PM</li><li>No ads. No paid upgrade.</li></ul>
<p class="sdc-demo-footnote">Time comes from the visitor’s device. City selection sets the time zone; it does not locate the visitor. Changes stay in this temporary demo.</p>
<!-- /wp:html -->
HTML;
$content = str_replace( 'SDC_EDIT_URL', $edit_url, $content );
$page_data['ID'] = $page_id;
$page_data['post_content'] = $content;
$result = wp_update_post( wp_slash( $page_data ), true );
if ( is_wp_error( $result ) ) {
    throw new RuntimeException( $result->get_error_message() );
}

$theme = get_stylesheet();
$templates = get_posts( array(
    'post_type' => 'wp_template', 'name' => 'page', 'posts_per_page' => 1,
    'tax_query' => array( array( 'taxonomy' => 'wp_theme', 'field' => 'name', 'terms' => $theme ) ),
) );
$template_data = array(
    'post_type' => 'wp_template', 'post_name' => 'page', 'post_title' => 'Clock preview',
    'post_status' => 'publish',
    'post_content' => '<!-- wp:group {"tagName":"main","layout":{"type":"default"}} --><main class="wp-block-group"><!-- wp:post-content {"layout":{"type":"default"}} /--></main><!-- /wp:group -->',
    'tax_input' => array( 'wp_theme' => array( $theme ) ),
);
if ( $templates ) {
    $template_data['ID'] = $templates[0]->ID;
}
$template_id = wp_insert_post( $template_data, true );
if ( is_wp_error( $template_id ) ) {
    throw new RuntimeException( $template_id->get_error_message() );
}
update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $page_id );
update_option( 'blogname', 'Simple Digital Clock Demo' );
update_option( 'blogdescription', 'Choose a clock. Make it yours.' );
update_user_meta( 1, 'show_admin_bar_front', 'false' );
update_user_meta( 1, 'show_welcome_panel', 0 );
update_user_meta( 1, 'simple_digital_clock_hide_notice', time() );
global $wpdb;
update_user_meta( 1, $wpdb->get_blog_prefix() . 'persisted_preferences', array(
    'core/edit-post' => array( 'welcomeGuide' => false ),
) );
