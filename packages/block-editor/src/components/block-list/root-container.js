/**
 * WordPress dependencies
 */
import { useRef, createContext } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import useMultiSelection from './use-multi-selection';
import { getBlockClientId } from '../../utils/dom';

/** @typedef {import('@wordpress/element').WPSyntheticEvent} WPSyntheticEvent */

export const Context = createContext();

function selector( select ) {
	const {
		getSelectedBlockClientId,
		hasMultiSelection,
	} = select( 'core/block-editor' );

	return {
		selectedBlockClientId: getSelectedBlockClientId(),
		hasMultiSelection: hasMultiSelection(),
	};
}

/**
 * Prevents default dragging behavior within a block.
 * To do: we must handle this in the future and clean up the drag target.
 * Previously dragging was prevented for multi-selected, but this is no longer
 * needed.
 *
 * @param {WPSyntheticEvent} event Synthetic drag event.
 */
function onDragStart( event ) {
	// Ensure we target block content, not block controls.
	if ( getBlockClientId( event.target ) ) {
		event.preventDefault();
	}
}

export default function RootContainer( { children, className } ) {
	const ref = useRef();
	const {
		selectedBlockClientId,
		hasMultiSelection,
	} = useSelect( selector, [] );
	const { selectBlock } = useDispatch( 'core/block-editor' );
	const onSelectionStart = useMultiSelection( ref );

	/**
	 * Marks the block as selected when focused and not already selected. This
	 * specifically handles the case where block does not set focus on its own
	 * (via `setFocus`), typically if there is no focusable input in the block.
	 *
	 * @param {WPSyntheticEvent} event
	 */
	function onFocus( event ) {
		if ( hasMultiSelection ) {
			return;
		}

		const clientId = getBlockClientId( event.target );

		if ( clientId && clientId !== selectedBlockClientId ) {
			selectBlock( clientId );
		}
	}

	return (
		<div
			ref={ ref }
			className={ className }
			onFocus={ onFocus }
			onDragStart={ onDragStart }
		>
			<Context.Provider value={ onSelectionStart }>
				{ children }
			</Context.Provider>
		</div>
	);
}
