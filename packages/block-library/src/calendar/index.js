/**
 * WordPress dependencies
 */
import { calendar as icon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __( 'Calendar' ),
	description: __( 'A calendar of your site’s posts.' ),
	icon,
	keywords: [ __( 'posts' ), __( 'archive' ) ],
	example: {},
	edit,
};
