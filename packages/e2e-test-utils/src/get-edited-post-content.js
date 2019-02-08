/**
 * Returns a promise which resolves with the edited post content (HTML string).
 *
 * @return {Promise} Promise resolving with post content markup.
 */
export async function getEditedPostContent() {
	return await page.evaluate( () => {
		return window.wp.data.select( 'core/editor' ).getEditedPostContent();
	} );
}
