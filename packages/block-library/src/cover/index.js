/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import deprecated from './deprecated';
import edit from './edit';
import icon from './icon';
import metadata from './block.json';
import save from './save';
import transforms from './transforms';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __( 'Cover' ),
	description: __( 'Add an image or video with a text overlay — great for headers.' ),
	icon,
	supports: {
		align: true,
	},
	example: {
		attributes: {
			customOverlayColor: '#065174',
			dimRatio: 40,
			url: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Windbuchencom.jpg',
		},
		innerBlocks: [
			{
				name: 'core/paragraph',
				attributes: {
					customFontSize: 48,
					content: __( '<strong>Snow Patrol</strong>' ),
					align: 'center',
				},
			},
		],
	},
	transforms,
	save,
	edit,
	deprecated,
};
