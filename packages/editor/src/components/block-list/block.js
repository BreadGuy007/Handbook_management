/**
 * External dependencies
 */
import classnames from 'classnames';
import { get, reduce, size, first, last } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import {
	focus,
	isTextField,
	placeCaretAtHorizontalEdge,
	placeCaretAtVerticalEdge,
} from '@wordpress/dom';
import { BACKSPACE, DELETE, ENTER } from '@wordpress/keycodes';
import {
	getBlockType,
	getSaveElement,
	isReusableBlock,
	isUnmodifiedDefaultBlock,
	getUnregisteredTypeHandlerName,
} from '@wordpress/blocks';
import { KeyboardShortcuts, withFilters } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { withDispatch, withSelect } from '@wordpress/data';
import { withViewportMatch } from '@wordpress/viewport';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import BlockEdit from '../block-edit';
import BlockMover from '../block-mover';
import BlockDropZone from '../block-drop-zone';
import BlockInvalidWarning from './block-invalid-warning';
import BlockCrashWarning from './block-crash-warning';
import BlockCrashBoundary from './block-crash-boundary';
import BlockHtml from './block-html';
import BlockBreadcrumb from './breadcrumb';
import BlockContextualToolbar from './block-contextual-toolbar';
import BlockMultiControls from './multi-controls';
import BlockMobileToolbar from './block-mobile-toolbar';
import BlockInsertionPoint from './insertion-point';
import IgnoreNestedEvents from '../ignore-nested-events';
import InserterWithShortcuts from '../inserter-with-shortcuts';
import Inserter from '../inserter';
import HoverArea from './hover-area';
import { isInsideRootBlock } from '../../utils/dom';

export class BlockListBlock extends Component {
	constructor() {
		super( ...arguments );

		this.setBlockListRef = this.setBlockListRef.bind( this );
		this.bindBlockNode = this.bindBlockNode.bind( this );
		this.setAttributes = this.setAttributes.bind( this );
		this.maybeHover = this.maybeHover.bind( this );
		this.forceFocusedContextualToolbar = this.forceFocusedContextualToolbar.bind( this );
		this.hideHoverEffects = this.hideHoverEffects.bind( this );
		this.mergeBlocks = this.mergeBlocks.bind( this );
		this.insertBlocksAfter = this.insertBlocksAfter.bind( this );
		this.onFocus = this.onFocus.bind( this );
		this.preventDrag = this.preventDrag.bind( this );
		this.onPointerDown = this.onPointerDown.bind( this );
		this.deleteOrInsertAfterWrapper = this.deleteOrInsertAfterWrapper.bind( this );
		this.onBlockError = this.onBlockError.bind( this );
		this.onTouchStart = this.onTouchStart.bind( this );
		this.onClick = this.onClick.bind( this );
		this.onDragStart = this.onDragStart.bind( this );
		this.onDragEnd = this.onDragEnd.bind( this );
		this.selectOnOpen = this.selectOnOpen.bind( this );
		this.onShiftSelection = this.onShiftSelection.bind( this );
		this.hadTouchStart = false;

		this.state = {
			error: null,
			dragging: false,
			isHovered: false,
		};
		this.isForcingContextualToolbar = false;
	}

	componentDidMount() {
		if ( this.props.isSelected ) {
			this.focusTabbable();
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.isForcingContextualToolbar ) {
			// The forcing of contextual toolbar should only be true during one update,
			// after the first update normal conditions should apply.
			this.isForcingContextualToolbar = false;
		}
		if ( this.props.isTypingWithinBlock || this.props.isSelected ) {
			this.hideHoverEffects();
		}

		if ( this.props.isSelected && ! prevProps.isSelected ) {
			this.focusTabbable( true );
		}

		// When triggering a multi-selection,
		// move the focus to the wrapper of the first selected block.
		if ( this.props.isFirstMultiSelected && ! prevProps.isFirstMultiSelected ) {
			this.wrapperNode.focus();
		}
	}

	setBlockListRef( node ) {
		this.wrapperNode = node;
		this.props.blockRef( node, this.props.clientId );

		// We need to rerender to trigger a rerendering of HoverArea
		// it depents on this.wrapperNode but we can't keep this.wrapperNode in state
		// Because we need it to be immediately availeble for `focusableTabbable` to work.
		this.forceUpdate();
	}

