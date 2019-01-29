# Creating dynamic blocks

It is possible to create dynamic blocks. These are blocks that can change their content even if the post is not saved. One example from WordPress itself is the latest posts block. This block will update everywhere it is used when a new post is published.

The following code example shows how to create the latest post block dynamic block.

{% codetabs %}
{% ES5 %}
```js
// myblock.js

var el = wp.element.createElement,
	registerBlockType = wp.blocks.registerBlockType,
	withSelect = wp.data.withSelect;

registerBlockType( 'my-plugin/latest-post', {
	title: 'Latest Post',
	icon: 'megaphone',
	category: 'widgets',

	edit: withSelect( function( select ) {
		return {
			posts: select( 'core' ).getEntityRecords( 'postType', 'post' )
		};
	} )( function( props ) {
		
		if ( ! props.posts ) {
			return "Loading...";
		}

		if ( props.posts.length === 0 ) {
			return "No posts";
		}
		var className = props.className;
		var post = props.posts[ 0 ];

		return el(
			'a',
			{ className: className, href: post.link },
			post.title.rendered
		);
	} ),

	save: function() {
		// Rendering in PHP
		return null;
	},
} );
```
{% ESNext %}
```js
// myblock.js

const { registerBlockType } = wp.blocks;
const { withSelect } = wp.data;

registerBlockType( 'my-plugin/latest-post', {
	title: 'Latest Post',
	icon: 'megaphone',
	category: 'widgets',

	edit: withSelect( ( select ) => {
		return {
			posts: select( 'core' ).getEntityRecords( 'postType', 'post' )
		};
	} )( ( { posts, className } ) => {

		if ( ! posts ) {
			return "Loading...";
		}

		if ( posts && posts.length === 0 ) {
			return "No posts";
		}

		let post = posts[ 0 ];

		return <a className={ className } href={ post.link }>
			{ post.title.rendered }
		</a>;
	} ),

	save() {
		// Rendering in PHP
		return null;
	},
} );
```
{% end %}

Because it is a dynamic block it also needs a server component. The rendering can be added using the `render_callback` property when using the `register_block_type` function.

```php
<?php
// block.php

function my_plugin_render_block_latest_post( $attributes, $content ) {
	$recent_posts = wp_get_recent_posts( array(
		'numberposts' => 1,
		'post_status' => 'publish',
	) );
	if ( count( $recent_posts ) === 0 ) {
		return 'No posts';
	}
	$post = $recent_posts[ 0 ];
	$post_id = $post['ID'];
	return sprintf(
		'<a class="wp-block-my-plugin-latest-post" href="%1$s">%2$s</a>',
		esc_url( get_permalink( $post_id ) ),
		esc_html( get_the_title( $post_id ) )
	);
}

register_block_type( 'my-plugin/latest-post', array(
	'render_callback' => 'my_plugin_render_block_latest_post',
) );
```

There are a few things to notice:

* The edit function still shows a representation of the block in the editor's context (this could be very different from the rendered version, it's up to the block's author)
* The save function just returns null because the rendering is performed server-side.
* The server-side rendering is a function taking the block attributes and the block inner content as arguments, and returning the markup (quite similar to shortcodes)

## Live rendering in Gutenberg editor

Gutenberg 2.8 added the [`<ServerSideRender>`](/packages/components/src/server-side-render) block which enables rendering to take place on the server using PHP rather than in JavaScript. 

*Server-side render is meant as a fallback; client-side rendering in JavaScript is always preferred (client rendering is faster and allows better editor manipulation).*

{% codetabs %}
{% ES5 %}
```js
// myblock.js

var el = wp.element.createElement,
	registerBlockType = wp.blocks.registerBlockType,
	ServerSideRender = wp.components.ServerSideRender;

registerBlockType( 'my-plugin/latest-post', {
	title: 'Latest Post',
	icon: 'megaphone',
	category: 'widgets',

	edit: function( props ) {
		// ensure the block attributes matches this plugin's name
		return (
			el(ServerSideRender, {
				block: "my-plugin/latest-post",
				attributes:  props.attributes
			})
		);
	},

	save: function() {
		// Rendering in PHP
		return null;
	},
} );
```
{% ESNext %}
```js
// myblock.js

const { registerBlockType } = wp.blocks;
const { ServerSideRender } = wp.components;

registerBlockType( 'my-plugin/latest-post', {
	title: 'Latest Post',
	icon: 'megaphone',
	category: 'widgets',

	edit: function( props ) {
		// ensure the block attributes matches this plugin's name
		return (
			<ServerSideRender
				block="my-plugin/latest-post"
				attributes={ props.attributes }
			/>
		);
	},

	save() {
		// Rendering in PHP
		return null;
	},
} );
```
{% end %}

The PHP code is the same as above and is automatically handled through the WP REST API.
