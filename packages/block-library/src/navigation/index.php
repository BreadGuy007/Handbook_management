<?php
/**
 * Server-side rendering of the `core/navigation` block.
 *
 * @package gutenberg
 */

/**
 * Build an array with CSS classes and inline styles defining the colors
 * which will be applied to the navigation markup in the front-end.
 *
 * @param  array $attributes Navigation block attributes.
 * @return array Colors CSS classes and inline styles.
 */
function build_css_colors( $attributes ) {
	// CSS classes.
	$colors = array(
		'css_classes'   => '',
		'inline_styles' => '',
	);

	$has_named_text_color  = array_key_exists( 'textColor', $attributes );
	$has_custom_text_color = array_key_exists( 'customTextColor', $attributes );

	// If has text color.
	if ( $has_custom_text_color || $has_named_text_color ) {
		// Add has-text-color class.
		$colors['css_classes'] .= 'has-text-color';
	}

	if ( $has_named_text_color ) {
		// Add the color class.
		$colors['css_classes'] .= sprintf( ' has-%s-color', $attributes['textColor'] );
	} elseif ( $has_custom_text_color ) {
		// Add the custom color inline style.
		$colors['inline_styles'] = sprintf( 'color: %s;', $attributes['customTextColor'] );
	}

	return $colors;
}

/**
 * Renders the `core/navigation` block on server.
 *
 * @param array $attributes The block attributes.
 * @param array $content The saved content.
 * @param array $block The parsed block.
 *
 * @return string Returns the post content with the legacy widget added.
 */
function render_block_navigation( $attributes, $content, $block ) {
	$colors          = build_css_colors( $attributes );
	$class_attribute = sprintf( ' class="%s"', esc_attr( $colors['css_classes'] ? 'wp-block-navigation ' . $colors['css_classes'] : 'wp-block-navigation' ) );
	$style_attribute = $colors['inline_styles'] ? sprintf( ' style="%s"', esc_attr( $colors['inline_styles'] ) ) : '';

	return sprintf(
		implode(
			"\n",
			array(
				'<nav%s%s>',
				'	%s',
				'</nav>',
			)
		),
		$class_attribute,
		$style_attribute,
		build_navigation_html( $block, $colors )
	);
}

/**
 * Walks the inner block structure and returns an HTML list for it.
 *
 * @param array $block  The block.
 * @param array $colors Contains inline styles and CSS classes to apply to navigation item.
 *
 * @return string Returns  an HTML list from innerBlocks.
 */
function build_navigation_html( $block, $colors ) {
	$html = '';

	$class_attribute = sprintf( ' class="%s"', esc_attr( $colors['css_classes'] ? 'wp-block-navigation-item__link ' . $colors['css_classes'] : 'wp-block-navigation-item__link' ) );
	$style_attribute = $colors['inline_styles'] ? sprintf( ' style="%s"', esc_attr( $colors['inline_styles'] ) ) : '';

	foreach ( (array) $block['innerBlocks'] as $key => $block ) {

		$html .= '<li class="wp-block-navigation-item">' .
			'<a' . $class_attribute . $style_attribute;

		// Start appending HTML attributes to anchor tag.
		if ( isset( $block['attrs']['url'] ) ) {
			$html .= ' href="' . esc_url( $block['attrs']['url'] ) . '"';
		}
		if ( isset( $block['attrs']['title'] ) ) {
			$html .= ' title="' . esc_attr( $block['attrs']['title'] ) . '"';
		}

		if ( isset( $block['attrs']['opensInNewTab'] ) && true === $block['attrs']['opensInNewTab'] ) {
			$html .= ' target="_blank"  ';
		}
		// End appending HTML attributes to anchor tag.

		// Start anchor tag content.
		$html .= '>';
		if ( isset( $block['attrs']['label'] ) ) {
			$html .= esc_html( $block['attrs']['label'] );
		}
		$html .= '</a>';
		// End anchor tag content.

		if ( count( (array) $block['innerBlocks'] ) > 0 ) {
			$html .= build_navigation_html( $block, $colors );
		}

		$html .= '</li>';
	}
	return '<ul>' . $html . '</ul>';
}

/**
 * Register the navigation block.
 *
 * @uses render_block_navigation()
 * @throws WP_Error An WP_Error exception parsing the block definition.
 */
function register_block_core_navigation() {

	register_block_type(
		'core/navigation',
		array(
			'category'        => 'layout',
			'attributes'      => array(
				'className'        => array(
					'type' => 'string',
				),
				'automaticallyAdd' => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'textColor'        => array(
					'type' => 'string',
				),
				'customTextColor'  => array(
					'type' => 'string',
				),
			),

			'render_callback' => 'render_block_navigation',
		)
	);
}
add_action( 'init', 'register_block_core_navigation' );
