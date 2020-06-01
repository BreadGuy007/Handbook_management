'use strict';
/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

/**
 * @typedef {import('./config').WPConfig} WPConfig
 */

/**
 * Creates a docker-compose config object which, when serialized into a
 * docker-compose.yml file, tells docker-compose how to run the environment.
 *
 * @param {WPConfig} config A wp-env config object.
 *
 * @return {Object} A docker-compose config object, ready to serialize into YAML.
 */
module.exports = function buildDockerComposeConfig( config ) {
	// Top-level WordPress directory mounts (like wp-content/themes)
	const directoryMounts = Object.entries( config.mappings ).map(
		( [ wpDir, source ] ) => `${ source.path }:/var/www/html/${ wpDir }`
	);

	const pluginMounts = config.pluginSources.map(
		( source ) =>
			`${ source.path }:/var/www/html/wp-content/plugins/${ source.basename }`
	);

	const themeMounts = config.themeSources.map(
		( source ) =>
			`${ source.path }:/var/www/html/wp-content/themes/${ source.basename }`
	);

	const localMounts = [ ...directoryMounts, ...pluginMounts, ...themeMounts ];

	const developmentMounts = [
		`${
			config.coreSource ? config.coreSource.path : 'wordpress'
		}:/var/www/html`,
		...localMounts,
	];

	let testsMounts;
	if ( config.coreSource ) {
		testsMounts = [
			`${ config.coreSource.testsPath }:/var/www/html`,

			// When using a local source for "core" we want to ensure two things:
			//
			// 1. That changes the user makes within the "core" directory are
			//    served in both the development and tests environments.
			// 2. That the development and tests environment use separate
			//    databases and `wp-content/uploads`.
			//
			// To do this we copy the local "core" files ($wordpress) to a tests
			// directory ($tests-wordpress) and instruct the tests environment
			// to source its files like so:
			//
			// - wp-config.php        <- $tests-wordpress/wp-config.php
			// - wp-config-sample.php <- $tests-wordpress/wp-config.php
			// - wp-content           <- $tests-wordpress/wp-content
			// - *                    <- $wordpress/*
			//
			// https://github.com/WordPress/gutenberg/issues/21164
			...( config.coreSource.type === 'local'
				? fs
						.readdirSync( config.coreSource.path )
						.filter(
							( filename ) =>
								filename !== 'wp-config.php' &&
								filename !== 'wp-config-sample.php' &&
								filename !== 'wp-content'
						)
						.map(
							( filename ) =>
								`${ path.join(
									config.coreSource.path,
									filename
								) }:/var/www/html/${ filename }`
						)
				: [] ),

			...localMounts,
		];
	} else {
		testsMounts = [ 'tests-wordpress:/var/www/html', ...localMounts ];
	}

	// Set the default ports based on the config values.
	const developmentPorts = `\${WP_ENV_PORT:-${ config.port }}:80`;
	const testsPorts = `\${WP_ENV_TESTS_PORT:-${ config.testsPort }}:80`;

	// The www-data user in wordpress:cli has a different UID (82) to the
	// www-data user in wordpress (33). Ensure we use the wordpress www-data
	// user for CLI commands.
	// https://github.com/docker-library/wordpress/issues/256
	const cliUser = '33:33';

	return {
		version: '3.7',
		services: {
			mysql: {
				image: 'mariadb',
				ports: [ '3306' ],
				environment: {
					MYSQL_ALLOW_EMPTY_PASSWORD: 'yes',
				},
				volumes: [ 'mysql:/var/lib/mysql' ],
			},
			wordpress: {
				depends_on: [ 'mysql' ],
				image: 'wordpress',
				ports: [ developmentPorts ],
				environment: {
					WORDPRESS_DB_NAME: 'wordpress',
				},
				volumes: developmentMounts,
			},
			'tests-wordpress': {
				depends_on: [ 'mysql' ],
				image: 'wordpress',
				ports: [ testsPorts ],
				environment: {
					WORDPRESS_DB_NAME: 'tests-wordpress',
				},
				volumes: testsMounts,
			},
			cli: {
				depends_on: [ 'wordpress' ],
				image: 'wordpress:cli',
				volumes: developmentMounts,
				user: cliUser,
			},
			'tests-cli': {
				depends_on: [ 'tests-wordpress' ],
				image: 'wordpress:cli',
				volumes: testsMounts,
				user: cliUser,
			},
			composer: {
				image: 'composer',
				volumes: [ `${ config.configDirectoryPath }:/app` ],
			},
			phpunit: {
				image: 'wordpressdevelop/phpunit:${LOCAL_PHP-latest}',
				depends_on: [ 'tests-wordpress' ],
				volumes: [
					...testsMounts,
					'phpunit-uploads:/var/www/html/wp-content/uploads',
				],
				environment: {
					LOCAL_DIR: 'html',
					WP_PHPUNIT__TESTS_CONFIG: '/var/www/html/wp-config.php',
				},
			},
		},
		volumes: {
			...( ! config.coreSource && { wordpress: {} } ),
			...( ! config.coreSource && { 'tests-wordpress': {} } ),
			mysql: {},
			'phpunit-uploads': {},
		},
	};
};
