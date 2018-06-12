<?php
/**
 * Plugin Name: Gutenberg Test Plugin, Plugins API
 * Plugin URI: https://github.com/WordPress/gutenberg
 * Author: Gutenberg Team
 *
 * @package gutenberg-test-plugin-plugins-api
 */
wp_enqueue_script(
	'gutenberg-test-plugins-api',
	plugins_url( 'plugins-api/index.js', __FILE__ ),
	array(
		'wp-components',
		'wp-data',
		'wp-element',
		'wp-edit-post',
		'wp-i18n',
		'wp-plugins',
	),
	filemtime( plugin_dir_path( __FILE__ ) . 'plugins-api/index.js' ),
	true
);
