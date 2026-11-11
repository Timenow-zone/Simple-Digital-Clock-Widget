<?php

/**
 * @version 1.1.6
 */

/*
Plugin Name: Simple Digital Clock 🕒
Plugin URI: https://utctime.info/
Description: It is 🪄 a magical and easy-to-use digital clock with a beautiful UI, supporting multiple languages, locales, dates, captions, and time zones.
Version: 1.1.6
Requires at least: 6.3
Requires PHP: 7.0
Author: UTCTime.info
Author URI: https://utctime.info/
License: GPLv2 or later
Text Domain: simple-digital-clock
Domain Path: /languages
*/

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}
// Exit if accessed directly

define('SDCW_PATH', plugin_dir_path(__FILE__));
define('SDCW_URL', plugin_dir_url(__FILE__));
define('SDCW_NAME', 'Simple Digital Clock 🕒');
define('SDCW_PLUGIN_SLUG', 'simple-digital-clock');

require_once SDCW_PATH . 'includes/simple-digital-clock-kses.php';
require_once SDCW_PATH . 'includes/simple-digital-clock-assets.php';

class SDCW_digital_clock_widget
{
    protected static $_instance = null;

    public static function get_instance()
    {
        if (!self::$_instance) {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    public function __construct()
    {
        add_action('admin_menu', [$this, 'SDCW_add_plugin_page']);
        add_filter('plugin_action_links', [$this, 'SDCW_plugin_action_links'], 10, 2);
        if(file_exists(plugin_dir_path(__FILE__) . 'includes/simple-digital-clock-admin-notices.php')) {
            require_once(plugin_dir_path(__FILE__) . 'includes/simple-digital-clock-admin-notices.php');
        
            $admin_notice = SDCW_Admin_Notices::get_instance();
        }
    }

    public function SDCW_plugin_action_links($links, $file)
    {
        if ($file == plugin_basename(SDCW_PATH.'/widget_init.php')) {
            $links[] = '<a href="'.admin_url('admin.php?page='.SDCW_PLUGIN_SLUG).'">'.esc_html__('Settings', 'simple-digital-clock').'</a>';
        }

        return $links;
    }

    /**
     * Add options page.
     */
    public function SDCW_add_plugin_page()
    {
        add_options_page(
            esc_html__('Settings Admin', 'simple-digital-clock'),
            esc_html__('Simple Digital Clock', 'simple-digital-clock'),
            'manage_options',
            SDCW_PLUGIN_SLUG,
            [$this, 'SDCW_admin_settings_page']
        );
    }

    public function SDCW_admin_settings_page()
    {
        require_once SDCW_PATH.'includes/simple-digital-clock-admin-settings.php';
    }
}

function SDCW_block_register_block() {
    wp_register_script(
        'simple-digital-clock-block-editor-script',
        plugins_url('block.js', __FILE__),
        ['wp-blocks', 'wp-i18n', 'wp-element', 'wp-block-editor', 'wp-hooks'],
        filemtime(plugin_dir_path(__FILE__) . 'block.js'),
        true
    );

    // Localize the script with necessary data
    wp_localize_script('simple-digital-clock-block-editor-script', 'blockData', [
        'locale' => get_locale(),
        // Keep translations as text; JSON transport and editor components handle escaping.
        'i18n' => [
            'title' => __('Simple Digital Clock', 'simple-digital-clock'),
            'description' => __('A simple block for displaying Digital Clock.', 'simple-digital-clock'),
            'container' => __('Container', 'simple-digital-clock'),
            'caption' => __('Caption', 'simple-digital-clock'),
            'width' => __('Width', 'simple-digital-clock'),
            'fullSize' => __('Full Size', 'simple-digital-clock'),
            'rounded' => __('Rounded', 'simple-digital-clock'),
            'border' => __('Border', 'simple-digital-clock'),
            'textAlign' => __('Text Align', 'simple-digital-clock'),
            'textAlignHelp' => __('Select the alignment of the text within the container.', 'simple-digital-clock'),
            'shadow' => __('Shadow', 'simple-digital-clock'),
            'backgroundColor' => __('Background Color', 'simple-digital-clock'),
            'color' => __('Color', 'simple-digital-clock'),
            'gradient' => __('Gradient', 'simple-digital-clock'),
            'options' => __('Options', 'simple-digital-clock'),
            'timeZone' => __('Time Zone', 'simple-digital-clock'),
            'resetToSiteTz' => __('Auto Timezone', 'simple-digital-clock'),
            'display' => __('Display', 'simple-digital-clock'),
            'googleFonts' => __('Google Fonts', 'simple-digital-clock'),
            'googleFontsHelp' => __('Google fonts are loading from the CDN, they are not included in the plugin.', 'simple-digital-clock'),
            'locale' => __('Locale', 'simple-digital-clock'),
            'localeInvalid' => __('Invalid BCP-47 locale tag.', 'simple-digital-clock'),
            'useSiteLocale' => __('Auto language', 'simple-digital-clock'),
            'localeHelp' => __('Language of date and including the time display format.', 'simple-digital-clock'),
            'about' => __('About', 'simple-digital-clock'),
            'ratePlugin' => __('❤️ Rate plugin ★★★★★', 'simple-digital-clock'),
            'second' => __('Second', 'simple-digital-clock'),
            'hundredths' => __('Hundredths of a second', 'simple-digital-clock'),
            'hundredthsHelp' => __('Show two digits after seconds.', 'simple-digital-clock'),
            'date' => __('Date', 'simple-digital-clock'),
            'amPm' => __('24-Hour', 'simple-digital-clock'),
            'timeNow' => __('Time Now', 'simple-digital-clock'),
            'todaysDateNow' => __('Todays Date', 'simple-digital-clock'),
            'left' => __('Left', 'simple-digital-clock'),
            'center' => __('Center', 'simple-digital-clock'),
            'right' => __('Right', 'simple-digital-clock'),
            'shadowHelp' => __('Select the shadow of the container.', 'simple-digital-clock'),
            'gradientHelp' => __('Select a gradient (font color is automatically inverted based on background color). Note: the gradient is used on top of the background color.', 'simple-digital-clock'),
            'time' => __('Time', 'simple-digital-clock'),
            'clock' => __('Clock', 'simple-digital-clock'),
            'digital' => __('Digital', 'simple-digital-clock'),
            'simple' => __('Simple', 'simple-digital-clock'),
            'widget' => __('Widget', 'simple-digital-clock'),
            'demoPlugin' => __('DEMO 👀', 'simple-digital-clock'),
            'none' => __('None', 'simple-digital-clock'),
            'clearColors' => __('Clear All Colors', 'simple-digital-clock'),
            'clearGradient' => __('Clear Gradient', 'simple-digital-clock'),
            'timeZoneHelp' => __('Select the time zone for the clock display.', 'simple-digital-clock'),
        ],
    ]);

    register_block_type('simple-digital-clock-block/widget-block', [
        'api_version' => 3,
        'editor_script' => 'simple-digital-clock-block-editor-script',
        'editor_style' => 'simple-digital-clock-block-style',
    ]);
}

function SDCW_admin_scripts($hook) {
    if ('settings_page_simple-digital-clock' !== $hook || !SDCW_Admin_Notices::should_show_notice()) {
        return;
    }
    $script_path = plugin_dir_path(__FILE__) . 'assets/admin/js/simple-digital-clock-notify.js';
    $version = filemtime($script_path); // Gets the file modification time for cache-busting

    wp_enqueue_script('simple-digital-clock-script', plugin_dir_url(__FILE__) . 'assets/admin/js/simple-digital-clock-notify.js', array('jquery'), $version, true);
    wp_localize_script('simple-digital-clock-script', 'simpleDigitalClockAjax', array('ajaxurl' => admin_url('admin-ajax.php'), 'nonce' => wp_create_nonce('simple-digital-clock-nonce')));
}

add_action('admin_enqueue_scripts', 'SDCW_admin_scripts');
add_action('init', 'SDCW_block_register_block');

$GLOBALS['SDCW_digital_clock_widget'] = SDCW_digital_clock_widget::get_instance();
