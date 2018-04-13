/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';
import { flow, pick } from 'lodash';

/**
 * WordPress Dependencies
 */
import { createElement, Component } from '@wordpress/element';
import { RichTextProvider, EditorSettings } from '@wordpress/blocks';
import {
	APIProvider,
	DropZoneProvider,
	SlotFillProvider,
} from '@wordpress/components';

/**
 * Internal Dependencies
 */
import { setupEditor, undo, redo, createUndoLevel } from '../../store/actions';
import store from '../../store';

class EditorProvider extends Component {
	constructor( props ) {
		super( ...arguments );

		this.store = store;

		// Assume that we don't need to initialize in the case of an error recovery.
		if ( ! props.recovery ) {
			this.store.dispatch(
				setupEditor( props.post, {
					...EditorSettings.defaultSettings,
					...this.props.settings,
				} )
			);
		}
	}

	render() {
		const { children, settings } = this.props;
		const providers = [
			// Editor settings provider
			[
				EditorSettings.Provider,
				{
					value: {
						...EditorSettings.defaultSettings,
						...settings,
					},
				},
			],

			// Redux provider:
			//
			//  - context.store
			[
				ReduxProvider,
				{ store: this.store },
			],

			// RichText provider:
			//
			//  - context.onUndo
			//  - context.onRedo
			//  - context.onCreateUndoLevel
			[
				RichTextProvider,
				bindActionCreators( {
					onUndo: undo,
					onRedo: redo,
					onCreateUndoLevel: createUndoLevel,
				}, this.store.dispatch ),
			],

			// Slot / Fill provider:
			//
			//  - context.getSlot
			//  - context.registerSlot
			//  - context.unregisterSlot
			[
				SlotFillProvider,
			],

			// APIProvider
			//
			//  - context.getAPISchema
			//  - context.getAPIPostTypeRestBaseMapping
			//  - context.getAPITaxonomyRestBaseMapping
			[
				APIProvider,
				{
					...wpApiSettings,
					...pick( wp.api, [
						'postTypeRestBaseMapping',
						'taxonomyRestBaseMapping',
					] ),
				},
			],

			// DropZone provider:
			[
				DropZoneProvider,
			],
		];

		const createEditorElement = flow(
			providers.map( ( [ Provider, props ] ) => (
				( arg ) => createElement( Provider, props, arg )
			) )
		);

		return createEditorElement( children );
	}
}

export default EditorProvider;
