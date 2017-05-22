<?php
/**
 * Blocks registration Tests
 *
 * @package Gutenberg
 */

/**
 * Test register_block
 */
class Registration_Test extends WP_UnitTestCase {
	function tearDown() {
		$GLOBALS['wp_registered_blocks'] = array();
	}

	/**
	 * Should reject numbers
	 *
	 * @expectedIncorrectUsage register_block
	 */
	function test_invalid_non_string_slugs() {
		$result = register_block( 1, array() );
		$this->assertFalse( $result );
	}

	/**
	 * Should reject blocks without a namespace
	 *
	 * @expectedIncorrectUsage register_block
	 */
	function test_invalid_slugs_without_namespace() {
		$result = register_block( 'text', array() );
		$this->assertFalse( $result );
	}

	/**
	 * Should reject blocks with invalid characters
	 *
	 * @expectedIncorrectUsage register_block
	 */
	function test_invlalid_characters() {
		$result = register_block( 'still/_doing_it_wrong', array() );
		$this->assertFalse( $result );
	}

	/**
	 * Should accept valid block names
	 */
	function test_register_block() {
		global $wp_registered_blocks;
		$settings = array(
			'icon' => 'text',
		);
		$updated_settings = register_block( 'core/text', $settings );
		$this->assertEquals( $updated_settings, array(
			'icon' => 'text',
			'slug' => 'core/text',
		) );
		$this->assertEquals( $updated_settings, $wp_registered_blocks['core/text'] );
	}

	/**
	 * Should fail to re-register the same block
	 *
	 * @expectedIncorrectUsage register_block
	 */
	function test_register_block_twice() {
		$settings = array(
			'icon' => 'text',
		);
		$result = register_block( 'core/text', $settings );
		$this->assertNotFalse( $result );
		$result = register_block( 'core/text', $settings );
		$this->assertFalse( $result );
	}

	/**
	 * Unregistering should fail if a block is not registered
	 *
	 * @expectedIncorrectUsage unregister_block
	 */
	function test_unregister_not_registered_block() {
		$result = unregister_block( 'core/unregistered' );
		$this->assertFalse( $result );
	}

	/**
	 * Should unregister existing blocks
	 */
	function test_unregister_block() {
		global $wp_registered_blocks;
		$settings = array(
			'icon' => 'text',
		);
		register_block( 'core/text', $settings );
		$unregistered_block = unregister_block( 'core/text' );
		$this->assertEquals( $unregistered_block, array(
			'icon' => 'text',
			'slug' => 'core/text',
		) );
		$this->assertFalse( isset( $wp_registered_blocks['core/text'] ) );
	}
}
