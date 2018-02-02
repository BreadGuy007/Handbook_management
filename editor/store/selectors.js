/**
 * External dependencies
 */
import moment from 'moment';
import {
	first,
	get,
	has,
	last,
	reduce,
	compact,
	find,
	some,
	unionWith,
} from 'lodash';
import createSelector from 'rememo';

/**
 * WordPress dependencies
 */
import { serialize, getBlockType, getBlockTypes } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/***
 * Module constants
 */
const MAX_RECENT_BLOCKS = 8;
export const POST_UPDATE_TRANSACTION_ID = 'post-update';

/**
 * Returns the state of legacy meta boxes.
 *
 * @param   {Object} state Global application state.
 * @returns {Object}       State of meta boxes.
 */
export function getMetaBoxes( state ) {
	return state.metaBoxes;
}

/**
 * Returns the state of legacy meta boxes.
 *
 * @param {Object} state    Global application state.
 * @param {string} location Location of the meta box.
 *
 * @returns {Object} State of meta box at specified location.
 */
export function getMetaBox( state, location ) {
	return getMetaBoxes( state )[ location ];
}

/**
 * Returns true if the post is using Meta Boxes
 *
 * @param  {Object} state Global application state
 * @return {boolean}      Whether there are metaboxes or not.
 */
export const hasMetaBoxes = createSelector(
	( state ) => {
		return some( getMetaBoxes( state ), ( metaBox ) => {
			return metaBox.isActive;
		} );
	},
	( state ) => state.metaBoxes,
);

/**
 * Returns true if the the Meta Boxes are being saved.
 *
 * @param   {Object}  state Global application state.
 * @returns {boolean}       Whether the metaboxes are being saved.
 */
export function isSavingMetaBoxes( state ) {
	return state.isSavingMetaBoxes;
}

/**
 * Returns true if any past editor history snapshots exist, or false otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether undo history exists.
 */
export function hasEditorUndo( state ) {
	return state.editor.past.length > 0;
}

/**
 * Returns true if any future editor history snapshots exist, or false
 * otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether redo history exists.
 */
export function hasEditorRedo( state ) {
	return state.editor.future.length > 0;
}

/**
 * Returns true if the currently edited post is yet to be saved, or false if
 * the post has been saved.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether the post is new.
 */
export function isEditedPostNew( state ) {
	return getCurrentPost( state ).status === 'auto-draft';
}

/**
 * Returns true if there are unsaved values for the current edit session, or
 * false if the editing state matches the saved or new post.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether unsaved values exist.
 */
export function isEditedPostDirty( state ) {
	return state.editor.isDirty;
}

/**
 * Returns true if there are no unsaved values for the current edit session and if
 * the currently edited post is new (and has never been saved before).
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether new post and unsaved values exist.
 */
export function isCleanNewPost( state ) {
	return ! isEditedPostDirty( state ) && isEditedPostNew( state );
}

/**
 * Returns the post currently being edited in its last known saved state, not
 * including unsaved edits. Returns an object containing relevant default post
 * values if the post has not yet been saved.
 *
 * @param {Object} state Global application state.
 *
 * @returns {Object} Post object.
 */
export function getCurrentPost( state ) {
	return state.currentPost;
}

/**
 * Returns the post type of the post currently being edited.
 *
 * @param {Object} state Global application state.
 *
 * @returns {string} Post type.
 */
export function getCurrentPostType( state ) {
	return state.currentPost.type;
}

/**
 * Returns the slug of the post currently being edited.
 *
 * @param {Object} state Global application state.
 *
 * @returns {string} Slug.
 */
export function getCurrentPostSlug( state ) {
	return getEditedPostAttribute( state, 'slug' );
}

/**
 * Returns the ID of the post currently being edited, or null if the post has
 * not yet been saved.
 *
 * @param {Object} state Global application state.
 *
 * @returns {?number} ID of current post.
 */
export function getCurrentPostId( state ) {
	return getCurrentPost( state ).id || null;
}

