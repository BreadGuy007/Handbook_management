/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import deprecated from './deprecated';
import edit from './edit';
import { icon } from './icons';
import metadata from './block.json';
import save from './save';
import transforms from './transforms';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __( 'Gallery' ),
	description: __( 'Display multiple images in a rich gallery.' ),
	icon,
	keywords: [ __( 'images' ), __( 'photos' ) ],
	example: {
		attributes: {
			columns: 2,
			images: [
				{ url: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Glacial_lakes%2C_Bhutan.jpg' },
				{ url: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Sediment_off_the_Yucatan_Peninsula.jpg' },
			],
		},
	},
	supports: {
		align: true,
	},
	transforms,
	edit,
	save,
	deprecated,
};
