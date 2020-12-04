/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import {
	BACKSPACE,
	DELETE,
	UP,
	DOWN,
	LEFT,
	RIGHT,
	TAB,
	ESCAPE,
	ENTER,
	SPACE,
} from '@wordpress/keycodes';
import {
	getBlockType,
	__experimentalGetAccessibleBlockLabel as getAccessibleBlockLabel,
} from '@wordpress/blocks';
import { speak } from '@wordpress/a11y';
import { focus } from '@wordpress/dom';

/**
 * Internal dependencies
 */
import BlockTitle from '../block-title';

/**
 * Returns true if the user is using windows.
 *
 * @return {boolean} Whether the user is using Windows.
 */
function isWindows() {
	return window.navigator.platform.indexOf( 'Win' ) > -1;
}

function selector( select ) {
	const {
		getSelectedBlockClientId,
		getMultiSelectedBlocksEndClientId,
		getPreviousBlockClientId,
		getNextBlockClientId,
		hasBlockMovingClientId,
		getBlockIndex,
		getBlockRootClientId,
		getClientIdsOfDescendants,
		canInsertBlockType,
		getBlockName,
	} = select( 'core/block-editor' );

	const selectedBlockClientId = getSelectedBlockClientId();
	const selectionEndClientId = getMultiSelectedBlocksEndClientId();

	return {
		selectedBlockClientId,
		selectionBeforeEndClientId: getPreviousBlockClientId(
			selectionEndClientId || selectedBlockClientId
		),
		selectionAfterEndClientId: getNextBlockClientId(
			selectionEndClientId || selectedBlockClientId
		),
		hasBlockMovingClientId,
		getBlockIndex,
		getBlockRootClientId,
		getClientIdsOfDescendants,
		canInsertBlockType,
		getBlockName,
	};
}

/**
 * Block selection button component, displaying the label of the block. If the block
 * descends from a root block, a button is displayed enabling the user to select
 * the root block.
 *
 * @param {string} props          Component props.
 * @param {string} props.clientId Client ID of block.
 *
 * @return {WPComponent} The component to be rendered.
 */
function BlockSelectionButton( { clientId, rootClientId, blockElement } ) {
	const selected = useSelect(
		( select ) => {
			const {
				__unstableGetBlockWithoutInnerBlocks,
				getBlockIndex,
				hasBlockMovingClientId,
				getBlockListSettings,
			} = select( 'core/block-editor' );
			const index = getBlockIndex( clientId, rootClientId );
			const { name, attributes } = __unstableGetBlockWithoutInnerBlocks(
				clientId
			);
			const blockMovingMode = hasBlockMovingClientId();
			return {
				index,
				name,
				attributes,
				blockMovingMode,
				orientation: getBlockListSettings( rootClientId )?.orientation,
			};
		},
		[ clientId, rootClientId ]
	);
	const { index, name, attributes, blockMovingMode, orientation } = selected;
	const { setNavigationMode, removeBlock } = useDispatch(
		'core/block-editor'
	);
	const ref = useRef();

	// Focus the breadcrumb in navigation mode.
	useEffect( () => {
		ref.current.focus();

		// NVDA on windows suffers from a bug where focus changes are not announced properly
		// See WordPress/gutenberg#24121 and nvaccess/nvda#5825 for more details
		// To solve it we announce the focus change manually.
		if ( isWindows() ) {
			speak( label );
		}
	}, [] );

	const {
		selectedBlockClientId,
		selectionBeforeEndClientId,
		selectionAfterEndClientId,
		hasBlockMovingClientId,
		getBlockIndex,
		getBlockRootClientId,
		getClientIdsOfDescendants,
	} = useSelect( selector, [] );
	const {
		selectBlock,
		clearSelectedBlock,
		setBlockMovingClientId,
		moveBlockToPosition,
	} = useDispatch( 'core/block-editor' );

	function onKeyDown( event ) {
		const { keyCode } = event;
		const isUp = keyCode === UP;
		const isDown = keyCode === DOWN;
		const isLeft = keyCode === LEFT;
		const isRight = keyCode === RIGHT;
		const isTab = keyCode === TAB;
		const isEscape = keyCode === ESCAPE;
		const isEnter = keyCode === ENTER;
		const isSpace = keyCode === SPACE;
		const isShift = event.shiftKey;

		if ( keyCode === BACKSPACE || keyCode === DELETE ) {
			removeBlock( clientId );
			event.preventDefault();
			return;
		}

		const navigateUp = ( isTab && isShift ) || isUp;
		const navigateDown = ( isTab && ! isShift ) || isDown;
		// Move out of current nesting level (no effect if at root level).
		const navigateOut = isLeft;
		// Move into next nesting level (no effect if the current block has no innerBlocks).
		const navigateIn = isRight;

		let focusedBlockUid;
		if ( navigateUp ) {
			focusedBlockUid = selectionBeforeEndClientId;
		} else if ( navigateDown ) {
			focusedBlockUid = selectionAfterEndClientId;
		} else if ( navigateOut ) {
			focusedBlockUid =
				getBlockRootClientId( selectedBlockClientId ) ??
				selectedBlockClientId;
		} else if ( navigateIn ) {
			focusedBlockUid =
				getClientIdsOfDescendants( [ selectedBlockClientId ] )[ 0 ] ??
				selectedBlockClientId;
		}
		const startingBlockClientId = hasBlockMovingClientId();

		if ( isEscape && startingBlockClientId ) {
			setBlockMovingClientId( null );
		}
		if ( ( isEnter || isSpace ) && startingBlockClientId ) {
			const sourceRoot = getBlockRootClientId( startingBlockClientId );
			const destRoot = getBlockRootClientId( selectedBlockClientId );
			const sourceBlockIndex = getBlockIndex(
				startingBlockClientId,
				sourceRoot
			);
			let destinationBlockIndex = getBlockIndex(
				selectedBlockClientId,
				destRoot
			);
			if (
				sourceBlockIndex < destinationBlockIndex &&
				sourceRoot === destRoot
			) {
				destinationBlockIndex -= 1;
			}
			moveBlockToPosition(
				startingBlockClientId,
				sourceRoot,
				destRoot,
				destinationBlockIndex
			);
			selectBlock( startingBlockClientId );
			setBlockMovingClientId( null );
		}
		if ( navigateDown || navigateUp || navigateOut || navigateIn ) {
			if ( focusedBlockUid ) {
				event.preventDefault();
				selectBlock( focusedBlockUid );
			} else if ( isTab && selectedBlockClientId ) {
				let nextTabbable;

				if ( navigateDown ) {
					nextTabbable = focus.tabbable.findNext( blockElement );
				} else {
					nextTabbable = focus.tabbable.findPrevious( blockElement );
				}

				if ( nextTabbable ) {
					event.preventDefault();
					nextTabbable.focus();
					clearSelectedBlock();
				}
			}
		}
	}

	const blockType = getBlockType( name );
	const label = getAccessibleBlockLabel(
		blockType,
		attributes,
		index + 1,
		orientation
	);

	const classNames = classnames(
		'block-editor-block-list__block-selection-button',
		{
			'is-block-moving-mode': !! blockMovingMode,
		}
	);

	return (
		<div className={ classNames }>
			<Button
				ref={ ref }
				onClick={ () => setNavigationMode( false ) }
				onKeyDown={ onKeyDown }
				label={ label }
			>
				<BlockTitle clientId={ clientId } />
			</Button>
		</div>
	);
}

export default BlockSelectionButton;
