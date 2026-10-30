<?php

/**
 * @version 1.1.4
 */

/*
Plugin Name: Simple Digital Clock 🕒
Plugin URI: https://utctime.info/
Description: It is 🪄 a magical and easy-to-use digital clock with a beautiful UI, supporting multiple languages, locales, dates, captions, and time zones.
Version: 1.1.4
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
            'Settings Admin',
            'Simple Digital Clock',
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
        'i18n' => [
            'title' => esc_html__('Simple Digital Clock', 'simple-digital-clock'),
            'description' => esc_html__('A simple block for displaying Digital Clock.', 'simple-digital-clock'),
            'container' => esc_html__('Container', 'simple-digital-clock'),
            'caption' => esc_html__('Caption', 'simple-digital-clock'),
            'width' => esc_html__('Width', 'simple-digital-clock'),
            'fullSize' => esc_html__('Full Size', 'simple-digital-clock'),
            'rounded' => esc_html__('Rounded', 'simple-digital-clock'),
            'border' => esc_html__('Border', 'simple-digital-clock'),
            'textAlign' => esc_html__('Text Align', 'simple-digital-clock'),
            'textAlignHelp' => esc_html__('Select the alignment of the text within the container.', 'simple-digital-clock'),
            'shadow' => esc_html__('Shadow', 'simple-digital-clock'),
            'backgroundColor' => esc_html__('Background Color', 'simple-digital-clock'),
            'color' => esc_html__('Color', 'simple-digital-clock'),
            'gradient' => esc_html__('Gradient', 'simple-digital-clock'),
            'options' => esc_html__('Options', 'simple-digital-clock'),
            'timeZone' => esc_html__('Time Zone', 'simple-digital-clock'),
            'display' => esc_html__('Display', 'simple-digital-clock'),
            'googleFonts' => esc_html__('Google Fonts', 'simple-digital-clock'),
            'googleFontsHelp' => esc_html__('Google fonts are loading from the CDN, they are not included in the plugin.', 'simple-digital-clock'),
            'locale' => esc_html__('Locale', 'simple-digital-clock'),
            'localeHelp' => esc_html__('Language of date and including the time display format.', 'simple-digital-clock'),
            'about' => esc_html__('About', 'simple-digital-clock'),
            'ratePlugin' => esc_html__('❤️ Rate plugin ★★★★★', 'simple-digital-clock'),
            'second' => esc_html__('Second', 'simple-digital-clock'),
            'hundredths' => esc_html__('Hundredths of a second', 'simple-digital-clock'),
            'hundredthsHelp' => esc_html__('Show two digits after seconds.', 'simple-digital-clock'),
            'date' => esc_html__('Date', 'simple-digital-clock'),
            'amPm' => esc_html__('24-Hour', 'simple-digital-clock'),
            'timeNow' => esc_html__('Time Now', 'simple-digital-clock'),
            'todaysDateNow' => esc_html__('Todays Date', 'simple-digital-clock'),
            'left' => esc_html__('Left', 'simple-digital-clock'),
            'center' => esc_html__('Center', 'simple-digital-clock'),
            'right' => esc_html__('Right', 'simple-digital-clock'),
            'shadowHelp' => esc_html__('Select the Shadow of the text within the container.', 'simple-digital-clock'),
            'gradientHelp' => esc_html__('Select a gradient (font color is automatically inverted based on background color). Note: the gradient is used on top of the background color.', 'simple-digital-clock'),
            'time' => esc_html__('Time', 'simple-digital-clock'),
            'clock' => esc_html__('Clock', 'simple-digital-clock'),
            'digital' => esc_html__('Digital', 'simple-digital-clock'),
            'simple' => esc_html__('Simple', 'simple-digital-clock'),
            'widget' => esc_html__('Widget', 'simple-digital-clock'),
            'demoPlugin' => esc_html__('DEMO 👀', 'simple-digital-clock'),
            'none' => esc_html__('None', 'simple-digital-clock'),
            'clearColors' => esc_html__('Clear All Colors', 'simple-digital-clock'),
            'clearGradient' => esc_html__('Clear Gradient', 'simple-digital-clock'),
            'timeZoneHelp' => esc_html__('Select the time zone for the clock display.', 'simple-digital-clock'),
        ],
    ]);

    wp_register_style(
        'simple-digital-clock-block-style',
        plugins_url('assets/public/css/simple-digital-clock.css', __FILE__),
        [],
        filemtime(plugin_dir_path(__FILE__) . 'assets/public/css/simple-digital-clock.css')
    );

    register_block_type('simple-digital-clock-block/widget-block', [
        'api_version' => 3,
        'editor_script' => 'simple-digital-clock-block-editor-script',
        'script' => 'simple-digital-clock',
        'style' => 'simple-digital-clock-block-style',
    ]);
}

function SDCW_admin_scripts() {
    $script_path = plugin_dir_path(__FILE__) . 'assets/admin/js/simple-digital-clock-notify.js';
    $version = filemtime($script_path); // Gets the file modification time for cache-busting

    wp_enqueue_script('simple-digital-clock-script', plugin_dir_url(__FILE__) . 'assets/admin/js/simple-digital-clock-notify.js', array('jquery'), $version, true);
    wp_localize_script('simple-digital-clock-script', 'simpleDigitalClockAjax', array('ajaxurl' => admin_url('admin-ajax.php'), 'nonce' => wp_create_nonce('simple-digital-clock-nonce')));
}

function SDCW_enqueue_scripts() {
    wp_register_script(
        'simple-digital-clock',
        plugins_url('assets/public/js/simple-digital-clock.min.js', __FILE__),
        [],
        '0.8.0',
        [
            'strategy' => 'async',
            'in_footer' => true,
        ]
    );
    wp_enqueue_script('simple-digital-clock');
}

add_action('wp_enqueue_scripts', 'SDCW_enqueue_scripts');
add_action('admin_enqueue_scripts', 'SDCW_enqueue_scripts');
// Load the clock runtime inside the iframed block editor canvas as well:
// the iframe collects frontend-context assets via the `enqueue_block_assets` hook.
add_action('enqueue_block_assets', 'SDCW_enqueue_scripts');
add_action('admin_enqueue_scripts', 'SDCW_admin_scripts');
add_action('init', 'SDCW_block_register_block');

$GLOBALS['SDCW_digital_clock_widget'] = SDCW_digital_clock_widget::get_instance();