/**
 * Returns the number of revisions of the post currently being edited.
 *
 * @param {Object} state Global application state.
 *
 * @returns {number} Number of revisions.
 */
export function getCurrentPostRevisionsCount( state ) {
	return get( getCurrentPost( state ), 'revisions.count', 0 );
}

/**
 * Returns the last revision ID of the post currently being edited,
 * or null if the post has no revisions.
 *
 * @param {Object} state Global application state.
 *
 * @returns {?number} ID of the last revision.
 */
export function getCurrentPostLastRevisionId( state ) {
	return get( getCurrentPost( state ), 'revisions.last_id', null );
}

/**
 * Returns any post values which have been changed in the editor but not yet
 * been saved.
 *
 * @param {Object} state Global application state.
 *
 * @returns {Object} Object of key value pairs comprising unsaved edits.
 */
export function getPostEdits( state ) {
	return get( state, [ 'editor', 'present', 'edits' ], {} );
}

/**
 * Returns a single attribute of the post being edited, preferring the unsaved
 * edit if one exists, but falling back to the attribute for the last known
 * saved state of the post.
 *
 * @param {Object} state         Global application state.
 * @param {string} attributeName Post attribute name.
 *
 * @returns {*} Post attribute value.
 */
export function getEditedPostAttribute( state, attributeName ) {
	const edits = getPostEdits( state );
	return edits[ attributeName ] === undefined ?
		state.currentPost[ attributeName ] :
		edits[ attributeName ];
}

/**
 * Returns the current visibility of the post being edited, preferring the
 * unsaved value if different than the saved post. The return value is one of
 * "private", "password", or "public".
 *
 * @param {Object} state Global application state.
 *
 * @returns {string} Post visibility.
 */
export function getEditedPostVisibility( state ) {
	const status = getEditedPostAttribute( state, 'status' );
	const password = getEditedPostAttribute( state, 'password' );

	if ( status === 'private' ) {
		return 'private';
	} else if ( password ) {
		return 'password';
	}
	return 'public';
}

/**
 * Return true if the current post has already been published.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether the post has been published.
 */
export function isCurrentPostPublished( state ) {
	const post = getCurrentPost( state );

	return [ 'publish', 'private' ].indexOf( post.status ) !== -1 ||
		( post.status === 'future' && moment( post.date ).isBefore( moment() ) );
}

/**
 * Return true if the post being edited can be published.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether the post can been published.
 */
export function isEditedPostPublishable( state ) {
	const post = getCurrentPost( state );
	return isEditedPostDirty( state ) || hasMetaBoxes( state ) || [ 'publish', 'private', 'future' ].indexOf( post.status ) === -1;
}

/**
 * Returns true if the post can be saved, or false otherwise. A post must
 * contain a title, an excerpt, or non-empty content to be valid for save.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether the post can be saved.
 */
export function isEditedPostSaveable( state ) {
	return (
		!! getEditedPostTitle( state ) ||
		!! getEditedPostExcerpt( state ) ||
		!! getEditedPostContent( state )
	);
}

/**
 * Return true if the post being edited is being scheduled. Preferring the
 * unsaved status values.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether the post has been published.
 */
export function isEditedPostBeingScheduled( state ) {
	const date = getEditedPostAttribute( state, 'date' );
	// Adding 1 minute as an error threshold between the server and the client dates.
	const now = moment().add( 1, 'minute' );

	return moment( date ).isAfter( now );
}

/**
 * Returns the raw title of the post being edited, preferring the unsaved value
 * if different than the saved post.
 *
 * @param {Object} state Global application state.
 *
 * @returns {string} Raw post title.
 */
export function getEditedPostTitle( state ) {
	const editedTitle = getPostEdits( state ).title;
	if ( editedTitle !== undefined ) {
		return editedTitle;
	}
	const currentPost = getCurrentPost( state );
	if ( currentPost.title && currentPost.title ) {
		return currentPost.title;
	}
	return '';
}

