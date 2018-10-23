/**
 * Internal dependencies
 */
import { common, others } from './core-embeds';
import { DEFAULT_EMBED_BLOCK } from './constants';

/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Returns true if any of the regular expressions match the URL.
 *
 * @param {string} url The URL to test.
 * @param {Array} patterns The list of regular expressions to test agains.
 * @return {boolean} True if any of the regular expressions match the URL.
 */
export const matchesPatterns = ( url, patterns = [] ) => {
	return patterns.some( ( pattern ) => {
		return url.match( pattern );
	} );
};

/**
 * Finds the block name that should be used for the URL, based on the
 * structure of the URL.
 *
 * @param {string} url The URL to test.
 * @return {string} The name of the block that should be used for this URL, e.g. core-embed/twitter
 */
export const findBlock = ( url ) => {
	for ( const block of [ ...common, ...others ] ) {
		if ( matchesPatterns( url, block.patterns ) ) {
			return block.name;
		}
	}
	return DEFAULT_EMBED_BLOCK;
};

export const isFromWordPress = ( html ) => {
	return includes( html, 'class="wp-embedded-content" data-secret' );
};
