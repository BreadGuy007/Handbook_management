/**
 * WordPress dependencies
 */
import { SETTINGS_DEFAULTS } from '@wordpress/block-editor';

export const PREFERENCES_DEFAULTS = {
	isPublishSidebarEnabled: true,
};

/**
 * Default initial edits state.
 *
 * @type {Object}
 */
export const INITIAL_EDITS_DEFAULTS = {};

/**
 * The default post editor settings
 *
 *  allowedBlockTypes  boolean|Array Allowed block types
 *  richEditingEnabled boolean       Whether rich editing is enabled or not
 *  enableCustomFields boolean       Whether the WordPress custom fields are enabled or not
 *  autosaveInterval   number        Autosave Interval
 *  availableTemplates array?        The available post templates
 *  disablePostFormats boolean       Whether or not the post formats are disabled
 *  allowedMimeTypes   array?        List of allowed mime types and file extensions
 *  maxUploadFileSize  number        Maximum upload file size
 */
export const EDITOR_SETTINGS_DEFAULTS = {
	...SETTINGS_DEFAULTS,

	richEditingEnabled: true,
	enableCustomFields: false,
};

