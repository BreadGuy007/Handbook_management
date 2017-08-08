/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as SlotFillProvider } from 'react-slot-fill';
import moment from 'moment-timezone';
import 'moment-timezone/moment-timezone-utils';

/**
 * WordPress dependencies
 */
import { EditableProvider } from '@wordpress/blocks';
import { render } from '@wordpress/element';
import { settings } from '@wordpress/date';

/**
 * Internal dependencies
 */
import './assets/stylesheets/main.scss';
import Layout from './layout';
import { createReduxStore } from './state';
import { undo, createInfoNotice } from './actions';
import EnableTrackingPrompt, { TRACKING_PROMPT_NOTICE_ID } from './enable-tracking-prompt';
import EditorSettingsProvider from './settings/provider';

/**
 * The default editor settings
 * You can override any default settings when calling createEditorInstance
 *
 *  wideImages   boolean   Enable/Disable Wide/Full Alignments
 *
 * @var {Object} DEFAULT_SETTINGS
 */
const DEFAULT_SETTINGS = {
	wideImages: false,
};

// Configure moment globally
moment.locale( settings.l10n.locale );
if ( settings.timezone.string ) {
	moment.tz.setDefault( settings.timezone.string );
} else {
	const momentTimezone = {
		name: 'WP',
		abbrs: [ 'WP' ],
		untils: [ null ],
		offsets: [ -settings.timezone.offset * 60 ],
	};
	const unpackedTimezone = moment.tz.pack( momentTimezone );
	moment.tz.add( unpackedTimezone );
	moment.tz.setDefault( 'WP' );
}

/**
 * Initializes Redux state with bootstrapped post, if provided.
 *
 * @param {Redux.Store} store Redux store instance
 * @param {Object}     post  Bootstrapped post object
 */
function preparePostState( store, post ) {
	// Set current post into state
	store.dispatch( {
		type: 'RESET_POST',
		post,
	} );

	// Include auto draft title in edits while not flagging post as dirty
	if ( post.status === 'auto-draft' ) {
		store.dispatch( {
			type: 'SETUP_NEW_POST',
			edits: {
				title: post.title.raw,
			},
		} );
	}
}

/**
 * Initializes and returns an instance of Editor.
 *
 * @param {String} id              Unique identifier for editor instance
 * @param {Object} post            API entity for post to edit  (type required)
 * @param {Object} editorSettings  Editor settings object
 */
export function createEditorInstance( id, post, editorSettings = DEFAULT_SETTINGS ) {
	const store = createReduxStore();

	store.dispatch( {
		type: 'SETUP_EDITOR',
		settings: editorSettings,
	} );

	if ( window.getUserSetting( 'gutenberg_tracking' ) === '' ) {
		store.dispatch( createInfoNotice( <EnableTrackingPrompt />, {
			id: TRACKING_PROMPT_NOTICE_ID,
			isDismissible: false, // This notice has its own dismiss logic.
		} ) );
	}

	preparePostState( store, post );

	render(
		<ReduxProvider store={ store }>
			<SlotFillProvider>
				<EditableProvider {
					...bindActionCreators( {
						onUndo: undo,
					}, store.dispatch ) }
				>
					<EditorSettingsProvider settings={ editorSettings }>
						<Layout />
					</EditorSettingsProvider>
				</EditableProvider>
			</SlotFillProvider>
		</ReduxProvider>,
		document.getElementById( id )
	);
}
