/**
 * Internal dependencies
 */
import '../support/bootstrap';
import { newPost, newDesktopBrowserPage, toggleMoreMenuItem } from '../support/utils';
import { activatePlugin, deactivatePlugin } from '../support/plugins';

describe( 'Using Plugins API', () => {
	beforeAll( async () => {
		await newDesktopBrowserPage();
		await activatePlugin( 'gutenberg-test-plugin-plugins-api' );
		await newPost();
	} );

	afterAll( async () => {
		await newDesktopBrowserPage();
		await deactivatePlugin( 'gutenberg-test-plugin-plugins-api' );
	} );

	it( 'Should open plugins sidebar using More Menu item and render content', async () => {
		await toggleMoreMenuItem( 'My title plugin' );

		const pluginSidebarContent = await page.$eval( '.edit-post-sidebar', ( el ) => el.innerHTML );
		expect( pluginSidebarContent ).toMatchSnapshot();
	} );

	it( 'Should close plugins sidebar using More Menu item', async () => {
		await toggleMoreMenuItem( 'My title plugin' );

		const pluginSidebar = await page.$( '.edit-post-sidebar' );
		expect( pluginSidebar ).toBeNull();
	} );
} );