/**
 * Gets the document title to be used.
 *
 * @param {Object} state Global application state.
 *
 * @returns {string} Document title.
 */
export function getDocumentTitle( state ) {
	let title = getEditedPostTitle( state );

	if ( ! title.trim() ) {
		title = isCleanNewPost( state ) ? __( 'New post' ) : __( '(Untitled)' );
	}
	return title;
}

/**
 * Returns the raw excerpt of the post being edited, preferring the unsaved
 * value if different than the saved post.
 *
 * @param {Object} state Global application state.
 *
 * @returns {string} Raw post excerpt.
 */
export function getEditedPostExcerpt( state ) {
	return state.editor.present.edits.excerpt === undefined ?
		state.currentPost.excerpt :
		state.editor.present.edits.excerpt;
}

/**
 * Returns a URL to preview the post being edited.
 *
 * @param {Object} state Global application state.
 *
 * @returns {string} Preview URL.
 */
export function getEditedPostPreviewLink( state ) {
	const link = state.currentPost.link;
	if ( ! link ) {
		return null;
	}

	return addQueryArgs( link, { preview: 'true' } );
}

/**
 * Returns a block given its unique ID. This is a parsed copy of the block,
 * containing its `blockName`, identifier (`uid`), and current `attributes`
 * state. This is not the block's registration settings, which must be
 * retrieved from the blocks module registration store.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @returns {Object} Parsed block object.
 */
export const getBlock = createSelector(
	( state, uid ) => {
		const block = state.editor.present.blocksByUid[ uid ];
		if ( ! block ) {
			return null;
		}

		const type = getBlockType( block.name );
		if ( ! type || ! type.attributes ) {
			return block;
		}

		const metaAttributes = reduce( type.attributes, ( result, value, key ) => {
			if ( value.source === 'meta' ) {
				result[ key ] = getPostMeta( state, value.meta );
			}

			return result;
		}, {} );

		if ( ! Object.keys( metaAttributes ).length ) {
			return block;
		}

		return {
			...block,
			attributes: {
				...block.attributes,
				...metaAttributes,
			},
		};
	},
	( state, uid ) => [
		get( state, [ 'editor', 'present', 'blocksByUid', uid ] ),
		get( state, [ 'editor', 'present', 'edits', 'meta' ] ),
		get( state, 'currentPost.meta' ),
	]
);

function getPostMeta( state, key ) {
	return has( state, [ 'editor', 'present', 'edits', 'meta', key ] ) ?
		get( state, [ 'editor', 'present', 'edits', 'meta', key ] ) :
		get( state, [ 'currentPost', 'meta', key ] );
}

/**
 * Returns all block objects for the current post being edited as an array in
 * the order they appear in the post.
 * Note: It's important to memoize this selector to avoid return a new instance on each call
 *
 * @param {Object} state Global application state.
 *
 * @returns {Object[]} Post blocks.
 */
export const getBlocks = createSelector(
	( state ) => {
		return state.editor.present.blockOrder.map( ( uid ) => getBlock( state, uid ) );
	},
	( state ) => [
		state.editor.present.blockOrder,
		state.editor.present.blocksByUid,
	]
);

/**
 * Returns the number of blocks currently present in the post.
 *
 * @param {Object} state Global application state.
 *
 * @returns {number} Number of blocks in the post.
 */
export function getBlockCount( state ) {
	return getBlockUids( state ).length;
}

/**
 * Returns the number of blocks currently selected in the post.
 *
 * @param {Object} state Global application state.
 *
 * @returns {number} Number of blocks selected in the post.
 */
export function getSelectedBlockCount( state ) {
	const multiSelectedBlockCount = getMultiSelectedBlockUids( state ).length;

	if ( multiSelectedBlockCount ) {
		return multiSelectedBlockCount;
	}

	return state.blockSelection.start ? 1 : 0;
}

/**
 * Returns the currently selected block, or null if there is no selected block.
 *
 * @param {Object} state Global application state.
 *
 * @returns {?Object} Selected block.
 */
