<?php
/**
 * Admin Tests
 *
 * @package Gutenberg
 */

/**
 * Test functions in register.php
 */
class Admin_Test extends WP_UnitTestCase {

	/**
	 * Editor user ID.
	 *
	 * @var int
	 */
	protected static $editor_user_id;

	/**
	 * ID for a post containing blocks.
	 *
	 * @var int
	 */
	protected static $post_with_blocks;

	/**
	 * ID for a post without blocks.
	 *
	 * @var int
	 */
	protected static $post_without_blocks;

	/**
	 * Set up before class.
	 */
	public static function wpSetUpBeforeClass() {
		self::$editor_user_id      = self::factory()->user->create(
			array(
				'role' => 'editor',
			)
		);
		self::$post_with_blocks    = self::factory()->post->create(
			array(
				'post_title'   => 'Example',
				'post_content' => "<!-- wp:core/text {\"dropCap\":true} -->\n<p class=\"has-drop-cap\">Tester</p>\n<!-- /wp:core/text -->",
			)
		);
		self::$post_without_blocks = self::factory()->post->create(
			array(
				'post_title'   => 'Example',
				'post_content' => 'Tester',
			)
		);
	}

	/**
	 * Tests gutenberg_can_edit_post().
	 *
	 * @covers ::gutenberg_can_edit_post
	 */
	function test_gutenberg_can_edit_post() {
		$this->assertFalse( gutenberg_can_edit_post( -1 ) );
		$bogus_post_id = $this->factory()->post->create(
			array(
				'post_type' => 'bogus',
			)
		);
		$this->assertFalse( gutenberg_can_edit_post( $bogus_post_id ) );

		register_post_type(
			'restless',
			array(
				'show_in_rest' => false,
			)
		);
		$restless_post_id = $this->factory()->post->create(
			array(
				'post_type' => 'restless',
			)
		);
		$this->assertFalse( gutenberg_can_edit_post( $restless_post_id ) );

		$generic_post_id = $this->factory()->post->create();

		wp_set_current_user( 0 );
		$this->assertFalse( gutenberg_can_edit_post( $generic_post_id ) );

		wp_set_current_user( self::$editor_user_id );
		$this->assertTrue( gutenberg_can_edit_post( $generic_post_id ) );

		$blog_page_without_content = self::factory()->post->create(
			array(
				'post_title'   => 'Blog',
				'post_content' => '',
			)
		);
		update_option( 'page_for_posts', $blog_page_without_content );
		$this->assertFalse( gutenberg_can_edit_post( $blog_page_without_content ) );

		$blog_page_with_content = self::factory()->post->create(
			array(
				'post_title'   => 'Blog',
				'post_content' => 'Hello World!',
			)
		);
		update_option( 'page_for_posts', $blog_page_with_content );
		$this->assertTrue( gutenberg_can_edit_post( $blog_page_with_content ) );

		add_filter( 'gutenberg_can_edit_post', '__return_false' );
		$this->assertFalse( gutenberg_can_edit_post( $generic_post_id ) );
		remove_filter( 'gutenberg_can_edit_post', '__return_false' );

		add_filter( 'gutenberg_can_edit_post', '__return_true' );
		$this->assertTrue( gutenberg_can_edit_post( $restless_post_id ) );
		remove_filter( 'gutenberg_can_edit_post', '__return_true' );
	}

	/**
	 * Tests gutenberg_post_has_blocks().
	 *
	 * @covers ::gutenberg_post_has_blocks
	 * @expectedDeprecated gutenberg_post_has_blocks
	 */
	function test_gutenberg_post_has_blocks() {
		$this->assertTrue( gutenberg_post_has_blocks( self::$post_with_blocks ) );
		$this->assertFalse( gutenberg_post_has_blocks( self::$post_without_blocks ) );
	}

	/**
	 * Tests gutenberg_content_has_blocks().
	 *
	 * @covers ::gutenberg_content_has_blocks
	 * @expectedDeprecated gutenberg_content_has_blocks
	 */
	function test_gutenberg_content_has_blocks() {
		$content_with_blocks    = get_post_field( 'post_content', self::$post_with_blocks );
		$content_without_blocks = get_post_field( 'post_content', self::$post_without_blocks );

		$this->assertTrue( gutenberg_content_has_blocks( $content_with_blocks ) );
		$this->assertFalse( gutenberg_content_has_blocks( $content_without_blocks ) );
	}
}