	bindBlockNode( node ) {
		this.node = node;
	}

	/**
	 * When a block becomes selected, transition focus to an inner tabbable.
	 *
	 * @param {boolean} ignoreInnerBlocks Should not focus inner blocks.
	 */
	focusTabbable( ignoreInnerBlocks ) {
		const { initialPosition } = this.props;

		// Focus is captured by the wrapper node, so while focus transition
		// should only consider tabbables within editable display, since it
		// may be the wrapper itself or a side control which triggered the
		// focus event, don't unnecessary transition to an inner tabbable.
		if ( this.wrapperNode.contains( document.activeElement ) ) {
			return;
		}

		// Find all tabbables within node.
		const textInputs = focus.tabbable
			.find( this.node )
			.filter( isTextField )
			// Exclude inner blocks
			.filter( ( node ) => ! ignoreInnerBlocks || isInsideRootBlock( this.node, node ) );

		// If reversed (e.g. merge via backspace), use the last in the set of
		// tabbables.
		const isReverse = -1 === initialPosition;
		const target = ( isReverse ? last : first )( textInputs );

		if ( ! target ) {
			this.wrapperNode.focus();
			return;
		}

		target.focus();

		// In reverse case, need to explicitly place caret position.
		if ( isReverse ) {
			placeCaretAtHorizontalEdge( target, true );
			placeCaretAtVerticalEdge( target, true );
		}
	}

	setAttributes( attributes ) {
		const { block, onChange } = this.props;
		const type = getBlockType( block.name );
		onChange( block.clientId, attributes );

		const metaAttributes = reduce( attributes, ( result, value, key ) => {
			if ( get( type, [ 'attributes', key, 'source' ] ) === 'meta' ) {
				result[ type.attributes[ key ].meta ] = value;
			}

			return result;
		}, {} );

		if ( size( metaAttributes ) ) {
			this.props.onMetaChange( metaAttributes );
		}
	}

	onTouchStart() {
		// Detect touchstart to disable hover on iOS
		this.hadTouchStart = true;
	}

	onClick() {
		// Clear touchstart detection
		// Browser will try to emulate mouse events also see https://www.html5rocks.com/en/mobile/touchandmouse/
		this.hadTouchStart = false;
	}

	/**
	 * A mouseover event handler to apply hover effect when a pointer device is
	 * placed within the bounds of the block. The mouseover event is preferred
	 * over mouseenter because it may be the case that a previous mouseenter
	 * event was blocked from being handled by a IgnoreNestedEvents component,
	 * therefore transitioning out of a nested block to the bounds of the block
	 * would otherwise not trigger a hover effect.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/Events/mouseenter
	 */
	maybeHover() {
		const { isPartOfMultiSelection, isSelected } = this.props;
		const { isHovered } = this.state;

		if ( isHovered || isPartOfMultiSelection || isSelected ||
				this.props.isMultiSelecting || this.hadTouchStart ) {
			return;
		}

		this.setState( { isHovered: true } );
	}

	/**
	 * Sets the block state as unhovered if currently hovering. There are cases
	 * where mouseleave may occur but the block is not hovered (multi-select),
	 * so to avoid unnecesary renders, the state is only set if hovered.
	 */
	hideHoverEffects() {
		if ( this.state.isHovered ) {
			this.setState( { isHovered: false } );
		}
	}

	mergeBlocks( forward = false ) {
		const { block, previousBlockClientId, nextBlockClientId, onMerge } = this.props;

		// Do nothing when it's the first block.
		if (
			( ! forward && ! previousBlockClientId ) ||
			( forward && ! nextBlockClientId )
		) {
			return;
		}

		if ( forward ) {
			onMerge( block.clientId, nextBlockClientId );
		} else {
			onMerge( previousBlockClientId, block.clientId );
		}
	}

	insertBlocksAfter( blocks ) {
		this.props.onInsertBlocks( blocks, this.props.order + 1 );
	}

