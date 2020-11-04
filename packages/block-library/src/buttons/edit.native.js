/**
 * External dependencies
 */
import { debounce } from 'lodash';
import { View } from 'react-native';

/**
 * WordPress dependencies
 */
import { BlockControls, InnerBlocks } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { useResizeObserver } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useEffect, useRef } from '@wordpress/element';
import { ToolbarGroup, ToolbarItem } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { name as buttonBlockName } from '../button/';
import styles from './editor.scss';
import ContentJustificationDropdown from './content-justification-dropdown';

const ALLOWED_BLOCKS = [ buttonBlockName ];
const BUTTONS_TEMPLATE = [ [ 'core/button' ] ];

export default function ButtonsEdit( {
	attributes: { contentJustification },
	clientId,
	isSelected,
	setAttributes,
} ) {
	const [ resizeObserver, sizes ] = useResizeObserver();
	const [ maxWidth, setMaxWidth ] = useState( 0 );
	const { marginLeft: spacing } = styles.spacing;

	const { getBlockOrder, isInnerButtonSelected, shouldDelete } = useSelect(
		( select ) => {
			const {
				getBlockCount,
				getBlockOrder: _getBlockOrder,
				getBlockParents,
				getSelectedBlockClientId,
			} = select( 'core/block-editor' );
			const selectedBlockClientId = getSelectedBlockClientId();
			const selectedBlockParents = getBlockParents(
				selectedBlockClientId,
				true
			);

			return {
				getBlockOrder: _getBlockOrder,
				isInnerButtonSelected: selectedBlockParents[ 0 ] === clientId,
				// The purpose of `shouldDelete` check is giving the ability to
				// pass to mobile toolbar function called `onDelete` which removes
				// the whole `Buttons` container along with the last inner button
				// when there is exactly one button.
				shouldDelete: getBlockCount( clientId ) === 1,
			};
		},
		[ clientId ]
	);

	const { insertBlock, removeBlock, selectBlock } = useDispatch(
		'core/block-editor'
	);

	useEffect( () => {
		const margins = 2 * styles.parent.marginRight;
		const { width } = sizes || {};
		if ( width ) {
			setMaxWidth( width - margins );
		}
	}, [ sizes ] );

	const onAddNextButton = debounce( ( selectedId ) => {
		const order = getBlockOrder( clientId );
		const selectedButtonIndex = order.findIndex(
			( i ) => i === selectedId
		);

		const index =
			selectedButtonIndex === -1 ? order.length + 1 : selectedButtonIndex;

		const insertedBlock = createBlock( 'core/button' );

		insertBlock( insertedBlock, index, clientId );
		selectBlock( insertedBlock.clientId );
	}, 200 );

	function onChangeContentJustification( updatedValue ) {
		setAttributes( {
			contentJustification: updatedValue,
		} );
	}

	const renderFooterAppender = useRef( () => (
		<View style={ styles.appenderContainer }>
			<InnerBlocks.ButtonBlockAppender
				isFloating={ true }
				onAddBlock={ onAddNextButton }
			/>
		</View>
	) );

	const shouldRenderFooterAppender = isSelected || isInnerButtonSelected;

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarItem>
						{ ( toggleProps ) => (
							<ContentJustificationDropdown
								toggleProps={ toggleProps }
								value={ contentJustification }
								onChange={ onChangeContentJustification }
							/>
						) }
					</ToolbarItem>
				</ToolbarGroup>
			</BlockControls>
			{ resizeObserver }
			<InnerBlocks
				allowedBlocks={ ALLOWED_BLOCKS }
				template={ BUTTONS_TEMPLATE }
				renderFooterAppender={
					shouldRenderFooterAppender && renderFooterAppender.current
				}
				orientation="horizontal"
				horizontalAlignment={ contentJustification }
				onDeleteBlock={
					shouldDelete ? () => removeBlock( clientId ) : undefined
				}
				onAddBlock={ onAddNextButton }
				parentWidth={ maxWidth }
				marginHorizontal={ spacing }
				marginVertical={ spacing }
				__experimentalLayout={ { type: 'default', alignments: [] } }
				templateInsertUpdatesSelection
			/>
		</>
	);
}
