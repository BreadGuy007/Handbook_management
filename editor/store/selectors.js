/**
 * External dependencies
 */
import {
	map,
	first,
	get,
	has,
	intersection,
	last,
	reduce,
	size,
	compact,
	find,
	unionWith,
	includes,
	values,
	castArray,
} from 'lodash';
import createSelector from 'rememo';

/**
 * WordPress dependencies
 */
import { serialize, getBlockType, getBlockTypes } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { moment } from '@wordpress/date';

/***
 * Module constants
 */
const MAX_RECENT_BLOCKS = 9;
export const POST_UPDATE_TRANSACTION_ID = 'post-update';
const PERMALINK_POSTNAME_REGEX = /%(?:postname|pagename)%/;

/**
 * Shared reference to an empty array for cases where it is important to avoid
 * returning a new array reference on every invocation, as in a connected or
 * other pure component which performs `shouldComponentUpdate` check on props.
 * This should be used as a last resort, since the normalized data should be
 * maintained by the reducer result in state.
 *
 * @type {Array}
 */
const EMPTY_ARRAY = [];

/**
 * Returns true if any past editor history snapshots exist, or false otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether undo history exists.
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
 * @return {boolean} Whether redo history exists.
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
 * @return {boolean} Whether the post is new.
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
 * @return {boolean} Whether unsaved values exist.
 */
export function isEditedPostDirty( state ) {
	return state.editor.isDirty || inSomeHistory( state, isEditedPostDirty );
}

/**
 * Returns true if there are no unsaved values for the current edit session and if
 * the currently edited post is new (and has never been saved before).
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether new post and unsaved values exist.
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
 * @return {Object} Post object.
 */
export function getCurrentPost( state ) {
	return state.currentPost;
}

/**
 * Returns the post type of the post currently being edited.
 *
 * @param {Object} state Global application state.
 *
 * @return {string} Post type.
 */
export function getCurrentPostType( state ) {
	return state.currentPost.type;
}

/**
 * Returns the ID of the post currently being edited, or null if the post has
 * not yet been saved.
 *
 * @param {Object} state Global application state.
 *
 * @return {?number} ID of current post.
 */
export function getCurrentPostId( state ) {
	return getCurrentPost( state ).id || null;
}

/**
 * Returns the number of revisions of the post currently being edited.
 *
 * @param {Object} state Global application state.
 *
 * @return {number} Number of revisions.
 */
export function getCurrentPostRevisionsCount( state ) {
	return get( getCurrentPost( state ), [ 'revisions', 'count' ], 0 );
}

/**
 * Returns the last revision ID of the post currently being edited,
 * or null if the post has no revisions.
 *
 * @param {Object} state Global application state.
 *
 * @return {?number} ID of the last revision.
 */
export function getCurrentPostLastRevisionId( state ) {
	return get( getCurrentPost( state ), [ 'revisions', 'last_id' ], null );
}

/**
 * Returns any post values which have been changed in the editor but not yet
 * been saved.
 *
 * @param {Object} state Global application state.
 *
 * @return {Object} Object of key value pairs comprising unsaved edits.
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
 * @return {*} Post attribute value.
 */
