/**
 * WordPress dependencies
 */
import { useEffect, useCallback } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { useShortcut } from '@wordpress/keyboard-shortcuts';
import { __ } from '@wordpress/i18n';

function MenuEditorShortcuts( { saveBlocks } ) {
	useShortcut(
		'core/edit-navigation/save-menu',
		useCallback( ( event ) => {
			event.preventDefault();
			saveBlocks();
		} ),
		{
			bindGlobal: true,
		}
	);

	return null;
}

function RegisterMenuEditorShortcuts() {
	const { registerShortcut } = useDispatch( 'core/keyboard-shortcuts' );
	useEffect( () => {
		registerShortcut( {
			name: 'core/edit-navigation/save-menu',
			category: 'global',
			description: __( 'Save the menu currently being edited.' ),
			keyCombination: {
				modifier: 'primary',
				character: 's',
			},
		} );
	}, [ registerShortcut ] );

	return null;
}

MenuEditorShortcuts.Register = RegisterMenuEditorShortcuts;

export default MenuEditorShortcuts;
