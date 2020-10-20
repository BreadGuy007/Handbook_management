/**
 * External dependencies
 */
import { castArray } from 'lodash';

/**
 * WordPress dependencies
 */
import { controls } from '@wordpress/data';

/**
 * Returns an action object used in signalling that the user opened an editor sidebar.
 *
 * @param {?string} name Sidebar name to be opened.
 *
 * @yield {Object} Action object.
 */
export function* openGeneralSidebar( name ) {
	yield controls.dispatch(
		'core/interface',
		'enableComplementaryArea',
		'core/edit-post',
		name
	);
}

/**
 * Returns an action object signalling that the user closed the sidebar.
 *
 * @yield {Object} Action object.
 */
export function* closeGeneralSidebar() {
	yield controls.dispatch(
		'core/interface',
		'disableComplementaryArea',
		'core/edit-post'
	);
}

/**
 * Returns an action object used in signalling that the user opened a modal.
 *
 * @param {string} name A string that uniquely identifies the modal.
 *
 * @return {Object} Action object.
 */
export function openModal( name ) {
	return {
		type: 'OPEN_MODAL',
		name,
	};
}

/**
 * Returns an action object signalling that the user closed a modal.
 *
 * @return {Object} Action object.
 */
export function closeModal() {
	return {
		type: 'CLOSE_MODAL',
	};
}

/**
 * Returns an action object used in signalling that the user opened the publish
 * sidebar.
 *
 * @return {Object} Action object
 */
export function openPublishSidebar() {
	return {
		type: 'OPEN_PUBLISH_SIDEBAR',
	};
}

/**
 * Returns an action object used in signalling that the user closed the
 * publish sidebar.
 *
 * @return {Object} Action object.
 */
export function closePublishSidebar() {
	return {
		type: 'CLOSE_PUBLISH_SIDEBAR',
	};
}

/**
 * Returns an action object used in signalling that the user toggles the publish sidebar.
 *
 * @return {Object} Action object
 */
export function togglePublishSidebar() {
	return {
		type: 'TOGGLE_PUBLISH_SIDEBAR',
	};
}

/**
 * Returns an action object used to enable or disable a panel in the editor.
 *
 * @param {string} panelName A string that identifies the panel to enable or disable.
 *
 * @return {Object} Action object.
 */
export function toggleEditorPanelEnabled( panelName ) {
	return {
		type: 'TOGGLE_PANEL_ENABLED',
		panelName,
	};
}

/**
 * Returns an action object used to open or close a panel in the editor.
 *
 * @param {string} panelName A string that identifies the panel to open or close.
 *
 * @return {Object} Action object.
 */
export function toggleEditorPanelOpened( panelName ) {
	return {
		type: 'TOGGLE_PANEL_OPENED',
		panelName,
	};
}

/**
 * Returns an action object used to remove a panel from the editor.
 *
 * @param {string} panelName A string that identifies the panel to remove.
 *
 * @return {Object} Action object.
 */
export function removeEditorPanel( panelName ) {
	return {
		type: 'REMOVE_PANEL',
		panelName,
	};
}

/**
 * Returns an action object used to toggle a feature flag.
 *
 * @param {string} feature Feature name.
 *
 * @return {Object} Action object.
 */
export function toggleFeature( feature ) {
	return {
		type: 'TOGGLE_FEATURE',
		feature,
	};
}

export function switchEditorMode( mode ) {
	return {
		type: 'SWITCH_MODE',
		mode,
	};
}

/**
 * Returns an action object used to toggle a plugin name flag.
 *
 * @param {string} pluginName Plugin name.
 *
 * @return {Object} Action object.
 */
export function togglePinnedPluginItem( pluginName ) {
	return {
		type: 'TOGGLE_PINNED_PLUGIN_ITEM',
		pluginName,
	};
}

/**
 * Returns an action object used in signalling that block types by the given
 * name(s) should be hidden.
 *
 * @param {string[]} blockNames Names of block types to hide.
 *
 * @return {Object} Action object.
 */
export function hideBlockTypes( blockNames ) {
	return {
		type: 'HIDE_BLOCK_TYPES',
		blockNames: castArray( blockNames ),
	};
}

/**
 * Returns an action object used in signaling that a style should be auto-applied when a block is created.
 *
 * @param {string}  blockName  Name of the block.
 * @param {?string} blockStyle Name of the style that should be auto applied. If undefined, the "auto apply" setting of the block is removed.
 *
 * @return {Object} Action object.
 */
export function updatePreferredStyleVariations( blockName, blockStyle ) {
	return {
		type: 'UPDATE_PREFERRED_STYLE_VARIATIONS',
		blockName,
		blockStyle,
	};
}

/**
 * Returns an action object used in signalling that the editor should attempt
 * to locally autosave the current post every `interval` seconds.
 *
 * @param {number} interval The new interval, in seconds.
 * @return {Object} Action object.
 */
export function __experimentalUpdateLocalAutosaveInterval( interval ) {
	return {
		type: 'UPDATE_LOCAL_AUTOSAVE_INTERVAL',
		interval,
	};
}

/**
 * Returns an action object used in signalling that block types by the given
 * name(s) should be shown.
 *
 * @param {string[]} blockNames Names of block types to show.
 *
 * @return {Object} Action object.
 */
export function showBlockTypes( blockNames ) {
	return {
		type: 'SHOW_BLOCK_TYPES',
		blockNames: castArray( blockNames ),
	};
}

/**
 * Returns an action object used in signaling
 * what Meta boxes are available in which location.
 *
 * @param {Object} metaBoxesPerLocation Meta boxes per location.
 *
 * @return {Object} Action object.
 */
export function setAvailableMetaBoxesPerLocation( metaBoxesPerLocation ) {
	return {
		type: 'SET_META_BOXES_PER_LOCATIONS',
		metaBoxesPerLocation,
	};
}

/**
 * Returns an action object used to request meta box update.
 *
 * @return {Object} Action object.
 */
export function requestMetaBoxUpdates() {
	return {
		type: 'REQUEST_META_BOX_UPDATES',
	};
}

/**
 * Returns an action object used signal a successful meta box update.
 *
 * @return {Object} Action object.
 */
export function metaBoxUpdatesSuccess() {
	return {
		type: 'META_BOX_UPDATES_SUCCESS',
	};
}

/**
 * Returns an action object used to toggle the width of the editing canvas.
 *
 * @param {string} deviceType
 *
 * @return {Object} Action object.
 */
export function __experimentalSetPreviewDeviceType( deviceType ) {
	return {
		type: 'SET_PREVIEW_DEVICE_TYPE',
		deviceType,
	};
}

/**
 * Returns an action object used to open/close the inserter.
 *
 * @param {boolean} value A boolean representing whether the inserter should be opened or closed.
 * @return {Object} Action object.
 */
export function setIsInserterOpened( value ) {
	return {
		type: 'SET_IS_INSERTER_OPENED',
		value,
	};
}
