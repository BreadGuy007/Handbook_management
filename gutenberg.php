<?php
/**
 * Plugin Name: Gutenberg
 * Plugin URI: https://github.com/WordPress/gutenberg
 * Description: Printing since 1440. This is the development plugin for the new block editor in core.
 * Requires at least: 5.3
 * Requires PHP: 5.6
 * Version: 8.8.0
 * Author: Gutenberg Team
 * Text Domain: gutenberg
 *
 * @package gutenberg
 */

### BEGIN AUTO-GENERATED DEFINES
defined( 'GUTENBERG_DEVELOPMENT_MODE' ) or define( 'GUTENBERG_DEVELOPMENT_MODE', true );
### END AUTO-GENERATED DEFINES

gutenberg_pre_init();

/**
 * Gutenberg's Menu.
 *
 * Adds a new wp-admin menu page for the Gutenberg editor.
 *
 * @since 0.1.0
 */
function gutenberg_menu() {
	global $submenu;

	add_menu_page(
		'Gutenberg',
		'Gutenberg',
		'edit_posts',
		'gutenberg',
		'',
		'dashicons-edit'
	);

	add_submenu_page(
		'gutenberg',
		__( 'Demo', 'gutenberg' ),
		__( 'Demo', 'gutenberg' ),
		'edit_posts',
		'gutenberg'
	);

	if ( get_option( 'gutenberg-experiments' ) ) {
		if ( array_key_exists( 'gutenberg-widget-experiments', get_option( 'gutenberg-experiments' ) ) ) {
			add_submenu_page(
				'gutenberg',
				__( 'Widgets (beta)', 'gutenberg' ),
				__( 'Widgets (beta)', 'gutenberg' ),
				'edit_theme_options',
				'gutenberg-widgets',
				'the_gutenberg_widgets'
			);
		}
		if ( array_key_exists( 'gutenberg-navigation', get_option( 'gutenberg-experiments' ) ) ) {
			add_submenu_page(
				'gutenberg',
				__( 'Navigation (beta)', 'gutenberg' ),
				__( 'Navigation (beta)', 'gutenberg' ),
				'edit_theme_options',
				'gutenberg-navigation',
				'gutenberg_navigation_page'
			);
		}
		if ( array_key_exists( 'gutenberg-full-site-editing', get_option( 'gutenberg-experiments' ) ) ) {
			add_menu_page(
				__( 'Site Editor (beta)', 'gutenberg' ),
				__( 'Site Editor (beta)', 'gutenberg' ),
				'edit_theme_options',
				'gutenberg-edit-site',
				'gutenberg_edit_site_page',
				'dashicons-layout'
			);
		}
	}

	if ( current_user_can( 'edit_posts' ) ) {
		$submenu['gutenberg'][] = array(
			__( 'Support', 'gutenberg' ),
			'edit_posts',
			__( 'https://wordpress.org/support/plugin/gutenberg', 'gutenberg' ),
		);

		$submenu['gutenberg'][] = array(
			__( 'Documentation', 'gutenberg' ),
			'edit_posts',
			'https://developer.wordpress.org/block-editor/',
		);
	}

	add_submenu_page(
		'gutenberg',
		__( 'Experiments Settings', 'gutenberg' ),
		__( 'Experiments', 'gutenberg' ),
		'edit_posts',
		'gutenberg-experiments',
		'the_gutenberg_experiments'
	);
}
add_action( 'admin_menu', 'gutenberg_menu' );

/**
 * Display a version notice and deactivate the Gutenberg plugin.
 *
 * @since 0.1.0
 */
function gutenberg_wordpress_version_notice() {
	echo '<div class="error"><p>';
	/* translators: %s: Minimum required version */
	printf( __( 'Gutenberg requires WordPress %s or later to function properly. Please upgrade WordPress before activating Gutenberg.', 'gutenberg' ), '5.3.0' );
	echo '</p></div>';

	deactivate_plugins( array( 'gutenberg/gutenberg.php' ) );
}

