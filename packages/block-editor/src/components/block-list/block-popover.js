/**
 * External dependencies
 */
import { findIndex } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	useState,
	useCallback,
	useContext,
	useRef,
	useEffect,
} from '@wordpress/element';
import { isUnmodifiedDefaultBlock } from '@wordpress/blocks';
import { Popover } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useShortcut } from '@wordpress/keyboard-shortcuts';
import { useViewportMatch } from '@wordpress/compose';
import { getScrollContainer } from '@wordpress/dom';

/**
 * Internal dependencies
 */
import BlockSelectionButton from './block-selection-button';
import BlockContextualToolbar from './block-contextual-toolbar';
import Inserter from '../inserter';
import { BlockNodes } from './';
import { getBlockDOMNode } from '../../utils/dom';

function selector( select ) {
	const {
		isNavigationMode,
		isMultiSelecting,
		hasMultiSelection,
		isTyping,
		isCaretWithinFormattedText,
		getSettings,
		getLastMultiSelectedBlockClientId,
	} = select( 'core/block-editor' );
	return {
		isNavigationMode: isNavigationMode(),
		isMultiSelecting: isMultiSelecting(),
		isTyping: isTyping(),
		isCaretWithinFormattedText: isCaretWithinFormattedText(),
		hasMultiSelection: hasMultiSelection(),
		hasFixedToolbar: getSettings().hasFixedToolbar,
		lastClientId: getLastMultiSelectedBlockClientId(),
	};
}

function BlockPopover( {
	clientId,
	rootClientId,
	isValid,
	isEmptyDefaultBlock,
	capturingClientId,
} ) {
	const {
		isNavigationMode,
		isMultiSelecting,
		isTyping,
		isCaretWithinFormattedText,
		hasMultiSelection,
		hasFixedToolbar,
		lastClientId,
	} = useSelect( selector, [] );
	const isLargeViewport = useViewportMatch( 'medium' );
	const [ isToolbarForced, setIsToolbarForced ] = useState( false );
	const [ isInserterShown, setIsInserterShown ] = useState( false );
	const blockNodes = useContext( BlockNodes );
	const { stopTyping } = useDispatch( 'core/block-editor' );

	// Controls when the side inserter on empty lines should
	// be shown, including writing and selection modes.
	const showEmptyBlockSideInserter =
		! isTyping && ! isNavigationMode && isEmptyDefaultBlock && isValid;
	const shouldShowBreadcrumb = isNavigationMode;
	const shouldShowContextualToolbar =
		! isNavigationMode &&
		! hasFixedToolbar &&
		isLargeViewport &&
		! showEmptyBlockSideInserter &&
		! isMultiSelecting &&
		( ! isTyping || isCaretWithinFormattedText );
	const canFocusHiddenToolbar =
		! isNavigationMode &&
		! shouldShowContextualToolbar &&
		! hasFixedToolbar &&
		! isEmptyDefaultBlock;

	useShortcut(
		'core/block-editor/focus-toolbar',
		useCallback( () => {
			setIsToolbarForced( true );
			stopTyping( true );
		}, [] ),
		{
			bindGlobal: true,
			eventName: 'keydown',
			isDisabled: ! canFocusHiddenToolbar,
		}
	);

	useEffect( () => {
		if ( ! shouldShowContextualToolbar ) {
			setIsToolbarForced( false );
		}
	}, [ shouldShowContextualToolbar ] );

	// Stores the active toolbar item index so the block toolbar can return focus
	// to it when re-mounting.
	const initialToolbarItemIndexRef = useRef();

	useEffect( () => {
		// Resets the index whenever the active block changes so this is not
		// persisted. See https://github.com/WordPress/gutenberg/pull/25760#issuecomment-717906169
		initialToolbarItemIndexRef.current = undefined;
	}, [ clientId ] );

	if (
		! shouldShowBreadcrumb &&
		! shouldShowContextualToolbar &&
		! isToolbarForced &&
		! showEmptyBlockSideInserter
	) {
		return null;
	}

	let node = blockNodes[ clientId ];

	if ( ! node ) {
		return null;
	}

	const { ownerDocument } = node;

	if ( capturingClientId ) {
		node = getBlockDOMNode( capturingClientId, ownerDocument );
	}

	let anchorRef = node;

	if ( hasMultiSelection ) {
		const bottomNode = blockNodes[ lastClientId ];

		// Wait to render the popover until the bottom reference is available
		// as well.
		if ( ! bottomNode ) {
			return null;
		}

		anchorRef = {
			top: node,
			bottom: bottomNode,
		};
	}

	function onFocus() {
		setIsInserterShown( true );
	}

	function onBlur() {
		setIsInserterShown( false );
	}

	// Position above the anchor, pop out towards the right, and position in the
	// left corner. For the side inserter, pop out towards the left, and
	// position in the right corner.
	// To do: refactor `Popover` to make this prop clearer.
	const popoverPosition = showEmptyBlockSideInserter
		? 'top left right'
		: 'top right left';
	const stickyBoundaryElement = showEmptyBlockSideInserter
		? undefined
		: // The sticky boundary element should be the boundary at which the
		  // the block toolbar becomes sticky when the block scolls out of view.
		  // In case of an iframe, this should be the iframe boundary, otherwise
		  // the scroll container.
		  ownerDocument.defaultView.frameElement ||
		  getScrollContainer( node ) ||
		  ownerDocument.body;

	return (
		<Popover
			noArrow
			animate={ false }
			position={ popoverPosition }
			focusOnMount={ false }
			anchorRef={ anchorRef }
			className="block-editor-block-list__block-popover"
			__unstableStickyBoundaryElement={ stickyBoundaryElement }
			__unstableSlotName="block-toolbar"
			__unstableBoundaryParent
			// Observe movement for block animations (especially horizontal).
			__unstableObserveElement={ node }
			shouldAnchorIncludePadding
		>
			{ ( shouldShowContextualToolbar || isToolbarForced ) && (
				<div
					onFocus={ onFocus }
					onBlur={ onBlur }
					// While ideally it would be enough to capture the
					// bubbling focus event from the Inserter, due to the
					// characteristics of click focusing of `button`s in
					// Firefox and Safari, it is not reliable.
					//
					// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus
					tabIndex={ -1 }
					className={ classnames(
						'block-editor-block-list__block-popover-inserter',
						{
							'is-visible': isInserterShown,
						}
					) }
				>
					<Inserter
						clientId={ clientId }
						rootClientId={ rootClientId }
						__experimentalIsQuick
					/>
				</div>
			) }
			{ ( shouldShowContextualToolbar || isToolbarForced ) && (
				<BlockContextualToolbar
					// If the toolbar is being shown because of being forced
					// it should focus the toolbar right after the mount.
					focusOnMount={ isToolbarForced }
					__experimentalInitialIndex={
						initialToolbarItemIndexRef.current
					}
					__experimentalOnIndexChange={ ( index ) => {
						initialToolbarItemIndexRef.current = index;
					} }
				/>
			) }
			{ shouldShowBreadcrumb && (
				<BlockSelectionButton
					clientId={ clientId }
					rootClientId={ rootClientId }
					blockElement={ node }
				/>
			) }
			{ showEmptyBlockSideInserter && (
				<div className="block-editor-block-list__empty-block-inserter">
					<Inserter
						position="bottom right"
						rootClientId={ rootClientId }
						clientId={ clientId }
						__experimentalIsQuick
					/>
				</div>
			) }
		</Popover>
	);
}