export function getEditedPostAttribute( state, attributeName ) {
	const edits = getPostEdits( state );

	// Special cases
	switch ( attributeName ) {
		case 'content':
			return getEditedPostContent( state );
	}

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
 * @return {string} Post visibility.
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
 * Returns true if post is pending review.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether current post is pending review.
 */
export function isCurrentPostPending( state ) {
	return getCurrentPost( state ).status === 'pending';
}

/**
 * Return true if the current post has already been published.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether the post has been published.
 */
export function isCurrentPostPublished( state ) {
	const post = getCurrentPost( state );

	return [ 'publish', 'private' ].indexOf( post.status ) !== -1 ||
		( post.status === 'future' && moment( post.date ).isBefore( moment() ) );
}

/**
 * Returns true if post is already scheduled.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether current post is scheduled to be posted.
 */
export function isCurrentPostScheduled( state ) {
	return getCurrentPost( state ).status === 'future' && ! isCurrentPostPublished( state );
}

/**
 * Return true if the post being edited can be published.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether the post can been published.
 */
export function isEditedPostPublishable( state ) {
	const post = getCurrentPost( state );

	return isEditedPostDirty( state ) || [ 'publish', 'private', 'future' ].indexOf( post.status ) === -1;
}

/**
 * Returns true if the post can be saved, or false otherwise. A post must
 * contain a title, an excerpt, or non-empty content to be valid for save.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether the post can be saved.
 */
export function isEditedPostSaveable( state ) {
	return (
		!! getEditedPostAttribute( state, 'title' ) ||
		!! getEditedPostExcerpt( state ) ||
		! isEditedPostEmpty( state )
	);
}

/**
 * Returns true if the edited post has content. A post has content if it has at
 * least one block or otherwise has a non-empty content property assigned.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether post has content.
 */
export function isEditedPostEmpty( state ) {
	return (
		! getBlockCount( state ) &&
		! getEditedPostAttribute( state, 'content' )
	);
}

/**
 * Return true if the post being edited is being scheduled. Preferring the
 * unsaved status values.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether the post has been published.
 */
export function isEditedPostBeingScheduled( state ) {
	const date = moment( getEditedPostAttribute( state, 'date' ) );
	// Adding 1 minute as an error threshold between the server and the client dates.
	const now = moment().add( 1, 'minute' );

	return date.isAfter( now );
}

/**
 * Gets the document title to be used.
 *
 * @param {Object} state Global application state.
 *
 * @return {string} Document title.
 */
export function getDocumentTitle( state ) {
	let title = getEditedPostAttribute( state, 'title' );

	if ( ! title || ! title.trim() ) {
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
 * @return {string} Raw post excerpt.
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
 * @return {string} Preview URL.
 */
export function getEditedPostPreviewLink( state ) {
	const link = state.currentPost.link;
	if ( ! link ) {
		return null;
	}

	return addQueryArgs( link, { preview: 'true' } );
}

/**
 * Returns a new reference when the inner blocks of a given block UID change.
 * This is used exclusively as a memoized selector dependant, relying on this
 * selector's shared return value and recursively those of its inner blocks
 * defined as dependencies. This abuses mechanics of the selector memoization
 * to return from the original selector function only when dependants change.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @return {*} A value whose reference will change only when inner blocks of
 *             the given block UID change.
 */
export const getBlockDependantsCacheBust = createSelector(
	() => [],
	( state, uid ) => map(
		getBlockOrder( state, uid ),
		( innerBlockUID ) => getBlock( state, innerBlockUID ),
	),
);

/**
 * Returns a block's name given its UID, or null if no block exists with the
 * UID.
 *
 * @param {Object} state Editor state.
 * @param {string} uid   Block unique ID.
 *
 * @return {string} Block name.
 */
export function getBlockName( state, uid ) {
	const block = state.editor.present.blocksByUid[ uid ];
	return block ? block.name : null;
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
 * @return {Object} Parsed block object.
 */
export const getBlock = createSelector(
	( state, uid ) => {
		const block = state.editor.present.blocksByUid[ uid ];
		if ( ! block ) {
			return null;
		}

		let { attributes } = block;

		// Inject custom source attribute values.
		//
		// TODO: Create generic external sourcing pattern, not explicitly
		// targeting meta attributes.
		const type = getBlockType( block.name );
		if ( type ) {
			attributes = reduce( type.attributes, ( result, value, key ) => {
				if ( value.source === 'meta' ) {
					if ( result === attributes ) {
						result = { ...result };
					}

					result[ key ] = getPostMeta( state, value.meta );
				}

				return result;
			}, attributes );
		}

		return {
			...block,
			attributes,
			innerBlocks: getBlocks( state, uid ),
		};
	},
	( state, uid ) => [
		state.editor.present.blocksByUid[ uid ],
		getBlockDependantsCacheBust( state, uid ),
		state.editor.present.edits.meta,
		state.currentPost.meta,
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
 * @param {Object}  state   Global application state.
 * @param {?String} rootUID Optional root UID of block list.
 *
 * @return {Object[]} Post blocks.
 */
export const getBlocks = createSelector(
	( state, rootUID ) => {
		return map(
			getBlockOrder( state, rootUID ),
			( uid ) => getBlock( state, uid )
		);
	},
	( state ) => [
		state.editor.present.blockOrder,
		state.editor.present.blocksByUid,
	]
);

/**
 * Returns the total number of blocks, or the total number of blocks with a specific name in a post.
 * The number returned includes nested blocks.
 *
 * @param {Object}  state     Global application state.
 * @param {?String} blockName Optional block name, if specified only blocks of that type will be counted.
 *
 * @return {number} Number of blocks in the post, or number of blocks with name equal to blockName.
 */
export const getGlobalBlockCount = createSelector(
	( state, blockName ) => {
		if ( ! blockName ) {
			return size( state.editor.present.blocksByUid );
		}
		return reduce(
			state.editor.present.blocksByUid,
			( count, block ) => block.name === blockName ? count + 1 : count,
			0
		);
	},
	( state ) => [
		state.editor.present.blocksByUid,
	]
);

export const getBlocksByUID = createSelector(
	( state, uids ) => {
		return map( castArray( uids ), ( uid ) => getBlock( state, uid ) );
	},
	( state ) => [
		state.editor.present.blocksByUid,
		state.editor.present.blockOrder,
		state.editor.present.edits.meta,
		state.currentPost.meta,
		state.editor.present.blocksByUid,
	]
);

/**
 * Returns the number of blocks currently present in the post.
 *
 * @param {Object}  state   Global application state.
 * @param {?string} rootUID Optional root UID of block list.
 *
 * @return {number} Number of blocks in the post.
 */
export function getBlockCount( state, rootUID ) {
	return getBlockOrder( state, rootUID ).length;
}

/**
 * Returns the current block selection start. This value may be null, and it
 * may represent either a singular block selection or multi-selection start.
 * A selection is singular if its start and end match.
 *
 * @param {Object} state Global application state.
 *
 * @return {?string} UID of block selection start.
 */
export function getBlockSelectionStart( state ) {
	return state.blockSelection.start;
}

/**
 * Returns the current block selection end. This value may be null, and it
 * may represent either a singular block selection or multi-selection end.
 * A selection is singular if its start and end match.
 *
 * @param {Object} state Global application state.
 *
 * @return {?string} UID of block selection end.
 */
export function getBlockSelectionEnd( state ) {
	return state.blockSelection.end;
}

/**
 * Returns the number of blocks currently selected in the post.
 *
 * @param {Object} state Global application state.
 *
 * @return {number} Number of blocks selected in the post.
 */
export function getSelectedBlockCount( state ) {
	const multiSelectedBlockCount = getMultiSelectedBlockUids( state ).length;

	if ( multiSelectedBlockCount ) {
		return multiSelectedBlockCount;
	}

	return state.blockSelection.start ? 1 : 0;
}

/**
 * Returns true if there is a single selected block, or false otherwise.
 *
 * @param {Object} state Editor state.
 *
 * @return {boolean} Whether a single block is selected.
 */
export function hasSelectedBlock( state ) {
	const { start, end } = state.blockSelection;
	return !! start && start === end;
}

/**
 * Returns the currently selected block UID, or null if there is no selected
 * block.
 *
 * @param {Object} state Global application state.
 *
 * @return {?Object} Selected block UID.
 */
export function getSelectedBlockUID( state ) {
	const { start, end } = state.blockSelection;
	return start === end && start ? start : null;
}

/**
 * Returns the currently selected block, or null if there is no selected block.
 *
 * @param {Object} state Global application state.
 *
 * @return {?Object} Selected block.
 */
export function getSelectedBlock( state ) {
	const uid = getSelectedBlockUID( state );
	return uid ? getBlock( state, uid ) : null;
}

/**
 * Given a block UID, returns the root block from which the block is nested, an
 * empty string for top-level blocks, or null if the block does not exist.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block from which to find root UID.
 *
 * @return {?string} Root UID, if exists
 */
export function getBlockRootUID( state, uid ) {
	const { blockOrder } = state.editor.present;

	for ( const rootUID in blockOrder ) {
		if ( includes( blockOrder[ rootUID ], uid ) ) {
			return rootUID;
		}
	}

	return null;
}

/**
 * Returns the UID of the block adjacent one at the given reference startUID and modifier
 * directionality. Defaults start UID to the selected block, and direction as
 * next block. Returns null if there is no adjacent block.
 *
 * @param {Object}  state    Global application state.
 * @param {?string} startUID Optional UID of block from which to search.
 * @param {?number} modifier Directionality multiplier (1 next, -1 previous).
 *
 * @return {?string} Return the UID of the block, or null if none exists.
 */
export function getAdjacentBlockUid( state, startUID, modifier = 1 ) {
	// Default to selected block.
	if ( startUID === undefined ) {
		startUID = get( getSelectedBlock( state ), [ 'uid' ] );
	}

	// Try multi-selection starting at extent based on modifier.
	if ( startUID === undefined ) {
		if ( modifier < 0 ) {
			startUID = getFirstMultiSelectedBlockUid( state );
		} else {
			startUID = getLastMultiSelectedBlockUid( state );
		}
	}

	// Validate working start UID.
	if ( ! startUID ) {
		return null;
	}

	// Retrieve start block root UID, being careful to allow the falsey empty
	// string top-level root UID by explicitly testing against null.
	const rootUID = getBlockRootUID( state, startUID );
	if ( rootUID === null ) {
		return null;
	}

	const { blockOrder } = state.editor.present;
	const orderSet = blockOrder[ rootUID ];
	const index = orderSet.indexOf( startUID );
	const nextIndex = ( index + ( 1 * modifier ) );

	// Block was first in set and we're attempting to get previous.
	if ( nextIndex < 0 ) {
		return null;
	}

	// Block was last in set and we're attempting to get next.
	if ( nextIndex === orderSet.length ) {
		return null;
	}

	// Assume incremented index is within the set.
	return orderSet[ nextIndex ];
}

/**
 * Returns the previous block's UID from the given reference startUID. Defaults start
 * UID to the selected block. Returns null if there is no previous block.
 *
 * @param {Object}  state    Global application state.
 * @param {?string} startUID Optional UID of block from which to search.
 *
 * @return {?string} Adjacent block's UID, or null if none exists.
 */
export function getPreviousBlockUid( state, startUID ) {
	return getAdjacentBlockUid( state, startUID, -1 );
}

/**
 * Returns the next block's UID from the given reference startUID. Defaults start UID
 * to the selected block. Returns null if there is no next block.
 *
 * @param {Object}  state    Global application state.
 * @param {?string} startUID Optional UID of block from which to search.
 *
 * @return {?string} Adjacent block's UID, or null if none exists.
 */
export function getNextBlockUid( state, startUID ) {
	return getAdjacentBlockUid( state, startUID, 1 );
}

/**
 * Returns the initial caret position for the selected block.
 * This position is to used to position the caret properly when the selected block changes.
 *
 * @param {Object} state Global application state.
 *
 * @return {?Object} Selected block.
 */
export function getSelectedBlocksInitialCaretPosition( state ) {
	const { start, end } = state.blockSelection;
	if ( start !== end || ! start ) {
		return null;
	}

	return state.blockSelection.initialPosition;
}

/**
 * Returns the current multi-selection set of blocks unique IDs, or an empty
 * array if there is no multi-selection.
 *
 * @param {Object} state Global application state.
 *
 * @return {Array} Multi-selected block unique IDs.
 */
export const getMultiSelectedBlockUids = createSelector(
	( state ) => {
		const { start, end } = state.blockSelection;
		if ( start === end ) {
			return [];
		}

		// Retrieve root UID to aid in retrieving relevant nested block order,
		// being careful to allow the falsey empty string top-level root UID by
		// explicitly testing against null.
		const rootUID = getBlockRootUID( state, start );
		if ( rootUID === null ) {
			return [];
		}

		const blockOrder = getBlockOrder( state, rootUID );
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
 * @return {Array} Multi-selected block objects.
 */
export const getMultiSelectedBlocks = createSelector(
	( state ) => {
		const multiSelectedBlockUids = getMultiSelectedBlockUids( state );
		if ( ! multiSelectedBlockUids.length ) {
			return EMPTY_ARRAY;
		}

		return multiSelectedBlockUids.map( ( uid ) => getBlock( state, uid ) );
	},
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
 * @return {?string} First unique block ID in the multi-selection set.
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
 * @return {?string} Last unique block ID in the multi-selection set.
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
 * @return {boolean} Whether block is first in mult-selection.
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
 * @return {boolean} Whether block is in multi-selection set.
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
 * @return {?string} Unique ID of block beginning multi-selection.
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
 * @return {?string} Unique ID of block ending multi-selection.
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
 * in the order they appear in the post. Optionally accepts a root UID of the
 * block list for which the order should be returned, defaulting to the top-
 * level block order.
 *
 * @param {Object}  state   Global application state.
 * @param {?string} rootUID Optional root UID of block list.
 *
 * @return {Array} Ordered unique IDs of post blocks.
 */
export function getBlockOrder( state, rootUID ) {
	return state.editor.present.blockOrder[ rootUID || '' ] || EMPTY_ARRAY;
}

/**
 * Returns the index at which the block corresponding to the specified unique ID
 * occurs within the post block order, or `-1` if the block does not exist.
 *
 * @param {Object}  state   Global application state.
 * @param {string}  uid     Block unique ID.
 * @param {?string} rootUID Optional root UID of block list.
 *
 * @return {number} Index at which block exists in order.
 */
export function getBlockIndex( state, uid, rootUID ) {
	return getBlockOrder( state, rootUID ).indexOf( uid );
}

/**
 * Returns true if the block corresponding to the specified unique ID is
 * currently selected and no multi-selection exists, or false otherwise.
 *
 * @param {Object} state Global application state.
 * @param {string} uid   Block unique ID.
 *
 * @return {boolean} Whether block is selected and multi-selection exists.
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
 * @return {boolean} Whether block is selected and not the last in
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
 * Returns true if a multi-selection has been made, or false otherwise.
 *
 * @param {Object} state Editor state.
 *
 * @return {boolean} Whether multi-selection has been made.
 */
export function hasMultiSelection( state ) {
	const { start, end } = state.blockSelection;
	return start !== end;
}

/**
 * Whether in the process of multi-selecting or not. This flag is only true
 * while the multi-selection is being selected (by mouse move), and is false
 * once the multi-selection has been settled.
 *
 * @see hasMultiSelection
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} True if multi-selecting, false if not.
 */
export function isMultiSelecting( state ) {
	return state.blockSelection.isMultiSelecting;
}

/**
 * Whether is selection disable or not.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} True if multi is disable, false if not.
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
 * @return {Object} Block editing mode.
 */
export function getBlockMode( state, uid ) {
	return state.blocksMode[ uid ] || 'visual';
}

/**
 * Returns true if the user is typing, or false otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether user is typing.
 */
export function isTyping( state ) {
	return state.isTyping;
}

/**
 * Returns the insertion point, the index at which the new inserted block would
 * be placed. Defaults to the last index.
 *
 * @param {Object} state Global application state.
 *
 * @return {Object} Insertion point object with `rootUID`, `layout`, `index`
 */
export function getBlockInsertionPoint( state ) {
	let rootUID, layout, index;

	const { end } = state.blockSelection;
	if ( end ) {
		rootUID = getBlockRootUID( state, end ) || undefined;

		layout = get( getBlock( state, end ), [ 'attributes', 'layout' ] );
		index = getBlockIndex( state, end, rootUID ) + 1;
	} else {
		index = getBlockOrder( state ).length;
	}

	return { rootUID, layout, index };
}

/**
 * Returns true if we should show the block insertion point.
 *
 * @param {Object} state Global application state.
 *
 * @return {?boolean} Whether the insertion point is visible or not.
 */
export function isBlockInsertionPointVisible( state ) {
	return state.isInsertionPointVisible;
}

/**
 * Returns whether the blocks matches the template or not.
 *
 * @param {boolean} state
 * @return {?boolean} Whether the template is valid or not.
 */
export function isValidTemplate( state ) {
	return state.template.isValid;
}

/**
 * Returns the defined block template
 *
 * @param {boolean} state
 * @return {?Arary}        Block Template
 */
export function getTemplate( state ) {
	return state.template.template;
}

/**
 * Returns the defined block template lock
 *
 * @param {boolean} state
 * @return {?string}        Block Template Lock
 */
export function getTemplateLock( state ) {
	return state.template.lock;
}

/**
 * Returns true if the post is currently being saved, or false otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether post is being saved.
 */
export function isSavingPost( state ) {
	return state.saving.requesting;
}

/**
 * Returns true if a previous post save was attempted successfully, or false
 * otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether the post was saved successfully.
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
 * @return {boolean} Whether the post save failed.
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
 * @return {?string} Suggested post format.
 */
export function getSuggestedPostFormat( state ) {
	const blocks = getBlockOrder( state );

	let name;
	// If there is only one block in the content of the post grab its name
	// so we can derive a suitable post format from it.
	if ( blocks.length === 1 ) {
		name = getBlock( state, blocks[ 0 ] ).name;
	}

	// If there are two blocks in the content and the last one is a text blocks
	// grab the name of the first one to also suggest a post format from it.
	if ( blocks.length === 2 ) {
		if ( getBlock( state, blocks[ 1 ] ).name === 'core/paragraph' ) {
			name = getBlock( state, blocks[ 0 ] ).name;
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
 * @return {string} Post content.
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
 * @return {Array} List of notices.
 */
export function getNotices( state ) {
	return state.notices;
}

/**
 * An item that appears in the inserter. Inserting this item will create a new
 * block. Inserter items encapsulate both regular blocks and shared blocks.
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
 * @param {string[]|boolean} allowedBlockTypes Allowed block types, or true/false to enable/disable all types.
 * @param {Object}           blockType         Block type, likely from getBlockType().
 *
 * @return {Editor.InserterItem} Item that appears in inserter.
 */
function buildInserterItemFromBlockType( state, allowedBlockTypes, blockType ) {
	if ( ! allowedBlockTypes || ! blockType ) {
		return null;
	}

	const blockTypeIsDisabled = Array.isArray( allowedBlockTypes ) && ! includes( allowedBlockTypes, blockType.name );
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
		isDisabled: !! blockType.useOnce && getBlocks( state ).some( ( block ) => block.name === blockType.name ),
	};
}

/**
 * Given a shared block, constructs an item that appears in the inserter.
 *
 * @param {Object}           state             Global application state.
 * @param {string[]|boolean} allowedBlockTypes Allowed block types, or true/false to enable/disable all types.
 * @param {Object}           sharedBlock       Shared block, likely from getSharedBlock().
 *
 * @return {Editor.InserterItem} Item that appears in inserter.
 */
function buildInserterItemFromSharedBlock( state, allowedBlockTypes, sharedBlock ) {
	if ( ! allowedBlockTypes || ! sharedBlock ) {
		return null;
	}

	const blockTypeIsDisabled = Array.isArray( allowedBlockTypes ) && ! includes( allowedBlockTypes, 'core/block' );
	if ( blockTypeIsDisabled ) {
		return null;
	}

	const referencedBlock = getBlock( state, sharedBlock.uid );
	if ( ! referencedBlock ) {
		return null;
	}

	const referencedBlockType = getBlockType( referencedBlock.name );
	if ( ! referencedBlockType ) {
		return null;
	}

	return {
		id: `core/block/${ sharedBlock.id }`,
		name: 'core/block',
		initialAttributes: { ref: sharedBlock.id },
		title: sharedBlock.title,
		icon: referencedBlockType.icon,
		category: 'shared',
		keywords: [],
		isDisabled: false,
	};
}

/**
 * Determines the items that appear in the the inserter. Includes both static
 * items (e.g. a regular block type) and dynamic items (e.g. a shared block).
 *
 * @param {Object}           state             Global application state.
 * @param {string[]|boolean} allowedBlockTypes Allowed block types, or true/false to enable/disable all types.
 *
 * @return {Editor.InserterItem[]} Items that appear in inserter.
 */
export function getInserterItems( state, allowedBlockTypes ) {
	if ( ! allowedBlockTypes ) {
		return [];
	}

	const staticItems = getBlockTypes().map( ( blockType ) =>
		buildInserterItemFromBlockType( state, allowedBlockTypes, blockType )
	);

	const dynamicItems = getSharedBlocks( state ).map( ( sharedBlock ) =>
		buildInserterItemFromSharedBlock( state, allowedBlockTypes, sharedBlock )
	);

	const items = [ ...staticItems, ...dynamicItems ];
	return compact( items );
}

function fillWithCommonBlocks( inserts ) {
	// Filter out any inserts that are associated with a block type that isn't registered
	const items = inserts.filter( ( insert ) => getBlockType( insert.name ) );

	// Common blocks that we'll use to pad out our list
	const commonInserts = getBlockTypes()
		.filter( ( blockType ) => blockType.category === 'common' )
		.map( ( blockType ) => ( { name: blockType.name } ) );

	const areInsertsEqual = ( a, b ) => a.name === b.name && a.ref === b.ref;
	return unionWith( items, commonInserts, areInsertsEqual );
}

function getItemsFromInserts( state, inserts, allowedBlockTypes, maximum = MAX_RECENT_BLOCKS ) {
	if ( ! allowedBlockTypes ) {
		return [];
	}

	const items = fillWithCommonBlocks( inserts ).map( ( insert ) => {
		if ( insert.ref ) {
			const sharedBlock = getSharedBlock( state, insert.ref );
			return buildInserterItemFromSharedBlock( state, allowedBlockTypes, sharedBlock );
		}

		const blockType = getBlockType( insert.name );
		return buildInserterItemFromBlockType( state, allowedBlockTypes, blockType );
	} );

	return compact( items ).slice( 0, maximum );
}

/**
 * Returns a list of items which the user is likely to want to insert. These
 * are ordered by 'frecency', which is a heuristic that combines block usage
 * frequency and recency.
 *
 * https://en.wikipedia.org/wiki/Frecency
 *
 * @param {Object}           state             Global application state.
 * @param {string[]|boolean} allowedBlockTypes Allowed block types, or true/false to enable/disable all types.
 * @param {number}           maximum           Number of items to return.
 *
 * @return {Editor.InserterItem[]} Items that appear in the 'Recent' tab.
 */
export function getFrecentInserterItems( state, allowedBlockTypes, maximum = MAX_RECENT_BLOCKS ) {
	const calculateFrecency = ( time, count ) => {
		if ( ! time ) {
			return count;
		}

		const duration = Date.now() - time;
		switch ( true ) {
			case duration < 3600:
				return count * 4;
			case duration < ( 24 * 3600 ):
				return count * 2;
			case duration < ( 7 * 24 * 3600 ):
				return count / 2;
			default:
				return count / 4;
		}
	};

	const sortedInserts = values( state.preferences.insertUsage )
		.sort( ( a, b ) => calculateFrecency( b.time, b.count ) - calculateFrecency( a.time, a.count ) )
		.map( ( { insert } ) => insert );
	return getItemsFromInserts( state, sortedInserts, allowedBlockTypes, maximum );
}

/**
 * Returns the shared block with the given ID.
 *
 * @param {Object}        state Global application state.
 * @param {number|string} ref   The shared block's ID.
 *
 * @return {Object} The shared block, or null if none exists.
 */
export const getSharedBlock = createSelector(
	( state, ref ) => {
		const block = state.sharedBlocks.data[ ref ];
		if ( ! block ) {
			return null;
		}

		const isTemporary = isNaN( parseInt( ref ) );

		return {
			...block,
			id: isTemporary ? ref : +ref,
			isTemporary,
		};
	},
	( state, ref ) => [
		state.sharedBlocks.data[ ref ],
	],
);

/**
 * Returns whether or not the shared block with the given ID is being saved.
 *
 * @param {Object} state Global application state.
 * @param {string} ref   The shared block's ID.
 *
 * @return {boolean} Whether or not the shared block is being saved.
 */
export function isSavingSharedBlock( state, ref ) {
	return state.sharedBlocks.isSaving[ ref ] || false;
}

/**
 * Returns true if the shared block with the given ID is being fetched, or
 * false otherwise.
 *
 * @param {Object} state Global application state.
 * @param {string} ref   The shared block's ID.
 *
 * @return {boolean} Whether the shared block is being fetched.
 */
export function isFetchingSharedBlock( state, ref ) {
	return !! state.sharedBlocks.isFetching[ ref ];
}

/**
 * Returns an array of all shared blocks.
 *
 * @param {Object} state Global application state.
 *
 * @return {Array} An array of all shared blocks.
 */
export function getSharedBlocks( state ) {
	return map( state.sharedBlocks.data, ( value, ref ) => getSharedBlock( state, ref ) );
}

/**
 * Returns state object prior to a specified optimist transaction ID, or `null`
 * if the transaction corresponding to the given ID cannot be found.
 *
 * @param {Object} state         Current global application state.
 * @param {Object} transactionId Optimist transaction ID.
 *
 * @return {Object} Global application state prior to transaction.
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
 * @return {boolean} Whether post is being published.
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

/**
 * Returns the provisional block UID, or null if there is no provisional block.
 *
 * @param {Object} state Editor state.
 *
 * @return {?string} Provisional block UID, if set.
 */
export function getProvisionalBlockUID( state ) {
	return state.provisionalBlockUID;
}

/**
 * Returns whether the permalink is editable or not.
 *
 * @param {Object} state Editor state.
 *
 * @return {boolean} Whether or not the permalink is editable.
 */
export function isPermalinkEditable( state ) {
	const permalinkTemplate = getEditedPostAttribute( state, 'permalink_template' );

	return PERMALINK_POSTNAME_REGEX.test( permalinkTemplate );
}

/**
 * Returns the permalink for the post.
 *
 * @param {Object} state Editor state.
 *
 * @return {string} The permalink.
 */
export function getPermalink( state ) {
	const { prefix, postName, suffix } = getPermalinkParts( state );

	if ( isPermalinkEditable( state ) ) {
		return prefix + postName + suffix;
	}

	return prefix;
}

/**
 * Returns the permalink for a post, split into it's three parts: the prefix, the postName, and the suffix.
 *
 * @param {Object} state Editor state.
 *
 * @return {Object} The prefix, postName, and suffix for the permalink.
 */
export function getPermalinkParts( state ) {
	const permalinkTemplate = getEditedPostAttribute( state, 'permalink_template' );
	const postName = getEditedPostAttribute( state, 'slug' ) || getEditedPostAttribute( state, 'generated_slug' );

	const [ prefix, suffix ] = permalinkTemplate.split( PERMALINK_POSTNAME_REGEX );

	return {
		prefix,
		postName,
		suffix,
	};
}

/**
 * Returns true if an optimistic transaction is pending commit, for which the
 * before state satisfies the given predicate function.
 *
 * @param {Object}   state     Editor state.
 * @param {Function} predicate Function given state, returning true if match.
 *
 * @return {boolean} Whether predicate matches for some history.
 */
export function inSomeHistory( state, predicate ) {
	const { optimist } = state;

	// In recursion, optimist state won't exist. Assume exhausted options.
	if ( ! optimist ) {
		return false;
	}

	return optimist.some( ( { beforeState } ) => (
		beforeState && predicate( beforeState )
	) );
}

/**
 * Returns the Block List settings of a block if any.
 *
 * @param {Object}  state Editor state.
 * @param {?string} uid   Block UID.
 *
 * @return {?Object} Block settings of the block if set.
 */
export function getBlockListSettings( state, uid ) {
	return state.blockListSettings[ uid ];
}

/**
 * Determines the blocks that can be nested inside a given block. Or globally if a block is not specified.
 *
 * @param {Object}           state                     Global application state.
 * @param {?string}          uid                       Block UID.
 * @param {string[]|boolean} globallyEnabledBlockTypes Globally enabled block types, or true/false to enable/disable all types.
 *
 * @return {string[]|boolean} Blocks that can be nested inside the block with the specified uid, or true/false to enable/disable all types.
 */
export function getSupportedBlocks( state, uid, globallyEnabledBlockTypes ) {
	if ( ! globallyEnabledBlockTypes ) {
		return false;
	}

	const supportedNestedBlocks = get( getBlockListSettings( state, uid ), [ 'supportedBlocks' ] );
	if ( supportedNestedBlocks === true || supportedNestedBlocks === undefined ) {
		return globallyEnabledBlockTypes;
	}

	if ( ! supportedNestedBlocks ) {
		return false;
	}

	if ( globallyEnabledBlockTypes === true ) {
		return supportedNestedBlocks;
	}
	return intersection( globallyEnabledBlockTypes, supportedNestedBlocks );
}
