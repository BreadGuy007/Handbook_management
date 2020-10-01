/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { AsyncModeProvider, useSelect } from '@wordpress/data';
import { useRef, forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockListBlock from './block';
import BlockListAppender from '../block-list-appender';
import RootContainer from './root-container';
import useBlockDropZone from '../use-block-drop-zone';

/**
 * If the block count exceeds the threshold, we disable the reordering animation
 * to avoid laginess.
 */
const BLOCK_ANIMATION_THRESHOLD = 200;

function BlockList(
	{
		className,
		rootClientId,
		renderAppender,
		__experimentalTagName = 'div',
		__experimentalAppenderTagName,
		__experimentalPassedProps = {},
	},
	ref
) {
	function selector( select ) {
		const {
			getBlockOrder,
			getBlockListSettings,
			getSelectedBlockClientId,
			getMultiSelectedBlockClientIds,
			hasMultiSelection,
			getGlobalBlockCount,
			isTyping,
			isDraggingBlocks,
		} = select( 'core/block-editor' );

		return {
			blockClientIds: getBlockOrder( rootClientId ),
			selectedBlockClientId: getSelectedBlockClientId(),
			multiSelectedBlockClientIds: getMultiSelectedBlockClientIds(),
			orientation: getBlockListSettings( rootClientId )?.orientation,
			hasMultiSelection: hasMultiSelection(),
			enableAnimation:
				! isTyping() &&
				getGlobalBlockCount() <= BLOCK_ANIMATION_THRESHOLD,
			isDraggingBlocks: isDraggingBlocks(),
		};
	}

	const {
		blockClientIds,
		selectedBlockClientId,
		multiSelectedBlockClientIds,
		orientation,
		hasMultiSelection,
		enableAnimation,
		isDraggingBlocks,
	} = useSelect( selector, [ rootClientId ] );

	const fallbackRef = useRef();
	const element = __experimentalPassedProps.ref || ref || fallbackRef;

	const Container = rootClientId ? __experimentalTagName : RootContainer;
	const dropTargetIndex = useBlockDropZone( {
		element,
		rootClientId,
	} );

	const isAppenderDropTarget =
		dropTargetIndex === blockClientIds.length && isDraggingBlocks;

	return (
		<Container
			{ ...__experimentalPassedProps }
			ref={ element }
			className={ classnames(
				'block-editor-block-list__layout',
				className,
				__experimentalPassedProps.className
			) }
		>
			{ blockClientIds.map( ( clientId, index ) => {
				const isBlockInSelection = hasMultiSelection
					? multiSelectedBlockClientIds.includes( clientId )
					: selectedBlockClientId === clientId;

				const isDropTarget =
					dropTargetIndex === index && isDraggingBlocks;

				return (
					<AsyncModeProvider
						key={ clientId }
						value={ ! isBlockInSelection }
					>
						<BlockListBlock
							rootClientId={ rootClientId }
							clientId={ clientId }
							// This prop is explicitely computed and passed down
							// to avoid being impacted by the async mode
							// otherwise there might be a small delay to trigger the animation.
							index={ index }
							enableAnimation={ enableAnimation }
							className={ classnames( {
								'is-drop-target': isDropTarget,
								'is-dropping-horizontally':
									isDropTarget &&
									orientation === 'horizontal',
							} ) }
						/>
					</AsyncModeProvider>
				);
			} ) }
			<BlockListAppender
				tagName={ __experimentalAppenderTagName }
				rootClientId={ rootClientId }
				renderAppender={ renderAppender }
				className={ classnames( {
					'is-drop-target': isAppenderDropTarget,
					'is-dropping-horizontally':
						isAppenderDropTarget && orientation === 'horizontal',
				} ) }
			/>
		</Container>
	);
}

const ForwardedBlockList = forwardRef( BlockList );

// This component needs to always be synchronous
// as it's the one changing the async mode
// depending on the block selection.
export default forwardRef( ( props, ref ) => {
	return (
		<AsyncModeProvider value={ false }>
			<ForwardedBlockList ref={ ref } { ...props } />
		</AsyncModeProvider>
	);
} );