/**
 * Display a build notice.
 *
 * @since 0.1.0
 */
function gutenberg_build_files_notice() {
	echo '<div class="error"><p>';
	_e( 'Gutenberg development mode requires files to be built. Run <code>npm install</code> to install dependencies, <code>npm run build</code> to build the files or <code>npm run dev</code> to build the files and watch for changes. Read the <a href="https://github.com/WordPress/gutenberg/blob/master/docs/contributors/getting-started.md">contributing</a> file for more information.', 'gutenberg' );
	echo '</p></div>';
}

/**
 * Verify that we can initialize the Gutenberg editor , then load it.
 *
 * @since 1.5.0
 */
function gutenberg_pre_init() {
	global $wp_version;
	if ( defined( 'GUTENBERG_DEVELOPMENT_MODE' ) && GUTENBERG_DEVELOPMENT_MODE && ! file_exists( dirname( __FILE__ ) . '/build/blocks' ) ) {
		add_action( 'admin_notices', 'gutenberg_build_files_notice' );
		return;
	}

	// Get unmodified $wp_version.
	include ABSPATH . WPINC . '/version.php';

	// Strip '-src' from the version string. Messes up version_compare().
	$version = str_replace( '-src', '', $wp_version );

	if ( version_compare( $version, '5.3.0', '<' ) ) {
		add_action( 'admin_notices', 'gutenberg_wordpress_version_notice' );
		return;
	}

	require_once dirname( __FILE__ ) . '/lib/load.php';
}

/**
 * Outputs a WP REST API nonce.
 */
function gutenberg_rest_nonce() {
	exit( wp_create_nonce( 'wp_rest' ) );
}
add_action( 'wp_ajax_gutenberg_rest_nonce', 'gutenberg_rest_nonce' );


/**
 * Exposes the site icon url to the Gutenberg editor through the WordPress REST
 * API. The site icon url should instead be fetched from the wp/v2/settings
 * endpoint when https://github.com/WordPress/gutenberg/pull/19967 is complete.
 *
 * @since 8.2.1
 *
 * @param WP_REST_Response $response Response data served by the WordPress REST index endpoint.
 * @return WP_REST_Response
 */
function register_site_icon_url( $response ) {
	$data                  = $response->data;
	$data['site_icon_url'] = get_site_icon_url();
	$response->set_data( $data );
	return $response;
}

add_filter( 'rest_index', 'register_site_icon_url' );

/**
 * Registers the WP_Widget_Block widget
 */
function gutenberg_register_widgets() {
	if ( ! gutenberg_is_experiment_enabled( 'gutenberg-widget-experiments' ) ) {
		return;
	}

	register_widget( 'WP_Widget_Block' );
	// By default every widget on widgets.php is wrapped with a <form>.
	// This means that you can sometimes end up with invalid HTML, e.g. when
	// one of the widgets is a Search block.
	//
	// To fix the problem, let's add a filter that moves the form below the actual
	// widget content.
	global $pagenow;
	if ( 'widgets.php' === $pagenow ) {
		add_filter(
			'dynamic_sidebar_params',
			'gutenberg_override_sidebar_params_for_block_widget'
		);
	}
}

/**
 * Overrides dynamic_sidebar_params to make sure Blocks are not wrapped in <form> tag.
 *
 * @param  array $arg Dynamic sidebar params.
 * @return array Updated dynamic sidebar params.
 */
function gutenberg_override_sidebar_params_for_block_widget( $arg ) {
	if ( 'Block' === $arg[0]['widget_name'] ) {
		$arg[0]['before_form']           = '';
		$arg[0]['before_widget_content'] = '<div class="widget-content">';
		$arg[0]['after_widget_content']  = '</div><form class="block-widget-form">';
		$arg[0]['after_form']            = '</form>';
	}

	return $arg;
}

add_action( 'widgets_init', 'gutenberg_register_widgets' );
