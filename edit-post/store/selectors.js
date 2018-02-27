/**
 * External dependencies
 */
import createSelector from 'rememo';
import { some } from 'lodash';

/**
 * Returns the current editing mode.
 *
 * @param {Object} state Global application state.
 *
 * @return {string} Editing mode.
 */
export function getEditorMode( state ) {
	return getPreference( state, 'editorMode', 'visual' );
}

/**
 * Returns the current active panel for the sidebar.
 *
 * @param {Object} state Global application state.
 *
 * @return {string} Active sidebar panel.
 */
export function getActiveEditorPanel( state ) {
	return getPreference( state, 'activeSidebarPanel', {} ).editor;
}

/**
 * Returns the current active plugin for the plugin sidebar.
 *
 * @param  {Object}  state Global application state
 * @return {string}        Active plugin sidebar plugin
 */
export function getActivePlugin( state ) {
	return getPreference( state, 'activeSidebarPanel', {} ).plugin;
}

/**
 * Returns the preferences (these preferences are persisted locally).
 *
 * @param {Object} state Global application state.
 *
 * @return {Object} Preferences Object.
 */
export function getPreferences( state ) {
	return state.preferences;
}

/**
 *
 * @param {Object} state         Global application state.
 * @param {string} preferenceKey Preference Key.
 * @param {Mixed}  defaultValue  Default Value.
 *
 * @return {Mixed} Preference Value.
 */
export function getPreference( state, preferenceKey, defaultValue ) {
	const preferences = getPreferences( state );
	const value = preferences[ preferenceKey ];
	return value === undefined ? defaultValue : value;
}

/**
 * Returns the opened general sidebar and null if the sidebar is closed.
 *
 * @param {Object} state Global application state.
 * @return {string}     The opened general sidebar panel.
 */
export function getOpenedGeneralSidebar( state ) {
	return getPreference( state, 'activeGeneralSidebar' );
}

/**
 * Returns true if the panel is open in the currently opened sidebar.
 *
 * @param  {Object}  state   Global application state
 * @param  {string}  sidebar Sidebar name (leave undefined for the default sidebar)
 * @param  {string}  panel   Sidebar panel name (leave undefined for the default panel)
 * @return {boolean}        Whether the given general sidebar panel is open
 */
export function isGeneralSidebarPanelOpened( state, sidebar, panel ) {
	const activeGeneralSidebar = getPreference( state, 'activeGeneralSidebar' );
	const activeSidebarPanel = getPreference( state, 'activeSidebarPanel' );
	return activeGeneralSidebar === sidebar && activeSidebarPanel === panel;
}

/**
 * Returns true if the publish sidebar is opened.
 *
 * @param {Object} state Global application state
 * @return {boolean}       Whether the publish sidebar is open.
 */
export function isPublishSidebarOpened( state ) {
	return state.publishSidebarActive;
}

/**
 * Returns true if there's any open sidebar (mobile, desktop or publish).
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether sidebar is open.
 */
export function hasOpenSidebar( state ) {
	const generalSidebarOpen = getPreference( state, 'activeGeneralSidebar' ) !== null;
	const publishSidebarOpen = state.publishSidebarActive;

	return generalSidebarOpen || publishSidebarOpen;
}

/**
 * Returns true if the editor sidebar panel is open, or false otherwise.
 *
 * @param  {Object}  state Global application state.
 * @param  {string}  panel Sidebar panel name.
 * @return {boolean}       Whether the sidebar panel is open.
 */
export function isEditorSidebarPanelOpened( state, panel ) {
	const panels = getPreference( state, 'panels' );
	return panels ? !! panels[ panel ] : false;
}

/**
 * Returns whether the given feature is enabled or not.
 *
 * @param {Object} state   Global application state.
 * @param {string} feature Feature slug.
 *
 * @return {boolean} Is active.
 */
export function isFeatureActive( state, feature ) {
	return !! state.preferences.features[ feature ];
}

/**
 * Returns the state of legacy meta boxes.
 *
 * @param   {Object} state Global application state.
 * @return {Object}       State of meta boxes.
 */
export function getMetaBoxes( state ) {
	return state.metaBoxes;
}

/**
 * Returns the state of legacy meta boxes.
 *
 * @param {Object} state    Global application state.
 * @param {string} location Location of the meta box.
 *
 * @return {Object} State of meta box at specified location.
 */
export function getMetaBox( state, location ) {
	return getMetaBoxes( state )[ location ];
}

/**
 * Returns true if the post is using Meta Boxes
 *
 * @param  {Object} state Global application state
 * @return {boolean}      Whether there are metaboxes or not.
 */
export const hasMetaBoxes = createSelector(
	( state ) => {
		return some( getMetaBoxes( state ), ( metaBox ) => {
			return metaBox.isActive;
		} );
	},
	( state ) => state.metaBoxes,
);

/**
 * Returns true if the the Meta Boxes are being saved.
 *
 * @param   {Object}  state Global application state.
 * @return {boolean}       Whether the metaboxes are being saved.
 */
export function isSavingMetaBoxes( state ) {
	return state.isSavingMetaBoxes;
}
