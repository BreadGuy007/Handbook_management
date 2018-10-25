/**
 * WordPress
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import {
	RichText,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/editor';
import { SVG, Path } from '@wordpress/components';

export const name = 'core/verse';

export const settings = {
	title: __( 'Verse' ),

	description: __( 'A block for haiku? Why not? Blocks for all the things! (See what we did here?)' ),

	icon: <SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><Path fill="none" d="M0 0h24v24H0V0z" /><Path d="M3 17v4h4l11-11-4-4L3 17zm3 2H5v-1l9-9 1 1-9 9zM21 6l-3-3h-1l-2 2 4 4 2-2V6z" /></SVG>,

	category: 'formatting',

	keywords: [ __( 'poetry' ) ],

	attributes: {
		content: {
			source: 'html',
			selector: 'pre',
		},
		textAlign: {
			type: 'string',
		},
	},

	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( attributes ) =>
					createBlock( 'core/verse', attributes ),
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( attributes ) =>
					createBlock( 'core/paragraph', attributes ),
			},
		],
	},

	edit( { attributes, setAttributes, className, mergeBlocks } ) {
		const { textAlign, content } = attributes;

		return (
			<Fragment>
				<BlockControls>
					<AlignmentToolbar
						value={ textAlign }
						onChange={ ( nextAlign ) => {
							setAttributes( { textAlign: nextAlign } );
						} }
					/>
				</BlockControls>
				<RichText
					tagName="pre"
					value={ content }
					onChange={ ( nextContent ) => {
						setAttributes( {
							content: nextContent,
						} );
					} }
					style={ { textAlign: textAlign } }
					placeholder={ __( 'Write…' ) }
					wrapperClassName={ className }
					onMerge={ mergeBlocks }
				/>
			</Fragment>
		);
	},

	save( { attributes, className } ) {
		const { textAlign, content } = attributes;

		return (
			<RichText.Content
				tagName="pre"
				className={ className }
				style={ { textAlign: textAlign } }
				value={ content }
			/>
		);
	},

	merge( attributes, attributesToMerge ) {
		return {
			content: attributes.content + attributesToMerge.content,
		};
	},
};
