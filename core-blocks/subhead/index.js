/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
import { RichText } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';

export const name = 'core/subhead';

export const settings = {
	title: __( 'Subhead' ),

	description: __( 'Explanatory text under the main heading of an article.' ),

	icon: 'text',

	category: 'common',

	useOnce: true,

	attributes: {
		content: {
			type: 'array',
			source: 'children',
			selector: 'p',
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
		const { content, placeholder } = attributes;

		return (
			<RichText
				tagName="p"
				value={ content }
				onChange={ ( nextContent ) => {
					setAttributes( {
						content: nextContent,
					} );
				} }
				className={ className }
				placeholder={ placeholder || __( 'Write subhead…' ) }
			/>
		);
	},

	save( { attributes, className } ) {
		const { content } = attributes;

		return (
			<RichText.Content
				tagName="p"
				className={ className }
				value={ content }
			/>
		);
	},
};
