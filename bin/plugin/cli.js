#!/usr/bin/env node

/**
 * External dependencies
 */
const program = require( 'commander' );

/**
 * Internal dependencies
 */
const { releaseRC, releaseStable } = require( './commands/release' );
const { prepublishNpmStablePackages } = require( './commands/packages' );
const { getReleaseChangelog } = require( './commands/changelog' );
const { runPerformanceTests } = require( './commands/performance' );

program
	.command( 'release-plugin-rc' )
	.alias( 'rc' )
	.description(
		'Release an RC version of the plugin (supports only rc.1 for now)'
	)
	.action( releaseRC );

program
	.command( 'release-plugin-stable' )
	.alias( 'stable' )
	.description( 'Release a stable version of the plugin' )
	.action( releaseStable );

program
	.command( 'prepublish-packages-stable' )
	.alias( 'npm-stable' )
	.description(
		'Prepublish to npm steps for the next stable version of WordPress packages'
	)
	.action( prepublishNpmStablePackages );

program
	.command( 'release-plugin-changelog' )
	.alias( 'changelog' )
	.option( '-m, --milestone <milestone>', 'Milestone' )
	.option( '-t, --token <token>', 'Github token' )
	.description( 'Generates a changelog from merged Pull Requests' )
	.action( getReleaseChangelog );

program
	.command( 'performance-tests [branches...]' )
	.alias( 'perf' )
	.description(
		'Runs performance tests on two separate branches and outputs the result'
	)
	.action( runPerformanceTests );

program.parse( process.argv );
