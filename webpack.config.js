/**
 * External dependencies
 */
const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );
const WebpackRTLPlugin = require( 'webpack-rtl-plugin' );
const { get } = require( 'lodash' );
const { basename } = require( 'path' );

/**
 * WordPress dependencies
 */
const CustomTemplatedPathPlugin = require( '@wordpress/custom-templated-path-webpack-plugin' );

// Main CSS loader for everything but blocks..
const mainCSSExtractTextPlugin = new ExtractTextPlugin( {
	filename: './build/[basename]/style.css',
} );

// CSS loader for styles specific to block editing.
const editBlocksCSSPlugin = new ExtractTextPlugin( {
	filename: './build/core-blocks/edit-blocks.css',
} );

// CSS loader for styles specific to blocks in general.
const blocksCSSPlugin = new ExtractTextPlugin( {
	filename: './build/core-blocks/style.css',
} );

// Configuration for the ExtractTextPlugin.
const extractConfig = {
	use: [
		{ loader: 'raw-loader' },
		{
			loader: 'postcss-loader',
			options: {
				plugins: [
					require( './packages/postcss-themes' )( {
						defaults: {
							primary: '#00a0d2',
							secondary: '#0073aa',
							toggle: '#00a0d2',
						},
						themes: {
							'admin-color-light': {
								primary: '#00a0d2',
								secondary: '#c75726',
								toggle: '#00a0d2',
							},
							'admin-color-blue': {
								primary: '#82b4cb',
								secondary: '#d9ab59',
								toggle: '#82b4cb',
							},
							'admin-color-coffee': {
								primary: '#c2a68c',
								secondary: '#9fa47b',
								toggle: '#c2a68c',
							},
							'admin-color-ectoplasm': {
								primary: '#a7b656',
								secondary: '#c77430',
								toggle: '#a7b656',
							},
							'admin-color-midnight': {
								primary: '#e34e46',
								secondary: '#77a6b9',
								toggle: '#77a6b9',
							},
							'admin-color-ocean': {
								primary: '#a3b9a2',
								secondary: '#a89d8a',
								toggle: '#a3b9a2',
							},
							'admin-color-sunrise': {
								primary: '#d1864a',
								secondary: '#c8b03c',
								toggle: '#c8b03c',
							},
						},
					} ),
					require( 'autoprefixer' ),
					require( 'postcss-color-function' ),
				],
			},
		},
		{
			loader: 'sass-loader',
			query: {
				includePaths: [ 'edit-post/assets/stylesheets' ],
				data: '@import "colors"; @import "breakpoints"; @import "variables"; @import "mixins"; @import "animations";@import "z-index";',
				outputStyle: 'production' === process.env.NODE_ENV ?
					'compressed' : 'nested',
			},
		},
	],
};

/**
 * Given a string, returns a new string with dash separators converedd to
 * camel-case equivalent. This is not as aggressive as `_.camelCase` in
 * converting to uppercase, where Lodash will convert letters following
 * numbers.
 *
 * @param {string} string Input dash-delimited string.
 *
 * @return {string} Camel-cased string.
 */
function camelCaseDash( string ) {
	return string.replace(
		/-([a-z])/g,
		( match, letter ) => letter.toUpperCase()
	);
}

const entryPointNames = [
	'blocks',
	'components',
	'editor',
	'utils',
	'data',
	'viewport',
	'core-data',
	'plugins',
	'edit-post',
	'core-blocks',
];

const gutenbergPackages = [
	'date',
	'dom',
	'element',
];

const wordPressPackages = [
	'a11y',
	'dom-ready',
	'hooks',
	'i18n',
	'is-shallow-equal',
];

const coreGlobals = [
	'api-request',
];

const externals = {
	react: 'React',
	'react-dom': 'ReactDOM',
	tinymce: 'tinymce',
	moment: 'moment',
	jquery: 'jQuery',
	lodash: 'lodash',
	'lodash-es': 'lodash',
};

[
	...entryPointNames,
	...gutenbergPackages,
	...wordPressPackages,
	...coreGlobals,
].forEach( ( name ) => {
	externals[ `@wordpress/${ name }` ] = {
		this: [ 'wp', camelCaseDash( name ) ],
	};
} );

const config = {
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

	entry: Object.assign(
		entryPointNames.reduce( ( memo, path ) => {
			const name = camelCaseDash( path );
			memo[ name ] = `./${ path }`;
			return memo;
		}, {} ),
		gutenbergPackages.reduce( ( memo, packageName ) => {
			const name = camelCaseDash( packageName );
			memo[ name ] = `./packages/${ packageName }`;
			return memo;
		}, {} ),
		wordPressPackages.reduce( ( memo, packageName ) => {
			const name = camelCaseDash( packageName );
			memo[ name ] = `./node_modules/@wordpress/${ packageName }`;
			return memo;
		}, {} )
	),
	output: {
		filename: './build/[basename]/index.js',
		path: __dirname,
		library: [ 'wp', '[name]' ],
		libraryTarget: 'this',
	},
	externals,
	resolve: {
		modules: [
			__dirname,
			'node_modules',
		],
		alias: {
			'lodash-es': 'lodash',
		},
	},
	module: {
		rules: [
			{
				test: /\.pegjs/,
				use: 'pegjs-loader',
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader',
			},
			{
				test: /style\.s?css$/,
				include: [
					/core-blocks/,
				],
				use: blocksCSSPlugin.extract( extractConfig ),
			},
			{
				test: /editor\.s?css$/,
				include: [
					/core-blocks/,
				],
				use: editBlocksCSSPlugin.extract( extractConfig ),
			},
			{
				test: /\.s?css$/,
				exclude: [
					/core-blocks/,
				],
				use: mainCSSExtractTextPlugin.extract( extractConfig ),
			},
		],
	},
	plugins: [
		blocksCSSPlugin,
		editBlocksCSSPlugin,
		mainCSSExtractTextPlugin,
		// Create RTL files with a -rtl suffix
		new WebpackRTLPlugin( {
			suffix: '-rtl',
			minify: process.env.NODE_ENV === 'production' ? { safe: true } : false,
		} ),
		new CustomTemplatedPathPlugin( {
			basename( path, data ) {
				let rawRequest;

				const entryModule = get( data, [ 'chunk', 'entryModule' ], {} );
				switch ( entryModule.type ) {
					case 'javascript/auto':
						rawRequest = entryModule.rawRequest;
						break;

					case 'javascript/esm':
						rawRequest = entryModule.rootModule.rawRequest;
						break;
				}

				if ( rawRequest ) {
					return basename( rawRequest );
				}

				return path;
			},
		} ),
	],
	stats: {
		children: false,
	},
};

if ( config.mode !== 'production' ) {
	config.devtool = process.env.SOURCEMAP || 'source-map';
}

module.exports = config;
