<?php
/**
 * Server-side rendering of the `core/post-date` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/post-date` block on the server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the filtered post date for the current post wrapped inside "time" tags.
 */
function render_block_core_post_date( $attributes ) {
	$post = gutenberg_get_post_from_context();
	if ( ! $post ) {
		return '';
	}
	return '<time datetime="'
		. get_the_date( 'c', $post ) . '">'
		. get_the_date( isset( $attributes['format'] ) ? $attributes['format'] : '', $post )
		. '</time>';
}

/**
 * Registers the `core/post-date` block on the server.
 */
function register_block_core_post_date() {
	$path     = __DIR__ . '/post-date/block.json';
	$metadata = json_decode( file_get_contents( $path ), true );

	register_block_type(
		$metadata['name'],
		array_merge(
			$metadata,
			array(
				'render_callback' => 'render_block_core_post_date',
			)
		)
	);
}
add_action( 'init', 'register_block_core_post_date' );
