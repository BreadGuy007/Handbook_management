/**
 * Internal dependencies
 */
import '../support/bootstrap';
import { newPost, newDesktopBrowserPage } from '../support/utils';

describe( 'adding blocks', () => {
	beforeAll( async () => {
		await newDesktopBrowserPage();
		await newPost();
	} );

	/**
	 * Given a Puppeteer ElementHandle, clicks around the center-right point.
	 *
	 * TEMPORARY: This is a mild hack to work around a bug in the application
	 * which prevents clicking at center of the inserter, due to conflicting
	 * overlap of focused block contextual toolbar.
	 *
	 * @see Puppeteer.ElementHandle#click
	 *
	 * @link https://github.com/WordPress/gutenberg/pull/5658#issuecomment-376943568
	 *
	 * @param {Puppeteer.ElementHandle} elementHandle Element handle.
	 *
	 * @return {Promise} Promise resolving when element clicked.
	 */
	async function clickAtRightish( elementHandle ) {
		await elementHandle._scrollIntoViewIfNeeded();
		const box = await elementHandle._assertBoundingBox();
		const x = box.x + ( box.width * 0.75 );
		const y = box.y + ( box.height / 2 );
		return page.mouse.click( x, y );
	}

	it( 'Should insert content using the placeholder and the regular inserter', async () => {
		// Default block appender is provisional
		await page.click( '.editor-default-block-appender' );
		await page.click( '.editor-post-title__input' );

		// Post is empty, the newly created paragraph has been removed on focus out
		const paragraphBlock = await page.$( '[data-type="core/paragraph"]' );
		expect( paragraphBlock ).toBeNull();

		// Using the placeholder
		await page.click( '.editor-default-block-appender' );
		await page.keyboard.type( 'Paragraph block' );

		// Using the slash command
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( '/quote' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Quote block' );

		// Using the regular inserter
		await page.click( '.edit-post-header [aria-label="Add block"]' );
		await page.keyboard.type( 'code' );
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Code block' );

		// Using the between inserter
		await page.mouse.move( 200, 300 );
		await page.mouse.move( 250, 350 );
		const inserter = await page.$( '[data-type="core/quote"] .editor-block-list__insertion-point-inserter' );
		await clickAtRightish( inserter );
		await page.keyboard.type( 'Second paragraph' );

		// Switch to Text Mode to check HTML Output
		await page.click( '.edit-post-more-menu [aria-label="More"]' );
		const codeEditorButton = ( await page.$x( '//button[contains(text(), \'Code Editor\')]' ) )[ 0 ];
		await codeEditorButton.click( 'button' );

		// Assertions
		const textEditorContent = await page.$eval( '.editor-post-text-editor', ( element ) => element.value );

		expect( textEditorContent ).toMatchSnapshot();
	} );
} );
