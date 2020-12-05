<?php

/**
 * Test WP_Theme_JSON class.
 *
 * @package Gutenberg
 */

class WP_Theme_JSON_Test extends WP_UnitTestCase {

	function test_contexts_not_valid_are_skipped() {
		$theme_json = new WP_Theme_JSON(
			array(
				'global'       => array(
					'settings' => array(
						'color' => array(
							'custom' => 'false',
						),
					),
				),
				'core/invalid' => array(
					'settings' => array(
						'color' => array(
							'custom' => 'false',
						),
					),
				),
			)
		);
		$result     = $theme_json->get_raw_data();

		$expected = array(
			'global' => array(
				'settings' => array(
					'color' => array(
						'custom' => 'false',
					),
				),
			),
		);

		$this->assertEqualSetsWithIndex( $expected, $result );
	}

	function test_properties_not_valid_are_skipped() {
		$theme_json = new WP_Theme_JSON(
			array(
				'global' => array(
					'invalidKey' => 'invalid value',
					'settings'   => array(
						'color'          => array(
							'custom'     => 'false',
							'invalidKey' => 'invalid value',
						),
						'invalidSection' => array(
							'invalidKey' => 'invalid value',
						),
					),
					'styles'     => array(
						'typography'     => array(
							'fontSize'        => '12',
							'invalidProperty' => 'invalid value',
						),
						'invalidSection' => array(
							'invalidProperty' => 'invalid value',
						),
					),
				),
			)
		);
		$result     = $theme_json->get_raw_data();

		$expected = array(
			'global' => array(
				'settings' => array(
					'color' => array(
						'custom' => 'false',
					),
				),
				'styles'   => array(
					'typography' => array(
						'fontSize' => '12',
					),
				),
			),
		);

		$this->assertEqualSetsWithIndex( $expected, $result );
	}

	function test_get_settings() {
		// See schema at WP_Theme_JSON::SCHEMA.
		$theme_json = new WP_Theme_JSON(
			array(
				'global' => array(
					'settings' => array(
						'color'      => array(
							'link' => 'value',
						),
						'custom'     => 'value',
						'typography' => 'value',
						'misc'       => 'value',
					),
					'styles'   => array(
						'color' => 'value',
						'misc'  => 'value',
					),
					'misc'     => 'value',
				),
			)
		);

		$result = $theme_json->get_settings();

		$this->assertArrayHasKey( 'global', $result );
		$this->assertCount( 1, $result );

		$this->assertArrayHasKey( 'color', $result['global'] );
		$this->assertArrayHasKey( 'custom', $result['global'] );
		$this->assertCount( 2, $result['global'] );
	}

	function test_get_stylesheet() {
		// See schema at WP_Theme_JSON::SCHEMA.
		$theme_json = new WP_Theme_JSON(
			array(
				'global' => array(
					'settings' => array(
						'color'      => array(
							'text'    => 'value',
							'palette' => array(
								array(
									'slug'  => 'grey',
									'color' => 'grey',
								),
							),
						),
						'typography' => array(
							'fontFamilies' => array(
								array(
									'slug'       => 'small',
									'fontFamily' => '14px',
								),
								array(
									'slug'       => 'big',
									'fontFamily' => '41px',
								),
							),
						),
						'misc'       => 'value',
					),
					'styles'   => array(
						'color' => array(
							'link' => '#111',
							'text' => 'var:preset|color|grey',
						),
						'misc'  => 'value',
					),
					'misc'     => 'value',
				),
			)
		);

		$this->assertEquals(
			$theme_json->get_stylesheet(),
			':root{--wp--preset--color--grey: grey;--wp--preset--font-family--small: 14px;--wp--preset--font-family--big: 41px;}:root{--wp--style--color--link: #111;color: var(--wp--preset--color--grey);}.has-grey-color{color: grey;}.has-grey-background-color{background-color: grey;}'
		);
		$this->assertEquals(
			$theme_json->get_stylesheet( 'block_styles' ),
			':root{--wp--style--color--link: #111;color: var(--wp--preset--color--grey);}.has-grey-color{color: grey;}.has-grey-background-color{background-color: grey;}'
		);
		$this->assertEquals(
			$theme_json->get_stylesheet( 'css_variables' ),
			':root{--wp--preset--color--grey: grey;--wp--preset--font-family--small: 14px;--wp--preset--font-family--big: 41px;}'
		);
	}

