/**
 * WordPress dependencies
 */
import { useState, useMemo, memo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	BlockContextProvider,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
	__experimentalUseBlockPreview as useBlockPreview,
} from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { convertToTree } from './util';

const TEMPLATE = [
	[ 'core/comment-author-avatar' ],
	[ 'core/comment-author-name' ],
	[ 'core/comment-date' ],
	[ 'core/comment-content' ],
	[ 'core/comment-reply-link' ],
	[ 'core/comment-edit-link' ],
];

/**
 * Component which renders the inner blocks of the Comment Template.
 *
 * @param {Object} props                    Component props.
 * @param {Array}  [props.comment]          - A comment object.
 * @param {Array}  [props.activeComment]    - The block that is currently active.
 * @param {Array}  [props.setActiveComment] - The setter for activeComment.
 * @param {Array}  [props.firstComment]     - First comment in the array.
 * @param {Array}  [props.blocks]           - Array of blocks returned from
 *                                          getBlocks() in parent .
 * @return {WPElement}                 		Inner blocks of the Comment Template
 */
function CommentTemplateInnerBlocks( {
	comment,
	activeComment,
	setActiveComment,
	firstComment,
	blocks,
} ) {
	const { children, ...innerBlocksProps } = useInnerBlocksProps(
		{},
		{ template: TEMPLATE }
	);
	return (
		<li { ...innerBlocksProps }>
			{ comment === ( activeComment || firstComment ) ? children : null }

			{ /* To avoid flicker when switching active block contexts, a preview
			is ALWAYS rendered and the preview for the active block is hidden. 
			This ensures that when switching the active block, the component is not 
			mounted again but rather it only toggles the `isHidden` prop.
			
			The same strategy is used for preventing the flicker in the Post Template
			block. */ }
			<MemoizedCommentTemplatePreview
				blocks={ blocks }
				comment={ comment }
				setActiveComment={ setActiveComment }
				isHidden={ comment === ( activeComment || firstComment ) }
			/>

			{ comment?.children?.length > 0 ? (
				<CommentsList
					comments={ comment.children }
					activeComment={ activeComment }
					setActiveComment={ setActiveComment }
					blocks={ blocks }
				/>
			) : null }
		</li>
	);
}

const CommentTemplatePreview = ( {
	blocks,
	comment,
	setActiveComment,
	isHidden,
} ) => {
	const blockPreviewProps = useBlockPreview( {
		blocks,
	} );

	const handleOnClick = () => {
		setActiveComment( comment );
	};

	// We have to hide the preview block if the `comment` props points to
	// the curently active block!

	// Or, to put it differently, every preview block is visible unless it is the
	// currently active block - in this case we render its inner blocks.
	const style = {
		display: isHidden ? 'none' : undefined,
	};

	return (
		<div
			{ ...blockPreviewProps }
			tabIndex={ 0 }
			role="button"
			style={ style }
			// eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
			onClick={ handleOnClick }
			onKeyPress={ handleOnClick }
		/>
	);
};

const MemoizedCommentTemplatePreview = memo( CommentTemplatePreview );

/**
 * Component that renders a list of (nested) comments. It is called recursively.
 *
 * @param {Object} props                    Component props.
 * @param {Array}  [props.comments]         - Array of comment objects.
 * @param {Array}  [props.blockProps]       - Props from parent's `useBlockProps()`.
 * @param {Array}  [props.activeComment]    - The block that is currently active.
 * @param {Array}  [props.setActiveComment] - The setter for activeComment.
 * @param {Array}  [props.blocks]           - Array of blocks returned from
 *                                          getBlocks() in parent .
 * @return {WPElement}                 		List of comments.
 */
const CommentsList = ( {
	comments,
	blockProps,
	activeComment,
	setActiveComment,
	blocks,
} ) => (
	<ol { ...blockProps }>
		{ comments &&
			comments.map( ( comment ) => (
				<BlockContextProvider
					key={ comment.commentId }
					value={ comment }
				>
					<CommentTemplateInnerBlocks
						comment={ comment }
						activeComment={ activeComment }
						setActiveComment={ setActiveComment }
						blocks={ blocks }
						firstComment={ comments[ 0 ] }
					/>
				</BlockContextProvider>
			) ) }
	</ol>
);

export default function CommentTemplateEdit( {
	clientId,
	context: { postId, 'comments/perPage': perPage, 'comments/order': order },
} ) {
	const blockProps = useBlockProps();

	const [ activeComment, setActiveComment ] = useState();
	const { commentOrder, commentsPerPage } = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		return getSettings().__experimentalDiscussionSettings;
	} );
	const { rawComments, blocks } = useSelect(
		( select ) => {
			const { getEntityRecords } = select( coreStore );
			const { getBlocks } = select( blockEditorStore );

			const commentQuery = {
				post: postId,
				status: 'approve',
				context: 'embed',
				order: order || commentOrder,
			};

			if ( order ) {
				commentQuery.order = order;
			}
			return {
				rawComments: getEntityRecords(
					'root',
					'comment',
					commentQuery
				),
				blocks: getBlocks( clientId ),
			};
		},
		[ postId, clientId, order ]
	);

	// TODO: Replicate the logic used on the server.
	perPage = perPage || commentsPerPage;
	// We convert the flat list of comments to tree.
	// Then, we show only a maximum of `perPage` number of comments.
	// This is because passing `per_page` to `getEntityRecords()` does not
	// take into account nested comments.
	const comments = useMemo(
		() => convertToTree( rawComments ).slice( 0, perPage ),
		[ rawComments, perPage ]
	);

	if ( ! rawComments ) {
		return (
			<p { ...blockProps }>
				<Spinner />
			</p>
		);
	}

	if ( ! comments.length ) {
		return <p { ...blockProps }> { __( 'No results found.' ) }</p>;
	}

	return (
		<CommentsList
			comments={ comments }
			blockProps={ blockProps }
			blocks={ blocks }
			activeComment={ activeComment }
			setActiveComment={ setActiveComment }
		/>
	);
}
