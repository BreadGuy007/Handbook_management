/**
 * WordPress dependencies
 */
import { Draggable } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useContext, useEffect, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockDraggableChip from './draggable-chip';
import useScrollWhenDragging from './use-scroll-when-dragging';
import { BlockNodes } from '../block-list/root-container';

const BlockDraggable = ( {
	children,
	clientIds,
	cloneClassname,
	onDragStart,
	onDragEnd,
} ) => {
	const { srcRootClientId, index, isDraggable } = useSelect(
		( select ) => {
			const {
				getBlockIndex,
				getBlockRootClientId,
				getTemplateLock,
			} = select( 'core/block-editor' );
			const rootClientId =
				clientIds.length === 1
					? getBlockRootClientId( clientIds[ 0 ] )
					: null;
			const templateLock = rootClientId
				? getTemplateLock( rootClientId )
				: null;

			return {
				index: getBlockIndex( clientIds[ 0 ], rootClientId ),
				srcRootClientId: rootClientId,
				isDraggable: clientIds.length === 1 && 'all' !== templateLock,
			};
		},
		[ clientIds ]
	);
	const isDragging = useRef( false );
	const [ firstClientId ] = clientIds;
	const blockNodes = useContext( BlockNodes );
	const blockElement = blockNodes ? blockNodes[ firstClientId ] : undefined;
	const [
		startScrolling,
		scrollOnDragOver,
		stopScrolling,
	] = useScrollWhenDragging( blockElement );

	const { startDraggingBlocks, stopDraggingBlocks } = useDispatch(
		'core/block-editor'
	);

	// Stop dragging blocks if the block draggable is unmounted
	useEffect( () => {
		return () => {
			if ( isDragging.current ) {
				stopDraggingBlocks();
			}
		};
	}, [] );

	if ( ! isDraggable ) {
		return children( { isDraggable: false } );
	}

	const transferData = {
		type: 'block',
		srcIndex: index,
		srcClientId: clientIds[ 0 ],
		srcRootClientId,
	};

	return (
		<Draggable
			cloneClassname={ cloneClassname }
			elementId={ `block-${ clientIds[ 0 ] }` }
			transferData={ transferData }
			onDragStart={ ( event ) => {
				startDraggingBlocks();
				isDragging.current = true;

				startScrolling( event );

				if ( onDragStart ) {
					onDragStart();
				}
			} }
			onDragOver={ scrollOnDragOver }
			onDragEnd={ () => {
				stopDraggingBlocks();
				isDragging.current = false;

				stopScrolling();

				if ( onDragEnd ) {
					onDragEnd();
				}
			} }
			__experimentalDragComponent={
				<BlockDraggableChip clientIds={ clientIds } />
			}
		>
			{ ( { onDraggableStart, onDraggableEnd } ) => {
				return children( {
					isDraggable: true,
					onDraggableStart,
					onDraggableEnd,
				} );
			} }
		</Draggable>
	);
};

export default BlockDraggable;
