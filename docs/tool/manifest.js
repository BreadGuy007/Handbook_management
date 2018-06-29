/**
 * Node dependencies
 */
const { kebabCase } = require( 'lodash' );

/**
 * Generates the manifest for the given namespaces.
 *
 * @param {Object} parsedNamespaces Parsed Namespace Object.
 *
 * @return {Array} manifest.
 */
module.exports = function( parsedNamespaces ) {
	return [ {
		title: 'Data Package Reference',
		slug: 'data',
		markdown_source: 'https://raw.githubusercontent.com/WordPress/gutenberg/master/docs/data/README.md',
		parent: null,
	} ].concat(
		Object.values( parsedNamespaces ).map( ( parsedNamespace ) => {
			const slug = kebabCase( parsedNamespace.name );
			return {
				title: parsedNamespace.title,
				slug: 'data-' + slug,
				markdown_source: 'https://raw.githubusercontent.com/WordPress/gutenberg/master/docs/data/' + slug + '.md',
				parent: 'data',
			};
		} )
	);
};