	/**
	 * Marks the block as selected when focused and not already selected. This
	 * specifically handles the case where block does not set focus on its own
	 * (via `setFocus`), typically if there is no focusable input in the block.
	 *
	 * @return {void}
	 */
	onFocus() {
		if ( ! this.props.isSelected && ! this.props.isPartOfMultiSelection ) {
			this.props.onSelect();
		}
	}

	/**
	 * Prevents default dragging behavior within a block to allow for multi-
	 * selection to take effect unhampered.
	 *
	 * @param {DragEvent} event Drag event.
	 *
	 * @return {void}
	 */
	preventDrag( event ) {
		event.preventDefault();
	}

	/**
	 * Begins tracking cursor multi-selection when clicking down within block.
	 *
	 * @param {MouseEvent} event A mousedown event.
	 *
	 * @return {void}
	 */
	onPointerDown( event ) {
		// Not the main button.
		// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
		if ( event.button !== 0 ) {
			return;
		}

		if ( event.shiftKey ) {
			if ( ! this.props.isSelected ) {
				this.onShiftSelection();
				event.preventDefault();
			}
		} else {
			this.props.onSelectionStart( this.props.clientId );

			// Allow user to escape out of a multi-selection to a singular
			// selection of a block via click. This is handled here since
			// onFocus excludes blocks involved in a multiselection, as
			// focus can be incurred by starting a multiselection (focus
			// moved to first block's multi-controls).
			if ( this.props.isPartOfMultiSelection ) {
				this.props.onSelect();
			}
		}
	}

	/**
	 * Interprets keydown event intent to remove or insert after block if key
	 * event occurs on wrapper node. This can occur when the block has no text
	 * fields of its own, particularly after initial insertion, to allow for
	 * easy deletion and continuous writing flow to add additional content.
	 *
	 * @param {KeyboardEvent} event Keydown event.
	 */
	deleteOrInsertAfterWrapper( event ) {
		const { keyCode, target } = event;

		if (
			! this.props.isSelected ||
			target !== this.wrapperNode ||
			this.props.isLocked
		) {
			return;
		}

		switch ( keyCode ) {
			case ENTER:
				// Insert default block after current block if enter and event
				// not already handled by descendant.
				this.props.onInsertDefaultBlockAfter();
				event.preventDefault();
				break;

			case BACKSPACE:
			case DELETE:
				// Remove block on backspace.
				const { clientId, onRemove } = this.props;
				onRemove( clientId );
				event.preventDefault();
				break;
		}
	}

	onBlockError( error ) {
		this.setState( { error } );
	}

	onDragStart() {
		this.setState( { dragging: true } );
	}

	onDragEnd() {
		this.setState( { dragging: false } );
	}

	selectOnOpen( open ) {
		if ( open && ! this.props.isSelected ) {
			this.props.onSelect();
		}
	}

	onShiftSelection() {
		if ( ! this.props.isSelectionEnabled ) {
			return;
		}

		const { getBlockSelectionStart, onMultiSelect, onSelect } = this.props;

		if ( getBlockSelectionStart() ) {
			onMultiSelect( getBlockSelectionStart(), this.props.clientId );
		} else {
			onSelect( this.props.clientId );
		}
	}

	forceFocusedContextualToolbar() {
		this.isForcingContextualToolbar = true;
		// trigger a re-render
		this.setState( () => ( {} ) );
	}

