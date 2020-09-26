/**
 * WordPress dependencies
 */
import { forwardRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { redo as redoIcon } from '@wordpress/icons';
import { displayShortcut } from '@wordpress/keycodes';

function RedoButton( props, ref ) {
	const hasRedo = useSelect( ( select ) => select( 'core' ).hasRedo() );
	const { redo } = useDispatch( 'core' );
	return (
		<Button
			icon={ redoIcon }
			label={ __( 'Redo' ) }
			shortcut={ displayShortcut.primaryShift( 'z' ) }
			// If there are no undo levels we don't want to actually disable this
			// button, because it will remove focus for keyboard users.
			// See: https://github.com/WordPress/gutenberg/issues/3486
			aria-disabled={ ! hasRedo }
			onClick={ hasRedo ? redo : undefined }
			ref={ ref }
			{ ...props }
		/>
	);
}

export default forwardRef( RedoButton );
