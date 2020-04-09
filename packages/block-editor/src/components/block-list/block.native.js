/**
 * External dependencies
 */
import { View, Text, TouchableWithoutFeedback } from 'react-native';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { ToolbarButton, Toolbar } from '@wordpress/components';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose, withPreferredColorScheme } from '@wordpress/compose';
import {
	getBlockType,
	__experimentalGetAccessibleBlockLabel as getAccessibleBlockLabel,
} from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import styles from './block.scss';
import BlockEdit from '../block-edit';
import BlockInvalidWarning from './block-invalid-warning';
import BlockMobileToolbar from '../block-mobile-toolbar';
import FloatingToolbar from './block-mobile-floating-toolbar';
import Breadcrumbs from './breadcrumb';
import NavigateUpSVG from './nav-up-icon';

class BlockListBlock extends Component {
	constructor() {
		super( ...arguments );

		this.insertBlocksAfter = this.insertBlocksAfter.bind( this );
		this.onFocus = this.onFocus.bind( this );
	}

	onFocus() {
		const { firstToSelectId, isSelected, onSelect } = this.props;
		if ( ! isSelected ) {
			onSelect( firstToSelectId );
		}
	}

	insertBlocksAfter( blocks ) {
		this.props.onInsertBlocks( blocks, this.props.order + 1 );

		if ( blocks[ 0 ] ) {
			// focus on the first block inserted
			this.props.onSelect( blocks[ 0 ].clientId );
		}
	}

	getBlockForType() {
		return (
			<BlockEdit
				name={ this.props.name }
				isSelected={ this.props.isSelected }
				attributes={ this.props.attributes }
				setAttributes={ this.props.onChange }
				onFocus={ this.onFocus }
				onReplace={ this.props.onReplace }
				insertBlocksAfter={ this.insertBlocksAfter }
				mergeBlocks={ this.props.mergeBlocks }
				onCaretVerticalPositionChange={
					this.props.onCaretVerticalPositionChange
				}
				clientId={ this.props.clientId }
				contentStyle={ this.props.contentStyle }
			/>
		);
	}

	renderBlockTitle() {
		return (
			<View style={ styles.blockTitle }>
				<Text>BlockType: { this.props.name }</Text>
			</View>
		);
	}

	render() {
		const {
			attributes,
			blockType,
			clientId,
			icon,
			isSelected,
			isValid,
			order,
			title,
			parentId,
			isDimmed,
			isTouchable,
			onDeleteBlock,
			horizontalDirection,
			hasParent,
			isParentSelected,
			onSelect,
			showFloatingToolbar,
			getStylesFromColorScheme,
			marginVertical,
			marginHorizontal,
			isInnerBlockSelected,
		} = this.props;

		const accessibilityLabel = getAccessibleBlockLabel(
			blockType,
			attributes,
			order + 1
		);

		const accessible = ! ( isSelected || isInnerBlockSelected );

		return (
			<TouchableWithoutFeedback
				onPress={ this.onFocus }
				accessible={ accessible }
				accessibilityRole={ 'button' }
			>
				<View
					style={ { flex: 1 } }
					accessibilityLabel={ accessibilityLabel }
				>
					{ showFloatingToolbar && (
						<FloatingToolbar>
							{ hasParent && (
								<Toolbar passedStyle={ styles.toolbar }>
									<ToolbarButton
										title={ __( 'Navigate Up' ) }
										onClick={ () => onSelect( parentId ) }
										icon={ NavigateUpSVG }
									/>
									<View style={ styles.pipe } />
								</Toolbar>
							) }
							<Breadcrumbs clientId={ clientId } />
						</FloatingToolbar>
					) }
					<View
						pointerEvents={ isTouchable ? 'auto' : 'box-only' }
						accessibilityLabel={ accessibilityLabel }
						style={ [
							{ marginVertical, marginHorizontal, flex: 1 },
							isDimmed && styles.dimmed,
						] }
					>
						{ isSelected && (
							<View
								style={ [
									styles.solidBorder,
									getStylesFromColorScheme(
										styles.solidBorderColor,
										styles.solidBorderColorDark
									),
								] }
							/>
						) }
						{ isParentSelected && (
							<View
								style={ [
									styles.dashedBorder,
									getStylesFromColorScheme(
										styles.dashedBorderColor,
										styles.dashedBorderColorDark
									),
								] }
							/>
						) }
						{ isValid ? (
							this.getBlockForType()
						) : (
							<BlockInvalidWarning
								blockTitle={ title }
								icon={ icon }
							/>
						) }
						<View style={ styles.neutralToolbar }>
							{ isSelected && (
								<BlockMobileToolbar
									clientId={ clientId }
									onDelete={ onDeleteBlock }
									horizontalDirection={ horizontalDirection }
								/>
							) }
						</View>
					</View>
				</View>
			</TouchableWithoutFeedback>
		);
	}
}

