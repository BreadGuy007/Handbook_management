/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useRef } from '@wordpress/element';
import { useViewportMatch } from '@wordpress/compose';
import { getBlockType, hasBlockSupport } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import BlockMover from '../block-mover';
import BlockParentSelector from '../block-parent-selector';
import BlockSwitcher from '../block-switcher';
import BlockControls from '../block-controls';
import BlockFormatControls from '../block-format-controls';
import BlockSettingsMenu from '../block-settings-menu';
import BlockDraggable from '../block-draggable';
import { useShowMoversGestures, useToggleBlockHighlight } from './utils';
import ExpandedBlockControlsContainer from './expanded-block-controls-container';

export default function BlockToolbar( {
	hideDragHandle,
	__experimentalExpandedControl = false,
} ) {
	const {
		blockClientIds,
		blockClientId,
		blockType,
		hasFixedToolbar,
		isValid,
		isVisual,
	} = useSelect( ( select ) => {
		const {
			getBlockName,
			getBlockMode,
			getSelectedBlockClientIds,
			isBlockValid,
			getBlockRootClientId,
			getSettings,
		} = select( 'core/block-editor' );
		const selectedBlockClientIds = getSelectedBlockClientIds();
		const selectedBlockClientId = selectedBlockClientIds[ 0 ];
		const blockRootClientId = getBlockRootClientId( selectedBlockClientId );

		return {
			blockClientIds: selectedBlockClientIds,
			blockClientId: selectedBlockClientId,
			blockType:
				selectedBlockClientId &&
				getBlockType( getBlockName( selectedBlockClientId ) ),
			hasFixedToolbar: getSettings().hasFixedToolbar,
			rootClientId: blockRootClientId,
			isValid: selectedBlockClientIds.every( ( id ) =>
				isBlockValid( id )
			),
			isVisual: selectedBlockClientIds.every(
				( id ) => getBlockMode( id ) === 'visual'
			),
		};
	}, [] );

	const toggleBlockHighlight = useToggleBlockHighlight( blockClientId );
	const nodeRef = useRef();

	const { showMovers, gestures: showMoversGestures } = useShowMoversGestures(
		{
			ref: nodeRef,
			onChange: toggleBlockHighlight,
		}
	);

	const displayHeaderToolbar =
		useViewportMatch( 'medium', '<' ) || hasFixedToolbar;

	if ( blockType ) {
		if ( ! hasBlockSupport( blockType, '__experimentalToolbar', true ) ) {
			return null;
		}
	}

	const shouldShowMovers = displayHeaderToolbar || showMovers;

	if ( blockClientIds.length === 0 ) {
		return null;
	}

	const shouldShowVisualToolbar = isValid && isVisual;
	const isMultiToolbar = blockClientIds.length > 1;

	const classes = classnames(
		'block-editor-block-toolbar',
		shouldShowMovers && 'is-showing-movers'
	);

	const Wrapper = __experimentalExpandedControl
		? ExpandedBlockControlsContainer
		: 'div';

	return (
		<Wrapper className={ classes }>
			<div
				className="block-editor-block-toolbar__mover-switcher-container"
				ref={ nodeRef }
			>
				{ ! isMultiToolbar && (
					<div className="block-editor-block-toolbar__block-parent-selector-wrapper">
						<BlockParentSelector clientIds={ blockClientIds } />
					</div>
				) }

				{ ( shouldShowVisualToolbar || isMultiToolbar ) && (
					<BlockDraggable
						clientIds={ blockClientIds }
						cloneClassname="block-editor-block-toolbar__drag-clone"
					>
						{ ( {
							isDraggable,
							onDraggableStart,
							onDraggableEnd,
						} ) => (
							<div
								{ ...showMoversGestures }
								className="block-editor-block-toolbar__block-switcher-wrapper"
								draggable={ isDraggable && ! hideDragHandle }
								onDragStart={ onDraggableStart }
								onDragEnd={ onDraggableEnd }
							>
								<BlockSwitcher clientIds={ blockClientIds } />
								<BlockMover clientIds={ blockClientIds } />
							</div>
						) }
					</BlockDraggable>
				) }
			</div>
			{ shouldShowVisualToolbar && (
				<>
					<BlockControls.Slot
						bubblesVirtually
						className="block-editor-block-toolbar__slot"
					/>
					<BlockFormatControls.Slot
						bubblesVirtually
						className="block-editor-block-toolbar__slot"
					/>
				</>
			) }
			<BlockSettingsMenu clientIds={ blockClientIds } />
		</Wrapper>
	);
}
