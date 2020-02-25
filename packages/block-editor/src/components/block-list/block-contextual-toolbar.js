/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import NavigableToolbar from '../navigable-toolbar';
import { BlockToolbar } from '../';

function BlockContextualToolbar( { focusOnMount, ...props } ) {
	return (
		<div className="block-editor-block-contextual-toolbar-wrapper">
			<NavigableToolbar
				focusOnMount={ focusOnMount }
				className="block-editor-block-contextual-toolbar"
				/* translators: accessibility text for the block toolbar */
				aria-label={ __( 'Block tools' ) }
				{ ...props }
			>
				<BlockToolbar />
			</NavigableToolbar>
		</div>
	);
}

export default BlockContextualToolbar;
