/**
 * WordPress dependencies
 */
import {
	hasBlockSwitcher,
	getAvailableBlockTransforms,
	createNewPost,
	insertBlock,
	pressKeyWithModifier,
} from '@wordpress/e2e-test-utils';

describe( 'Block Switcher', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'Should show the expected block transforms on the list block when the blocks are removed', async () => {
		// Insert a list block.
		await insertBlock( 'List' );
		await page.keyboard.type( 'List content' );
		await pressKeyWithModifier( 'alt', 'F10' );

		// Verify the block switcher exists.
		expect( await hasBlockSwitcher() ).toBeTruthy();

		// Verify the correct block transforms appear.
		expect( await getAvailableBlockTransforms() ).toEqual( [
			'Group',
			'Paragraph',
			'Quote',
			'Pullquote',
		] );
	} );

	it( 'Should show the expected block transforms on the list block when the quote block is removed', async () => {
		// Remove the quote block from the list of registered blocks.
		await page.evaluate( () => {
			wp.blocks.unregisterBlockType( 'core/quote' );
		} );

		// Insert a list block.
		await insertBlock( 'List' );
		await page.keyboard.type( 'List content' );
		await pressKeyWithModifier( 'alt', 'F10' );

		// Verify the block switcher exists.
		expect( await hasBlockSwitcher() ).toBeTruthy();

		// Verify the correct block transforms appear.
		expect( await getAvailableBlockTransforms() ).toEqual( [
			'Group',
			'Paragraph',
			'Pullquote',
		] );
	} );

	it( 'Should not show the block switcher if all the blocks the list block transforms into are removed', async () => {
		// Remove the paragraph and quote block from the list of registered blocks.
		await page.evaluate( () => {
			[
				'core/quote',
				'core/pullquote',
				'core/paragraph',
				'core/group',
			].map( ( block ) => wp.blocks.unregisterBlockType( block ) );
		} );

		// Insert a list block.
		await insertBlock( 'List' );
		await page.keyboard.type( 'List content' );
		await pressKeyWithModifier( 'alt', 'F10' );

		// Verify the block switcher exists.
		expect( await hasBlockSwitcher() ).toBeFalsy();
		// Verify the correct block transforms appear.
		expect( await getAvailableBlockTransforms() ).toHaveLength( 0 );
	} );
} );
