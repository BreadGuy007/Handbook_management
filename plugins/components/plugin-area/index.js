/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { addAction, removeAction } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import PluginContextProvider from '../plugin-context-provider';
import { getPlugins } from '../../api';

/**
 * A component that renders all plugin fills in a hidden div.
 *
 * @return {WPElement} Plugin area.
 */
class PluginArea extends Component {
	constructor() {
		super( ...arguments );

		this.setPlugins = this.setPlugins.bind( this );

		this.state = {
			plugins: getPlugins(),
		};
	}

	componentDidMount() {
		addAction( 'plugins.pluginRegistered', 'core/plugins/plugin-area-plugins-registered', this.setPlugins );
		addAction( 'plugins.pluginUnregistered', 'core/plugins/plugin-area-plugins-unregistered', this.setPlugins );
	}

	componentWillUnmount() {
		removeAction( 'plugins.pluginRegistered', 'core/plugins/plugin-area-plugins-registered' );
		removeAction( 'plugins.pluginUnregistered', 'core/plugins/plugin-area-plugins-unregistered' );
	}

	setPlugins() {
		this.setState( () => {
			return {
				plugins: getPlugins(),
			};
		} );
	}

	render() {
		return (
			<div style={ { display: 'none' } }>
				{ map( this.state.plugins, ( plugin ) => {
					const { render: Plugin } = plugin;

					return (
						<PluginContextProvider
							key={ plugin.name }
							pluginName={ plugin.name }
						>
							<Plugin />
						</PluginContextProvider>
					);
				} ) }
			</div>
		);
	}
}

export default PluginArea;
