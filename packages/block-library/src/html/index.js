/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { html as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';
import save from './save';
import transforms from './transforms';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __( 'Custom HTML' ),
	description: __( 'Add custom HTML code and preview it as you edit.' ),
	icon,
	keywords: [ __( 'embed' ) ],
	example: {
		attributes: {
			content:
				'<marquee>' +
				__( 'Welcome to the wonderful world of blocks…' ) +
				'</marquee>',
		},
	},
	edit,
	save,
	transforms,
};