	render() {
		return (
			<HoverArea container={ this.wrapperNode }>
				{ ( { hoverArea } ) => {
					const {
						block,
						order,
						mode,
						isFocusMode,
						hasFixedToolbar,
						isLocked,
						isFirst,
						isLast,
						clientId,
						rootClientId,
						isSelected,
						isPartOfMultiSelection,
						isFirstMultiSelected,
						isTypingWithinBlock,
						isCaretWithinFormattedText,
						isMultiSelecting,
						isEmptyDefaultBlock,
						isMovable,
						isPreviousBlockADefaultEmptyBlock,
						isParentOfSelectedBlock,
						isDraggable,
						className,
					} = this.props;
					const isHovered = this.state.isHovered && ! isMultiSelecting;
					const { name: blockName, isValid } = block;
					const blockType = getBlockType( blockName );
					// translators: %s: Type of block (i.e. Text, Image etc)
					const blockLabel = sprintf( __( 'Block: %s' ), blockType.title );
					// The block as rendered in the editor is composed of general block UI
					// (mover, toolbar, wrapper) and the display of the block content.

					const isUnregisteredBlock = block.name === getUnregisteredTypeHandlerName();

					// If the block is selected and we're typing the block should not appear.
					// Empty paragraph blocks should always show up as unselected.
					const showEmptyBlockSideInserter = ( isSelected || isHovered ) && isEmptyDefaultBlock && isValid;
					const showSideInserter = ( isSelected || isHovered ) && isEmptyDefaultBlock;
					const shouldAppearSelected = ! isFocusMode && ! showSideInserter && isSelected && ! isTypingWithinBlock;
					const shouldAppearHovered = ! isFocusMode && ! hasFixedToolbar && isHovered && ! isEmptyDefaultBlock;
					// We render block movers and block settings to keep them tabbale even if hidden
					const shouldRenderMovers = ! isFocusMode && ( isSelected || hoverArea === 'left' ) && ! showEmptyBlockSideInserter && ! isMultiSelecting && ! isPartOfMultiSelection && ! isTypingWithinBlock;
					const shouldShowBreadcrumb = ! isFocusMode && isHovered && ! isEmptyDefaultBlock;
					const shouldShowContextualToolbar = ! hasFixedToolbar && ! showSideInserter && ( ( isSelected && ( ! isTypingWithinBlock || isCaretWithinFormattedText ) ) || isFirstMultiSelected );
					const shouldShowMobileToolbar = shouldAppearSelected;
					const { error, dragging } = this.state;

					// Insertion point can only be made visible if the block is at the
					// the extent of a multi-selection, or not in a multi-selection.
					const shouldShowInsertionPoint = ( isPartOfMultiSelection && isFirstMultiSelected ) || ! isPartOfMultiSelection;
					const canShowInBetweenInserter = ! isEmptyDefaultBlock && ! isPreviousBlockADefaultEmptyBlock;

					// The wp-block className is important for editor styles.
					// Generate the wrapper class names handling the different states of the block.
					const wrapperClassName = classnames( 'wp-block editor-block-list__block', {
						'has-warning': ! isValid || !! error || isUnregisteredBlock,
						'is-selected': shouldAppearSelected,
						'is-multi-selected': isPartOfMultiSelection,
						'is-hovered': shouldAppearHovered,
						'is-reusable': isReusableBlock( blockType ),
						'is-dragging': dragging,
						'is-typing': isTypingWithinBlock,
						'is-focused': isFocusMode && ( isSelected || isParentOfSelectedBlock ),
						'is-focus-mode': isFocusMode,
					}, className );

					const { onReplace } = this.props;

					// Determine whether the block has props to apply to the wrapper.
					let wrapperProps = this.props.wrapperProps;
					if ( blockType.getEditWrapperProps ) {
						wrapperProps = {
							...wrapperProps,
							...blockType.getEditWrapperProps( block.attributes ),
						};
					}
					const blockElementId = `block-${ clientId }`;

					// We wrap the BlockEdit component in a div that hides it when editing in
					// HTML mode. This allows us to render all of the ancillary pieces
					// (InspectorControls, etc.) which are inside `BlockEdit` but not
					// `BlockHTML`, even in HTML mode.
					let blockEdit = (
						<BlockEdit
							name={ blockName }
							isSelected={ isSelected }
							attributes={ block.attributes }
							setAttributes={ this.setAttributes }
							insertBlocksAfter={ isLocked ? undefined : this.insertBlocksAfter }
							onReplace={ isLocked ? undefined : onReplace }
							mergeBlocks={ isLocked ? undefined : this.mergeBlocks }
							clientId={ clientId }
							isSelectionEnabled={ this.props.isSelectionEnabled }
							toggleSelection={ this.props.toggleSelection }
						/>
					);
					if ( mode !== 'visual' ) {
						blockEdit = <div style={ { display: 'none' } }>{ blockEdit }</div>;
					}

					// Disable reasons:
					//
					//  jsx-a11y/mouse-events-have-key-events:
					//   - onMouseOver is explicitly handling hover effects
					//
					//  jsx-a11y/no-static-element-interactions:
					//   - Each block can be selected by clicking on it

					/* eslint-disable jsx-a11y/mouse-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */

					return (
						<IgnoreNestedEvents
							id={ blockElementId }
							ref={ this.setBlockListRef }
							onMouseOver={ this.maybeHover }
							onMouseOverHandled={ this.hideHoverEffects }
							onMouseLeave={ this.hideHoverEffects }
							className={ wrapperClassName }
							data-type={ block.name }
							onTouchStart={ this.onTouchStart }
							onFocus={ this.onFocus }
							onClick={ this.onClick }
							onKeyDown={ this.deleteOrInsertAfterWrapper }
							tabIndex="0"
							aria-label={ blockLabel }
							childHandledEvents={ [
								'onDragStart',
								'onMouseDown',
							] }
							{ ...wrapperProps }
						>
							{ shouldShowInsertionPoint && (
								<BlockInsertionPoint
									clientId={ clientId }
									rootClientId={ rootClientId }
									canShowInserter={ canShowInBetweenInserter }
								/>
							) }
							<BlockDropZone
								index={ order }
								clientId={ clientId }
								rootClientId={ rootClientId }
							/>
							{ shouldRenderMovers && (
								<BlockMover
									clientIds={ clientId }
									blockElementId={ blockElementId }
									isFirst={ isFirst }
									isLast={ isLast }
									isHidden={ ! ( isHovered || isSelected ) || hoverArea !== 'left' }
									isDraggable={ ( isDraggable !== false ) && ( ! isPartOfMultiSelection && isMovable ) }
									onDragStart={ this.onDragStart }
									onDragEnd={ this.onDragEnd }
								/>
							) }
							{ isFirstMultiSelected && (
								<BlockMultiControls rootClientId={ rootClientId } />
							) }
							<div className="editor-block-list__block-edit">
								{ shouldShowBreadcrumb && (
									<BlockBreadcrumb
										clientId={ clientId }
										isHidden={ ! ( isHovered || isSelected ) || hoverArea !== 'left' }
									/>
								) }
								{ (
									shouldShowContextualToolbar ||
									this.isForcingContextualToolbar
								) && (
									<BlockContextualToolbar
										// If the toolbar is being shown because of being forced
										// it should focus the toolbar right after the mount.
										focusOnMount={ this.isForcingContextualToolbar }
									/>
								) }
								{ (
									! shouldShowContextualToolbar &&
									isSelected &&
									! hasFixedToolbar &&
									! isEmptyDefaultBlock
								) && (
									<KeyboardShortcuts
										bindGlobal
										eventName="keydown"
										shortcuts={ {
											'alt+f10': this.forceFocusedContextualToolbar,
										} }
									/>
								) }
								<IgnoreNestedEvents
									ref={ this.bindBlockNode }
									onDragStart={ this.preventDrag }
									onMouseDown={ this.onPointerDown }
									data-block={ clientId }
								>
									<BlockCrashBoundary onError={ this.onBlockError }>
										{ isValid && blockEdit }
										{ isValid && mode === 'html' && (
											<BlockHtml clientId={ clientId } />
										) }
										{ ! isValid && [
											<BlockInvalidWarning
												key="invalid-warning"
												block={ block }
											/>,
											<div key="invalid-preview">
												{ getSaveElement( blockType, block.attributes ) }
											</div>,
										] }
									</BlockCrashBoundary>
									{ shouldShowMobileToolbar && (
										<BlockMobileToolbar
											clientId={ clientId }
										/>
									) }
									{ !! error && <BlockCrashWarning /> }
								</IgnoreNestedEvents>
							</div>
							{ showEmptyBlockSideInserter && (
								<Fragment>
									<div className="editor-block-list__side-inserter">
										<InserterWithShortcuts
											clientId={ clientId }
											rootClientId={ rootClientId }
											onToggle={ this.selectOnOpen }
										/>
									</div>
									<div className="editor-block-list__empty-block-inserter">
										<Inserter
											position="top right"
											onToggle={ this.selectOnOpen }
										/>
									</div>
								</Fragment>
							) }
						</IgnoreNestedEvents>
					);
					/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
				} }
			</HoverArea>
		);
	}
}

