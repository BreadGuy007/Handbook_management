/**
 * Node dependencies
 */
const { camelCase, kebabCase, upperFirst } = require( 'lodash' );

const baseRepoUrl = `https://raw.githubusercontent.com/WordPress/gutenberg/master`;

/**
 * Generates the package manifest.
 *
 * @param {Object} packagesConfig Packages Docs Config
 *
 * @return {Array} Manifest
 */
function getPackageManifest( packagesConfig ) {
	return [
		{
			title: 'Packages',
			slug: 'packages',
			markdown_source: `${ baseRepoUrl }/docs/packages.md`,
			parent: null,
		},
	].concat(
		Object.entries( packagesConfig ).map( ( [ folderName, config ] ) => {
			const path = config.isNpmReady === false ?
				`${ baseRepoUrl }/${ folderName }/README.md` :
				`${ baseRepoUrl }/packages/${ folderName }/README.md`;
			return {
				title: `@wordpress/${ folderName }`,
				slug: `packages-${ folderName }`,
				markdown_source: path,
				parent: 'packages',
			};
		} )
	);
}

/**
 * Generates the components manifest.
 *
 * @param {Array} componentPaths Paths for all components
 *
 * @return {Array} Manifest
 */
function getComponentManifest( componentPaths ) {
	return [
		{
			title: 'Components Package Reference',
			slug: 'components',
			markdown_source: `${ baseRepoUrl }/packages/components.md`,
			parent: null,
		},
		...componentPaths
			.map( ( filePath ) => {
				const slug = filePath.split( '/' )[ 3 ];
				return {
					title: upperFirst( camelCase( slug ) ),
					slug,
					markdown_source: `${ baseRepoUrl }/${ filePath }`,
					parent: 'components',
				};
			} ),
	];
}

/**
 * Generates the data manifest.
 *
 * @param {Object} parsedNamespaces Parsed Namespace Object
 *
 * @return {Array} Manifest
 */
function getDataManifest( parsedNamespaces ) {
	return [ {
		title: 'Data Package Reference',
		slug: 'data',
		markdown_source: `${ baseRepoUrl }/docs/data/README.md`,
		parent: null,
	} ].concat(
		Object.values( parsedNamespaces ).map( ( parsedNamespace ) => {
			const slug = `data-${ kebabCase( parsedNamespace.name ) }`;
			return {
				title: parsedNamespace.title,
				slug,
				markdown_source: `${ baseRepoUrl }/docs/data/${ slug }.md`,
				parent: 'data',
			};
		} )
	);
}

module.exports = {
	getPackageManifest,
	getComponentManifest,
	getDataManifest,
};
