/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useState, createContext, useMemo } from '@wordpress/element';
import {
	getBlockType,
	getSaveElement,
	isReusableBlock,
	isUnmodifiedDefaultBlock,
	getUnregisteredTypeHandlerName,
	hasBlockSupport,
	getBlockDefaultClassName,
} from '@wordpress/blocks';
import { withFilters } from '@wordpress/components';
import { withDispatch, withSelect, useSelect } from '@wordpress/data';
import { withViewportMatch } from '@wordpress/viewport';
import { compose, pure, ifCondition } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import BlockEdit from '../block-edit';
import BlockInvalidWarning from './block-invalid-warning';
import BlockCrashWarning from './block-crash-warning';
import BlockCrashBoundary from './block-crash-boundary';
import BlockHtml from './block-html';
import { Block } from './block-wrapper';

export const BlockContext = createContext();

function BlockListBlock( {
	mode,
	isFocusMode,
	isLocked,
	clientId,
	rootClientId,
	isSelected,
	isMultiSelected,
	isPartOfMultiSelection,
	isFirstMultiSelected,
	isLastMultiSelected,
	isTypingWithinBlock,
	isAncestorOfSelectedBlock,
	isSelectionEnabled,
	className,
	name,
	isValid,
	attributes,
	wrapperProps,
	setAttributes,
	onReplace,
	onInsertBlocksAfter,
	onMerge,
	toggleSelection,
	index,
	enableAnimation,
	isNavigationMode,
	isMultiSelecting,
	hasSelectedUI = true,
} ) {
	// In addition to withSelect, we should favor using useSelect in this
	// component going forward to avoid leaking new props to the public API
	// (editor.BlockListBlock filter)
	const { isDraggingBlocks } = useSelect( ( select ) => {
		return {
			isDraggingBlocks: select( 'core/block-editor' ).isDraggingBlocks(),
		};
	}, [] );

	// Handling the error state
	const [ hasError, setErrorState ] = useState( false );
	const onBlockError = () => setErrorState( true );

	const blockType = getBlockType( name );
	const lightBlockWrapper = hasBlockSupport(
		blockType,
		'lightBlockWrapper',
		false
	);
	const isUnregisteredBlock = name === getUnregisteredTypeHandlerName();
	const isDragging =
		isDraggingBlocks && ( isSelected || isPartOfMultiSelection );

	// Determine whether the block has props to apply to the wrapper.
	if ( ! lightBlockWrapper && blockType.getEditWrapperProps ) {
		wrapperProps = {
			...wrapperProps,
			...blockType.getEditWrapperProps( attributes ),
		};
	}

	const isAligned = wrapperProps && wrapperProps[ 'data-align' ];
	const generatedClassName =
		lightBlockWrapper && hasBlockSupport( blockType, 'className', true )
			? getBlockDefaultClassName( name )
			: null;
	const customClassName = lightBlockWrapper ? attributes.className : null;

	// The wp-block className is important for editor styles.
	// Generate the wrapper class names handling the different states of the
	// block.
	const wrapperClassName = classnames(
		generatedClassName,
		customClassName,
		'wp-block block-editor-block-list__block',
		{
			'has-selected-ui': hasSelectedUI,
			'has-warning': ! isValid || !! hasError || isUnregisteredBlock,
			'is-selected': isSelected,
			'is-multi-selected': isMultiSelected,
			'is-reusable': isReusableBlock( blockType ),
			'is-dragging': isDragging,
			'is-typing': isTypingWithinBlock,
			'is-focused':
				isFocusMode && ( isSelected || isAncestorOfSelectedBlock ),
			'is-focus-mode': isFocusMode,
			'has-child-selected': isAncestorOfSelectedBlock,
			'is-block-collapsed': isAligned,
		},
		className
	);

	// We wrap the BlockEdit component in a div that hides it when editing in
	// HTML mode. This allows us to render all of the ancillary pieces
	// (InspectorControls, etc.) which are inside `BlockEdit` but not
	// `BlockHTML`, even in HTML mode.
	let blockEdit = (
		<BlockEdit
			name={ name }
			isSelected={ isSelected }
			attributes={ attributes }
			setAttributes={ setAttributes }
			insertBlocksAfter={ isLocked ? undefined : onInsertBlocksAfter }
			onReplace={ isLocked ? undefined : onReplace }
			mergeBlocks={ isLocked ? undefined : onMerge }
			clientId={ clientId }
			isSelectionEnabled={ isSelectionEnabled }
			toggleSelection={ toggleSelection }
		/>
	);

	// For aligned blocks, provide a wrapper element so the block can be
	// positioned relative to the block column. This is enabled with the
	// .is-block-content className.
	if ( ! lightBlockWrapper && isAligned ) {
		blockEdit = <div className="is-block-content">{ blockEdit }</div>;
	}

	if ( mode !== 'visual' ) {
		blockEdit = <div style={ { display: 'none' } }>{ blockEdit }</div>;
	}

	const value = {
		clientId,
		rootClientId,
		isSelected,
		isFirstMultiSelected,
		isLastMultiSelected,
		isMultiSelecting,
		isNavigationMode,
		isPartOfMultiSelection,
		enableAnimation,
		index,
		className: wrapperClassName,
		isLocked,
		name,
		mode,
		blockTitle: blockType.title,
		wrapperProps,
	};
	const memoizedValue = useMemo( () => value, Object.values( value ) );

	return (
		<BlockContext.Provider value={ memoizedValue }>
			<BlockCrashBoundary onError={ onBlockError }>
				{ isValid && lightBlockWrapper && (
					<>
						{ blockEdit }
						{ mode === 'html' && (
							<Block.div __unstableIsHtml>
								<BlockHtml clientId={ clientId } />
							</Block.div>
						) }
					</>
				) }
				{ isValid && ! lightBlockWrapper && (
					<Block.div { ...wrapperProps }>
						{ blockEdit }
						{ mode === 'html' && (
							<BlockHtml clientId={ clientId } />
						) }
					</Block.div>
				) }
				{ ! isValid && (
					<Block.div>
						<BlockInvalidWarning clientId={ clientId } />
						<div>{ getSaveElement( blockType, attributes ) }</div>
					</Block.div>
				) }
			</BlockCrashBoundary>
			{ !! hasError && (
				<Block.div>
					<BlockCrashWarning />
				</Block.div>
			) }
		</BlockContext.Provider>
	);
}

