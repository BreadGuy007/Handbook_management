/**
 * External dependencies
 */
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const { DefinePlugin } = require( 'webpack' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const postcss = require( 'postcss' );
const { escapeRegExp, compact } = require( 'lodash' );
const { join, sep } = require( 'path' );
const fastGlob = require( 'fast-glob' );

/**
 * WordPress dependencies
 */
const CustomTemplatedPathPlugin = require( '@wordpress/custom-templated-path-webpack-plugin' );
const LibraryExportDefaultPlugin = require( '@wordpress/library-export-default-webpack-plugin' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

/**
 * Internal dependencies
 */
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const {
	camelCaseDash,
} = require( '@wordpress/dependency-extraction-webpack-plugin/lib/util' );

/**
 * Internal dependencies
 */
const { dependencies } = require( './package' );

const {
	NODE_ENV: mode = 'development',
	WP_DEVTOOL: devtool = mode === 'production' ? false : 'source-map',
} = process.env;

const WORDPRESS_NAMESPACE = '@wordpress/';
const BUNDLED_PACKAGES = [ '@wordpress/icons', '@wordpress/interface' ];

const gutenbergPackages = Object.keys( dependencies )
	.filter(
		( packageName ) =>
			! BUNDLED_PACKAGES.includes( packageName ) &&
			packageName.startsWith( WORDPRESS_NAMESPACE ) &&
			! packageName.startsWith( WORDPRESS_NAMESPACE + 'react-native' )
	)
	.map( ( packageName ) => packageName.replace( WORDPRESS_NAMESPACE, '' ) );

const stylesTransform = ( content ) => {
	if ( mode === 'production' ) {
		return postcss( [
			require( 'cssnano' )( {
				preset: [
					'default',
					{
						discardComments: {
							removeAll: true,
						},
					},
				],
			} ),
		] )
			.process( content, {
				from: 'src/app.css',
				to: 'dest/app.css',
			} )
			.then( ( result ) => result.css );
	}
	return content;
};

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
	const blockViewScriptEntries = blockViewScriptPaths.reduce(
		( entries, scriptPath ) => {
			const [ blockName ] = scriptPath.match( blockNameRegex );

			return {
				...entries,
				[ 'blocks/' + blockName ]: scriptPath,
			};
		},
		{}
	);

	const packageEntries = gutenbergPackages.reduce( ( memo, packageName ) => {
		return {
			...memo,
			[ packageName ]: `./packages/${ packageName }`,
		};
	}, {} );

	return { ...packageEntries, ...blockViewScriptEntries };
};

module.exports = {
	optimization: {
		// Only concatenate modules in production, when not analyzing bundles.
		concatenateModules:
			mode === 'production' && ! process.env.WP_BUNDLE_ANALYZER,
		minimizer: [
			new TerserPlugin( {
				cache: true,
				parallel: true,
				sourceMap: mode !== 'production',
				terserOptions: {
					output: {
						comments: /translators:/i,
					},
					compress: {
						passes: 2,
					},
					mangle: {
						reserved: [ '__', '_n', '_nx', '_x' ],
					},
				},
				extractComments: false,
			} ),
		],
	},
	mode,
	entry: createEntrypoints(),
	output: {
		devtoolNamespace: 'wp',
		filename: ( pathData ) => {
			const { chunk } = pathData;
			const { entryModule } = chunk;
			const { rawRequest, rootModule } = entryModule;

			// When processing ESM files, the requested path
			// is defined in `entryModule.rootModule.rawRequest`, instead of
			// being present in `entryModule.rawRequest`.
			// In the context of frontend view files, they would be processed
			// as ESM if they use `import` or `export` within it.
			const request = rootModule?.rawRequest || rawRequest;

			if ( request.includes( '/view.js' ) ) {
				return `./build/block-library/[name]/view.min.js`;
			}

			return `./build/[name]/index.min.js`;
		},
		path: __dirname,
		library: [ 'wp', '[camelName]' ],
		libraryTarget: 'window',
	},
	module: {
		rules: compact( [
			mode !== 'production' && {
				test: /\.js$/,
				use: require.resolve( 'source-map-loader' ),
				enforce: 'pre',
			},
		] ),
	},
	plugins: [
		// The WP_BUNDLE_ANALYZER global variable enables a utility that represents bundle
		// content as a convenient interactive zoomable treemap.
		process.env.WP_BUNDLE_ANALYZER && new BundleAnalyzerPlugin(),
		new DefinePlugin( {
			// Inject the `GUTENBERG_PHASE` global, used for feature flagging.
			'process.env.GUTENBERG_PHASE': JSON.stringify(
				parseInt(
					process.env.npm_package_config_GUTENBERG_PHASE,
					10
				) || 1
			),
			'process.env.FORCE_REDUCED_MOTION': JSON.stringify(
				process.env.FORCE_REDUCED_MOTION
			),
		} ),
		new CustomTemplatedPathPlugin( {
			camelName( path, data ) {
				return camelCaseDash( data.chunk.name );
			},
		} ),
		new LibraryExportDefaultPlugin( [
			'api-fetch',
			'deprecated',
			'dom-ready',
			'redux-routine',
			'token-list',
			'server-side-render',
			'shortcode',
			'warning',
		] ),
		new CopyWebpackPlugin( {
			patterns: [].concat(
				gutenbergPackages.map( ( packageName ) => ( {
					from: `./packages/${ packageName }/build-style/*.css`,
					to: `./build/${ packageName }/`,
					flatten: true,
					transform: stylesTransform,
					noErrorOnMissing: true,
				} ) ),
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
								content
									.match( /^function [^\(]+/gm )
									.reduce( ( result, functionName ) => {
										// Trim leading "function " prefix from match.
										functionName = functionName.slice( 9 );

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
		new DependencyExtractionWebpackPlugin( { injectPolyfill: true } ),
		mode === 'production' && new ReadableJsAssetsWebpackPlugin(),
	].filter( Boolean ),
	watchOptions: {
		ignored: [ '**/node_modules', '**/packages/*/src' ],
		aggregateTimeout: 500,
	},
	devtool,
};
