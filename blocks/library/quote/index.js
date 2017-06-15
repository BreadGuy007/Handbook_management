/**
 * WordPress dependencies
 */
import { switchChildrenNodeName } from 'element';

/**
 * Internal dependencies
 */
import './style.scss';
import { registerBlockType, createBlock, query as hpq } from '../../api';
import AlignmentToolbar from '../../alignment-toolbar';
import BlockControls from '../../block-controls';
import Editable from '../../editable';

const { children, query } = hpq;

registerBlockType( 'core/quote', {
	title: wp.i18n.__( 'Quote' ),
	icon: 'format-quote',
	category: 'common',

	attributes: {
		value: query( 'blockquote > p', children() ),
		citation: children( 'footer' ),
	},

	controls: [ 1, 2 ].map( ( variation ) => ( {
		icon: 'format-quote',
		title: wp.i18n.sprintf( wp.i18n.__( 'Quote style %d' ), variation ),
		isActive: ( { style = 1 } ) => Number( style ) === variation,
		onClick( attributes, setAttributes ) {
			setAttributes( { style: variation } );
		},
		subscript: variation,
	} ) ),

	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/text' ],
				transform: ( { content } ) => {
					return createBlock( 'core/quote', {
						value: content,
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/list' ],
				transform: ( { values } ) => {
					return createBlock( 'core/quote', {
						value: switchChildrenNodeName( values, 'p' ),
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/heading' ],
				transform: ( { content } ) => {
					return createBlock( 'core/quote', {
						value: content,
					} );
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/text' ],
				transform: ( { value, citation } ) => {
					return createBlock( 'core/text', {
						content: wp.element.concatChildren( value, citation ),
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/list' ],
				transform: ( { value, citation } ) => {
					const valueElements = switchChildrenNodeName( value, 'li' );
					const values = citation
						? wp.element.concatChildren( valueElements, <li>{ citation }</li> )
						: valueElements;
					return createBlock( 'core/list', {
						nodeName: 'ul',
						values,
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/heading' ],
				transform: ( { value, citation, ...attrs } ) => {
					if ( Array.isArray( value ) || citation ) {
						const heading = createBlock( 'core/heading', {
							content: Array.isArray( value ) ? value[ 0 ] : value,
						} );
						const quote = createBlock( 'core/quote', {
							...attrs,
							citation,
							value: Array.isArray( value ) ? value.slice( 1 ) : '',
						} );

						return [ heading, quote ];
					}
					return createBlock( 'core/heading', {
						content: value,
					} );
				},
			},
		],
	},

	edit( { attributes, setAttributes, focus, setFocus, mergeBlocks } ) {
		const { align, value, citation, style = 1 } = attributes;
		const focusedEditable = focus ? focus.editable || 'value' : null;

		return [
			focus && (
				<BlockControls key="controls">
					<AlignmentToolbar
						value={ align }
						onChange={ ( nextAlign ) => {
							setAttributes( { align: nextAlign } );
						} }
					/>
				</BlockControls>
			),
			<blockquote
				key="quote"
				className={ `blocks-quote blocks-quote-style-${ style }` }
			>
				<Editable
					value={ value }
					onChange={
						( nextValue ) => setAttributes( {
							value: nextValue,
						} )
					}
					focus={ focusedEditable === 'value' ? focus : null }
					onFocus={ ( props ) => setFocus( { ...props, editable: 'value' } ) }
					onMerge={ mergeBlocks }
					style={ { textAlign: align } }
				/>
				{ ( ( citation && citation.length > 0 ) || !! focus ) && (
					<Editable
						tagName="footer"
						value={ citation }
						placeholder={ wp.i18n.__( '— Add citation…' ) }
						onChange={
							( nextCitation ) => setAttributes( {
								citation: nextCitation,
							} )
						}
						focus={ focusedEditable === 'citation' ? focus : null }
						onFocus={ ( props ) => setFocus( { ...props, editable: 'citation' } ) }
						inline
					/>
				) }
			</blockquote>,
		];
	},

	save( { attributes } ) {
		const { align, value, citation, style = 1 } = attributes;

		return (
			<blockquote className={ `blocks-quote-style-${ style }` }>
				{ value && value.map( ( paragraph, i ) => (
					<p
						key={ i }
						style={ { textAlign: align ? align : null } }
					>
						{ paragraph }
					</p>
				) ) }
				{ citation && citation.length > 0 && (
					<footer>{ citation }</footer>
				) }
			</blockquote>
		);
	},
} );
