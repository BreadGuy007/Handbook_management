<?php
/**
 * Dynamic blocks rendering Test
 *
 * @package Gutenberg
 */

/**
 * Test do_blocks
 */
class Dynamic_Blocks_Render_Test extends WP_UnitTestCase {

	/**
	 * Dummy block instance number.
	 *
	 * @var int
	 */
	protected $dummy_block_instance_number = 0;

	/**
	 * Dummy block rendering function.
	 *
	 * @param  array $attributes Block attributes.
	 *
	 * @return string             Block output.
	 */
	function render_dummy_block( $attributes ) {
		$this->dummy_block_instance_number += 1;
		return $this->dummy_block_instance_number . ':' . $attributes['value'];
	}

	/**
	 * Tear down.
	 */
	function tearDown() {
		parent::tearDown();

		$this->dummy_block_instance_number = 0;

		$registry = WP_Block_Type_Registry::get_instance();
		$registry->unregister( 'core/dummy' );
	}

	/**
	 * Test dynamic blocks that lack content, including void blocks.
	 *
	 * @covers ::do_blocks
	 */
	function test_dynamic_block_rendering() {
		$settings = array(
			'render_callback' => array(
				$this,
				'render_dummy_block',
			),
		);
		register_block_type( 'core/dummy', $settings );

		// The duplicated dynamic blocks below are there to ensure that do_blocks() replaces each one-by-one.
		$post_content =
			'before' .
			'<!-- wp:core/dummy {"value":"b1"} --><!-- /wp:core/dummy -->' .
			'<!-- wp:core/dummy {"value":"b1"} --><!-- /wp:core/dummy -->' .
			'between' .
			'<!-- wp:core/dummy {"value":"b2"} /-->' .
			'<!-- wp:core/dummy {"value":"b2"} /-->' .
			'after';

		$updated_post_content = do_blocks( $post_content );
		$this->assertEquals( $updated_post_content,
			'before' .
			'1:b1' .
			'2:b1' .
			'between' .
			'3:b2' .
			'4:b2' .
			'after'
		);
	}
}