export function getSelectedBlock( state ) {
	const { start, end } = state.blockSelection;
	if ( start !== end || ! start ) {
		return null;
	}

	return getBlock( state, start );
}

/**
 * Returns the current multi-selection set of blocks unique IDs, or an empty
 * array if there is no multi-selection.
 *
 * @param {Object} state Global application state.
 *
 * @returns {Array} Multi-selected block unique IDs.
 */
export const getMultiSelectedBlockUids = createSelector(
	( state ) => {
		const { blockOrder } = state.editor.present;
		const { start, end } = state.blockSelection;
		if ( start === end ) {
			return [];
		}

		const startIndex = blockOrder.indexOf( start );
		const endIndex = blockOrder.indexOf( end );

		if ( startIndex > endIndex ) {
			return blockOrder.slice( endIndex, startIndex + 1 );
		}

		return blockOrder.slice( startIndex, endIndex + 1 );
	},
	( state ) => [
		state.editor.present.blockOrder,
		state.blockSelection.start,
		state.blockSelection.end,
	],
);

/**
 * Returns the current multi-selection set of blocks, or an empty array if
 * there is no multi-selection.
 *
 * @param {Object} state Global application state.
 *
 * @returns {Array} Multi-selected block objects.
 */
export const getMultiSelectedBlocks = createSelector(
	( state ) => getMultiSelectedBlockUids( state ).map( ( uid ) => getBlock( state, uid ) ),
	( state ) => [
		state.editor.present.blockOrder,
		state.blockSelection.start,
		state.blockSelection.end,
		state.editor.present.blocksByUid,
		state.editor.present.edits.meta,
		state.currentPost.meta,
	]
);

/**
 * Returns the unique ID of the first block in the multi-selection set, or null
 * if there is no multi-selection.
 *
 * @param {Object} state Global application state.
 *
 * @returns {?string} First unique block ID in the multi-selection set.
 */
export function getFirstMultiSelectedBlockUid( state ) {
	return first( getMultiSelectedBlockUids( state ) ) || null;
}

/**
 * Returns the unique ID of the last block in the multi-selection set, or null
 * if there is no multi-selection.
 *
 * @param {Object} state Global application state.
 *
 * @returns {?string} Last unique block ID in the multi-selection set.
 */
export function getLastMultiSelectedBlockUid( state ) {
	return last( getMultiSelectedBlockUids( state ) ) || null;
}

/**
 * Returns true if a multi-selection exists, and the block corresponding to the
 * specified unique ID is the first block of the multi-selection set, or false
 * otherwise.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @returns {boolean} Whether block is first in mult-selection.
 */
export function isFirstMultiSelectedBlock( state, uid ) {
	return getFirstMultiSelectedBlockUid( state ) === uid;
}

/**
 * Returns true if the unique ID occurs within the block multi-selection, or
 * false otherwise.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @returns {boolean} Whether block is in multi-selection set.
 */
export function isBlockMultiSelected( state, uid ) {
	return getMultiSelectedBlockUids( state ).indexOf( uid ) !== -1;
}

/**
 * Returns the unique ID of the block which begins the multi-selection set, or
 * null if there is no multi-selection.
 *
 * N.b.: This is not necessarily the first uid in the selection. See
 * getFirstMultiSelectedBlockUid().
 *
 * @param {Object} state Global application state.
 *
 * @returns {?string} Unique ID of block beginning multi-selection.
 */
export function getMultiSelectedBlocksStartUid( state ) {
	const { start, end } = state.blockSelection;
	if ( start === end ) {
		return null;
	}
	return start || null;
}

/**
 * Returns the unique ID of the block which ends the multi-selection set, or
 * null if there is no multi-selection.
 *
 * N.b.: This is not necessarily the last uid in the selection. See
 * getLastMultiSelectedBlockUid().
 *
 * @param {Object} state Global application state.
 *
 * @returns {?string} Unique ID of block ending multi-selection.
 */
export function getMultiSelectedBlocksEndUid( state ) {
	const { start, end } = state.blockSelection;
	if ( start === end ) {
		return null;
	}
	return end || null;
}

