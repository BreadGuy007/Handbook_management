/**
 * External dependencies
 */
import {
	deburr,
	differenceWith,
	find,
	get,
	intersectionWith,
	isEmpty,
	words,
} from 'lodash';

/**
 * Converts the search term into a list of normalized terms.
 *
 * @param {string} term The search term to normalize.
 *
 * @return {string[]} The normalized list of search terms.
 */
export const normalizeSearchTerm = ( term = '' ) => {
	// Disregard diacritics.
	//  Input: "média"
	term = deburr( term );

	// Accommodate leading slash, matching autocomplete expectations.
	//  Input: "/media"
	term = term.replace( /^\//, '' );

	// Lowercase.
	//  Input: "MEDIA"
	term = term.toLowerCase();

	// Extract words.
	return words( term );
};

const removeMatchingTerms = ( unmatchedTerms, unprocessedTerms ) => {
	return differenceWith(
		unmatchedTerms,
		normalizeSearchTerm( unprocessedTerms ),
		( unmatchedTerm, unprocessedTerm ) =>
			unprocessedTerm.includes( unmatchedTerm )
	);
};

/**
 * Filters an item list given a search term.
 *
 * @param {Array} items       Item list
 * @param {Array} categories  Available categories.
 * @param {Array} collections Available collections.
 * @param {string} searchTerm Search term.
 *
 * @return {Array}             Filtered item list.
 */
export const searchItems = ( items, categories, collections, searchTerm ) => {
	const normalizedSearchTerms = normalizeSearchTerm( searchTerm );

	if ( normalizedSearchTerms.length === 0 ) {
		return items;
	}

	return items
		.filter(
			( { name, title, category, keywords = [], variations = [] } ) => {
				let unmatchedTerms = removeMatchingTerms(
					normalizedSearchTerms,
					title
				);

				if ( unmatchedTerms.length === 0 ) {
					return true;
				}

				unmatchedTerms = removeMatchingTerms(
					unmatchedTerms,
					keywords.join( ' ' )
				);

				if ( unmatchedTerms.length === 0 ) {
					return true;
				}

				unmatchedTerms = removeMatchingTerms(
					unmatchedTerms,
					get( find( categories, { slug: category } ), [ 'title' ] )
				);

				const itemCollection = collections[ name.split( '/' )[ 0 ] ];
				if ( itemCollection ) {
					unmatchedTerms = removeMatchingTerms(
						unmatchedTerms,
						itemCollection.title
					);
				}

				if ( unmatchedTerms.length === 0 ) {
					return true;
				}

				unmatchedTerms = removeMatchingTerms(
					unmatchedTerms,
					variations
						.map( ( variation ) => variation.title )
						.join( ' ' )
				);

				return unmatchedTerms.length === 0;
			}
		)
		.map( ( item ) => {
			if ( isEmpty( item.variations ) ) {
				return item;
			}

			const matchedVariations = item.variations.filter( ( variation ) => {
				return (
					intersectionWith(
						normalizedSearchTerms,
						normalizeSearchTerm( variation.title ),
						( termToMatch, labelTerm ) =>
							labelTerm.includes( termToMatch )
					).length > 0
				);
			} );
			// When no partterns matched, fallback to all variations.
			if ( isEmpty( matchedVariations ) ) {
				return item;
			}

			return {
				...item,
				variations: matchedVariations,
			};
		} );
};
