/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import {
	RichText,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/editor';

export const name = 'core/subhead';

export const settings = {
	title: __( 'Subheading' ),

	description: __( 'What’s a subhead? Smaller than a headline, bigger than basic text.' ),

	icon: <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z" /><g><path d="M4 9h16v2H4V9zm0 4h10v2H4v-2z" /></g></svg>,

	category: 'common',

	supports: {
		multiple: false,
	},

	attributes: {
		content: {
			type: 'array',
			source: 'children',
			selector: 'p',
		},
		align: {
			type: 'string',
		},
	},

	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( { content } ) => {
					return createBlock( 'core/subhead', {
						content,
					} );
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( { content } ) => {
					return createBlock( 'core/paragraph', {
						content,
					} );
				},
			},
		],
	},

	edit( { attributes, setAttributes, className } ) {
		const { align, content, placeholder } = attributes;

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

	save( { attributes, className } ) {
		const { align, content } = attributes;

		return (
			<RichText.Content
				tagName="p"
				className={ className }
				style={ { textAlign: align } }
				value={ content }
			/>
		);
	},
};