const applyWithSelect = withSelect( ( select, { clientId, rootClientId, isLargeViewport } ) => {
	const {
		isBlockSelected,
		getPreviousBlockClientId,
		getNextBlockClientId,
		getBlock,
		isAncestorMultiSelected,
		isBlockMultiSelected,
		isFirstMultiSelectedBlock,
		isMultiSelecting,
		isTyping,
		isCaretWithinFormattedText,
		getBlockIndex,
		getBlockMode,
		isSelectionEnabled,
		getSelectedBlocksInitialCaretPosition,
		getEditorSettings,
		hasSelectedInnerBlock,
		getTemplateLock,
		getBlockSelectionStart,
	} = select( 'core/editor' );
	const isSelected = isBlockSelected( clientId );
	const { hasFixedToolbar, focusMode } = getEditorSettings();
	const block = getBlock( clientId );
	const previousBlockClientId = getPreviousBlockClientId( clientId );
	const previousBlock = getBlock( previousBlockClientId );
	const templateLock = getTemplateLock( rootClientId );
	const isParentOfSelectedBlock = hasSelectedInnerBlock( clientId, true );

	return {
		nextBlockClientId: getNextBlockClientId( clientId ),
		isPartOfMultiSelection: isBlockMultiSelected( clientId ) || isAncestorMultiSelected( clientId ),
		isFirstMultiSelected: isFirstMultiSelectedBlock( clientId ),
		isMultiSelecting: isMultiSelecting(),
		// We only care about this prop when the block is selected
		// Thus to avoid unnecessary rerenders we avoid updating the prop if the block is not selected.
		isTypingWithinBlock: ( isSelected || isParentOfSelectedBlock ) && isTyping(),
		isCaretWithinFormattedText: isCaretWithinFormattedText(),
		order: getBlockIndex( clientId, rootClientId ),
		mode: getBlockMode( clientId ),
		isSelectionEnabled: isSelectionEnabled(),
		initialPosition: getSelectedBlocksInitialCaretPosition(),
		isEmptyDefaultBlock: block && isUnmodifiedDefaultBlock( block ),
		isPreviousBlockADefaultEmptyBlock: previousBlock && isUnmodifiedDefaultBlock( previousBlock ),
		isMovable: 'all' !== templateLock,
		isLocked: !! templateLock,
		isFocusMode: focusMode && isLargeViewport,
		hasFixedToolbar: hasFixedToolbar && isLargeViewport,
		previousBlockClientId,
		block,
		isSelected,
		isParentOfSelectedBlock,
		// We only care about this value when the shift key is pressed.
		// We call it dynamically in the event handler to avoid unnecessary re-renders.
		getBlockSelectionStart,
	};
} );