const applyWithSelect = withSelect(
	( select, { clientId, rootClientId, isLargeViewport } ) => {
		const {
			isBlockSelected,
			isAncestorMultiSelected,
			isBlockMultiSelected,
			isFirstMultiSelectedBlock,
			getLastMultiSelectedBlockClientId,
			isTyping,
			getBlockMode,
			isSelectionEnabled,
			getSettings,
			hasSelectedInnerBlock,
			getTemplateLock,
			__unstableGetBlockWithoutInnerBlocks,
			isNavigationMode,
		} = select( 'core/block-editor' );
		const block = __unstableGetBlockWithoutInnerBlocks( clientId );
		const isSelected = isBlockSelected( clientId );
		const { focusMode, isRTL } = getSettings();
		const templateLock = getTemplateLock( rootClientId );
		const checkDeep = true;

		// "ancestor" is the more appropriate label due to "deep" check
		const isAncestorOfSelectedBlock = hasSelectedInnerBlock(
			clientId,
			checkDeep
		);

		// The fallback to `{}` is a temporary fix.
		// This function should never be called when a block is not present in
		// the state. It happens now because the order in withSelect rendering
		// is not correct.
		const { name, attributes, isValid } = block || {};

		return {
			isMultiSelected: isBlockMultiSelected( clientId ),
			isPartOfMultiSelection:
				isBlockMultiSelected( clientId ) ||
				isAncestorMultiSelected( clientId ),
			isFirstMultiSelected: isFirstMultiSelectedBlock( clientId ),
			isLastMultiSelected:
				getLastMultiSelectedBlockClientId() === clientId,

			// We only care about this prop when the block is selected
			// Thus to avoid unnecessary rerenders we avoid updating the prop if
			// the block is not selected.
			isTypingWithinBlock:
				( isSelected || isAncestorOfSelectedBlock ) && isTyping(),

			mode: getBlockMode( clientId ),
			isSelectionEnabled: isSelectionEnabled(),
			isLocked: !! templateLock,
			isFocusMode: focusMode && isLargeViewport,
			isNavigationMode: isNavigationMode(),
			isRTL,

			// Users of the editor.BlockListBlock filter used to be able to
			// access the block prop.
			// Ideally these blocks would rely on the clientId prop only.
			// This is kept for backward compatibility reasons.
			block,

			name,
			attributes,
			isValid,
			isSelected,
			isAncestorOfSelectedBlock,
		};
	}
);

const applyWithDispatch = withDispatch( ( dispatch, ownProps, { select } ) => {
	const {
		updateBlockAttributes,
		insertBlocks,
		mergeBlocks,
		replaceBlocks,
		toggleSelection,
		__unstableMarkLastChangeAsPersistent,
	} = dispatch( 'core/block-editor' );

	return {
		setAttributes( newAttributes ) {
			const { clientId } = ownProps;
			updateBlockAttributes( clientId, newAttributes );
		},
		onInsertBlocks( blocks, index ) {
			const { rootClientId } = ownProps;
			insertBlocks( blocks, index, rootClientId );
		},
		onInsertBlocksAfter( blocks ) {
			const { clientId, rootClientId } = ownProps;
			const { getBlockIndex } = select( 'core/block-editor' );
			const index = getBlockIndex( clientId, rootClientId );
			insertBlocks( blocks, index + 1, rootClientId );
		},
		onMerge( forward ) {
			const { clientId } = ownProps;
			const { getPreviousBlockClientId, getNextBlockClientId } = select(
				'core/block-editor'
			);

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
		onReplace( blocks, indexToSelect ) {
			if (
				blocks.length &&
				! isUnmodifiedDefaultBlock( blocks[ blocks.length - 1 ] )
			) {
				__unstableMarkLastChangeAsPersistent();
			}
			replaceBlocks( [ ownProps.clientId ], blocks, indexToSelect );
		},
		toggleSelection( selectionEnabled ) {
			toggleSelection( selectionEnabled );
		},
	};
} );

export default compose(
	pure,
	withViewportMatch( { isLargeViewport: 'medium' } ),
	applyWithSelect,
	applyWithDispatch,
	// block is sometimes not mounted at the right time, causing it be undefined
	// see issue for more info
	// https://github.com/WordPress/gutenberg/issues/17013
	ifCondition( ( { block } ) => !! block ),
	withFilters( 'editor.BlockListBlock' )
)( BlockListBlock );
