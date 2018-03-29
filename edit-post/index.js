/**
 * External dependencies
 */
import { createProvider } from 'react-redux';

/**
 * WordPress dependencies
 */
import { render, unmountComponentAtNode } from '@wordpress/element';
import { EditorProvider, ErrorBoundary } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './assets/stylesheets/main.scss';
import './hooks';
import Layout from './components/layout';
import store from './store';
import { initializeMetaBoxState } from './store/actions';

import PluginSidebar from './components/plugin-sidebar';
import PluginMoreMenuItem from './components/plugin-more-menu-item';

/**
 * Configure heartbeat to refresh the wp-api nonce, keeping the editor
 * authorization intact.
 */
window.jQuery( document ).on( 'heartbeat-tick', ( event, response ) => {
	if ( response[ 'rest-nonce' ] ) {
		window.wpApiSettings.nonce = response[ 'rest-nonce' ];
	}
} );

/**
 * Reinitializes the editor after the user chooses to reboot the editor after
 * an unhandled error occurs, replacing previously mounted editor element using
 * an initial state from prior to the crash.
 *
 * @param {Element} target   DOM node in which editor is rendered.
 * @param {?Object} settings Editor settings object.
 */
export function reinitializeEditor( target, settings ) {
	unmountComponentAtNode( target );

	const reboot = reinitializeEditor.bind( null, target, settings );
	const ReduxProvider = createProvider( 'edit-post' );

	render(
		<EditorProvider settings={ settings } recovery>
			<ErrorBoundary onError={ reboot }>
				<ReduxProvider store={ store }>
					<Layout />
				</ReduxProvider>
			</ErrorBoundary>
		</EditorProvider>,
		target
	);
}

/**
 * Initializes and returns an instance of Editor.
 *
 * The return value of this function is not necessary if we change where we
 * call initializeEditor(). This is due to metaBox timing.
 *
 * @param {string}  id       Unique identifier for editor instance.
 * @param {Object}  post     API entity for post to edit.
 * @param {?Object} settings Editor settings object.
 *
 * @return {Object} Editor interface.
 */
export function initializeEditor( id, post, settings ) {
	const target = document.getElementById( id );
	const reboot = reinitializeEditor.bind( null, target, settings );
	const ReduxProvider = createProvider( 'edit-post' );

	render(
		<EditorProvider settings={ settings } post={ post }>
			<ErrorBoundary onError={ reboot }>
				<ReduxProvider store={ store }>
					<Layout />
				</ReduxProvider>
			</ErrorBoundary>
		</EditorProvider>,
		target
	);

	return {
		initializeMetaBoxes( metaBoxes ) {
			store.dispatch( initializeMetaBoxState( metaBoxes ) );
		},
	};
}

export const __experimental = {
	PluginSidebar,
	PluginMoreMenuItem,
};
