<?php
/**
 * Plugin Name: Simple Digital Clock Preview Runtime
 * Description: Interactive controls for the disposable Playground demo only.
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

require_once __DIR__ . '/sdc-preview/clock.php';

function sdc_preview_config() {
    $config = get_option( 'sdc_preview_config' );
    return is_array( $config ) && ! empty( $config['postId'] ) ? $config : null;
}

function sdc_preview_is_page() {
    $config = sdc_preview_config();
    return $config && is_page( (int) $config['postId'] );
}

add_action( 'wp_enqueue_scripts', function () {
    if ( ! sdc_preview_is_page() ) {
        return;
    }
    $script = __DIR__ . '/sdc-preview/demo.js';
    if ( ! is_readable( $script ) ) {
        throw new RuntimeException( 'The clock preview script is missing.' );
    }
    wp_enqueue_script(
        'sdc-preview-demo',
        WPMU_PLUGIN_URL . '/sdc-preview/demo.js',
        array(),
        (string) filemtime( $script ),
        array( 'in_footer' => true, 'strategy' => 'defer' )
    );
} );

add_action( 'wp_head', function () {
    if ( ! sdc_preview_is_page() ) {
        return;
    }
    $config = sdc_preview_config();
    $post_id = (int) $config['postId'];
    $config['canEdit'] = current_user_can( 'edit_post', $post_id );
    $config['restNonce'] = $config['canEdit'] ? wp_create_nonce( 'wp_rest' ) : '';
    $config['saveUrl'] = rest_url( 'sdc-preview/v1/clock' );
    $config['editorUrl'] = admin_url( 'post.php?post=' . $post_id . '&action=edit' );
    $json = wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT );
    if ( false === $json ) {
        throw new RuntimeException( 'The clock preview configuration could not be encoded.' );
    }
    echo '<script type="application/json" id="sdc-preview-data">' . $json . '</script>';
} );

function sdc_preview_permission() {
    $config = sdc_preview_config();
    if ( ! $config || ! current_user_can( 'edit_post', (int) $config['postId'] ) ) {
        return new WP_Error( 'sdc_preview_forbidden', 'You cannot edit this temporary preview.', array( 'status' => 403 ) );
    }
    return true;
}

function sdc_preview_city( $city, $time_zone, array $cities ) {
    $canonical_zone = null;
    foreach ( timezone_identifiers_list( DateTimeZone::ALL_WITH_BC ) as $identifier ) {
        if ( 0 === strcasecmp( $time_zone, $identifier ) ) {
            $canonical_zone = $identifier;
            break;
        }
    }
    if ( null === $canonical_zone ) {
        return new WP_Error( 'sdc_preview_invalid_zone', 'Choose a valid IANA time zone.', array( 'status' => 400 ) );
    }
    $time_zone = $canonical_zone;
    foreach ( $cities as $candidate ) {
        $names = array_merge( array( $candidate['name'] ), isset( $candidate['aliases'] ) ? $candidate['aliases'] : array() );
        foreach ( $names as $name ) {
            if ( 0 === strcasecmp( $city, $name ) && $time_zone === $candidate['timeZone'] ) {
                return $candidate;
            }
        }
    }

    // An explicit zone may be used without a city catalogue entry.
    $segments = explode( '/', $time_zone );
    $label = str_replace( '_', ' ', end( $segments ) );
    if ( 0 === strcasecmp( $city, $time_zone ) || 0 === strcasecmp( $city, $label ) ) {
        return array( 'name' => $label, 'timeZone' => $time_zone );
    }
    return new WP_Error( 'sdc_preview_invalid_city', 'Choose a listed city or enter an IANA time zone.', array( 'status' => 400 ) );
}

function sdc_preview_replace_clock( array $blocks, callable $replace, &$matches, $inside_result = false ) {
    foreach ( $blocks as &$block ) {
        $classes = isset( $block['attrs']['className'] ) ? preg_split( '/\s+/', $block['attrs']['className'] ) : array();
        $inside = $inside_result || ( 'core/group' === $block['blockName'] && in_array( 'sdc-live-result', $classes, true ) );
        if ( $inside && 'simple-digital-clock-block/widget-block' === $block['blockName'] ) {
            ++$matches;
            $block = $replace( $block );
        } elseif ( ! empty( $block['innerBlocks'] ) ) {
            $block['innerBlocks'] = sdc_preview_replace_clock( $block['innerBlocks'], $replace, $matches, $inside );
        }
    }
    unset( $block );
    return $blocks;
}

function sdc_preview_saved_attributes( array $block ) {
    $attributes = $block['attrs'];
    $html = new WP_HTML_Tag_Processor( $block['innerHTML'] );
    if ( ! $html->next_tag( 'timenow-zone-sdcw' ) ) {
        throw new RuntimeException( 'The saved preview clock has no custom element.' );
    }
    // Gutenberg omits default values and HTML-sourced locale from block comments.
    $names = array(
        'width' => 'width', 'rounded' => 'rounded', 'locale' => 'locale',
        'align' => 'align', 'caption' => 'caption', 'background' => 'background',
        'backgroundColor' => 'background-color', 'timeZone' => 'time-zone',
        'fontFamily' => 'font-family', 'shadow' => 'shadow',
    );
    foreach ( $names as $name => $html_name ) {
        $value = $html->get_attribute( $html_name );
        if ( null !== $value ) {
            $attributes[ $name ] = 'width' === $name ? (int) $value : ( 'rounded' === $name ? (float) $value : $value );
        }
    }
    foreach ( array( 'date', 'second', 'hundredths', 'border' ) as $name ) {
        $attributes[ $name ] = null !== $html->get_attribute( $name );
    }
    $attributes['period'] = 'false' === $html->get_attribute( 'period' );
    return $attributes;
}

function sdc_preview_save_clock( WP_REST_Request $request ) {
    $config = sdc_preview_config();
    if ( ! $config ) {
        return new WP_Error( 'sdc_preview_missing_config', 'The temporary preview is not configured.', array( 'status' => 500 ) );
    }
    $params = $request->get_json_params();
    $keys = array( 'preset', 'city', 'timeZone', 'showDate', 'use24Hour' );
    if ( ! is_array( $params ) || array_diff( $keys, array_keys( $params ) ) || array_diff( array_keys( $params ), $keys ) ) {
        return new WP_Error( 'sdc_preview_invalid_request', 'Provide only the five clock configuration fields.', array( 'status' => 400 ) );
    }
    if ( ( null !== $params['preset'] && ! is_string( $params['preset'] ) ) || ! is_string( $params['city'] ) || ! is_string( $params['timeZone'] )
        || ( is_string( $params['preset'] ) && strlen( $params['preset'] ) > 32 ) || strlen( $params['city'] ) > 160 || strlen( $params['timeZone'] ) > 100
        || ! is_bool( $params['showDate'] ) || ! is_bool( $params['use24Hour'] ) ) {
        return new WP_Error( 'sdc_preview_invalid_types', 'Clock fields have invalid types or lengths.', array( 'status' => 400 ) );
    }

    $preset = null;
    foreach ( $config['presets'] as $candidate ) {
        if ( $params['preset'] === $candidate['id'] ) {
            $preset = $candidate;
            break;
        }
    }
    if ( null !== $params['preset'] && ! $preset ) {
        return new WP_Error( 'sdc_preview_invalid_preset', 'Choose one of the available clock styles.', array( 'status' => 400 ) );
    }
    $city = sdc_preview_city( trim( $params['city'] ), trim( $params['timeZone'] ), $config['cities'] );
    if ( is_wp_error( $city ) ) {
        return $city;
    }

    $post_id = (int) $config['postId'];
    $post = get_post( $post_id );
    if ( ! $post || 'page' !== $post->post_type ) {
        return new WP_Error( 'sdc_preview_missing_page', 'The temporary preview page is missing.', array( 'status' => 404 ) );
    }
    $attributes = array();
    $replace = function ( array $block ) use ( $preset, $city, $params, &$attributes ) {
        // A null preset preserves styles manually changed in Gutenberg.
        $attributes = $preset ? $preset['clock'] : sdc_preview_saved_attributes( $block );
        $attributes['timeZone'] = $city['timeZone'];
        $attributes['caption'] = $city['name'];
        $attributes['date'] = $params['showDate'];
        $attributes['period'] = $params['use24Hour'];
        $attributes['locale'] = ! $params['use24Hour'] ? 'en-US' : ( ! empty( $city['locale'] ) ? $city['locale'] : ( ! empty( $attributes['locale'] ) ? $attributes['locale'] : 'en-GB' ) );
        $generated = parse_blocks( sdc_clock_block( $attributes ) );
        return $generated[0];
    };
    $matches = 0;
    try {
        $blocks = sdc_preview_replace_clock( parse_blocks( $post->post_content ), $replace, $matches );
    } catch ( RuntimeException $error ) {
        return new WP_Error( 'sdc_preview_invalid_block', $error->getMessage(), array( 'status' => 409 ) );
    }
    if ( 1 !== $matches ) {
        return new WP_Error( 'sdc_preview_missing_clock', 'The preview must contain exactly one editable result clock.', array( 'status' => 409 ) );
    }
    $result = wp_update_post( wp_slash( array( 'ID' => $post_id, 'post_content' => serialize_blocks( $blocks ) ) ), true );
    if ( is_wp_error( $result ) ) {
        return $result;
    }
    if ( $post_id !== $result ) {
        return new WP_Error( 'sdc_preview_save_failed', 'The clock could not be saved.', array( 'status' => 500 ) );
    }

    $config['initial'] = array(
        'preset' => $preset ? $preset['id'] : null,
        'city' => $city['name'],
        'timeZone' => $city['timeZone'],
        'showDate' => $params['showDate'],
        'use24Hour' => $params['use24Hour'],
    );
    update_option( 'sdc_preview_config', $config, false );
    return rest_ensure_response( array(
        'editorUrl' => admin_url( 'post.php?post=' . $post_id . '&action=edit' ),
        'postId' => $post_id,
        'attributes' => $attributes,
    ) );
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'sdc-preview/v1', '/clock', array(
        'methods' => WP_REST_Server::CREATABLE,
        'callback' => 'sdc_preview_save_clock',
        'permission_callback' => 'sdc_preview_permission',
    ) );
} );