/**
 * Returns an array containing all block unique IDs of the post being edited,
 * in the order they appear in the post.
 *
 * @param {Object} state Global application state.
 *
 * @returns {Array} Ordered unique IDs of post blocks.
 */
export function getBlockUids( state ) {
	return state.editor.present.blockOrder;
}

/**
 * Returns the index at which the block corresponding to the specified unique ID
 * occurs within the post block order, or `-1` if the block does not exist.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @returns {number} Index at which block exists in order.
 */
export function getBlockIndex( state, uid ) {
	return state.editor.present.blockOrder.indexOf( uid );
}

/**
 * Returns true if the block corresponding to the specified unique ID is the
 * first block of the post, or false otherwise.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @returns {boolean} Whether block is first in post.
 */
export function isFirstBlock( state, uid ) {
	return first( state.editor.present.blockOrder ) === uid;
}

/**
 * Returns true if the block corresponding to the specified unique ID is the
 * last block of the post, or false otherwise.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @returns {boolean} Whether block is last in post.
 */
export function isLastBlock( state, uid ) {
	return last( state.editor.present.blockOrder ) === uid;
}

/**
 * Returns the block object occurring before the one corresponding to the
 * specified unique ID.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @returns {Object} Block occurring before specified unique ID.
 */
export function getPreviousBlock( state, uid ) {
	const order = getBlockIndex( state, uid );
	return state.editor.present.blocksByUid[ state.editor.present.blockOrder[ order - 1 ] ] || null;
}

/**
 * Returns the block object occurring after the one corresponding to the
 * specified unique ID.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @returns {Object} Block occurring after specified unique ID.
 */
export function getNextBlock( state, uid ) {
	const order = getBlockIndex( state, uid );
	return state.editor.present.blocksByUid[ state.editor.present.blockOrder[ order + 1 ] ] || null;
}

/**
 * Returns true if the block corresponding to the specified unique ID is
 * currently selected and no multi-selection exists, or false otherwise.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @returns {boolean} Whether block is selected and multi-selection exists.
 */
export function isBlockSelected( state, uid ) {
	const { start, end } = state.blockSelection;

	if ( start !== end ) {
		return false;
	}

	return start === uid;
}

/**
 * Returns true if the block corresponding to the specified unique ID is
 * currently selected but isn't the last of the selected blocks. Here "last"
 * refers to the block sequence in the document, _not_ the sequence of
 * multi-selection, which is why `state.blockSelection.end` isn't used.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @returns {boolean} Whether block is selected and not the last in
 *                    the selection.
 */
export function isBlockWithinSelection( state, uid ) {
	if ( ! uid ) {
		return false;
	}

	const uids = getMultiSelectedBlockUids( state );
	const index = uids.indexOf( uid );
	return index > -1 && index < uids.length - 1;
}

/**
 * Returns true if the cursor is hovering the block corresponding to the
 * specified unique ID, or false otherwise.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @returns {boolean} Whether block is hovered.
 */
export function isBlockHovered( state, uid ) {
	return state.hoveredBlock === uid;
}

/**
 * Returns focus state of the block corresponding to the specified unique ID,
 * or null if the block is not selected. It is left to a block's implementation
 * to manage the content of this object, defaulting to an empty object.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @returns {Object} Block focus state.
 */
export function getBlockFocus( state, uid ) {
	// If there is multi-selection, keep returning the focus object for the start block.
	if ( ! isBlockSelected( state, uid ) && state.blockSelection.start !== uid ) {
		return null;
	}

	return state.blockSelection.focus;
}

/**
 * Whether in the process of multi-selecting or not.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} True if multi-selecting, false if not.
 */
export function isMultiSelecting( state ) {
	return state.blockSelection.isMultiSelecting;
}

/**
 * Whether is selection disable or not.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} True if multi is disable, false if not.
 */
export function isSelectionEnabled( state ) {
	return state.blockSelection.isEnabled;
}

