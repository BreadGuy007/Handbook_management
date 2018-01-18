/**
 * WordPress dependencies
 */
import { addQueryArgs } from '@wordpress/url';

/**
 * Returns the Post's Edit URL.
 *
 * @param {number} postId Post ID.
 *
 * @returns {string} Post edit URL.
 */
export function getPostEditUrl( postId ) {
	return getWPAdminURL( 'post.php', { post: postId, action: 'edit' } );
}

/**
 * Returns the URL of a WPAdmin Page.
 *
 * @param {string} page  Page to navigate to.
 * @param {Object} query Query Args.
 *
 * @returns {string} WPAdmin URL.
 */
export function getWPAdminURL( page, query ) {
	return addQueryArgs( page, query );
}

/**
 * Returns a URL for display.
 *
 * @param {string} url Original URL.
 *
 * @returns {string} Displayed URL.
 */
export function filterURLForDisplay( url ) {
	// remove protocol and www prefixes
	const filteredURL = url.replace( new RegExp( '^https?://(www\.)?' ), '' );

	// ends with / and only has that single slash, strip it
	if ( filteredURL.match( '^[^/]+/$' ) ) {
		return filteredURL.replace( '/', '' );
	}

	return filteredURL;
}
