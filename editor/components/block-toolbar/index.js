/**
 * WordPress Dependencies
 */
import { BlockControls, BlockFormatControls } from '@wordpress/blocks';
import { withSelect } from '@wordpress/data';

/**
 * Internal Dependencies
 */
import './style.scss';
import BlockSwitcher from '../block-switcher';

function BlockToolbar( { block, mode } ) {
	if ( ! block || ! block.isValid || mode !== 'visual' ) {
		return null;
	}

	return (
		<div className="editor-block-toolbar">
			<BlockSwitcher uids={ [ block.uid ] } />
			<BlockControls.Slot />
			<BlockFormatControls.Slot />
		</div>
	);
}

export default withSelect( ( select ) => {
	const { getSelectedBlock, getBlockMode } = select( 'core/editor' );
	const block = getSelectedBlock();

	return {
		block,
		mode: block ? getBlockMode( block.uid ) : null,
	};
} )( BlockToolbar );
