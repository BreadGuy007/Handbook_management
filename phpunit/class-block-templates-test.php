<?php
/**
 * REST API: Block_Templates_Test class
 *
 * @package    WordPress
 * @subpackage REST_API
 */

/**
 * Tests for the Block Templates abstraction layer.
 */
class Block_Templates_Test extends WP_UnitTestCase {
	private static $post;

	public static function wpSetUpBeforeClass() {
		switch_theme( 'tt1-blocks' );
		gutenberg_register_template_post_type();
		gutenberg_register_template_part_post_type();
		gutenberg_register_wp_theme_taxonomy();

		$args       = array(
			'post_type'    => 'wp_template',
			'post_name'    => 'my_template',
			'post_title'   => 'My Template',
			'post_content' => 'Content',
			'post_excerpt' => 'Description of my template',
			'tax_input'    => array(
				'wp_theme' => array(
					get_stylesheet(),
				),
			),
		);
		self::$post = self::factory()->post->create_and_get( $args );
		wp_set_post_terms( self::$post->ID, get_stylesheet(), 'wp_theme' );
	}

	public static function wpTearDownAfterClass() {
		wp_delete_post( self::$post->ID );
	}

	function test_gutenberg_build_template_result_from_file() {
		$template = _gutenberg_build_template_result_from_file(
			array(
				'slug' => 'single',
				'path' => __DIR__ . '/fixtures/template.html',
			),
			'wp_template'
		);

		$this->assertEquals( get_stylesheet() . '//single', $template->id );
		$this->assertEquals( get_stylesheet(), $template->theme );
		$this->assertEquals( 'single', $template->slug );
		$this->assertEquals( 'publish', $template->status );
		$this->assertEquals( false, $template->is_custom );
		$this->assertEquals( 'Single', $template->title );
		$this->assertEquals( 'Used when a single entry that is not a Page is queried', $template->description );
		$this->assertEquals( 'wp_template', $template->type );
	}

	function test_gutenberg_build_template_result_from_post() {
		$template = _gutenberg_build_template_result_from_post(
			self::$post,
			'wp_template'
		);

		$this->assertNotWPError( $template );
		$this->assertEquals( get_stylesheet() . '//my_template', $template->id );
		$this->assertEquals( get_stylesheet(), $template->theme );
		$this->assertEquals( 'my_template', $template->slug );
		$this->assertEquals( 'publish', $template->status );
		$this->assertEquals( true, $template->is_custom );
		$this->assertEquals( 'My Template', $template->title );
		$this->assertEquals( 'Description of my template', $template->description );
		$this->assertEquals( 'wp_template', $template->type );
	}

	function test_inject_theme_attribute_in_content() {
		$theme                           = get_stylesheet();
		$content_without_theme_attribute = '<!-- wp:template-part {"slug":"header","align":"full", "tagName":"header","className":"site-header"} /-->';
		$template_content                = _inject_theme_attribute_in_content(
			$content_without_theme_attribute,
			$theme
		);
		$expected                        = sprintf(
			'<!-- wp:template-part {"slug":"header","align":"full","tagName":"header","className":"site-header","theme":"%s"} /-->',
			get_stylesheet()
		);
		$this->assertEquals( $expected, $template_content );

		// Does not inject theme when there is an existing theme attribute.
		$content_with_existing_theme_attribute = '<!-- wp:template-part {"slug":"header","theme":"fake-theme","align":"full", "tagName":"header","className":"site-header"} /-->';
		$template_content                      = _inject_theme_attribute_in_content(
			$content_with_existing_theme_attribute,
			$theme
		);
		$this->assertEquals( $content_with_existing_theme_attribute, $template_content );

		// Does not inject theme when there is no template part.
		$content_with_no_template_part = '<!-- wp:post-content /-->';
		$template_content              = _inject_theme_attribute_in_content(
			$content_with_no_template_part,
			$theme
		);
		$this->assertEquals( $content_with_no_template_part, $template_content );
	}

	/**
	 * Should retrieve the template from the theme files.
	 */
	function test_gutenberg_get_block_template_from_file() {
		$id       = get_stylesheet() . '//' . 'index';
		$template = gutenberg_get_block_template( $id, 'wp_template' );
		$this->assertEquals( $id, $template->id );
		$this->assertEquals( get_stylesheet(), $template->theme );
		$this->assertEquals( 'index', $template->slug );
		$this->assertEquals( 'publish', $template->status );
		$this->assertEquals( false, $template->is_custom );
		$this->assertEquals( 'wp_template', $template->type );
	}

	/**
	 * Should retrieve the template from the CPT.
	 */
	function test_gutenberg_get_block_template_from_post() {
		$id       = get_stylesheet() . '//' . 'my_template';
		$template = gutenberg_get_block_template( $id, 'wp_template' );
		$this->assertEquals( $id, $template->id );
		$this->assertEquals( get_stylesheet(), $template->theme );
		$this->assertEquals( 'my_template', $template->slug );
		$this->assertEquals( 'publish', $template->status );
		$this->assertEquals( true, $template->is_custom );
		$this->assertEquals( 'wp_template', $template->type );
	}

	/**
	 * Should retrieve block templates (file and CPT)
	 */
	function test_gutenberg_get_block_templates() {
		function get_template_ids( $templates ) {
			return array_map(
				function( $template ) {
					return $template->id;
				},
				$templates
			);
		}

		// All results.
		$templates    = gutenberg_get_block_templates( array(), 'wp_template' );
		$template_ids = get_template_ids( $templates );

		// Avoid testing the entire array because the theme might add/remove templates.
		$this->assertContains( get_stylesheet() . '//' . 'my_template', $template_ids );
		$this->assertContains( get_stylesheet() . '//' . 'index', $template_ids );

		// Filter by slug.
		$templates    = gutenberg_get_block_templates( array( 'slug__in' => array( 'my_template' ) ), 'wp_template' );
		$template_ids = get_template_ids( $templates );
		$this->assertEquals( array( get_stylesheet() . '//' . 'my_template' ), $template_ids );

		// Filter by CPT ID.
		$templates    = gutenberg_get_block_templates( array( 'wp_id' => self::$post->ID ), 'wp_template' );
		$template_ids = get_template_ids( $templates );
		$this->assertEquals( array( get_stylesheet() . '//' . 'my_template' ), $template_ids );
	}
}
