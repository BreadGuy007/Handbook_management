<?php
/**
 * Server-side rendering of the `core/post-title` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/post-title` block on the server.
 *
 * @return string Returns the filtered post title for the current post wrapped inside "h1" tags.
 */
function render_block_core_post_title() {
	$post = gutenberg_get_post_from_context();
	if ( ! $post ) {
		return '';
	}
	return '<h1>' . get_the_title( $post ) . '</h1>';
}

/**
 * Registers the `core/post-title` block on the server.
 */
function register_block_core_post_title() {
	$path     = __DIR__ . '/post-title/block.json';
	$metadata = json_decode( file_get_contents( $path ), true );

	register_block_type(
		$metadata['name'],
		array_merge(
			$metadata,
			array(
				'render_callback' => 'render_block_core_post_title',
			)
		)
	);
}
add_action( 'init', 'register_block_core_post_title' );