	public function test_merge_incoming_data() {
		$initial = array(
			'global'         => array(
				'settings' => array(
					'color' => array(
						'custom'  => 'false',
						'palette' => array(
							array(
								'slug'  => 'red',
								'color' => 'red',
							),
							array(
								'slug'  => 'blue',
								'color' => 'blue',
							),
						),
					),
				),
				'styles'   => array(
					'typography' => array(
						'fontSize' => '12',
					),
				),
			),
			'core/paragraph' => array(
				'settings' => array(
					'color' => array(
						'custom' => 'false',
					),
				),
			),
		);

		$add_new_context = array(
			'core/list' => array(
				'settings' => array(
					'color' => array(
						'custom' => 'false',
					),
				),
				'styles'   => array(
					'typography' => array(
						'fontSize' => '12',
					),
					'color'      => array(
						'link'       => 'pink',
						'background' => 'brown',
					),
				),
			),
		);

		$add_key_in_settings = array(
			'global' => array(
				'settings' => array(
					'color' => array(
						'customGradient' => 'true',
					),
				),
			),
		);

		$update_key_in_settings = array(
			'global' => array(
				'settings' => array(
					'color' => array(
						'custom' => 'true',
					),
				),
			),
		);

		$add_styles = array(
			'core/paragraph' => array(
				'styles' => array(
					'typography' => array(
						'fontSize' => '12',
					),
					'color'      => array(
						'link' => 'pink',
					),
				),
			),
		);

		$add_key_in_styles = array(
			'core/paragraph' => array(
				'styles' => array(
					'typography' => array(
						'lineHeight' => '12',
					),
				),
			),
		);

		$add_invalid_context = array(
			'core/para' => array(
				'styles' => array(
					'typography' => array(
						'lineHeight' => '12',
					),
				),
			),
		);

		$update_presets = array(
			'global' => array(
				'settings' => array(
					'color'      => array(
						'palette'   => array(
							array(
								'slug'  => 'color',
								'color' => 'color',
							),
						),
						'gradients' => array(
							array(
								'slug'     => 'gradient',
								'gradient' => 'gradient',
							),
						),
					),
					'typography' => array(
						'fontSizes'       => array(
							array(
								'slug' => 'fontSize',
								'size' => 'fontSize',
							),
						),
						'fontFamilies'    => array(
							array(
								'slug'       => 'fontFamily',
								'fontFamily' => 'fontFamily',
							),
						),
						'fontStyles'      => array(
							array(
								'slug' => 'fontStyle',
							),
						),
						'fontWeights'     => array(
							array(
								'slug' => 'fontWeight',
							),
						),
						'textDecorations' => array(
							array(
								'slug'  => 'textDecoration',
								'value' => 'textDecoration',
							),
						),
						'textTransforms'  => array(
							array(
								'slug'  => 'textTransform',
								'value' => 'textTransform',
							),
						),
					),
				),
			),
		);

		$expected = array(
			'global'         => array(
				'settings' => array(
					'color'      => array(
						'custom'         => 'true',
						'customGradient' => 'true',
						'palette'        => array(
							array(
								'slug'  => 'color',
								'color' => 'color',
							),
						),
						'gradients'      => array(
							array(
								'slug'     => 'gradient',
								'gradient' => 'gradient',
							),
						),
					),
					'typography' => array(
						'fontSizes'       => array(
							array(
								'slug' => 'fontSize',
								'size' => 'fontSize',
							),
						),
						'fontFamilies'    => array(
							array(
								'slug'       => 'fontFamily',
								'fontFamily' => 'fontFamily',
							),
						),
						'fontStyles'      => array(
							array(
								'slug' => 'fontStyle',
							),
						),
						'fontWeights'     => array(
							array(
								'slug' => 'fontWeight',
							),
						),
						'textDecorations' => array(
							array(
								'slug'  => 'textDecoration',
								'value' => 'textDecoration',
							),
						),
						'textTransforms'  => array(
							array(
								'slug'  => 'textTransform',
								'value' => 'textTransform',
							),
						),
					),
				),
				'styles'   => array(
					'typography' => array(
						'fontSize' => '12',
					),
				),
			),
			'core/paragraph' => array(
				'settings' => array(
					'color' => array(
						'custom' => 'false',
					),
				),
				'styles'   => array(
					'typography' => array(
						'fontSize'   => '12',
						'lineHeight' => '12',
					),
					'color'      => array(
						'link' => 'pink',
					),
				),
			),
			'core/list'      => array(
				'settings' => array(
					'color' => array(
						'custom' => 'false',
					),
				),
				'styles'   => array(
					'typography' => array(
						'fontSize' => '12',
					),
					'color'      => array(
						'link'       => 'pink',
						'background' => 'brown',
					),
				),
			),
		);

		$theme_json = new WP_Theme_JSON( $initial );
		$theme_json->merge( new WP_Theme_JSON( $add_new_context ) );
		$theme_json->merge( new WP_Theme_JSON( $add_key_in_settings ) );
		$theme_json->merge( new WP_Theme_JSON( $update_key_in_settings ) );
		$theme_json->merge( new WP_Theme_JSON( $add_styles ) );
		$theme_json->merge( new WP_Theme_JSON( $add_key_in_styles ) );
		$theme_json->merge( new WP_Theme_JSON( $add_invalid_context ) );
		$theme_json->merge( new WP_Theme_JSON( $update_presets ) );
		$result = $theme_json->get_raw_data();

		$this->assertEqualSetsWithIndex( $expected, $result );
	}
}
