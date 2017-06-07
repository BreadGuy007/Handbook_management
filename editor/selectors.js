/**
 * External dependencies
 */
import moment from 'moment';
import { first, last, get } from 'lodash';

/**
 * Internal dependencies
 */
import { addQueryArgs } from './utils/url';

/**
 * Returns the current editing mode.
 *
 * @param  {Object} state Global application state
 * @return {String}       Editing mode
 */
export function getEditorMode( state ) {
	return state.mode;
}

/**
 * Returns true if the editor sidebar panel is open, or false otherwise.
 *
 * @param  {Object}  state Global application state
 * @return {Boolean}       Whether sidebar is open
 */
export function isEditorSidebarOpened( state ) {
	return state.isSidebarOpened;
}

/**
 * Returns true if any past editor history snapshots exist, or false otherwise.
 *
 * @param  {Object}  state Global application state
 * @return {Boolean}       Whether undo history exists
 */
export function hasEditorUndo( state ) {
	return state.editor.history.past.length > 0;
}

/**
 * Returns true if any future editor history snapshots exist, or false
 * otherwise.
 *
 * @param  {Object}  state Global application state
 * @return {Boolean}       Whether redo history exists
 */
export function hasEditorRedo( state ) {
	return state.editor.history.future.length > 0;
}

/**
 * Returns true if the currently edited post is yet to be saved, or false if
 * the post has been saved.
 *
 * @param  {Object}  state Global application state
 * @return {Boolean}       Whether the post is new
 */
export function isEditedPostNew( state ) {
	return ! state.currentPost.id;
}

/**
 * Returns true if there are unsaved values for the current edit session, or
 * false if the editing state matches the saved or new post.
 *
 * @param  {Object}  state Global application state
 * @return {Boolean}       Whether unsaved values exist
 */
export function isEditedPostDirty( state ) {
	return state.editor.dirty;
}

/**
 * Returns the post currently being edited in its last known saved state, not
 * including unsaved edits. Returns an object containing relevant default post
 * values if the post has not yet been saved.
 *
 * @param  {Object} state Global application state
 * @return {Object}       Post object
 */
export function getCurrentPost( state ) {
	return state.currentPost;
}

/**
 * Returns any post values which have been changed in the editor but not yet
 * been saved.
 *
 * @param  {Object} state Global application state
 * @return {Object}       Object of key value pairs comprising unsaved edits
 */
export function getPostEdits( state ) {
	return state.editor.edits;
}

/**
 * Returns a single attribute of the post being edited, preferring the unsaved
 * edit if one exists, but falling back to the attribute for the last known
 * saved state of the post.
 *
 * @param  {Object} state         Global application state
 * @param  {String} attributeName Post attribute name
 * @return {*}                    Post attribute value
 */
export function getEditedPostAttribute( state, attributeName ) {
	return state.editor.edits[ attributeName ] === undefined
		? state.currentPost[ attributeName ]
		: state.editor.edits[ attributeName ];
}

/**
 * Returns the current visibility of the post being edited, preferring the
 * unsaved value if different than the saved post. The return value is one of
 * "private", "password", or "public".
 *
 * @param  {Object} state Global application state
 * @return {String}       Post visiblity
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
 * Return true if the post being edited has already been published.
 *
 * @param  {Object}   state Global application state
 * @return {Boolearn}       Whether the post has been bublished
 */
export function isEditedPostAlreadyPublished( state ) {
	const post = getCurrentPost( state );

	return [ 'publish', 'private' ].indexOf( post.status ) !== -1 ||
		( post.status === 'future' && moment( post.date ).isBefore( moment() ) );
}

/**
 * Return true if the post being edited is being scheduled. Preferring the
 * unsaved status values.
 *
 * @param  {Object}   state Global application state
 * @return {Boolearn}       Whether the post has been bublished
 */
export function isEditedPostBeingScheduled( state ) {
	const date = getEditedPostAttribute( state, 'date' );
	return moment( date ).isAfter( moment() );
}

/**
 * Returns the raw title of the post being edited, preferring the unsaved value
 * if different than the saved post.
 *
 * @param  {Object} state Global application state
 * @return {String}       Raw post title
 */
export function getEditedPostTitle( state ) {
	return state.editor.edits.title === undefined
		? get( state.currentPost, 'title.raw' )
		: state.editor.edits.title;
}

/**
 * Returns the raw excerpt of the post being edited, preferring the unsaved
 * value if different than the saved post.
 *
 * @param  {Object} state Global application state
 * @return {String}       Raw post excerpt
 */
export function getEditedPostExcerpt( state ) {
	return state.editor.edits.excerpt === undefined
		? get( state.currentPost, 'excerpt.raw' )
		: state.editor.edits.excerpt;
}

