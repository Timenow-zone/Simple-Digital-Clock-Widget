<?php
// Shared by the preview seed and its authenticated save endpoint.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function sdc_clock_block( array $input ) {
    $attributes = wp_parse_args( $input, array(
        'width' => 0,
        'locale' => 'en-GB',
        'timeZone' => 'UTC',
        'fontFamily' => '',
        'backgroundColor' => '#1d4ed8',
        'background' => '',
        'rounded' => 0.5,
        'align' => 'left',
        'second' => true,
        'date' => false,
        'caption' => '',
        'shadow' => '',
        'border' => false,
        'period' => false,
        'hundredths' => false,
    ) );

    // Preserve the same attribute presence and values as block.js:save().
    $html = array(
        'class' => 'wp-block-simple-digital-clock-block-widget-block',
        'width' => (string) $attributes['width'],
        'locale' => $attributes['locale'],
        'rounded' => (string) $attributes['rounded'],
        'align' => $attributes['align'],
    );
    foreach ( array( 'shadow', 'caption', 'background' ) as $name ) {
        if ( '' !== $attributes[ $name ] ) {
            $html[ $name ] = $attributes[ $name ];
        }
    }
    foreach ( array( 'date', 'second', 'hundredths', 'border' ) as $name ) {
        if ( $attributes[ $name ] ) {
            $html[ $name ] = 'true';
        }
    }
    if ( $attributes['period'] ) {
        $html['period'] = 'false';
    }
    foreach ( array( 'timeZone' => 'time-zone', 'fontFamily' => 'font-family', 'backgroundColor' => 'background-color' ) as $name => $html_name ) {
        if ( '' !== $attributes[ $name ] ) {
            $html[ $html_name ] = $attributes[ $name ];
        }
    }

    $html_attributes = '';
    foreach ( $html as $name => $value ) {
        $html_attributes .= ' ' . $name . '="' . esc_attr( $value ) . '"';
    }

    return get_comment_delimited_block_content(
        'simple-digital-clock-block/widget-block',
        $attributes,
        '<timenow-zone-sdcw' . $html_attributes . '></timenow-zone-sdcw>'
    );
}