function wrapperSelector( select ) {
	const {
		getSelectedBlockClientId,
		getFirstMultiSelectedBlockClientId,
		getBlockRootClientId,
		__unstableGetBlockWithoutInnerBlocks,
		getBlockParents,
		__experimentalGetBlockListSettingsForBlocks,
	} = select( 'core/block-editor' );

	const clientId =
		getSelectedBlockClientId() || getFirstMultiSelectedBlockClientId();

	if ( ! clientId ) {
		return;
	}

	const { name, attributes = {}, isValid } =
		__unstableGetBlockWithoutInnerBlocks( clientId ) || {};
	const blockParentsClientIds = getBlockParents( clientId );

	// Get Block List Settings for all ancestors of the current Block clientId
	const ancestorBlockListSettings = __experimentalGetBlockListSettingsForBlocks(
		blockParentsClientIds
	);

	// Find the index of the first Block with the `captureDescendantsToolbars` prop defined
	// This will be the top most ancestor because getBlockParents() returns tree from top -> bottom
	const topmostAncestorWithCaptureDescendantsToolbarsIndex = findIndex(
		ancestorBlockListSettings,
		[ '__experimentalCaptureToolbars', true ]
	);

	let capturingClientId;

	if ( topmostAncestorWithCaptureDescendantsToolbarsIndex !== -1 ) {
		capturingClientId =
			blockParentsClientIds[
				topmostAncestorWithCaptureDescendantsToolbarsIndex
			];
	}

	return {
		clientId,
		rootClientId: getBlockRootClientId( clientId ),
		name,
		isValid,
		isEmptyDefaultBlock:
			name && isUnmodifiedDefaultBlock( { name, attributes } ),
		capturingClientId,
	};
}

export default function WrappedBlockPopover() {
	const selected = useSelect( wrapperSelector, [] );

	if ( ! selected ) {
		return null;
	}

	const {
		clientId,
		rootClientId,
		name,
		isValid,
		isEmptyDefaultBlock,
		capturingClientId,
	} = selected;

	if ( ! name ) {
		return null;
	}

	return (
		<BlockPopover
			clientId={ clientId }
			rootClientId={ rootClientId }
			isValid={ isValid }
			isEmptyDefaultBlock={ isEmptyDefaultBlock }
			capturingClientId={ capturingClientId }
		/>
	);
}