/**
 * Returns a URL to preview the post being edited.
 *
 * @param  {Object} state Global application state
 * @return {String}       Preview URL
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
 * @param  {Object} state Global application state
 * @param  {String} uid   Block unique ID
 * @return {Object}       Parsed block object
 */
export function getBlock( state, uid ) {
	return state.editor.blocksByUid[ uid ];
}

/**
 * Returns all block objects for the current post being edited as an array in
 * the order they appear in the post.
 *
 * @param  {Object}   state Global application state
 * @return {Object[]}       Post blocks
 */
export function getBlocks( state ) {
	return state.editor.blockOrder.map( ( uid ) => (
		state.editor.blocksByUid[ uid ]
	) );
}

/**
 * Returns the currently selected block, or null if there is no selected block.
 *
 * @param  {Object}  state Global application state
 * @return {?Object}       Selected block
 */
export function getSelectedBlock( state ) {
	const { uid } = state.selectedBlock;
	const { start, end } = state.multiSelectedBlocks;

	if ( start || end || ! uid ) {
		return null;
	}

	return state.editor.blocksByUid[ uid ];
}

/**
 * Returns the current multi-selection set of blocks, or an empty array if
 * there is no multi-selection.
 *
 * @param  {Object} state Global application state
 * @return {Array}        Multi-selected block objects
 */
export function getSelectedBlocks( state ) {
	const { blockOrder } = state.editor;
	const { start, end } = state.multiSelectedBlocks;

	if ( ! start || ! end ) {
		return [];
	}

	const startIndex = blockOrder.indexOf( start );
	const endIndex = blockOrder.indexOf( end );

	if ( startIndex > endIndex ) {
		return blockOrder.slice( endIndex, startIndex + 1 );
	}

	return blockOrder.slice( startIndex, endIndex + 1 );
}

/**
 * Returns the unique ID of the block which begins the multi-selection set, or
 * null if there is no multi-selectino.
 *
 * @param  {Object}  state Global application state
 * @return {?String}       Unique ID of block beginning multi-selection
 */
export function getBlockSelectionStart( state ) {
	return state.multiSelectedBlocks.start || null;
}

/**
 * Returns the unique ID of the block which ends the multi-selection set, or
 * null if there is no multi-selectino.
 *
 * @param  {Object}  state Global application state
 * @return {?String}       Unique ID of block ending multi-selection
 */
export function getBlockSelectionEnd( state ) {
	return state.multiSelectedBlocks.end || null;
}

/**
 * Returns an array containing all block unique IDs of the post being edited,
 * in the order they appear in the post.
 *
 * @param  {Object} state Global application state
 * @return {Array}        Ordered unique IDs of post blocks
 */
export function getBlockUids( state ) {
	return state.editor.blockOrder;
}

/**
 * Returns the index at which the block corresponding to the specified unique
 * ID occurs within the post block order, or `-1` if the block does not exist.
 *
 * @param  {Object} state Global application state
 * @param  {String} uid   Block unique ID
 * @return {Number}       Index at which block exists in order
 */
export function getBlockIndex( state, uid ) {
	return state.editor.blockOrder.indexOf( uid );
}

/**
 * Returns true if the block corresponding to the specified unique ID is the
 * first block of the post, or false otherwise.
 *
 * @param  {Object}  state Global application state
 * @param  {Object}  uid   Block unique ID
 * @return {Boolean}       Whether block is first in post
 */
export function isFirstBlock( state, uid ) {
	return first( state.editor.blockOrder ) === uid;
}

/**
 * Returns true if a multi-selection exists, and the block corresponding to the
 * specified unique ID is the first block of the multi-selection set, or false
 * otherwise.
 *
 * @param  {Object}  state Global application state
 * @param  {Object}  uid   Block unique ID
 * @return {Boolean}       Whether block is first in mult-selection
 */
export function isFirstSelectedBlock( state, uid ) {
	return first( getSelectedBlocks( state ) ) === uid;
}

/**
 * Returns true if the block corresponding to the specified unique ID is the
 * last block of the post, or false otherwise.
 *
 * @param  {Object}  state Global application state
 * @param  {Object}  uid   Block unique ID
 * @return {Boolean}       Whether block is last in post
 */
export function isLastBlock( state, uid ) {
	return last( state.editor.blockOrder ) === uid;
}

/**
 * Returns the block object occurring before the one corresponding to the
 * specified unique ID.
 *
 * @param  {Object} state Global application state
 * @param  {Object} uid   Block unique ID
 * @return {Object}       Block occurring before specified unique ID
 */
export function getPreviousBlock( state, uid ) {
	const order = getBlockIndex( state, uid );
	return state.editor.blocksByUid[ state.editor.blockOrder[ order - 1 ] ] || null;
}

/**
 * Returns the block object occurring after the one corresponding to the
 * specified unique ID.
 *
 * @param  {Object} state Global application state
 * @param  {Object} uid   Block unique ID
 * @return {Object}       Block occurring after specified unique ID
 */
