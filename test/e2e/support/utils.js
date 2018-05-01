/**
 * Node dependencies
 */
import { join } from 'path';
import { URL } from 'url';

const {
	WP_BASE_URL = 'http://localhost:8888',
	WP_USERNAME = 'admin',
	WP_PASSWORD = 'password',
} = process.env;

/**
 * Platform-specific modifier key.
 *
 * @see pressWithModifier
 *
 * @type {string}
 */
const MOD_KEY = process.platform === 'darwin' ? 'Meta' : 'Control';

function getUrl( WPPath, query = '' ) {
	const url = new URL( WP_BASE_URL );

	url.pathname = join( url.pathname, WPPath );
	url.search = query;

	return url.href;
}

function isWPPath( WPPath, query = '' ) {
	const currentUrl = new URL( page.url() );

	currentUrl.search = query;

	return getUrl( WPPath ) === currentUrl.href;
}

async function goToWPPath( WPPath, query ) {
	await page.goto( getUrl( WPPath, query ) );
}

async function login() {
	await page.type( '#user_login', WP_USERNAME );
	await page.type( '#user_pass', WP_PASSWORD );

	await Promise.all( [
		page.waitForNavigation(),
		page.click( '#wp-submit' ),
	] );
}

export async function visitAdmin( adminPath, query ) {
	await goToWPPath( join( 'wp-admin', adminPath ), query );

	if ( isWPPath( 'wp-login.php' ) ) {
		await login();
		return visitAdmin( adminPath, query );
	}
}

export async function newPost( postType ) {
	await visitAdmin( 'post-new.php', postType ? 'post_type=' + postType : '' );
}

export async function newDesktopBrowserPage() {
	global.page = await browser.newPage();
	await page.setViewport( { width: 1000, height: 700 } );
}

export async function switchToEditor( mode ) {
	await page.click( '.edit-post-more-menu [aria-label="More"]' );
	const [ button ] = await page.$x( `//button[contains(text(), \'${ mode } Editor\')]` );
	await button.click( 'button' );
}

export async function getHTMLFromCodeEditor() {
	await switchToEditor( 'Code' );
	const textEditorContent = await page.$eval( '.editor-post-text-editor', ( element ) => element.value );
	await switchToEditor( 'Visual' );
	return textEditorContent;
}

/**
 * Performs a key press with modifier (Shift, Control, Meta, Mod), where "Mod"
 * is normalized to platform-specific modifier (Meta in MacOS, else Control).
 *
 * @param {string} modifier Modifier key.
 * @param {string} key      Key to press while modifier held.
 *
 * @return {Promise} Promise resolving when key combination pressed.
 */
export async function pressWithModifier( modifier, key ) {
	if ( modifier.toLowerCase() === 'mod' ) {
		modifier = MOD_KEY;
	}

	await page.keyboard.down( modifier );
	await page.keyboard.press( key );
	return page.keyboard.up( modifier );
}
