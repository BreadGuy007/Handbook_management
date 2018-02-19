/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import CategoriesBlock from './block';

export const name = 'core/categories';

export const settings = {
	title: __( 'Categories' ),

	description: __( 'Shows a list of your site\'s categories.' ),

	icon: 'list-view',

	category: 'widgets',

	attributes: {
		showPostCounts: {
			type: 'boolean',
			default: false,
		},
		displayAsDropdown: {
			type: 'boolean',
			default: false,
		},
		showHierarchy: {
			type: 'boolean',
			default: false,
		},
		align: {
			type: 'string',
		},
	},

	supports: {
		html: false,
	},

	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( 'left' === align || 'right' === align || 'full' === align ) {
			return { 'data-align': align };
		}
	},

	edit: CategoriesBlock,

	save() {
		return null;
	},
};
