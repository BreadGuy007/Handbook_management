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

/**
 * Regular expression matching zero-width space characters.
 *
 * @type {RegExp}
 */
const REGEXP_ZWSP = /[\u200B\u200C\u200D\uFEFF]/;

export function getUrl( WPPath, query = '' ) {
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

export async function newPost( postType, disableTips = true ) {
	await visitAdmin( 'post-new.php', postType ? 'post_type=' + postType : '' );

	if ( disableTips ) {
		// Disable new user tips so that their UI doesn't get in the way
		await page.evaluate( () => {
			wp.data.dispatch( 'core/nux' ).disableTips();
		} );
	}
}

export async function newDesktopBrowserPage() {
	global.page = await browser.newPage();

	page.on( 'pageerror', ( error ) => {
		// Disable reason: `jest/globals` doesn't include `fail`, but it is
		// part of the global context supplied by the underlying Jasmine:
		//
		//  https://jasmine.github.io/api/3.0/global.html#fail

		// eslint-disable-next-line no-undef
		fail( error );
	} );

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

	// Globally guard against zero-width characters.
	if ( REGEXP_ZWSP.test( textEditorContent ) ) {
		throw new Error( 'Unexpected zero-width space character in editor content.' );
	}

	return textEditorContent;
}

/**
 * Verifies that the edit post sidebar is opened, and if it is not, opens it.
 *
 * @return {Promise} Promise resolving once the edit post sidebar is opened.
 */
export async function ensureSidebarOpened() {
	// This try/catch flow relies on the fact that `page.$eval` throws an error
	// if the element matching the given selector does not exist. Thus, if an
	// error is thrown, it can be inferred that the sidebar is not opened.
	try {
		return page.$eval( '.edit-post-sidebar', () => {} );
	} catch ( error ) {
		return page.click( '.edit-post-header__settings [aria-label="Settings"]' );
	}
}

/**
 * Opens the inserter, searches for the given term, then selects the first
 * result that appears.
 *
 * @param {string} searchTerm The text to search the inserter for.
 */
export async function insertBlock( searchTerm ) {
	await page.click( '.edit-post-header [aria-label="Add block"]' );
	// Waiting here is necessary because sometimes the inserter takes more time to
	// render than Puppeteer takes to complete the 'click' action
	await page.waitForSelector( '.editor-inserter__menu' );
	await page.keyboard.type( searchTerm );
	await page.keyboard.press( 'Tab' );
	await page.keyboard.press( 'Tab' );
	await page.keyboard.press( 'Enter' );
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

/**
 * Toggles More Menu item, searchers for the button with the text provided and clicks it.
 *
 * @param {string} buttonLabel The label to search the button for.
 */
export async function toggleMoreMenuItem( buttonLabel ) {
	await page.click( '.edit-post-more-menu [aria-label="More"]' );
	const itemButton = ( await page.$x( `//button[contains(text(), \'${ buttonLabel }\')]` ) )[ 0 ];
	await itemButton.click( 'button' );
}

/**
 * Publishes the post, resolving once the request is complete (once a notice
 * is displayed).
 *
 * @return {Promise} Promise resolving when publish is complete.
 */
export async function publishPost() {
	// Opens the publish panel
	await page.click( '.editor-post-publish-panel__toggle' );

	// Disable reason: Wait for the animation to complete, since otherwise the
	// click attempt may occur at the wrong point.
	// eslint-disable-next-line no-restricted-syntax
	await page.waitFor( 100 );

	// Publish the post
	await page.click( '.editor-post-publish-button' );

	// A success notice should show up
	return page.waitForSelector( '.notice-success' );
}
