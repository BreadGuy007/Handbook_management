/**
 * External dependencies
 */
import { first, last } from 'lodash';
/**
 * WordPress dependencies
 */
import { useEffect, useCallback } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { useShortcut } from '@wordpress/keyboard-shortcuts';
import { __ } from '@wordpress/i18n';

function KeyboardShortcuts() {
	// Shortcuts Logic
	const { clientIds, rootBlocksClientIds } = useSelect( ( select ) => {
		const { getSelectedBlockClientIds, getBlockOrder } = select( 'core/block-editor' );
		return {
			clientIds: getSelectedBlockClientIds(),
			rootBlocksClientIds: getBlockOrder(),
		};
	}, [] );

	const {
		duplicateBlocks,
		removeBlocks,
		insertAfterBlock,
		insertBeforeBlock,
		multiSelect,
		clearSelectedBlock,
	} = useDispatch( 'core/block-editor' );

	// Prevents bookmark all Tabs shortcut in Chrome when devtools are closed.
	// Prevents reposition Chrome devtools pane shortcut when devtools are open.
	useShortcut( 'core/block-editor/duplicate', useCallback( ( event ) => {
		event.preventDefault();
		duplicateBlocks( clientIds );
	}, [ clientIds, duplicateBlocks ] ), { bindGlobal: true } );

	// Does not clash with any known browser/native shortcuts, but preventDefault
	// is used to prevent any obscure unknown shortcuts from triggering.
	useShortcut( 'core/block-editor/remove', useCallback( ( event ) => {
		event.preventDefault();
		removeBlocks( clientIds );
	}, [ clientIds, removeBlocks ] ), { bindGlobal: true } );

	// Does not clash with any known browser/native shortcuts, but preventDefault
	// is used to prevent any obscure unknown shortcuts from triggering.
	useShortcut( 'core/block-editor/insert-after', useCallback( ( event ) => {
		event.preventDefault();
		insertAfterBlock( last( clientIds ) );
	}, [ clientIds, insertAfterBlock ] ), { bindGlobal: true } );

	// Prevent 'view recently closed tabs' in Opera using preventDefault.
	useShortcut( 'core/block-editor/insert-before', useCallback( ( event ) => {
		event.preventDefault();
		insertBeforeBlock( first( clientIds ) );
	}, [ clientIds, insertBeforeBlock ] ), { bindGlobal: true } );

	useShortcut( 'core/block-editor/delete-multi-selection', useCallback( ( event ) => {
		if ( clientIds.length > 0 ) {
			event.preventDefault();
			removeBlocks( clientIds );
		}
	}, [ clientIds, removeBlocks ] ) );

	useShortcut( 'core/block-editor/select-all', useCallback( ( event ) => {
		event.preventDefault();
		multiSelect( first( rootBlocksClientIds ), last( rootBlocksClientIds ) );
	}, [ rootBlocksClientIds, multiSelect ] ) );

	useShortcut( 'core/block-editor/unselect', useCallback( ( event ) => {
		if ( clientIds.length > 1 ) {
			event.preventDefault();
			clearSelectedBlock();
			window.getSelection().removeAllRanges();
		}
	}, [ clientIds, clearSelectedBlock ] ) );

	return null;
}

function KeyboardShortcutsRegister() {
	// Registering the shortcuts
	const { registerShortcut } = useDispatch( 'core/keyboard-shortcuts' );
	useEffect( () => {
		registerShortcut( {
			name: 'core/block-editor/duplicate',
			category: 'block',
			description: __( 'Duplicate the selected block(s).' ),
			keyCombination: {
				modifier: 'primaryShift',
				character: 'd',
			},
		} );

		registerShortcut( {
			name: 'core/block-editor/remove',
			category: 'block',
			description: __( 'Remove the selected block(s).' ),
			keyCombination: {
				modifier: 'access',
				character: 'z',
			},
		} );

		registerShortcut( {
			name: 'core/block-editor/insert-before',
			category: 'block',
			description: __( 'Insert a new block before the selected block(s).' ),
			keyCombination: {
				modifier: 'primaryAlt',
				character: 't',
			},
		} );

		registerShortcut( {
			name: 'core/block-editor/insert-after',
			category: 'block',
			description: __( 'Insert a new block after the selected block(s).' ),
			keyCombination: {
				modifier: 'primaryAlt',
				character: 'y',
			},
		} );

		registerShortcut( {
			name: 'core/block-editor/delete-multi-selection',
			category: 'block',
			description: __( 'Remove multiple selected blocks.' ),
			keyCombination: {
				character: 'del',
			},
			aliases: [ {
				character: 'backspace',
			} ],
		} );

		registerShortcut( {
			name: 'core/block-editor/select-all',
			category: 'selection',
			description: __( 'Select all text when typing. Press again to select all blocks.' ),
			keyCombination: {
				modifier: 'primary',
				character: 'a',
			},
		} );

		registerShortcut( {
			name: 'core/block-editor/unselect',
			category: 'selections',
			description: __( 'Clear selection.' ),
			keyCombination: {
				character: 'escape',
			},
		} );
	}, [ registerShortcut ] );

	return null;
}

KeyboardShortcuts.Register = KeyboardShortcutsRegister;

export default KeyboardShortcuts;
