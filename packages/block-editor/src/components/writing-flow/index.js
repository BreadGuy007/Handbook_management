/**
 * External dependencies
 */
import { overEvery, find, findLast, reverse, first, last } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, createRef, forwardRef } from '@wordpress/element';
import {
	computeCaretRect,
	focus,
	isHorizontalEdge,
	isTextField,
	isVerticalEdge,
	placeCaretAtHorizontalEdge,
	placeCaretAtVerticalEdge,
	isEntirelySelected,
} from '@wordpress/dom';
import { UP, DOWN, LEFT, RIGHT, TAB, isKeyboardEvent } from '@wordpress/keycodes';
import { withSelect, withDispatch, useSelect, useDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import {
	isBlockFocusStop,
	isInSameBlock,
	hasInnerBlocksContext,
	getBlockFocusableWrapper,
} from '../../utils/dom';

/**
 * Browser constants
 */

const { getSelection, getComputedStyle } = window;

/**
 * Given an element, returns true if the element is a tabbable text field, or
 * false otherwise.
 *
 * @param {Element} element Element to test.
 *
 * @return {boolean} Whether element is a tabbable text field.
 */
const isTabbableTextField = overEvery( [
	isTextField,
	focus.tabbable.isTabbableIndex,
] );

/**
 * Returns true if the element should consider edge navigation upon a keyboard
 * event of the given directional key code, or false otherwise.
 *
 * @param {Element} element     HTML element to test.
 * @param {number}  keyCode     KeyboardEvent keyCode to test.
 * @param {boolean} hasModifier Whether a modifier is pressed.
 *
 * @return {boolean} Whether element should consider edge navigation.
 */
export function isNavigationCandidate( element, keyCode, hasModifier ) {
	const isVertical = ( keyCode === UP || keyCode === DOWN );

	// Currently, all elements support unmodified vertical navigation.
	if ( isVertical && ! hasModifier ) {
		return true;
	}

	// Native inputs should not navigate horizontally.
	const { tagName } = element;
	return tagName !== 'INPUT' && tagName !== 'TEXTAREA';
}

/**
 * Renders focus capturing areas to redirect focus to the selected block if not
 * in Navigation mode.
 *
 * @param {string}  selectedClientId Client ID of the selected block.
 * @param {boolean} isReverse        Set to true if the component is rendered
 *                                   after the block list, false if rendered
 *                                   before.
 * @param {Object}  containerRef     Reference containing the element reference
 *                                   of the block list container.
 * @param {boolean} noCapture        Reference containing the flag for enabling
 *                                   or disabling capturing.
 *
 * @return {WPElement} The focus capture element.
 */
const FocusCapture = forwardRef( ( {
	selectedClientId,
	isReverse,
	containerRef,
	noCapture,
}, ref ) => {
	const isNavigationMode = useSelect( ( select ) =>
		select( 'core/block-editor' ).isNavigationMode()
	);
	const { setNavigationMode } = useDispatch( 'core/block-editor' );

	function onFocus() {
		// Do not capture incoming focus if set by us in WritingFlow.
		if ( noCapture.current ) {
			delete noCapture.current;
			return;
		}

		// When focus coming in from out of the block list, and no block is
		// selected, enable Navigation mode and select the first or last block
		// depending on the direction.
		if ( ! selectedClientId ) {
			setNavigationMode( true );

			const tabbables = focus.tabbable.find( containerRef.current );

			if ( tabbables.length ) {
				if ( isReverse ) {
					last( tabbables ).focus();
				} else {
					first( tabbables ).focus();
				}
			}

			return;
		}

		// If there is a selected block, move focus to the first or last
		// tabbable element depending on the direction.
		const wrapper = getBlockFocusableWrapper( selectedClientId );

		if ( isReverse ) {
			const tabbables = focus.tabbable.find( wrapper );
			last( tabbables ).focus();
		} else {
			wrapper.focus();
		}
	}

	return (
		<div
			ref={ ref }
			// Don't allow tabbing to this element in Navigation mode.
			tabIndex={ ! isNavigationMode ? '0' : undefined }
			onFocus={ onFocus }
			// Needs to be positioned within the viewport, so focus to this
			// element does not scroll the page.
			style={ { position: 'fixed' } }
		/>
	);
} );

class WritingFlow extends Component {
	constructor() {
		super( ...arguments );

		this.onKeyDown = this.onKeyDown.bind( this );
		this.onMouseDown = this.onMouseDown.bind( this );
		this.focusLastTextField = this.focusLastTextField.bind( this );

		/**
		 * Here a rectangle is stored while moving the caret vertically so
		 * vertical position of the start position can be restored.
		 * This is to recreate browser behaviour across blocks.
		 *
		 * @type {?DOMRect}
		 */
		this.verticalRect = null;

		this.container = createRef();
		this.focusCaptureBeforeRef = createRef();
		this.focusCaptureAfterRef = createRef();

		// Object reference that holds the a flag for enabling or disabling
		// capturing on the focus capture elements.
		this.noCapture = {};
	}

	onMouseDown() {
		this.verticalRect = null;
	}

	/**
	 * Returns the optimal tab target from the given focused element in the
	 * desired direction. A preference is made toward text fields, falling back
	 * to the block focus stop if no other candidates exist for the block.
	 *
	 * @param {Element} target    Currently focused text field.
	 * @param {boolean} isReverse True if considering as the first field.
	 *
	 * @return {?Element} Optimal tab target, if one exists.
	 */
	getClosestTabbable( target, isReverse ) {
		// Since the current focus target is not guaranteed to be a text field,
		// find all focusables. Tabbability is considered later.
		let focusableNodes = focus.focusable.find( this.container.current );

		if ( isReverse ) {
			focusableNodes = reverse( focusableNodes );
		}

		// Consider as candidates those focusables after the current target.
		// It's assumed this can only be reached if the target is focusable
		// (on its keydown event), so no need to verify it exists in the set.
		focusableNodes = focusableNodes.slice( focusableNodes.indexOf( target ) + 1 );

		function isTabCandidate( node, i, array ) {
			// Not a candidate if the node is not tabbable.
			if ( ! focus.tabbable.isTabbableIndex( node ) ) {
				return false;
			}

			// Prefer text fields...
			if ( isTextField( node ) ) {
				return true;
			}

			// ...but settle for block focus stop.
			if ( ! isBlockFocusStop( node ) ) {
				return false;
			}

			// If element contains inner blocks, stop immediately at its focus
			// wrapper.
			if ( hasInnerBlocksContext( node ) ) {
				return true;
			}

			// If navigating out of a block (in reverse), don't consider its
			// block focus stop.
			if ( node.contains( target ) ) {
				return false;
			}

			// In case of block focus stop, check to see if there's a better
			// text field candidate within.
			for ( let offset = 1, nextNode; ( nextNode = array[ i + offset ] ); offset++ ) {
				// Abort if no longer testing descendents of focus stop.
				if ( ! node.contains( nextNode ) ) {
					break;
				}

				// Apply same tests by recursion. This is important to consider
				// nestable blocks where we don't want to settle for the inner
				// block focus stop.
				if ( isTabCandidate( nextNode, i + offset, array ) ) {
					return false;
				}
			}

			return true;
		}

		return find( focusableNodes, isTabCandidate );
	}

	expandSelection( isReverse ) {
		const {
			selectedBlockClientId,
			selectionStartClientId,
			selectionBeforeEndClientId,
			selectionAfterEndClientId,
		} = this.props;

		const nextSelectionEndClientId = isReverse ?
			selectionBeforeEndClientId :
			selectionAfterEndClientId;

		if ( nextSelectionEndClientId ) {
			this.props.onMultiSelect(
				selectionStartClientId || selectedBlockClientId,
				nextSelectionEndClientId
			);
		}
	}

	moveSelection( isReverse ) {
		const { selectedFirstClientId, selectedLastClientId } = this.props;

		const focusedBlockClientId = isReverse ? selectedFirstClientId : selectedLastClientId;

		if ( focusedBlockClientId ) {
			this.props.onSelectBlock( focusedBlockClientId );
		}
	}

	/**
	 * Returns true if the given target field is the last in its block which
	 * can be considered for tab transition. For example, in a block with two
	 * text fields, this would return true when reversing from the first of the
	 * two fields, but false when reversing from the second.
	 *
	 * @param {Element} target    Currently focused text field.
	 * @param {boolean} isReverse True if considering as the first field.
	 *
	 * @return {boolean} Whether field is at edge for tab transition.
	 */
	isTabbableEdge( target, isReverse ) {
		const closestTabbable = this.getClosestTabbable( target, isReverse );
		return ! closestTabbable || ! isInSameBlock( target, closestTabbable );
	}

	onKeyDown( event ) {
		const {
			hasMultiSelection,
			onMultiSelect,
			blocks,
			selectedBlockClientId,
			selectionBeforeEndClientId,
			selectionAfterEndClientId,
			isNavigationMode,
			selectionStartClientId,
		} = this.props;

		const { keyCode, target } = event;
		const isUp = keyCode === UP;
		const isDown = keyCode === DOWN;
		const isLeft = keyCode === LEFT;
		const isRight = keyCode === RIGHT;
		const isTab = keyCode === TAB;
		const isReverse = isUp || isLeft;
		const isHorizontal = isLeft || isRight;
		const isVertical = isUp || isDown;
		const isNav = isHorizontal || isVertical;
		const isShift = event.shiftKey;
		const hasModifier = isShift || event.ctrlKey || event.altKey || event.metaKey;
		const isNavEdge = isVertical ? isVerticalEdge : isHorizontalEdge;

		// In navigation mode, tab and arrows navigate from block to block.
		if ( isNavigationMode ) {
			const navigateUp = ( isTab && isShift ) || isUp;
			const navigateDown = ( isTab && ! isShift ) || isDown;
			const focusedBlockUid = navigateUp ? selectionBeforeEndClientId : selectionAfterEndClientId;

			if ( navigateDown || navigateUp ) {
				if ( focusedBlockUid ) {
					event.preventDefault();
					this.props.onSelectBlock( focusedBlockUid );
				} else if ( isTab && selectedBlockClientId ) {
					const wrapper = getBlockFocusableWrapper( selectedBlockClientId );
					let nextTabbable;

					if ( navigateDown ) {
						nextTabbable = focus.tabbable.findNext( wrapper );
					} else {
						nextTabbable = focus.tabbable.findPrevious( wrapper );
					}

					if ( nextTabbable ) {
						event.preventDefault();
						nextTabbable.focus();
						this.props.clearSelectedBlock();
					}
				}
			}

			return;
		}

		const clientId = selectedBlockClientId || selectionStartClientId;

		// In Edit mode, Tab should focus the first tabbable element after the
		// content, which is normally the sidebar (with block controls) and
		// Shift+Tab should focus the first tabbable element before the content,
		// which is normally the block toolbar.
		// Arrow keys can be used, and Tab and arrow keys can be used in
		// Navigation mode (press Esc), to navigate through blocks.
		if ( isTab && clientId ) {
			const wrapper = getBlockFocusableWrapper( clientId );

			if ( isShift ) {
				if ( target === wrapper ) {
					// Disable focus capturing on the focus capture element, so
					// it doesn't refocus this block and so it allows default
					// behaviour (moving focus to the next tabbable element).
					this.noCapture.current = true;
					this.focusCaptureBeforeRef.current.focus();
					return;
				}
			} else {
				const tabbables = focus.tabbable.find( wrapper );

				if ( target === last( tabbables ) ) {
					// See comment above.
					this.noCapture.current = true;
					this.focusCaptureAfterRef.current.focus();
					return;
				}
			}
		}

		// When presing any key other than up or down, the initial vertical
		// position must ALWAYS be reset. The vertical position is saved so it
		// can be restored as well as possible on sebsequent vertical arrow key
		// presses. It may not always be possible to restore the exact same
		// position (such as at an empty line), so it wouldn't be good to
		// compute the position right before any vertical arrow key press.
		if ( ! isVertical ) {
			this.verticalRect = null;
		} else if ( ! this.verticalRect ) {
			this.verticalRect = computeCaretRect();
		}

		// This logic inside this condition needs to be checked before
		// the check for event.nativeEvent.defaultPrevented.
		// The logic handles meta+a keypress and this event is default prevented
		// by RichText.
		if ( ! isNav ) {
			// Set immediately before the meta+a combination can be pressed.
			if ( isKeyboardEvent.primary( event ) ) {
				this.isEntirelySelected = isEntirelySelected( target );
			}

			if ( isKeyboardEvent.primary( event, 'a' ) ) {
				// When the target is contentEditable, selection will already
				// have been set by the browser earlier in this call stack. We
				// need check the previous result, otherwise all blocks will be
				// selected right away.
				if ( target.isContentEditable ? this.isEntirelySelected : isEntirelySelected( target ) ) {
					onMultiSelect( first( blocks ), last( blocks ) );
					event.preventDefault();
				}

				// After pressing primary + A we can assume isEntirelySelected is true.
				// Calling right away isEntirelySelected after primary + A may still return false on some browsers.
				this.isEntirelySelected = true;
			}

			return;
		}

		// Abort if navigation has already been handled (e.g. RichText inline
		// boundaries).
		if ( event.nativeEvent.defaultPrevented ) {
			return;
		}

		// Abort if our current target is not a candidate for navigation (e.g.
		// preserve native input behaviors).
		if ( ! isNavigationCandidate( target, keyCode, hasModifier ) ) {
			return;
		}

		// In the case of RTL scripts, right means previous and left means next,
		// which is the exact reverse of LTR.
		const { direction } = getComputedStyle( target );
		const isReverseDir = direction === 'rtl' ? ( ! isReverse ) : isReverse;

		if ( isShift ) {
			if (
				(
					// Ensure that there is a target block.
					( isReverse && selectionBeforeEndClientId ) ||
					( ! isReverse && selectionAfterEndClientId )
				) && (
					hasMultiSelection || (
						this.isTabbableEdge( target, isReverse ) &&
						isNavEdge( target, isReverse )
					)
				)
			) {
				// Shift key is down, and there is multi selection or we're at
				// the end of the current block.
				this.expandSelection( isReverse );
				event.preventDefault();
			}
		} else if ( hasMultiSelection ) {
			// Moving from block multi-selection to single block selection
			this.moveSelection( isReverse );
			event.preventDefault();
		} else if ( isVertical && isVerticalEdge( target, isReverse ) ) {
			const closestTabbable = this.getClosestTabbable( target, isReverse );

			if ( closestTabbable ) {
				placeCaretAtVerticalEdge( closestTabbable, isReverse, this.verticalRect );
				event.preventDefault();
			}
		} else if ( isHorizontal && getSelection().isCollapsed && isHorizontalEdge( target, isReverseDir ) ) {
			const closestTabbable = this.getClosestTabbable( target, isReverseDir );
			placeCaretAtHorizontalEdge( closestTabbable, isReverseDir );
			event.preventDefault();
		}
	}

	/**
	 * Sets focus to the end of the last tabbable text field, if one exists.
	 */
	focusLastTextField() {
		const focusableNodes = focus.focusable.find( this.container.current );
		const target = findLast( focusableNodes, isTabbableTextField );
		if ( target ) {
			placeCaretAtHorizontalEdge( target, true );
		}
	}

	render() {
		const {
			children,
			selectedBlockClientId,
			selectionStartClientId,
		} = this.props;
		const selectedClientId = selectedBlockClientId || selectionStartClientId;

		// Disable reason: Wrapper itself is non-interactive, but must capture
		// bubbling events from children to determine focus transition intents.
		/* eslint-disable jsx-a11y/no-static-element-interactions */
		return (
			<div className="block-editor-writing-flow">
				<FocusCapture
					ref={ this.focusCaptureBeforeRef }
					selectedClientId={ selectedClientId }
					containerRef={ this.container }
					noCapture={ this.noCapture }
				/>
				<div
					ref={ this.container }
					onKeyDown={ this.onKeyDown }
					onMouseDown={ this.onMouseDown }
				>
					{ children }
				</div>
				<FocusCapture
					ref={ this.focusCaptureAfterRef }
					selectedClientId={ selectedClientId }
					containerRef={ this.container }
					noCapture={ this.noCapture }
					isReverse
				/>
				<div
					aria-hidden
					tabIndex={ -1 }
					onClick={ this.focusLastTextField }
					className="block-editor-writing-flow__click-redirect"
				/>
			</div>
		);
		/* eslint-enable jsx-a11y/no-static-element-interactions */
	}
}

export default compose( [
	withSelect( ( select ) => {
		const {
			getSelectedBlockClientId,
			getMultiSelectedBlocksStartClientId,
			getMultiSelectedBlocksEndClientId,
			getPreviousBlockClientId,
			getNextBlockClientId,
			getFirstMultiSelectedBlockClientId,
			getLastMultiSelectedBlockClientId,
			hasMultiSelection,
			getBlockOrder,
			isNavigationMode,
		} = select( 'core/block-editor' );

		const selectedBlockClientId = getSelectedBlockClientId();
		const selectionStartClientId = getMultiSelectedBlocksStartClientId();
		const selectionEndClientId = getMultiSelectedBlocksEndClientId();

		return {
			selectedBlockClientId,
			selectionStartClientId,
			selectionBeforeEndClientId: getPreviousBlockClientId( selectionEndClientId || selectedBlockClientId ),
			selectionAfterEndClientId: getNextBlockClientId( selectionEndClientId || selectedBlockClientId ),
			selectedFirstClientId: getFirstMultiSelectedBlockClientId(),
			selectedLastClientId: getLastMultiSelectedBlockClientId(),
			hasMultiSelection: hasMultiSelection(),
			blocks: getBlockOrder(),
			isNavigationMode: isNavigationMode(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { multiSelect, selectBlock, clearSelectedBlock } = dispatch( 'core/block-editor' );
		return {
			onMultiSelect: multiSelect,
			onSelectBlock: selectBlock,
			clearSelectedBlock,
		};
	} ),
] )( WritingFlow );
