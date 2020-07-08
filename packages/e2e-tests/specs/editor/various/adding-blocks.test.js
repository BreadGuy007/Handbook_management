/**
 * WordPress dependencies
 */
import {
	createNewPost,
	insertBlock,
	getEditedPostContent,
	pressKeyTimes,
	setBrowserViewport,
	closeGlobalBlockInserter,
} from '@wordpress/e2e-test-utils';

/** @typedef {import('puppeteer').ElementHandle} ElementHandle */

describe( 'adding blocks', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	/**
	 * Given a Puppeteer ElementHandle, clicks below its bounding box.
	 *
	 * @param {ElementHandle} elementHandle Element handle.
	 *
	 * @return {Promise} Promise resolving when click occurs.
	 */
	async function clickAtBottom( elementHandle ) {
		const box = await elementHandle.boundingBox();
		const x = box.x + box.width / 2;
		const y = box.y + box.height - 50;
		return page.mouse.click( x, y );
	}

	it( 'Should insert content using the placeholder and the regular inserter', async () => {
		// This ensures the editor is loaded in navigation mode.
		await page.reload();

		// Set a tall viewport. The typewriter's intrinsic height can be enough
		// to scroll the page on a shorter viewport, thus obscuring the presence
		// of any potential buggy behavior with the "stretched" click redirect.
		await setBrowserViewport( { width: 960, height: 1400 } );

		// Click below editor to focus last field (block appender)
		await clickAtBottom(
			await page.$( '.interface-interface-skeleton__content' )
		);
		expect( await page.$( '[data-type="core/paragraph"]' ) ).not.toBeNull();
		await page.keyboard.type( 'Paragraph block' );

		// Using the slash command
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( '/quote' );
		await page.waitForXPath(
			`//*[contains(@class, "components-autocomplete__result") and contains(@class, "is-selected") and contains(text(), 'Quote')]`
		);
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Quote block' );

		// Arrow down into default appender.
		await page.keyboard.press( 'ArrowDown' );
		await page.keyboard.press( 'ArrowDown' );

		// Focus should be moved to block focus boundary on a block which does
		// not have its own inputs (e.g. image). Proceeding to press enter will
		// append the default block. Pressing backspace on the focused block
		// will remove it.
		await page.keyboard.type( '/image' );
		await page.waitForXPath(
			`//*[contains(@class, "components-autocomplete__result") and contains(@class, "is-selected") and contains(text(), 'Image')]`
		);
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'Enter' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
		await page.keyboard.press( 'Backspace' );
		await page.keyboard.press( 'Backspace' );
		expect( await getEditedPostContent() ).toMatchSnapshot();

		// Using the regular inserter
		await insertBlock( 'Preformatted' );
		await page.keyboard.type( 'Pre block' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'Enter' );

		// Verify vertical traversal at offset. This has been buggy in the past
		// where verticality on a blank newline would skip into previous block.
		await page.keyboard.type( 'Foo' );
		await page.keyboard.press( 'ArrowUp' );
		await page.keyboard.press( 'ArrowUp' );
		await pressKeyTimes( 'Delete', 6 );
		await page.keyboard.type( ' text' );

		// Ensure newline preservation in shortcode block.
		// See: https://github.com/WordPress/gutenberg/issues/4456
		await insertBlock( 'Shortcode' );
		await page.keyboard.type( '[myshortcode]With multiple' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'lines preserved[/myshortcode]' );

		// Unselect blocks to avoid conflicts with the inbetween inserter
		await page.click( '.editor-post-title__input' );
		await closeGlobalBlockInserter();

		// Using the between inserter
		const insertionPoint = await page.$( '[data-type="core/quote"]' );
		const rect = await insertionPoint.boundingBox();
		await page.mouse.move( rect.x + rect.width / 2, rect.y - 10, {
			steps: 10,
		} );
		await page.waitForSelector(
			'.block-editor-block-list__insertion-point .block-editor-inserter__toggle'
		);
		await page.click(
			'.block-editor-block-list__insertion-point .block-editor-inserter__toggle'
		);
		// [TODO]: Search input should be focused immediately. It shouldn't be
		// necessary to have `waitForFunction`.
		await page.waitForFunction(
			() =>
				document.activeElement &&
				document.activeElement.classList.contains(
					'block-editor-inserter__search-input'
				)
		);
		await page.keyboard.type( 'para' );
		await pressKeyTimes( 'Tab', 2 );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Second paragraph' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	// Check for regression of https://github.com/WordPress/gutenberg/issues/9583
	it( 'should not allow transfer of focus outside of the block-insertion menu once open', async () => {
		// Enter the default block and click the inserter toggle button to the left of it.
		await page.keyboard.press( 'ArrowDown' );
		await page.click(
			'.block-editor-block-list__empty-block-inserter .block-editor-inserter__toggle'
		);

		// Expect the inserter search input to be the active element.
		let activeElementClassList = await page.evaluate(
			() => document.activeElement.classList
		);
		expect( Object.values( activeElementClassList ) ).toContain(
			'block-editor-inserter__search-input'
		);

		// Try using the up arrow key (vertical navigation triggers the issue described in #9583).
		await page.keyboard.press( 'ArrowUp' );

		// Expect the inserter search input to still be the active element.
		activeElementClassList = await page.evaluate(
			() => document.activeElement.classList
		);
		expect( Object.values( activeElementClassList ) ).toContain(
			'block-editor-inserter__search-input'
		);

		// Tab to the block list
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Tab' );

		// Expect the block list to be the active element.
		activeElementClassList = await page.evaluate(
			() => document.activeElement.classList
		);
		expect( Object.values( activeElementClassList ) ).toContain(
			'block-editor-block-types-list__item'
		);

		// Try using the up arrow key
		await page.keyboard.press( 'ArrowUp' );

		// Expect the block list to still be the active element.
		activeElementClassList = await page.evaluate(
			() => document.activeElement.classList
		);
		expect( Object.values( activeElementClassList ) ).toContain(
			'block-editor-block-types-list__item'
		);

		// Press escape to close the block inserter.
		await page.keyboard.press( 'Escape' );

		// Expect focus to have transferred back to the inserter toggle button.
		activeElementClassList = await page.evaluate(
			() => document.activeElement.classList
		);
		expect( Object.values( activeElementClassList ) ).toContain(
			'block-editor-inserter__toggle'
		);
	} );

	// Check for regression of https://github.com/WordPress/gutenberg/issues/23263
	it( 'inserts blocks at root level when using the root appender while selection is in an inner block', async () => {
		await insertBlock( 'Buttons' );
		await page.keyboard.type( '1.1' );

		// After inserting the Buttons block the inner button block should be selected.
		const selectedButtonBlocks = await page.$$(
			'.wp-block-button.is-selected'
		);
		expect( selectedButtonBlocks.length ).toBe( 1 );

		// Specifically click the root container appender.
		await page.click(
			'.block-editor-block-list__layout.is-root-container > .block-list-appender .block-editor-inserter__toggle'
		);

		// Insert a paragraph block.
		await page.waitForSelector( '.block-editor-inserter__search-input' );
		await page.keyboard.type( 'Paragraph' );
		await page.click( '.editor-block-list-item-paragraph' );
		await page.keyboard.type( '2' );

		// The snapshot should show a buttons block followed by a paragraph.
		// The buttons block should contain a single button.
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
