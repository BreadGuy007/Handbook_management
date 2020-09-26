/**
 * WordPress dependencies
 */
import { Spinner, Popover } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { NavigableToolbar, BlockToolbar } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import SaveButton from './save-button';
import BlockInspectorDropdown from './block-inspector-dropdown';

export default function Toolbar( { isPending, navigationPost } ) {
	return (
		<div className="edit-navigation-toolbar">
			{ isPending ? (
				<Spinner />
			) : (
				<>
					<NavigableToolbar
						className="edit-navigation-toolbar__block-tools"
						aria-label={ __( 'Block tools' ) }
					>
						<BlockToolbar
							hideDragHandle
							__experimentalExpandedControl
						/>
					</NavigableToolbar>
					<Popover.Slot name="block-toolbar" />
					<BlockInspectorDropdown />
					<SaveButton navigationPost={ navigationPost } />
				</>
			) }
		</div>
	);
}