/**
 * Returns thee block's editing mode.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @returns {Object} Block editing mode.
 */
export function getBlockMode( state, uid ) {
	return state.blocksMode[ uid ] || 'visual';
}

/**
 * Returns true if the user is typing, or false otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether user is typing.
 */
export function isTyping( state ) {
	return state.isTyping;
}

/**
 * Returns the insertion point, the index at which the new inserted block would
 * be placed. Defaults to the last position.
 *
 * @param {Object} state Global application state.
 *
 * @returns {?string} Unique ID after which insertion will occur.
 */
export function getBlockInsertionPoint( state ) {
	const lastMultiSelectedBlock = getLastMultiSelectedBlockUid( state );
	if ( lastMultiSelectedBlock ) {
		return getBlockIndex( state, lastMultiSelectedBlock ) + 1;
	}

	const selectedBlock = getSelectedBlock( state );
	if ( selectedBlock ) {
		return getBlockIndex( state, selectedBlock.uid ) + 1;
	}

	return state.editor.present.blockOrder.length;
}

/**
 * Returns true if we should show the block insertion point.
 *
 * @param {Object} state Global application state.
 *
 * @returns {?boolean} Whether the insertion point is visible or not.
 */
export function isBlockInsertionPointVisible( state ) {
	return state.isInsertionPointVisible;
}

/**
 * Returns true if the post is currently being saved, or false otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether post is being saved.
 */
export function isSavingPost( state ) {
	return state.saving.requesting || isSavingMetaBoxes( state );
}

/**
 * Returns true if a previous post save was attempted successfully, or false
 * otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether the post was saved successfully.
 */
export function didPostSaveRequestSucceed( state ) {
	return state.saving.successful;
}

/**
 * Returns true if a previous post save was attempted but failed, or false
 * otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether the post save failed.
 */
export function didPostSaveRequestFail( state ) {
	return !! state.saving.error;
}

/**
 * Returns a suggested post format for the current post, inferred only if there
 * is a single block within the post and it is of a type known to match a
 * default post format. Returns null if the format cannot be determined.
 *
 * @param {Object} state Global application state.
 *
 * @returns {?string} Suggested post format.
 */
export function getSuggestedPostFormat( state ) {
	const blocks = state.editor.present.blockOrder;

	let name;
	// If there is only one block in the content of the post grab its name
	// so we can derive a suitable post format from it.
	if ( blocks.length === 1 ) {
		name = state.editor.present.blocksByUid[ blocks[ 0 ] ].name;
	}

	// If there are two blocks in the content and the last one is a text blocks
	// grab the name of the first one to also suggest a post format from it.
	if ( blocks.length === 2 ) {
		if ( state.editor.present.blocksByUid[ blocks[ 1 ] ].name === 'core/paragraph' ) {
			name = state.editor.present.blocksByUid[ blocks[ 0 ] ].name;
		}
	}

	// We only convert to default post formats in core.
	switch ( name ) {
		case 'core/image':
			return 'image';
		case 'core/quote':
		case 'core/pullquote':
			return 'quote';
		case 'core/gallery':
			return 'gallery';
		case 'core/video':
		case 'core-embed/youtube':
		case 'core-embed/vimeo':
			return 'video';
		case 'core/audio':
		case 'core-embed/spotify':
		case 'core-embed/soundcloud':
			return 'audio';
	}

	return null;
}

/**
 * Returns the content of the post being edited, preferring raw string edit
 * before falling back to serialization of block state.
 *
 * @param {Object} state Global application state.
 *
 * @returns {string} Post content.
 */
export const getEditedPostContent = createSelector(
	( state ) => {
		const edits = getPostEdits( state );
		if ( 'content' in edits ) {
			return edits.content;
		}

		return serialize( getBlocks( state ) );
	},
	( state ) => [
		state.editor.present.edits.content,
		state.editor.present.blocksByUid,
		state.editor.present.blockOrder,
	],
);

/**
 * Returns the user notices array.
 *
 * @param {Object} state Global application state.
 *
 * @returns {Array} List of notices.
 */
