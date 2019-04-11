/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Path, SVG } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { InnerBlocks, getColorClassName } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __( 'Group' ),

	icon: <SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><Path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z" /><Path d="M0 0h24v24H0z" fill="none" /></SVG>,

	description: __( 'A block that groups other blocks.' ),

	keywords: [ __( 'container' ), __( 'wrapper' ), __( 'row' ), __( 'section' ) ],

	supports: {
		align: [ 'wide', 'full' ],
		anchor: true,
		html: false,
	},

	edit,

	save( { attributes } ) {
		const { backgroundColor, customBackgroundColor } = attributes;

		const backgroundClass = getColorClassName( 'background-color', backgroundColor );
		const className = classnames( backgroundClass, {
			'has-background': backgroundColor || customBackgroundColor,
		} );

		const styles = {
			backgroundColor: backgroundClass ? undefined : customBackgroundColor,
		};

		return (
			<div className={ className } style={ styles }>
				<InnerBlocks.Content />
			</div>
		);
	},
};
