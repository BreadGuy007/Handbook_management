/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Dropdown, Button } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { info } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import TableOfContentsPanel from './panel';

function TableOfContents( { hasBlocks, hasOutlineItemsDisabled } ) {
	return (
		<Dropdown
			position="bottom"
			className="table-of-contents"
			contentClassName="table-of-contents__popover"
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					onClick={ hasBlocks ? onToggle : undefined }
					icon={ info }
					aria-expanded={ isOpen }
					label={ __( 'Content structure' ) }
					tooltipPosition="bottom"
					aria-disabled={ ! hasBlocks }
				/>
			) }
			renderContent={ ( { onClose } ) => (
				<TableOfContentsPanel
					onRequestClose={ onClose }
					hasOutlineItemsDisabled={ hasOutlineItemsDisabled }
				/>
			) }
		/>
	);
}

export default withSelect( ( select ) => {
	return {
		hasBlocks: !! select( 'core/block-editor' ).getBlockCount(),
	};
} )( TableOfContents );
