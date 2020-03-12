/**
 * External dependencies
 */
import classnames from 'classnames';
import { dropRight, get, map, times } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, RangeControl } from '@wordpress/components';
import { useRef } from '@wordpress/element';

import {
	InspectorControls,
	InnerBlocks,
	BlockControls,
	BlockVerticalAlignmentToolbar,
	__experimentalBlockVariationPicker,
	__experimentalUseColors,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';
import { withDispatch, useDispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import {
	hasExplicitColumnWidths,
	getMappedColumnWidths,
	getRedistributedColumnWidths,
	toWidthPrecision,
} from './utils';

/**
 * Allowed blocks constant is passed to InnerBlocks precisely as specified here.
 * The contents of the array should never change.
 * The array should contain the name of each block that is allowed.
 * In columns block, the only block we allow is 'core/column'.
 *
 * @constant
 * @type {string[]}
 */
const ALLOWED_BLOCKS = [ 'core/column' ];

function ColumnsEditContainer( {
	attributes,
	updateAlignment,
	updateColumns,
	clientId,
} ) {
	const { verticalAlignment } = attributes;

	const { count } = useSelect(
		( select ) => {
			return {
				count: select( 'core/block-editor' ).getBlockCount( clientId ),
			};
		},
		[ clientId ]
	);

	const ref = useRef();
	const {
		BackgroundColor,
		InspectorControlsColorPanel,
		TextColor,
	} = __experimentalUseColors(
		[
			{ name: 'textColor', property: 'color' },
			{ name: 'backgroundColor', className: 'has-background' },
		],
		{
			contrastCheckers: [ { backgroundColor: true, textColor: true } ],
			colorDetector: { targetRef: ref },
		}
	);

	const classes = classnames( {
		[ `are-vertically-aligned-${ verticalAlignment }` ]: verticalAlignment,
	} );

	return (
		<>
			<BlockControls>
				<BlockVerticalAlignmentToolbar
					onChange={ updateAlignment }
					value={ verticalAlignment }
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody>
					<RangeControl
						label={ __( 'Columns' ) }
						value={ count }
						onChange={ ( value ) => updateColumns( count, value ) }
						min={ 2 }
						max={ 6 }
					/>
				</PanelBody>
			</InspectorControls>
			{ InspectorControlsColorPanel }
			<BackgroundColor>
				{ ( backgroundProps ) => (
					<TextColor>
						{ ( textColorProps ) => (
							<InnerBlocks
								allowedBlocks={ ALLOWED_BLOCKS }
								__experimentalMoverDirection="horizontal"
								ref={ ref }
								__experimentalTagName={ Block.div }
								__experimentalPassedProps={ {
									className: classnames(
										classes,
										backgroundProps.className,
										textColorProps.className
									),
									style: {
										...backgroundProps.style,
										...textColorProps.style,
									},
								} }
							/>
						) }
					</TextColor>
				) }
			</BackgroundColor>
		</>
	);
}

const ColumnsEditContainerWrapper = withDispatch(
	( dispatch, ownProps, registry ) => ( {
		/**
		 * Update all child Column blocks with a new vertical alignment setting
		 * based on whatever alignment is passed in. This allows change to parent
		 * to overide anything set on a individual column basis.
		 *
		 * @param {string} verticalAlignment the vertical alignment setting
		 */
		updateAlignment( verticalAlignment ) {
			const { clientId, setAttributes } = ownProps;
			const { updateBlockAttributes } = dispatch( 'core/block-editor' );
			const { getBlockOrder } = registry.select( 'core/block-editor' );

			// Update own alignment.
			setAttributes( { verticalAlignment } );

			// Update all child Column Blocks to match
			const innerBlockClientIds = getBlockOrder( clientId );
			innerBlockClientIds.forEach( ( innerBlockClientId ) => {
				updateBlockAttributes( innerBlockClientId, {
					verticalAlignment,
				} );
			} );
		},

		/**
		 * Updates the column count, including necessary revisions to child Column
		 * blocks to grant required or redistribute available space.
		 *
		 * @param {number} previousColumns Previous column count.
		 * @param {number} newColumns      New column count.
		 */
		updateColumns( previousColumns, newColumns ) {
			const { clientId } = ownProps;
			const { replaceInnerBlocks } = dispatch( 'core/block-editor' );
			const { getBlocks } = registry.select( 'core/block-editor' );

			let innerBlocks = getBlocks( clientId );
			const hasExplicitWidths = hasExplicitColumnWidths( innerBlocks );

			// Redistribute available width for existing inner blocks.
			const isAddingColumn = newColumns > previousColumns;

			if ( isAddingColumn && hasExplicitWidths ) {
				// If adding a new column, assign width to the new column equal to
				// as if it were `1 / columns` of the total available space.
				const newColumnWidth = toWidthPrecision( 100 / newColumns );

				// Redistribute in consideration of pending block insertion as
				// constraining the available working width.
				const widths = getRedistributedColumnWidths(
					innerBlocks,
					100 - newColumnWidth
				);

				innerBlocks = [
					...getMappedColumnWidths( innerBlocks, widths ),
					...times( newColumns - previousColumns, () => {
						return createBlock( 'core/column', {
							width: newColumnWidth,
						} );
					} ),
				];
			} else if ( isAddingColumn ) {
				innerBlocks = [
					...innerBlocks,
					...times( newColumns - previousColumns, () => {
						return createBlock( 'core/column' );
					} ),
				];
			} else {
				// The removed column will be the last of the inner blocks.
				innerBlocks = dropRight(
					innerBlocks,
					previousColumns - newColumns
				);

				if ( hasExplicitWidths ) {
					// Redistribute as if block is already removed.
					const widths = getRedistributedColumnWidths(
						innerBlocks,
						100
					);

					innerBlocks = getMappedColumnWidths( innerBlocks, widths );
				}
			}

			replaceInnerBlocks( clientId, innerBlocks, false );
		},
	} )
)( ColumnsEditContainer );

const createBlocksFromInnerBlocksTemplate = ( innerBlocksTemplate ) => {
	return map(
		innerBlocksTemplate,
		( [ name, attributes, innerBlocks = [] ] ) =>
			createBlock(
				name,
				attributes,
				createBlocksFromInnerBlocksTemplate( innerBlocks )
			)
	);
};

const ColumnsEdit = ( props ) => {
	const { clientId, name } = props;
	const {
		blockType,
		defaultVariation,
		hasInnerBlocks,
		variations,
	} = useSelect(
		( select ) => {
			const {
				getBlockVariations,
				getBlockType,
				getDefaultBlockVariation,
			} = select( 'core/blocks' );

			return {
				blockType: getBlockType( name ),
				defaultVariation: getDefaultBlockVariation( name, 'block' ),
				hasInnerBlocks:
					select( 'core/block-editor' ).getBlocks( clientId ).length >
					0,
				variations: getBlockVariations( name, 'block' ),
			};
		},
		[ clientId, name ]
	);

	const { replaceInnerBlocks } = useDispatch( 'core/block-editor' );

	if ( hasInnerBlocks ) {
		return <ColumnsEditContainerWrapper { ...props } />;
	}

	return (
		<Block.div>
			<__experimentalBlockVariationPicker
				icon={ get( blockType, [ 'icon', 'src' ] ) }
				label={ get( blockType, [ 'title' ] ) }
				variations={ variations }
				onSelect={ ( nextVariation = defaultVariation ) => {
					if ( nextVariation.attributes ) {
						props.setAttributes( nextVariation.attributes );
					}
					if ( nextVariation.innerBlocks ) {
						replaceInnerBlocks(
							props.clientId,
							createBlocksFromInnerBlocksTemplate(
								nextVariation.innerBlocks
							)
						);
					}
				} }
				allowSkip
			/>
		</Block.div>
	);
};

export default ColumnsEdit;
