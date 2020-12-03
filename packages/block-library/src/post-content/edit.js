/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import PostContentInnerBlocks from './inner-blocks';

export default function PostContentEdit( {
	context: { postId: contextPostId, postType: contextPostType },
} ) {
	const blockProps = useBlockProps();
	if ( contextPostId && contextPostType ) {
		return (
			<div { ...blockProps }>
				<PostContentInnerBlocks
					postType={ contextPostType }
					postId={ contextPostId }
				/>
			</div>
		);
	}

	return (
		<div { ...blockProps }>
			<div className="wp-block-post-content__placeholder">
				<span>{ __( 'This is a placeholder for post content.' ) }</span>
			</div>
		</div>
	);
}
