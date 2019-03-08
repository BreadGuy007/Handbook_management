/**
 * WordPress dependencies
 */
import deprecated from '@wordpress/deprecated';
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import {
	RichText,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/block-editor';
import { SVG, Path } from '@wordpress/components';

export const name = 'core/subhead';

export const settings = {
	title: __( 'Subheading (deprecated)' ),

	description: __( 'This block is deprecated. Please use the Paragraph block instead.' ),

	icon: <SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><Path d="M7.1 6l-.5 3h4.5L9.4 19h3l1.8-10h4.5l.5-3H7.1z" /></SVG>,

	category: 'common',

	supports: {
		// Hide from inserter as this block is deprecated.
		inserter: false,
		multiple: false,
	},

	attributes: {
		content: {
			type: 'string',
			source: 'html',
			selector: 'p',
		},
		align: {
			type: 'string',
		},
	},

	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( attributes ) =>
					createBlock( 'core/paragraph', attributes ),
			},
		],
	},

	edit( { attributes, setAttributes, className } ) {
		const { align, content, placeholder } = attributes;

		deprecated( 'The Subheading block', {
			alternative: 'the Paragraph block',
			plugin: 'Gutenberg',
		} );

		return (
			<Fragment>
				<BlockControls>
					<AlignmentToolbar
						value={ align }
						onChange={ ( nextAlign ) => {
							setAttributes( { align: nextAlign } );
						} }
					/>
				</BlockControls>
				<RichText
					tagName="p"
					value={ content }
					onChange={ ( nextContent ) => {
						setAttributes( {
							content: nextContent,
						} );
					} }
					style={ { textAlign: align } }
					className={ className }
					placeholder={ placeholder || __( 'Write subheading…' ) }
				/>
			</Fragment>
		);
	},

	save( { attributes } ) {
		const { align, content } = attributes;

		return (
			<RichText.Content
				tagName="p"
				style={ { textAlign: align } }
				value={ content }
			/>
		);
	},
};
