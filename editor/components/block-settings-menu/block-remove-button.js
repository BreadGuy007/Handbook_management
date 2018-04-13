/**
 * External dependencies
 */
import { flow, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { compose } from '@wordpress/element';
import { withDispatch } from '@wordpress/data';
import { withEditorSettings } from '@wordpress/blocks';

export function BlockRemoveButton( { onRemove, onClick = noop, isLocked, small = false, role } ) {
	if ( isLocked ) {
		return null;
	}

	const label = __( 'Remove' );

	return (
		<IconButton
			className="editor-block-settings-menu__control"
			onClick={ flow( onRemove, onClick ) }
			icon="trash"
			label={ small ? label : undefined }
			role={ role }
		>
			{ ! small && label }
		</IconButton>
	);
}

export default compose(
	withDispatch( ( dispatch, { uids } ) => ( {
		onRemove() {
			dispatch( 'core/editor' ).removeBlocks( uids );
		},
	} ) ),
	withEditorSettings( ( settings ) => {
		const { templateLock } = settings;

		return {
			isLocked: !! templateLock,
		};
	} ),
)( BlockRemoveButton );