export function getNotices( state ) {
	return state.notices;
}

/**
 * An item that appears in the inserter. Inserting this item will create a new
 * block. Inserter items encapsulate both regular blocks and reusable blocks.
 *
 * @typedef {Object} Editor.InserterItem
 * @property {string}   id                Unique identifier for the item.
 * @property {string}   name              The type of block to create.
 * @property {Object}   initialAttributes Attributes to pass to the newly created block.
 * @property {string}   title             Title of the item, as it appears in the inserter.
 * @property {string}   icon              Dashicon for the item, as it appears in the inserter.
 * @property {string}   category          Block category that the item is associated with.
 * @property {string[]} keywords          Keywords that can be searched to find this item.
 * @property {boolean}  isDisabled        Whether or not the user should be prevented from inserting this item.
 */

/**
 * Given a regular block type, constructs an item that appears in the inserter.
 *
 * @param {Object}           state             Global application state.
 * @param {string[]|boolean} enabledBlockTypes Enabled block types, or true/false to enable/disable all types.
 * @param {Object}           blockType         Block type, likely from getBlockType().
 *
 * @returns {Editor.InserterItem} Item that appears in inserter.
 */
function buildInserterItemFromBlockType( state, enabledBlockTypes, blockType ) {
	if ( ! enabledBlockTypes || ! blockType ) {
		return null;
	}

	const blockTypeIsDisabled = Array.isArray( enabledBlockTypes ) && ! enabledBlockTypes.includes( blockType.name );
	if ( blockTypeIsDisabled ) {
		return null;
	}

	if ( blockType.isPrivate ) {
		return null;
	}

	return {
		id: blockType.name,
		name: blockType.name,
		initialAttributes: {},
		title: blockType.title,
		icon: blockType.icon,
		category: blockType.category,
		keywords: blockType.keywords,
		isDisabled: !! blockType.useOnce && getBlocks( state ).some( block => block.name === blockType.name ),
	};
}

/**
 * Given a reusable block, constructs an item that appears in the inserter.
 *
 * @param {string[]|boolean} enabledBlockTypes Enabled block types, or true/false to enable/disable all types.
 * @param {Object}           reusableBlock     Reusable block, likely from getReusableBlock().
 *
 * @returns {Editor.InserterItem} Item that appears in inserter.
 */
function buildInserterItemFromReusableBlock( enabledBlockTypes, reusableBlock ) {
	if ( ! enabledBlockTypes || ! reusableBlock ) {
		return null;
	}

	const blockTypeIsDisabled = Array.isArray( enabledBlockTypes ) && ! enabledBlockTypes.includes( 'core/block' );
	if ( blockTypeIsDisabled ) {
		return null;
	}

	const referencedBlockType = getBlockType( reusableBlock.type );
	if ( ! referencedBlockType ) {
		return null;
	}

	return {
		id: `core/block/${ reusableBlock.id }`,
		name: 'core/block',
		initialAttributes: { ref: reusableBlock.id },
		title: reusableBlock.title,
		icon: referencedBlockType.icon,
		category: 'reusable-blocks',
		keywords: [],
		isDisabled: false,
	};
}

/**
 * Determines the items that appear in the the inserter. Includes both static
 * items (e.g. a regular block type) and dynamic items (e.g. a reusable block).
 *
 * @param {Object}           state             Global application state.
 * @param {string[]|boolean} enabledBlockTypes Enabled block types, or true/false to enable/disable all types.
 *
 * @returns {Editor.InserterItem[]} Items that appear in inserter.
 */
export function getInserterItems( state, enabledBlockTypes = true ) {
	if ( ! enabledBlockTypes ) {
		return [];
	}

	const staticItems = getBlockTypes().map( blockType =>
		buildInserterItemFromBlockType( state, enabledBlockTypes, blockType )
	);

	const dynamicItems = getReusableBlocks( state ).map( reusableBlock =>
		buildInserterItemFromReusableBlock( enabledBlockTypes, reusableBlock )
	);

	const items = [ ...staticItems, ...dynamicItems ];
	return compact( items );
}

