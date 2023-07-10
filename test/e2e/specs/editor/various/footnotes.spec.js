/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

async function getFootnotes( page ) {
	// Save post so we can check meta.
	await page.click( 'button:text("Save draft")' );
	await page.waitForSelector( 'button:text("Saved")' );
	const footnotes = await page.evaluate( () => {
		return window.wp.data
			.select( 'core' )
			.getEntityRecord(
				'postType',
				'post',
				window.wp.data.select( 'core/editor' ).getCurrentPostId()
			).meta.footnotes;
	} );
	return JSON.parse( footnotes );
}

test.describe( 'Footnotes', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'can be inserted', async ( { editor, page } ) => {
		await editor.canvas.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( 'first paragraph' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'second paragraph' );

		await editor.showBlockToolbar();
		await editor.clickBlockToolbarButton( 'More' );
		await page.locator( 'button:text("Footnote")' ).click();

		await page.keyboard.type( 'first footnote' );

		const id1 = await editor.canvas.evaluate( () => {
			return document.activeElement.id;
		} );

		expect( await editor.getBlocks() ).toMatchObject( [
			{
				name: 'core/paragraph',
				attributes: { content: 'first paragraph' },
			},
			{
				name: 'core/paragraph',
				attributes: {
					content: `second paragraph<a href="#${ id1 }" id="${ id1 }-link" data-fn="${ id1 }" class="fn">*</a>`,
				},
			},
			{
				name: 'core/footnotes',
			},
		] );

		await editor.canvas.click( 'p:text("first paragraph")' );

		await editor.showBlockToolbar();
		await editor.clickBlockToolbarButton( 'More' );
		await page.locator( 'button:text("Footnote")' ).click();

		await page.keyboard.type( 'second footnote' );

		const id2 = await editor.canvas.evaluate( () => {
			return document.activeElement.id;
		} );

		expect( await editor.getBlocks() ).toMatchObject( [
			{
				name: 'core/paragraph',
				attributes: {
					content: `first paragraph<a href="#${ id2 }" id="${ id2 }-link" data-fn="${ id2 }" class="fn">*</a>`,
				},
			},
			{
				name: 'core/paragraph',
				attributes: {
					content: `second paragraph<a href="#${ id1 }" id="${ id1 }-link" data-fn="${ id1 }" class="fn">*</a>`,
				},
			},
			{
				name: 'core/footnotes',
			},
		] );

		expect( await getFootnotes( page ) ).toMatchObject( [
			{
				content: 'second footnote',
				id: id2,
			},
			{
				content: 'first footnote',
				id: id1,
			},
		] );

		await editor.canvas.click( 'p:text("first paragraph")' );

		await editor.showBlockToolbar();
		await editor.clickBlockToolbarButton( 'Move down' );

		expect( await editor.getBlocks() ).toMatchObject( [
			{
				name: 'core/paragraph',
				attributes: {
					content: `second paragraph<a href="#${ id1 }" id="${ id1 }-link" data-fn="${ id1 }" class="fn">*</a>`,
				},
			},
			{
				name: 'core/paragraph',
				attributes: {
					content: `first paragraph<a href="#${ id2 }" id="${ id2 }-link" data-fn="${ id2 }" class="fn">*</a>`,
				},
			},
			{
				name: 'core/footnotes',
			},
		] );

		expect( await getFootnotes( page ) ).toMatchObject( [
			{
				content: 'first footnote',
				id: id1,
			},
			{
				content: 'second footnote',
				id: id2,
			},
		] );

		await editor.canvas.click( `a[href="#${ id2 }-link"]` );
		await page.keyboard.press( 'Backspace' );

		expect( await editor.getBlocks() ).toMatchObject( [
			{
				name: 'core/paragraph',
				attributes: {
					content: `second paragraph<a href="#${ id1 }" id="${ id1 }-link" data-fn="${ id1 }" class="fn">*</a>`,
				},
			},
			{
				name: 'core/paragraph',
				attributes: {
					content: `first paragraph`,
				},
			},
			{
				name: 'core/footnotes',
			},
		] );

		expect( await getFootnotes( page ) ).toMatchObject( [
			{
				content: 'first footnote',
				id: id1,
			},
		] );

		await editor.canvas.click( `a[href="#${ id1 }-link"]` );
		await page.keyboard.press( 'Backspace' );

		expect( await editor.getBlocks() ).toMatchObject( [
			{
				name: 'core/paragraph',
				attributes: {
					content: `second paragraph`,
				},
			},
			{
				name: 'core/paragraph',
				attributes: {
					content: `first paragraph`,
				},
			},
			{
				name: 'core/footnotes',
			},
		] );

		expect( await getFootnotes( page ) ).toMatchObject( [] );
	} );

	test( 'can be inserted in a list', async ( { editor, page } ) => {
		await editor.canvas.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '* 1' );
		await editor.clickBlockToolbarButton( 'More' );
		await page.locator( 'button:text("Footnote")' ).click();

		await page.keyboard.type( 'a' );

		const id1 = await editor.canvas.evaluate( () => {
			return document.activeElement.id;
		} );

		expect( await editor.getBlocks() ).toMatchObject( [
			{
				name: 'core/list',
				innerBlocks: [
					{
						name: 'core/list-item',
						attributes: {
							content: `1<a href="#${ id1 }" id="${ id1 }-link" data-fn="${ id1 }" class="fn">*</a>`,
						},
					},
				],
			},
			{
				name: 'core/footnotes',
			},
		] );

		expect( await getFootnotes( page ) ).toMatchObject( [
			{
				content: 'a',
				id: id1,
			},
		] );
	} );

	test( 'can be inserted in a table', async ( { editor, page } ) => {
		await editor.insertBlock( { name: 'core/table' } );
		await editor.canvas.click( 'role=button[name="Create Table"i]' );
		await page.keyboard.type( '1' );
		await editor.showBlockToolbar();
		await editor.clickBlockToolbarButton( 'More' );
		await page.locator( 'button:text("Footnote")' ).click();

		await page.keyboard.type( 'a' );

		const id1 = await editor.canvas.evaluate( () => {
			return document.activeElement.id;
		} );

		expect( await editor.getBlocks() ).toMatchObject( [
			{
				name: 'core/table',
				attributes: {
					body: [
						{
							cells: [
								{
									content: `1<a href="#${ id1 }" id="${ id1 }-link" data-fn="${ id1 }" class="fn">*</a>`,
									tag: 'td',
								},
								{
									content: '',
									tag: 'td',
								},
							],
						},
						{
							cells: [
								{
									content: '',
									tag: 'td',
								},
								{
									content: '',
									tag: 'td',
								},
							],
						},
					],
				},
			},
			{
				name: 'core/footnotes',
			},
		] );

		expect( await getFootnotes( page ) ).toMatchObject( [
			{
				content: 'a',
				id: id1,
			},
		] );
	} );
} );
