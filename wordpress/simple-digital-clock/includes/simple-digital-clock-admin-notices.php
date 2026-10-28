<?php
/**
 * @version 1.1.1
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
} // Exit if accessed directly

if ( ! class_exists( 'SDCW_Admin_Notices' ) ) {

    class SDCW_Admin_Notices {

        private static $_instance;
        private $admin_notices;
        const TYPES = 'error,warning,info,success';

        private function __construct() {
            $this->admin_notices = new stdClass();
            foreach (explode( ',', self::TYPES) as $type) {
                $this->admin_notices->{$type} = [];
            }

            add_action('admin_notices', [ &$this, 'simple_digital_clock_admin_notice']);
            add_action('wp_ajax_simple_digital_clock_hide_notice', [ &$this, 'simple_digital_clock_hide_notice' ]);
            // add_action( 'admin_init', [ &$this, 'action_admin_init' ] );
            // add_action( 'admin_notices', [ &$this, 'action_admin_notices' ] );
            // add_action( 'admin_enqueue_scripts', [ &$this, 'action_admin_enqueue_scripts' ] );
        }

        public static function get_instance() {
            if ( ! ( self::$_instance instanceof self ) ) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        function simple_digital_clock_hide_notice() {
            check_ajax_referer('simple-digital-clock-nonce', 'security');
            $user_id = get_current_user_id();
            
            update_user_meta($user_id, 'simple_digital_clock_hide_notice', time());
            
            wp_send_json_success();
        }

        function simple_digital_clock_admin_notice() {
            $user_id = get_current_user_id();
            $hide_notice = get_user_meta($user_id, 'simple_digital_clock_hide_notice', true);
            
            if ($hide_notice && (time() - $hide_notice < WEEK_IN_SECONDS)) {
                return;
            } 

            echo '<div class="notice notice-info is-dismissible" id="simple-digital-clock-notice">
            <div style="display:flex;padding:10px 0;">
                <div style="margin-right:15px;">
                    <img alt="',esc_attr('Simple Digital Clock 🕒', 'simple-digital-clock'),'" src="', esc_url(SDCW_URL.'assets/admin/img/icon.svg'),'" style="width:96px">
                </div>
                <div>
                    <h2 style="margin:0;">🥰 ',esc_html('Please rate our free', 'simple-digital-clock'),' &laquo; ',esc_html('Simple Digital Clock 🕒', 'simple-digital-clock'),'&raquo;</h2>
                    <hr>
                    <p style="padding:0;margin:0;">',esc_html('Your valuable feedback will help us improve.', 'simple-digital-clock'),'<br>',esc_html('It will only take a few minutes', 'simple-digital-clock'),': <a href="https://wordpress.org/support/plugin/simple-digital-clock/reviews/#new-post" rel="noopener" target="_blank">',esc_html('Rate it now', 'simple-digital-clock'),'</a> 👍</p>
                    <p style="padding:0;margin:0;"><a href="https://wordpress.org/support/plugin/simple-digital-clock/reviews/#new-post" rel="noopener" target="_blank"><img src="',esc_url(SDCW_URL.'assets/admin/img/stars.png'),'" alt="',esc_attr('Rating', 'simple-digital-clock'),'"></a></p>
                </div>
            </div>
        </div>';
        }

        public function info( $message, $dismiss_option = false ) {
            $this->notice( 'info', $message, $dismiss_option );
        }

        private function notice( $type, $message, $dismiss_option ) {
            $notice = new stdClass();
            $notice->message = $message;
            $notice->dismiss_option = $dismiss_option;
            $this->admin_notices->{$type}[] = $notice;
        }
    }
}
