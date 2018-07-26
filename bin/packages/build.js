/**
 * script to build WordPress packages into `build/` directory.
 *
 * Example:
 *  node ./scripts/build.js
 */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );
const babel = require( '@babel/core' );
const chalk = require( 'chalk' );
const mkdirp = require( 'mkdirp' );
const sass = require( 'node-sass' );
const postcss = require( 'postcss' );
const deasync = require( 'deasync' );

/**
 * Internal dependencies
 */
const getPackages = require( './get-packages' );
const getBabelConfig = require( './get-babel-config' );

/**
 * Module Constants
 */
const PACKAGES_DIR = path.resolve( __dirname, '../../packages' );
const SRC_DIR = 'src';
const BUILD_DIR = {
	main: 'build',
	module: 'build-module',
	style: 'build-style',
};
const DONE = chalk.reset.inverse.bold.green( ' DONE ' );

/**
 * Get the package name for a specified file
 *
 * @param  {string} file File name
 * @return {string}      Package name
 */
function getPackageName( file ) {
	return path.relative( PACKAGES_DIR, file ).split( path.sep )[ 0 ];
}

/**
 * Get Build Path for a specified file
 *
 * @param  {string} file        File to build
 * @param  {string} buildFolder Output folder
 * @return {string}             Build path
 */
function getBuildPath( file, buildFolder ) {
	const pkgName = getPackageName( file );
	const pkgSrcPath = path.resolve( PACKAGES_DIR, pkgName, SRC_DIR );
	const pkgBuildPath = path.resolve( PACKAGES_DIR, pkgName, buildFolder );
	const relativeToSrcPath = path.relative( pkgSrcPath, file );
	return path.resolve( pkgBuildPath, relativeToSrcPath );
}

/**
 * Build a file for the required environments (node and ES5)
 *
 * @param {string} file    File path to build
 * @param {boolean} silent Show logs
 */
function buildFile( file, silent ) {
	buildFileFor( file, silent, 'main' );
	buildFileFor( file, silent, 'module' );
}

function buildStyle( packagePath ) {
	const styleFile = path.resolve( packagePath, SRC_DIR, 'style.scss' );
	const outputFile = path.resolve( packagePath, BUILD_DIR.style, 'style.css' );
	const outputFileRTL = path.resolve( packagePath, BUILD_DIR.style, 'style-rtl.css' );
	mkdirp.sync( path.dirname( outputFile ) );
	const builtSass = sass.renderSync( {
		file: styleFile,
		includePaths: [ path.resolve( __dirname, '../../edit-post/assets/stylesheets' ) ],
		data: (
			[
				'colors',
				'breakpoints',
				'variables',
				'mixins',
				'animations',
				'z-index',
			].map( ( imported ) => `@import "${ imported }";` ).join( ' ' )	+
			fs.readFileSync( styleFile, 'utf8' )
		),
	} );

	const postCSSSync = ( callback ) => {
		postcss( require( './post-css-config' ) )
			.process( builtSass.css, { from: 'src/app.css', to: 'dest/app.css' } )
			.then( ( result ) => callback( null, result ) );
	};

	const postCSSRTLSync = ( ltrCSS, callback ) => {
		postcss( [ require( 'rtlcss' )() ] )
			.process( ltrCSS, { from: 'src/app.css', to: 'dest/app.css' } )
			.then( ( result ) => callback( null, result ) );
	};

	const result = deasync( postCSSSync )();
	fs.writeFileSync( outputFile, result.css );

	const resultRTL = deasync( postCSSRTLSync )( result );
	fs.writeFileSync( outputFileRTL, resultRTL );
}

/**
 * Build a file for a specific environment
 *
 * @param {string}  file        File path to build
 * @param {boolean} silent      Show logs
 * @param {string}  environment Dist environment (node or es5)
 */
function buildFileFor( file, silent, environment ) {
	const buildDir = BUILD_DIR[ environment ];
	const destPath = getBuildPath( file, buildDir );
	const babelOptions = getBabelConfig( environment );

	mkdirp.sync( path.dirname( destPath ) );
	const transformed = babel.transformFileSync( file, babelOptions ).code;
	fs.writeFileSync( destPath, transformed );
	if ( ! silent ) {
		process.stdout.write(
			chalk.green( '  \u2022 ' ) +
				path.relative( PACKAGES_DIR, file ) +
				chalk.green( ' \u21D2 ' ) +
				path.relative( PACKAGES_DIR, destPath ) +
				'\n'
		);
	}
}

/**
 * Build the provided package path
 *
 * @param {string} packagePath absolute package path
 */
function buildPackage( packagePath ) {
	const srcDir = path.resolve( packagePath, SRC_DIR );
	const files = glob.sync( `${ srcDir }/**/*.js`, {
		ignore: [
			`${ srcDir }/**/test/**/*.js`,
			`${ srcDir }/**/__mocks__/**/*.js`,
		],
		nodir: true,
	} );

	process.stdout.write( `${ path.basename( packagePath ) }\n` );

	files.forEach( ( file ) => buildFile( file, true ) );

	// Building styles
	const styleFile = path.resolve( srcDir, 'style.scss' );
	if ( fs.existsSync( styleFile ) ) {
		buildStyle( packagePath );
	}

	process.stdout.write( `${ DONE }\n` );
}

const files = process.argv.slice( 2 );

if ( files.length ) {
	files.forEach( buildFile );
} else {
	process.stdout.write( chalk.inverse( '>> Building packages \n' ) );
	getPackages()
		.forEach( buildPackage );
	process.stdout.write( '\n' );
}