const getRecentInserts = createSelector(
	state => {
		// Filter out any inserts that are associated with a block type that isn't registered
		const inserts = state.preferences.recentInserts.filter( insert => getBlockType( insert.name ) );

		// Common blocks that we'll use to pad out our list
		const commonInserts = getBlockTypes()
			.filter( blockType => blockType.category === 'common' )
			.map( blockType => ( { name: blockType.name } ) );

		const areInsertsEqual = ( a, b ) => a.name === b.name && a.ref === b.ref;
		return unionWith( inserts, commonInserts, areInsertsEqual );
	},
	state => state.preferences.recentInserts
);

/**
 * Determines the items that appear in the 'Recent' tab of the inserter.
 *
 * @param {Object}           state             Global application state.
 * @param {string[]|boolean} enabledBlockTypes Enabled block types, or true/false to enable/disable all types.
 *
 * @returns {Editor.InserterItem[]} Items that appear in the 'Recent' tab.
 */
export function getRecentInserterItems( state, enabledBlockTypes = true ) {
	if ( ! enabledBlockTypes ) {
		return [];
	}

	const items = getRecentInserts( state ).map( insert => {
		if ( insert.ref ) {
			const reusableBlock = getReusableBlock( state, insert.ref );
			return buildInserterItemFromReusableBlock( enabledBlockTypes, reusableBlock );
		}

		const blockType = getBlockType( insert.name );
		return buildInserterItemFromBlockType( state, enabledBlockTypes, blockType );
	} );

	return compact( items ).slice( 0, MAX_RECENT_BLOCKS );
}

/**
 * Returns the reusable block with the given ID.
 *
 * @param {Object} state Global application state.
 * @param {string} ref   The reusable block's ID.
 *
 * @returns {Object} The reusable block, or null if none exists.
 */
export function getReusableBlock( state, ref ) {
	return state.reusableBlocks.data[ ref ] || null;
}

/**
 * Returns whether or not the reusable block with the given ID is being saved.
 *
 * @param {*} state Global application state.
 * @param {*} ref   The reusable block's ID.
 *
 * @returns {boolean} Whether or not the reusable block is being saved.
 */
export function isSavingReusableBlock( state, ref ) {
	return state.reusableBlocks.isSaving[ ref ] || false;
}

/**
 * Returns an array of all reusable blocks.
 *
 * @param {Object} state Global application state.
 *
 * @returns {Array} An array of all reusable blocks.
 */
export function getReusableBlocks( state ) {
	return Object.values( state.reusableBlocks.data );
}

/**
 * Returns state object prior to a specified optimist transaction ID, or `null`
 * if the transaction corresponding to the given ID cannot be found.
 *
 * @param {Object} state         Current global application state.
 * @param {Object} transactionId Optimist transaction ID.
 *
 * @returns {Object} Global application state prior to transaction.
 */
export function getStateBeforeOptimisticTransaction( state, transactionId ) {
	const transaction = find( state.optimist, ( entry ) => (
		entry.beforeState &&
		get( entry.action, [ 'optimist', 'id' ] ) === transactionId
	) );

	return transaction ? transaction.beforeState : null;
}

/**
 * Returns true if the post is being published, or false otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @returns {boolean} Whether post is being published.
 */
export function isPublishingPost( state ) {
	if ( ! isSavingPost( state ) ) {
		return false;
	}

	// Saving is optimistic, so assume that current post would be marked as
	// published if publishing
	if ( ! isCurrentPostPublished( state ) ) {
		return false;
	}

	// Use post update transaction ID to retrieve the state prior to the
	// optimistic transaction
	const stateBeforeRequest = getStateBeforeOptimisticTransaction(
		state,
		POST_UPDATE_TRANSACTION_ID
	);

	// Consider as publishing when current post prior to request was not
	// considered published
	return !! stateBeforeRequest && ! isCurrentPostPublished( stateBeforeRequest );
}
