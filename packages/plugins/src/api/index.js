/* eslint no-console: [ 'error', { allow: [ 'error' ] } ] */

/**
 * WordPress dependencies
 */
import { applyFilters, doAction } from '@wordpress/hooks';

/**
 * External dependencies
 */
import { isFunction } from 'lodash';

/**
 * Plugin definitions keyed by plugin name.
 *
 * @type {Object.<string,WPPlugin>}
 */
const plugins = {};

/**
 * Registers a plugin to the editor.
 *
 * @param {string}                    name            A string identifying the plugin. Must be unique across all registered plugins.
 * @param {Object}                    settings        The settings for this plugin.
 * @param {string|WPElement|Function} settings.icon   An icon to be shown in the UI. It can be a slug of the Dashicon,
 * or an element (or function returning an element) if you choose to render your own SVG.
 * @param {Function}                  settings.render A component containing the UI elements to be rendered.
 *
 * @example <caption>ES5</caption>
 * ```js
 * // Using ES5 syntax
 * var el = wp.element.createElement;
 * var Fragment = wp.element.Fragment;
 * var PluginSidebar = wp.editPost.PluginSidebar;
 * var PluginSidebarMoreMenuItem = wp.editPost.PluginSidebarMoreMenuItem;
 * var registerPlugin = wp.plugins.registerPlugin;
 *
 * function Component() {
 * 	return el(
 * 		Fragment,
 * 		{},
 * 		el(
 * 			PluginSidebarMoreMenuItem,
 * 			{
 * 				target: 'sidebar-name',
 * 			},
 * 			'My Sidebar'
 * 		),
 * 		el(
 * 			PluginSidebar,
 * 			{
 * 				name: 'sidebar-name',
 * 				title: 'My Sidebar',
 * 			},
 * 			'Content of the sidebar'
 * 		)
 * 	);
 * }
 * registerPlugin( 'plugin-name', {
 * 	icon: 'smiley',
 * 	render: Component,
 * } );
 * ```
 *
 * @example <caption>ESNext</caption>
 * ```js
 * // Using ESNext syntax
 * const { Fragment } = wp.element;
 * const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editPost;
 * const { registerPlugin } = wp.plugins;
 *
 * const Component = () => (
 * 	<Fragment>
 * 		<PluginSidebarMoreMenuItem
 * 			target="sidebar-name"
 * 		>
 * 			My Sidebar
 * 		</PluginSidebarMoreMenuItem>
 * 		<PluginSidebar
 * 			name="sidebar-name"
 * 			title="My Sidebar"
 * 		>
 * 			Content of the sidebar
 * 		</PluginSidebar>
 * 	</Fragment>
 * );
 *
 * registerPlugin( 'plugin-name', {
 * 	icon: 'smiley',
 * 	render: Component,
 * } );
 * ```
 *
 * @return {Object} The final plugin settings object.
 */
export function registerPlugin( name, settings ) {
	if ( typeof settings !== 'object' ) {
		console.error(
			'No settings object provided!'
		);
		return null;
	}
	if ( typeof name !== 'string' ) {
		console.error(
			'Plugin names must be strings.'
		);
		return null;
	}
	if ( ! /^[a-z][a-z0-9-]*$/.test( name ) ) {
		console.error(
			'Plugin names must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: "my-plugin".'
		);
		return null;
	}
	if ( plugins[ name ] ) {
		console.error(
			`Plugin "${ name }" is already registered.`
		);
	}

	settings = applyFilters( 'plugins.registerPlugin', settings, name );

	if ( ! isFunction( settings.render ) ) {
		console.error(
			'The "render" property must be specified and must be a valid function.'
		);
		return null;
	}

	plugins[ name ] = {
		name,
		icon: 'admin-plugins',
		...settings,
	};

	doAction( 'plugins.pluginRegistered', settings, name );

	return settings;
}

/**
 * Unregisters a plugin by name.
 *
 * @param {string} name Plugin name.
 *
 * @example <caption>ES5</caption>
 * ```js
 * // Using ES5 syntax
 * var unregisterPlugin = wp.plugins.unregisterPlugin;
 *
 * unregisterPlugin( 'plugin-name' );
 * ```
 *
 * @example <caption>ESNext</caption>
 * ```js
 * // Using ESNext syntax
 * const { unregisterPlugin } = wp.plugins;
 *
 * unregisterPlugin( 'plugin-name' );
 * ```
 *
 * @return {?WPPlugin} The previous plugin settings object, if it has been
 *                     successfully unregistered; otherwise `undefined`.
 */
export function unregisterPlugin( name ) {
	if ( ! plugins[ name ] ) {
		console.error(
			'Plugin "' + name + '" is not registered.'
		);
		return;
	}
	const oldPlugin = plugins[ name ];
	delete plugins[ name ];

	doAction( 'plugins.pluginUnregistered', oldPlugin, name );

	return oldPlugin;
}

/**
 * Returns a registered plugin settings.
 *
 * @param {string} name Plugin name.
 *
 * @return {?Object} Plugin setting.
 */
export function getPlugin( name ) {
	return plugins[ name ];
}

/**
 * Returns all registered plugins.
 *
 * @return {Array} Plugin settings.
 */
export function getPlugins() {
	return Object.values( plugins );
}
