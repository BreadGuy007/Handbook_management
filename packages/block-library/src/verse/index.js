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
	title: __( 'Verse' ),
	description: __( 'Insert poetry. Use special spacing formats. Or quote song lyrics.' ),
	icon,
	example: {
		attributes: {
			content: __( 'WHAT was he doing, the great god Pan,' ) + '<br>' +
			__( '    Down in the reeds by the river?' ) + '<br>' +
			__( 'Spreading ruin and scattering ban,' ) + '<br>' +
			__( 'Splashing and paddling with hoofs of a goat,' ) + '<br>' +
			__( 'And breaking the golden lilies afloat' ) + '<br>' +
			__( '    With the dragon-fly on the river.' ),
		},
	},
	keywords: [ __( 'poetry' ) ],
	transforms,
	deprecated,
	merge( attributes, attributesToMerge ) {
		return {
			content: attributes.content + attributesToMerge.content,
		};
	},
	edit,
	save,
};