const applyWithDispatch = withDispatch( ( dispatch, ownProps ) => {
	const {
		updateBlockAttributes,
		selectBlock,
		multiSelect,
		insertBlocks,
		insertDefaultBlock,
		removeBlock,
		mergeBlocks,
		replaceBlocks,
		editPost,
		toggleSelection,
	} = dispatch( 'core/editor' );

	return {
		onChange( clientId, attributes ) {
			updateBlockAttributes( clientId, attributes );
		},
		onSelect( clientId = ownProps.clientId, initialPosition ) {
			selectBlock( clientId, initialPosition );
		},
		onMultiSelect: multiSelect,
		onInsertBlocks( blocks, index ) {
			const { rootClientId } = ownProps;
			insertBlocks( blocks, index, rootClientId );
		},
		onInsertDefaultBlockAfter() {
			const { order, rootClientId } = ownProps;
			insertDefaultBlock( {}, rootClientId, order + 1 );
		},
		onRemove( clientId ) {
			removeBlock( clientId );
		},
		onMerge( ...args ) {
			mergeBlocks( ...args );
		},
		onReplace( blocks ) {
			replaceBlocks( [ ownProps.clientId ], blocks );
		},
		onMetaChange( meta ) {
			editPost( { meta } );
		},
		toggleSelection( selectionEnabled ) {
			toggleSelection( selectionEnabled );
		},
	};
} );

export default compose(
	withViewportMatch( { isLargeViewport: 'medium' } ),
	applyWithSelect,
	applyWithDispatch,
	withFilters( 'editor.BlockListBlock' ),
)( BlockListBlock );
