/**
 * Clicks a block toolbar button.
 *
 * @param {string} buttonAriaLabel The aria label of the button to click.
 */
export async function clickBlockToolbarButton( buttonAriaLabel ) {
	const BLOCK_TOOLBAR_SELECTOR = '.block-editor-block-toolbar';
	const BUTTON_SELECTOR = `${ BLOCK_TOOLBAR_SELECTOR } button[aria-label="${ buttonAriaLabel }"]`;
	if ( ( await page.$( BLOCK_TOOLBAR_SELECTOR ) ) === null ) {
		// Move the mouse to show the block toolbar
		await page.mouse.move( 0, 0 );
		await page.mouse.move( 10, 10 );
	}

	// Hover the block switcher to show the movers
	const switcher = await page.$(
		'.block-editor-block-toolbar .block-editor-block-toolbar__block-switcher-wrapper'
	);
	if ( switcher ) {
		await switcher.hover();
	}

	await page.waitForSelector( BUTTON_SELECTOR );
	await page.click( BUTTON_SELECTOR );
}
