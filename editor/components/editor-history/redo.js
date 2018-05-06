/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/element';
import { keycodes } from '@wordpress/utils';

const { displayShortcut } = keycodes;

function EditorHistoryRedo( { hasRedo, redo } ) {
	return (
		<IconButton
			icon="redo"
			label={ __( 'Redo' ) }
			shortcut={ displayShortcut.primaryShift( 'z' ) }
			disabled={ ! hasRedo }
			onClick={ redo }
			className="editor-history__undo"
		/>
	);
}

export default compose( [
	withSelect( ( select ) => ( {
		hasRedo: select( 'core/editor' ).hasEditorRedo(),
	} ) ),
	withDispatch( ( dispatch ) => ( {
		redo: () => dispatch( 'core/editor' ).redo(),
	} ) ),
] )( EditorHistoryRedo );
