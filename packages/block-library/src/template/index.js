/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { InnerBlocks } from '@wordpress/editor';
import { G, Path, Rect, SVG } from '@wordpress/components';

export const name = 'core/template';

export const settings = {
	title: __( 'Reusable Template' ),

	category: 'reusable',

	description: __( 'Template block used as a container.' ),

	icon: <SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><Rect x="0" fill="none" width="24" height="24" /><G><Path d="M19 3H5c-1.105 0-2 .895-2 2v14c0 1.105.895 2 2 2h14c1.105 0 2-.895 2-2V5c0-1.105-.895-2-2-2zM6 6h5v5H6V6zm4.5 13C9.12 19 8 17.88 8 16.5S9.12 14 10.5 14s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm3-6l3-5 3 5h-6z" /></G></SVG>,

	supports: {
		customClassName: false,
		html: false,
		inserter: false,
	},

	edit() {
		return <InnerBlocks />;
	},

	save() {
		return <InnerBlocks.Content />;
	},
};