export function getNextBlock( state, uid ) {
	const order = getBlockIndex( state, uid );
	return state.editor.blocksByUid[ state.editor.blockOrder[ order + 1 ] ] || null;
}

/**
 * Returns true if the block corresponding to the specified unique ID is
 * currently selected and a multi-selection exists, null if there is no
 * multi-selection active, or false if multi-selection exists, but the
 * specified unique ID is not the selected block.
 *
 * @param  {Object} state Global application state
 * @param  {Object} uid   Block unique ID
 * @return {Boolean}      Whether block is selected and multi-selection exists
 */
export function isBlockSelected( state, uid ) {
	const { start, end } = state.multiSelectedBlocks;

	if ( start || end ) {
		return null;
	}

	return state.selectedBlock.uid === uid;
}

/**
 * Returns true if the unique ID occurs within the block multi-selection, or
 * false otherwise.
 *
 * @param  {Object} state Global application state
 * @param  {Object} uid   Block unique ID
 * @return {Boolean}      Whether block is in multi-selection set
 */
export function isBlockMultiSelected( state, uid ) {
	return getSelectedBlocks( state ).indexOf( uid ) !== -1;
}

/**
 * Returns true if the cursor is hovering the block corresponding to the
 * specified unique ID, or false otherwise.
 *
 * @param  {Object} state Global application state
 * @param  {Object} uid   Block unique ID
 * @return {Boolean}      Whether block is hovered
 */
export function isBlockHovered( state, uid ) {
	return state.hoveredBlock === uid;
}

/**
 * Returns focus state of the block corresponding to the specified unique ID,
 * or null if the block is not selected. It is left to a block's implementation
 * to manage the content of this object, defaulting to an empty object.
 *
 * @param  {Object} state Global application state
 * @param  {Object} uid   Block unique ID
 * @return {Object}       Block focus state
 */
export function getBlockFocus( state, uid ) {
	if ( ! isBlockSelected( state, uid ) ) {
		return null;
	}

	return state.selectedBlock.focus;
}

/**
 * Returns true if the user is typing within the block corresponding to the
 * specified unique ID, or false otherwise.
 *
 * @param  {Object}  state Global application state
 * @param  {Object}  uid   Block unique ID
 * @return {Boolean}       Whether user is typing within block
 */
export function isTypingInBlock( state, uid ) {
	if ( ! isBlockSelected( state, uid ) ) {
		return false;
	}

	return state.selectedBlock.typing;
}

/**
 * Returns the unique ID of the block after which a new block insertion would
 * be placed, or null if the insertion point is not shown. Defaults to the
 * unique ID of the last block occurring in the post if not otherwise assigned.
 *
 * @param  {Object}  state Global application state
 * @return {?String}       Unique ID after which insertion will occur
 */
export function getBlockInsertionPoint( state ) {
	if ( ! state.insertionPoint.show ) {
		return null;
	}
	const blockToInsertAfter = state.insertionPoint.uid;

	return blockToInsertAfter || last( state.editor.blockOrder );
}

/**
 * Returns true if the post is currently being saved, or false otherwise.
 *
 * @param  {Object}  state Global application state
 * @return {Boolean}       Whether post is being saved
 */
export function isSavingPost( state ) {
	return state.saving.requesting;
}

/**
 * Returns true if a previous post save was attempted successfully, or false
 * otherwise.
 *
 * @param  {Object}  state Global application state
 * @return {Boolean}       Whether the post was saved successfully
 */
export function didPostSaveRequestSucceed( state ) {
	return state.saving.successful;
}

/**
 * Returns true if a previous post save was attempted but failed, or false
 * otherwise.
 *
 * @param  {Object}  state Global application state
 * @return {Boolean}       Whether the post save failed
 */
export function didPostSaveRequestFail( state ) {
	return !! state.saving.error;
}

/**
 * Returns true if the post being saved is a new draft, or false otherwise.
 *
 * @param  {Object}  state Global application state
 * @return {Boolean}       Whether post being saved is a new draft
 */
export function isSavingNewPost( state ) {
	return state.saving.isNew;
}

/**
 * Returns a suggested post format for the current post, inferred only if there
 * is a single block within the post and it is of a type known to match a
 * default post format. Returns null if the format cannot be determined.
 *
 * @param  {Object}  state Global application state
 * @return {?String}       Suggested post format
 */
export function getSuggestedPostFormat( state ) {
	const blocks = state.editor.blockOrder;

	let type;
	// If there is only one block in the content of the post grab its name so
	// so we can derive a suitable post format from it.
	if ( blocks.length === 1 ) {
		type = state.editor.blocksByUid[ blocks[ 0 ] ].blockType;
	}

	// We only convert to default post formats in core.
	switch ( type ) {
		case 'core/image':
			return 'Image';
		case 'core/quote':
			return 'Quote';
	}

	return null;
}
