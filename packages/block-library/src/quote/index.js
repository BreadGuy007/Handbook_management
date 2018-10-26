/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { createBlock, getPhrasingContentSchema } from '@wordpress/blocks';
import {
	BlockControls,
	AlignmentToolbar,
	RichText,
} from '@wordpress/editor';
import { join, split, create, toHTMLString } from '@wordpress/rich-text';
import { G, Path, SVG } from '@wordpress/components';

const blockAttributes = {
	value: {
		source: 'html',
		selector: 'blockquote',
		multiline: 'p',
	},
	citation: {
		source: 'html',
		selector: 'cite',
	},
	align: {
		type: 'string',
	},
};

export const name = 'core/quote';

export const settings = {
	title: __( 'Quote' ),
	description: __( 'Maybe someone else said it better -- add some quoted text.' ),
	icon: <SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><Path fill="none" d="M0 0h24v24H0V0z" /><G><Path d="M19 18h-6l2-4h-2V6h8v7l-2 5zm-2-2l2-3V8h-4v4h4l-2 4zm-8 2H3l2-4H3V6h8v7l-2 5zm-2-2l2-3V8H5v4h4l-2 4z" /></G></SVG>,
	category: 'common',
	keywords: [ __( 'blockquote' ) ],

	attributes: blockAttributes,

	styles: [
		{ name: 'default', label: _x( 'Regular', 'block style' ), isDefault: true },
		{ name: 'large', label: _x( 'Large', 'block style' ) },
	],

	transforms: {
		from: [
			{
				type: 'block',
				isMultiBlock: true,
				blocks: [ 'core/paragraph' ],
				transform: ( attributes ) => {
					return createBlock( 'core/quote', {
						value: toHTMLString( join( attributes.map( ( { content } ) =>
							create( { html: content } )
						), '\u2028' ), 'p' ),
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/heading' ],
				transform: ( { content } ) => {
					return createBlock( 'core/quote', {
						value: `<p>${ content }</p>`,
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/pullquote' ],
				transform: ( { value, citation } ) => createBlock( 'core/quote', {
					value,
					citation,
				} ),
			},
			{
				type: 'pattern',
				regExp: /^>\s/,
				transform: ( { content } ) => {
					return createBlock( 'core/quote', {
						value: `<p>${ content }</p>`,
					} );
				},
			},
			{
				type: 'raw',
				selector: 'blockquote',
				schema: {
					blockquote: {
						children: {
							p: {
								children: getPhrasingContentSchema(),
							},
						},
					},
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( { value, citation } ) => {
					const paragraphs = [];
					if ( value ) {
						paragraphs.push(
							...split( create( { html: value, multilineTag: 'p' } ), '\u2028' )
								.map( ( piece ) =>
									createBlock( 'core/paragraph', {
										content: toHTMLString( piece ),
									} )
								)
						);
					}
					if ( citation ) {
						paragraphs.push(
							createBlock( 'core/paragraph', {
								content: citation,
							} )
						);
					}

					if ( paragraphs.length === 0 ) {
						return createBlock( 'core/paragraph', {
							content: '',
						} );
					}
					return paragraphs;
				},
			},

			{
				type: 'block',
				blocks: [ 'core/heading' ],
				transform: ( { value, citation, ...attrs } ) => {
					// If there is no quote content, use the citation as the
					// content of the resulting heading. A nonexistent citation
					// will result in an empty heading.
					if ( value === '<p></p>' ) {
						return createBlock( 'core/heading', {
							content: citation,
						} );
					}

					const pieces = split( create( { html: value, multilineTag: 'p' } ), '\u2028' );
					const quotePieces = pieces.slice( 1 );

					return [
						createBlock( 'core/heading', {
							content: toHTMLString( pieces[ 0 ] ),
						} ),
						createBlock( 'core/quote', {
							...attrs,
							citation,
							value: toHTMLString( quotePieces.length ? join( pieces.slice( 1 ), '\u2028' ) : create(), 'p' ),
						} ),
					];
				},
			},

			{
				type: 'block',
				blocks: [ 'core/pullquote' ],
				transform: ( { value, citation } ) => {
					return createBlock( 'core/pullquote', {
						value,
						citation,
					} );
				},
			},
		],
	},

	edit( { attributes, setAttributes, isSelected, mergeBlocks, onReplace, className } ) {
		const { align, value, citation } = attributes;

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
				<blockquote className={ className } style={ { textAlign: align } }>
					<RichText
						multiline
						value={ value }
						onChange={
							( nextValue ) => setAttributes( {
								value: nextValue,
							} )
						}
						onMerge={ mergeBlocks }
						onRemove={ ( forward ) => {
							const hasEmptyCitation = ! citation || citation.length === 0;
							if ( ! forward && hasEmptyCitation ) {
								onReplace( [] );
							}
						} }
						/* translators: the text of the quotation */
						placeholder={ __( 'Write quote…' ) }
					/>
					{ ( ! RichText.isEmpty( citation ) || isSelected ) && (
						<RichText
							value={ citation }
							onChange={
								( nextCitation ) => setAttributes( {
									citation: nextCitation,
								} )
							}
							/* translators: the individual or entity quoted */
							placeholder={ __( 'Write citation…' ) }
							className="wp-block-quote__citation"
						/>
					) }
				</blockquote>
			</Fragment>
		);
	},

	save( { attributes } ) {
		const { align, value, citation } = attributes;

		return (
			<blockquote style={ { textAlign: align ? align : null } }>
				<RichText.Content multiline value={ value } />
				{ ! RichText.isEmpty( citation ) && <RichText.Content tagName="cite" value={ citation } /> }
			</blockquote>
		);
	},

	merge( attributes, { value, citation } ) {
		if ( ! value || value === '<p></p>' ) {
			return {
				...attributes,
				citation: attributes.citation + citation,
			};
		}

		return {
			...attributes,
			value: attributes.value + value,
			citation: attributes.citation + citation,
		};
	},

	deprecated: [
		{
			attributes: {
				...blockAttributes,
				style: {
					type: 'number',
					default: 1,
				},
			},

			migrate( attributes ) {
				if ( attributes.style === 2 ) {
					return {
						...omit( attributes, [ 'style' ] ),
						className: attributes.className ? attributes.className + ' is-style-large' : 'is-style-large',
					};
				}

				return attributes;
			},

			save( { attributes } ) {
				const { align, value, citation, style } = attributes;

				return (
					<blockquote
						className={ style === 2 ? 'is-large' : '' }
						style={ { textAlign: align ? align : null } }
					>
						<RichText.Content multiline value={ value } />
						{ ! RichText.isEmpty( citation ) && <RichText.Content tagName="cite" value={ citation } /> }
					</blockquote>
				);
			},
		},
		{
			attributes: {
				...blockAttributes,
				citation: {
					source: 'html',
					selector: 'footer',
				},
				style: {
					type: 'number',
					default: 1,
				},
			},

			save( { attributes } ) {
				const { align, value, citation, style } = attributes;

				return (
					<blockquote
						className={ `blocks-quote-style-${ style }` }
						style={ { textAlign: align ? align : null } }
					>
						<RichText.Content multiline value={ value } />
						{ ! RichText.isEmpty( citation ) && <RichText.Content tagName="footer" value={ citation } /> }
					</blockquote>
				);
			},
		},
	],
};
