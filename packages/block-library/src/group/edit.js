/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import {
	InnerBlocks,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';

function GroupEdit( { className, clientId } ) {
	const hasInnerBlocks = useSelect(
		( select ) => {
			const { getBlock } = select( 'core/block-editor' );
			const block = getBlock( clientId );
			return !! ( block && block.innerBlocks.length );
		},
		[ clientId ]
	);

	return (
		<Block.div className={ className }>
			<div className="wp-block-group__inner-container">
				<InnerBlocks
					renderAppender={
						! hasInnerBlocks && InnerBlocks.ButtonBlockAppender
					}
				/>
			</div>
		</Block.div>
	);
}

export default GroupEdit;
