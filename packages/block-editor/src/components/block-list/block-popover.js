/**
 * External dependencies
 */
import { findIndex } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useState, useCallback } from '@wordpress/element';
import { isUnmodifiedDefaultBlock } from '@wordpress/blocks';
import { Popover } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useShortcut } from '@wordpress/keyboard-shortcuts';
import { useViewportMatch } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import BlockBreadcrumb from './breadcrumb';
import BlockContextualToolbar from './block-contextual-toolbar';
import Inserter from '../inserter';

function selector( select ) {
	const {
		isNavigationMode,
		isMultiSelecting,
		hasMultiSelection,
		isTyping,
		isCaretWithinFormattedText,
		getSettings,
	} = select( 'core/block-editor' );
	return {
		isNavigationMode: isNavigationMode(),
		isMultiSelecting: isMultiSelecting(),
		isTyping: isTyping(),
		isCaretWithinFormattedText: isCaretWithinFormattedText(),
		hasMultiSelection: hasMultiSelection(),
		hasFixedToolbar: getSettings().hasFixedToolbar,
	};
}

function BlockPopover( {
	clientId,
	rootClientId,
	name,
	align,
	isValid,
	moverDirection,
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
	} = useSelect( selector, [] );
	const isLargeViewport = useViewportMatch( 'medium' );
	const [ isToolbarForced, setIsToolbarForced ] = useState( false );
	const [ isInserterShown, setIsInserterShown ] = useState( false );

	const showEmptyBlockSideInserter = ! isNavigationMode && isEmptyDefaultBlock && isValid;
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
		useCallback( () => setIsToolbarForced( true ), [] ),
		{ bindGlobal: true, eventName: 'keydown', isDisabled: ! canFocusHiddenToolbar }
	);

	if (
		! shouldShowBreadcrumb &&
		! shouldShowContextualToolbar &&
		! isToolbarForced &&
		! showEmptyBlockSideInserter
	) {
		return null;
	}

	const node = document.getElementById( 'block-' + capturingClientId );

	if ( ! node ) {
		return null;
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
	const popoverPosition = showEmptyBlockSideInserter ? 'top left right' : 'top right left';
	const popoverIsSticky = hasMultiSelection ? '.wp-block.is-multi-selected' : true;

	return (
		<Popover
			noArrow
			animate={ false }
			position={ popoverPosition }
			focusOnMount={ false }
			anchorRef={ node.lastChild }
			className="block-editor-block-list__block-popover"
			__unstableSticky={ showEmptyBlockSideInserter ? false : popoverIsSticky }
			__unstableSlotName="block-toolbar"
			// Allow subpixel positioning for the block movement animation.
			__unstableAllowVerticalSubpixelPosition={ moverDirection !== 'horizontal' && node }
			__unstableAllowHorizontalSubpixelPosition={ moverDirection === 'horizontal' && node }
			onBlur={ () => setIsToolbarForced( false ) }
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
						{ 'is-visible': isInserterShown }
					) }
				>
					<Inserter clientId={ clientId } rootClientId={ rootClientId } />
				</div>
			) }
			{ ( shouldShowContextualToolbar || isToolbarForced ) && (
				<BlockContextualToolbar
					// If the toolbar is being shown because of being forced
					// it should focus the toolbar right after the mount.
					focusOnMount={ isToolbarForced }
					data-type={ name }
					data-align={ align }
				/>
			) }
			{ shouldShowBreadcrumb && (
				<BlockBreadcrumb
					clientId={ clientId }
					data-align={ align }
				/>
			) }
			{ showEmptyBlockSideInserter && (
				<div className="block-editor-block-list__empty-block-inserter">
					<Inserter
						position="top right"
						rootClientId={ rootClientId }
						clientId={ clientId }
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
		__unstableGetSelectedMountedBlock,
		__unstableGetBlockWithoutInnerBlocks,
		getBlockParents,
		getBlockListSettings,
		__experimentalGetBlockListSettingsForBlocks,
	} = select( 'core/block-editor' );

	const clientId = getSelectedBlockClientId() || getFirstMultiSelectedBlockClientId();

	if ( ! clientId ) {
		return;
	}

	const rootClientId = getBlockRootClientId( clientId );
	const { name, attributes = {}, isValid } = __unstableGetBlockWithoutInnerBlocks( clientId ) || {};
	const blockParentsClientIds = getBlockParents( clientId );
	const { __experimentalMoverDirection } = getBlockListSettings( rootClientId ) || {};

	// Get Block List Settings for all ancestors of the current Block clientId
	const ancestorBlockListSettings = __experimentalGetBlockListSettingsForBlocks( blockParentsClientIds );

	// Find the index of the first Block with the `captureDescendantsToolbars` prop defined
	// This will be the top most ancestor because getBlockParents() returns tree from top -> bottom
	const topmostAncestorWithCaptureDescendantsToolbarsIndex = findIndex( ancestorBlockListSettings, [ '__experimentalCaptureToolbars', true ] );

	let capturingClientId = clientId;

	if ( topmostAncestorWithCaptureDescendantsToolbarsIndex !== -1 ) {
		capturingClientId = blockParentsClientIds[ topmostAncestorWithCaptureDescendantsToolbarsIndex ];
	}

	return {
		clientId,
		rootClientId: getBlockRootClientId( clientId ),
		isMounted: __unstableGetSelectedMountedBlock() === clientId,
		name,
		align: attributes.align,
		isValid,
		moverDirection: __experimentalMoverDirection,
		isEmptyDefaultBlock: name && isUnmodifiedDefaultBlock( { name, attributes } ),
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
		isMounted,
		name,
		align,
		isValid,
		moverDirection,
		isEmptyDefaultBlock,
		capturingClientId,
	} = selected;

	if ( ! name || ! isMounted ) {
		return null;
	}

	return (
		<BlockPopover
			clientId={ clientId }
			rootClientId={ rootClientId }
			name={ name }
			align={ align }
			isValid={ isValid }
			moverDirection={ moverDirection }
			isEmptyDefaultBlock={ isEmptyDefaultBlock }
			capturingClientId={ capturingClientId }
		/>
	);
}
