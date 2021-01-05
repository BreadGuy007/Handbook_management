/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { navigation as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit';
import save from './save';
import deprecated from './deprecated';
import variations from './variations';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: _x( 'Navigation', 'block title' ),
	icon,
	description: __(
		'A collection of blocks that allow visitors to get around your site.'
	),
	keywords: [ __( 'menu' ), __( 'navigation' ), __( 'links' ) ],
	variations,
	example: {
		innerBlocks: [
			{
				name: 'core/navigation-link',
				attributes: {
					// translators: 'Home' as in a website's home page.
					label: __( 'Home' ),
					url: 'https://make.wordpress.org/',
				},
			},
			{
				name: 'core/navigation-link',
				attributes: {
					// translators: 'About' as in a website's about page.
					label: __( 'About' ),
					url: 'https://make.wordpress.org/',
				},
			},
			{
				name: 'core/navigation-link',
				attributes: {
					// translators: 'Contact' as in a website's contact page.
					label: __( 'Contact' ),
					url: 'https://make.wordpress.org/',
				},
			},
		],
	},
	edit,
	save,
	deprecated,
};
