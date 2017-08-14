/**
 * External dependencies
 */
import { times } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';
import { registerBlockType, source } from '../../api';
import BlockControls from '../../block-controls';
import BlockAlignmentToolbar from '../../block-alignment-toolbar';
import RangeControl from '../../inspector-controls/range-control';
import Editable from '../../editable';
import InspectorControls from '../../inspector-controls';
import BlockDescription from '../../block-description';

const { children, query } = source;

registerBlockType( 'core/text-columns', {
	title: __( 'Text Columns' ),

	icon: 'columns',

	category: 'layout',

	attributes: {
		content: {
			type: 'array',
			source: query( 'p', children() ),
			default: [ [], [] ],
		},
		columns: {
			type: 'number',
			default: 2,
		},
		width: {
			type: 'string',
		},
	},

	getEditWrapperProps( attributes ) {
		const { width } = attributes;
		if ( 'wide' === width || 'full' === width ) {
			return { 'data-align': width };
		}
	},

	edit( { attributes, setAttributes, className, focus, setFocus } ) {
		const { width, content, columns } = attributes;

		return [
			focus && (
				<BlockControls key="controls">
					<BlockAlignmentToolbar
						value={ width }
						onChange={ ( nextWidth ) => setAttributes( { width: nextWidth } ) }
						controls={ [ 'center', 'wide', 'full' ] }
					/>
				</BlockControls>
			),
			focus && (
				<InspectorControls key="inspector">
					<BlockDescription>
						<p>{ __( 'Text. Great things start here.' ) }</p>
					</BlockDescription>
					<RangeControl
						label={ __( 'Columns' ) }
						value={ columns }
						onChange={ ( value ) => setAttributes( { columns: value } ) }
						min={ 2 }
						max={ 4 }
					/>
				</InspectorControls>
			),
			<section className={ `${ className } align${ width } columns-${ columns }` } key="block">
				{ times( columns, ( index ) =>
					<div className="wp-block-column" key={ `column-${ index }` }>
						<Editable
							tagName="p"
							value={ content && content[ index ] }
							onChange={ ( nextContent ) => {
								setAttributes( {
									content: [
										...content.slice( 0, index ),
										nextContent,
										...content.slice( index + 1 ),
									],
								} );
							} }
							focus={ focus && focus.column === index }
							onFocus={ () => setFocus( { column: index } ) }
							placeholder={ __( 'New Column' ) }
						/>
					</div>
				) }
			</section>,
		];
	},

	save( { attributes } ) {
		const { width, content, columns } = attributes;
		return (
			<section className={ `align${ width } columns-${ columns }` }>
				{ times( columns, ( index ) =>
					<div className="wp-block-column" key={ `column-${ index }` }>
						<p>{ content && content[ index ] }</p>
					</div>
				) }
			</section>
		);
	},
} );
