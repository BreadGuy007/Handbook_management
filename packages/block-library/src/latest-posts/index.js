/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { postList as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';

const { name } = metadata;
export { metadata, name };

export const settings = {
	title: __( 'Latest Posts' ),
	description: __( 'Display a list of your most recent posts.' ),
	icon,
	keywords: [ __( 'recent posts' ) ],
	supports: {
		align: true,
		html: false,
	},
	edit,
};
