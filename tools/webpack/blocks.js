/**
 * External dependencies
 */
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const { escapeRegExp } = require( 'lodash' );
const { join, sep } = require( 'path' );
const fastGlob = require( 'fast-glob' );

/**
 * WordPress dependencies
 */
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

/**
 * Internal dependencies
 */
const { baseConfig, plugins, stylesTransform } = require( './shared' );

/*
 * Matches a block's name in paths in the form
 * build-module/<blockName>/view.js
 */
const blockNameRegex = new RegExp( /(?<=build-module\/).*(?=(\/view))/g );

const createEntrypoints = () => {
	/*
	 * Returns an array of paths to view.js files within the `@wordpress/block-library` package.
	 * These paths can be matched by the regex `blockNameRegex` in order to extract
	 * the block's name.
	 *
	 * Returns an empty array if no files were found.
	 */
	const blockViewScriptPaths = fastGlob.sync(
		'./packages/block-library/build-module/**/view.js'
	);

	/*
	 * Go through the paths found above, in order to define webpack entry points for
	 * each block's view.js file.
	 */
	return blockViewScriptPaths.reduce( ( entries, scriptPath ) => {
		const [ blockName ] = scriptPath.match( blockNameRegex );

		return {
			...entries,
			[ 'blocks/' + blockName ]: scriptPath,
		};
	}, {} );
};

module.exports = {
	...baseConfig,
	name: 'blocks',
	entry: createEntrypoints(),
	output: {
		devtoolNamespace: 'wp',
		filename: './build/block-library/[name]/view.min.js',
		path: join( __dirname, '..', '..' ),
	},
	plugins: [
		...plugins,
		new DependencyExtractionWebpackPlugin( { injectPolyfill: false } ),
		new CopyWebpackPlugin( {
			patterns: [].concat(
				[
					'style',
					'style-rtl',
					'editor',
					'editor-rtl',
					'theme',
					'theme-rtl',
				].map( ( filename ) => ( {
					from: `./packages/block-library/build-style/*/${ filename }.css`,
					to( { absoluteFilename } ) {
						const [ , dirname ] = absoluteFilename.match(
							new RegExp(
								`([\\w-]+)${ escapeRegExp(
									sep
								) }${ filename }\\.css$`
							)
						);

						return join(
							'build/block-library/blocks',
							dirname,
							filename + '.css'
						);
					},
					transform: stylesTransform,
				} ) ),
				Object.entries( {
					'./packages/block-library/src/':
						'build/block-library/blocks/',
					'./packages/edit-widgets/src/blocks/':
						'build/edit-widgets/blocks/',
					'./packages/widgets/src/blocks/': 'build/widgets/blocks/',
				} ).flatMap( ( [ from, to ] ) => [
					{
						from: `${ from }/**/index.php`,
						to( { absoluteFilename } ) {
							const [ , dirname ] = absoluteFilename.match(
								new RegExp(
									`([\\w-]+)${ escapeRegExp(
										sep
									) }index\\.php$`
								)
							);

							return join( to, `${ dirname }.php` );
						},
						transform: ( content ) => {
							content = content.toString();

							// Within content, search for any function definitions. For
							// each, replace every other reference to it in the file.
							return (
								Array.from(
									content.matchAll(
										/^\s*function ([^\(]+)/gm
									)
								)
									.reduce( ( result, [ , functionName ] ) => {
										// Prepend the Gutenberg prefix, substituting any
										// other core prefix (e.g. "wp_").
										return result.replace(
											new RegExp( functionName, 'g' ),
											( match ) =>
												'gutenberg_' +
												match.replace( /^wp_/, '' )
										);
									}, content )
									// The core blocks override procedure takes place in
									// the init action default priority to ensure that core
									// blocks would have been registered already. Since the
									// blocks implementations occur at the default priority
									// and due to WordPress hooks behavior not considering
									// mutations to the same priority during another's
									// callback, the Gutenberg build blocks are modified
									// to occur at a later priority.
									.replace(
										/(add_action\(\s*'init',\s*'gutenberg_register_block_[^']+'(?!,))/,
										'$1, 20'
									)
							);
						},
						noErrorOnMissing: true,
					},
					{
						from: `${ from }/*/block.json`,
						to( { absoluteFilename } ) {
							const [ , dirname ] = absoluteFilename.match(
								new RegExp(
									`([\\w-]+)${ escapeRegExp(
										sep
									) }block\\.json$`
								)
							);

							return join( to, dirname, 'block.json' );
						},
					},
				] )
			),
		} ),
	].filter( Boolean ),
};
