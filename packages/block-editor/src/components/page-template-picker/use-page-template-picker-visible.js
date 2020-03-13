/**
 * WordPress dependencies
 */
import { isUnmodifiedDefaultBlock } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const __experimentalUsePageTemplatePickerVisible = () => {
	return useSelect( ( select ) => {
		const { getCurrentPostType } = select( 'core/editor' );

		const { getBlockOrder, getBlock } = select( 'core/block-editor' );

		const blocks = getBlockOrder();
		const isEmptyBlockList = blocks.length === 0;
		const firstBlock = ! isEmptyBlockList && getBlock( blocks[ 0 ] );
		const isOnlyUnmodifiedDefault =
			blocks.length === 1 && isUnmodifiedDefaultBlock( firstBlock );
		const isEmptyContent = isEmptyBlockList || isOnlyUnmodifiedDefault;
		const isPage = getCurrentPostType() === 'page';

		return isEmptyContent && isPage;
	}, [] );
};

export default __experimentalUsePageTemplatePickerVisible;