export default compose( [
	withSelect( ( select, { clientId, rootClientId } ) => {
		const {
			getBlockIndex,
			isBlockSelected,
			__unstableGetBlockWithoutInnerBlocks,
			getBlockHierarchyRootClientId,
			getSelectedBlockClientId,
			getBlock,
			getBlockRootClientId,
			getLowestCommonAncestorWithSelectedBlock,
			getBlockParents,
			hasSelectedInnerBlock,
		} = select( 'core/block-editor' );

		const order = getBlockIndex( clientId, rootClientId );
		const isSelected = isBlockSelected( clientId );
		const isInnerBlockSelected = hasSelectedInnerBlock( clientId );
		const block = __unstableGetBlockWithoutInnerBlocks( clientId );
		const { name, attributes, isValid } = block || {};

		const blockType = getBlockType( name || 'core/missing' );
		const title = blockType.title;
		const icon = blockType.icon;

		const parents = getBlockParents( clientId, true );
		const parentId = parents[ 0 ] || '';

		const rootBlockId = getBlockHierarchyRootClientId( clientId );
		const rootBlock = getBlock( rootBlockId );
		const hasRootInnerBlocks = rootBlock.innerBlocks.length !== 0;

		const showFloatingToolbar = isSelected && hasRootInnerBlocks;

		const selectedBlockClientId = getSelectedBlockClientId();

		const commonAncestor = getLowestCommonAncestorWithSelectedBlock(
			clientId
		);
		const commonAncestorIndex = parents.indexOf( commonAncestor ) - 1;
		const firstToSelectId = commonAncestor
			? parents[ commonAncestorIndex ]
			: parents[ parents.length - 1 ];

		const hasParent = !! parentId;
		const isParentSelected =
			selectedBlockClientId && selectedBlockClientId === parentId;
		const isAncestorSelected =
			selectedBlockClientId && parents.includes( selectedBlockClientId );
		const isSelectedBlockNested = !! getBlockRootClientId(
			selectedBlockClientId
		);

		const selectedParents = selectedBlockClientId
			? getBlockParents( selectedBlockClientId )
			: [];
		const isDescendantSelected = selectedParents.includes( clientId );
		const isDescendantOfParentSelected = selectedParents.includes(
			parentId
		);
		const isTouchable =
			isSelected ||
			isDescendantOfParentSelected ||
			isParentSelected ||
			parentId === '';
		const isDimmed =
			! isSelected &&
			isSelectedBlockNested &&
			! isAncestorSelected &&
			! isDescendantSelected &&
			( isDescendantOfParentSelected || rootBlockId === clientId );

		return {
			icon,
			name: name || 'core/missing',
			order,
			title,
			attributes,
			blockType,
			isSelected,
			isInnerBlockSelected,
			isValid,
			parentId,
			isParentSelected,
			firstToSelectId,
			hasParent,
			isAncestorSelected,
			isTouchable,
			isDimmed,
			showFloatingToolbar,
		};
	} ),
	withDispatch( ( dispatch, ownProps, { select } ) => {
		const {
			insertBlocks,
			mergeBlocks,
			replaceBlocks,
			selectBlock,
			updateBlockAttributes,
		} = dispatch( 'core/block-editor' );

		return {
			mergeBlocks( forward ) {
				const { clientId } = ownProps;
				const {
					getPreviousBlockClientId,
					getNextBlockClientId,
				} = select( 'core/block-editor' );

				if ( forward ) {
					const nextBlockClientId = getNextBlockClientId( clientId );
					if ( nextBlockClientId ) {
						mergeBlocks( clientId, nextBlockClientId );
					}
				} else {
					const previousBlockClientId = getPreviousBlockClientId(
						clientId
					);
					if ( previousBlockClientId ) {
						mergeBlocks( previousBlockClientId, clientId );
					}
				}
			},
			onInsertBlocks( blocks, index ) {
				insertBlocks( blocks, index, ownProps.rootClientId );
			},
			onSelect( clientId = ownProps.clientId, initialPosition ) {
				selectBlock( clientId, initialPosition );
			},
			onChange: ( attributes ) => {
				updateBlockAttributes( ownProps.clientId, attributes );
			},
			onReplace( blocks, indexToSelect ) {
				replaceBlocks( [ ownProps.clientId ], blocks, indexToSelect );
			},
		};
	} ),
	withPreferredColorScheme,
] )( BlockListBlock );
