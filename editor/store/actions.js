/**
 * External Dependencies
 */
import uuid from 'uuid/v4';
import { partial, castArray } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	getDefaultBlockName,
	createBlock,
} from '@wordpress/blocks';

/**
 * Returns an action object used in signalling that editor has initialized with
 * the specified post object and editor settings.
 *
 * @param {Object} post     Post object.
 * @param {Object} settings Editor settings object.
 *
 * @return {Object} Action object.
 */
export function setupEditor( post, settings ) {
	return {
		type: 'SETUP_EDITOR',
		post,
		settings,
	};
}

/**
 * Returns an action object used in signalling that the latest version of the
 * post has been received, either by initialization or save.
 *
 * @param {Object} post Post object.
 *
 * @return {Object} Action object.
 */
export function resetPost( post ) {
	return {
		type: 'RESET_POST',
		post,
	};
}

/**
 * Returns an action object used to setup the editor state when first opening an editor.
 *
 * @param {Object}  post            Post object.
 * @param {Array}   blocks          Array of blocks.
 * @param {Object}  edits           Initial edited attributes object.
 *
 * @return {Object} Action object.
 */
export function setupEditorState( post, blocks, edits ) {
	return {
		type: 'SETUP_EDITOR_STATE',
		post,
		blocks,
		edits,
	};
}

/**
 * Returns an action object used in signalling that blocks state should be
 * reset to the specified array of blocks, taking precedence over any other
 * content reflected as an edit in state.
 *
 * @param {Array} blocks Array of blocks.
 *
 * @return {Object} Action object.
 */
export function resetBlocks( blocks ) {
	return {
		type: 'RESET_BLOCKS',
		blocks,
	};
}

/**
 * Returns an action object used in signalling that blocks have been received.
 * Unlike resetBlocks, these should be appended to the existing known set, not
 * replacing.
 *
 * @param {Object[]} blocks Array of block objects.
 *
 * @return {Object} Action object.
 */
export function receiveBlocks( blocks ) {
	return {
		type: 'RECEIVE_BLOCKS',
		blocks,
	};
}

/**
 * Returns an action object used in signalling that the block attributes with
 * the specified UID has been updated.
 *
 * @param {string} uid        Block UID.
 * @param {Object} attributes Block attributes to be merged.
 *
 * @return {Object} Action object.
 */
export function updateBlockAttributes( uid, attributes ) {
	return {
		type: 'UPDATE_BLOCK_ATTRIBUTES',
		uid,
		attributes,
	};
}

/**
 * Returns an action object used in signalling that the block with the
 * specified UID has been updated.
 *
 * @param {string} uid     Block UID.
 * @param {Object} updates Block attributes to be merged.
 *
 * @return {Object} Action object.
 */
export function updateBlock( uid, updates ) {
	return {
		type: 'UPDATE_BLOCK',
		uid,
		updates,
	};
}

export function selectBlock( uid, initialPosition = null ) {
	return {
		type: 'SELECT_BLOCK',
		initialPosition,
		uid,
	};
}

export function startMultiSelect() {
	return {
		type: 'START_MULTI_SELECT',
	};
}

export function stopMultiSelect() {
	return {
		type: 'STOP_MULTI_SELECT',
	};
}

export function multiSelect( start, end ) {
	return {
		type: 'MULTI_SELECT',
		start,
		end,
	};
}

export function clearSelectedBlock() {
	return {
		type: 'CLEAR_SELECTED_BLOCK',
	};
}

/**
 * Returns an action object that enables or disables block selection.
 *
 * @param {boolean} [isSelectionEnabled=true] Whether block selection should
 *                                            be enabled.

 * @return {Object} Action object.
 */
export function toggleSelection( isSelectionEnabled = true ) {
	return {
		type: 'TOGGLE_SELECTION',
		isSelectionEnabled,
	};
}

/**
 * Returns an action object signalling that a blocks should be replaced with
 * one or more replacement blocks.
 *
 * @param {(string|string[])} uids   Block UID(s) to replace.
 * @param {(Object|Object[])} blocks Replacement block(s).
 *
 * @return {Object} Action object.
 */
export function replaceBlocks( uids, blocks ) {
	return {
		type: 'REPLACE_BLOCKS',
		uids: castArray( uids ),
		blocks: castArray( blocks ),
		time: Date.now(),
	};
}

/**
 * Returns an action object signalling that a single block should be replaced
 * with one or more replacement blocks.
 *
 * @param {(string|string[])} uid   Block UID(s) to replace.
 * @param {(Object|Object[])} block Replacement block(s).
 *
 * @return {Object} Action object.
 */
export function replaceBlock( uid, block ) {
	return replaceBlocks( uid, block );
}

/**
 * Returns an action object used in signalling that a single block should be
 * inserted, optionally at a specific index respective a root block list.
 *
 * @param {Object}  block   Block object to insert.
 * @param {?number} index   Index at which block should be inserted.
 * @param {?string} rootUID Optional root UID of block list to insert.
 *
 * @return {Object} Action object.
 */
export function insertBlock( block, index, rootUID ) {
	return insertBlocks( [ block ], index, rootUID );
}

/**
 * Returns an action object used in signalling that an array of blocks should
 * be inserted, optionally at a specific index respective a root block list.
 *
 * @param {Object[]} blocks  Block objects to insert.
 * @param {?number}  index   Index at which block should be inserted.
 * @param {?string}  rootUID Optional root UID of block list to insert.
 *
 * @return {Object} Action object.
 */
export function insertBlocks( blocks, index, rootUID ) {
	return {
		type: 'INSERT_BLOCKS',
		blocks: castArray( blocks ),
		index,
		rootUID,
		time: Date.now(),
	};
}

/**
 * Returns an action object used in signalling that the insertion point should
 * be shown.
 *
 * @return {Object} Action object.
 */
export function showInsertionPoint() {
	return {
		type: 'SHOW_INSERTION_POINT',
	};
}

/**
 * Returns an action object hiding the insertion point.
 *
 * @return {Object} Action object.
 */
export function hideInsertionPoint() {
	return {
		type: 'HIDE_INSERTION_POINT',
	};
}

/**
 * Returns an action object resetting the template validity.
 *
 * @param {boolean}  isValid  template validity flag.
 *
 * @return {Object} Action object.
 */
export function setTemplateValidity( isValid ) {
	return {
		type: 'SET_TEMPLATE_VALIDITY',
		isValid,
	};
}

/**
 * Returns an action object tocheck the template validity.
 *
 * @return {Object} Action object.
 */
export function checkTemplateValidity() {
	return {
		type: 'CHECK_TEMPLATE_VALIDITY',
	};
}

/**
 * Returns an action object synchronize the template with the list of blocks
 *
 * @return {Object} Action object.
 */
export function synchronizeTemplate() {
	return {
		type: 'SYNCHRONIZE_TEMPLATE',
	};
}

export function editPost( edits ) {
	return {
		type: 'EDIT_POST',
		edits,
	};
}

export function savePost() {
	return {
		type: 'REQUEST_POST_UPDATE',
	};
}

export function trashPost( postId, postType ) {
	return {
		type: 'TRASH_POST',
		postId,
		postType,
	};
}

/**
 * Returns an action object used in signalling that two blocks should be merged
 *
 * @param {string} blockAUid UID of the first block to merge.
 * @param {string} blockBUid UID of the second block to merge.
 *
 * @return {Object} Action object.
 */
export function mergeBlocks( blockAUid, blockBUid ) {
	return {
		type: 'MERGE_BLOCKS',
		blocks: [ blockAUid, blockBUid ],
	};
}

/**
 * Returns an action object used in signalling that the post should autosave.
 *
 * @return {Object} Action object.
 */
export function autosave() {
	return {
		type: 'AUTOSAVE',
	};
}

/**
 * Returns an action object used in signalling that undo history should
 * restore last popped state.
 *
 * @return {Object} Action object.
 */
export function redo() {
	return { type: 'REDO' };
}

/**
 * Returns an action object used in signalling that undo history should pop.
 *
 * @return {Object} Action object.
 */
export function undo() {
	return { type: 'UNDO' };
}

/**
 * Returns an action object used in signalling that undo history record should
 * be created.
 *
 * @return {Object} Action object.
 */
export function createUndoLevel() {
	return { type: 'CREATE_UNDO_LEVEL' };
}

/**
 * Returns an action object used in signalling that the blocks
 * corresponding to the specified UID set are to be removed.
 *
 * @param {string[]} uids           Block UIDs.
 * @param {boolean}  selectPrevious True if the previous block should be selected when a block is removed.
 *
 * @return {Object} Action object.
 */
export function removeBlocks( uids, selectPrevious = true ) {
	return {
		type: 'REMOVE_BLOCKS',
		uids,
		selectPrevious,
	};
}

/**
 * Returns an action object used in signalling that the block with the
 * specified UID is to be removed.
 *
 * @param {string}  uid            Block UID.
 * @param {boolean} selectPrevious True if the previous block should be selected when a block is removed.
 *
 * @return {Object} Action object.
 */
export function removeBlock( uid, selectPrevious = true ) {
	return removeBlocks( [ uid ], selectPrevious );
}

/**
 * Returns an action object used to toggle the block editing mode (visual/html).
 *
 * @param {string} uid Block UID.
 *
 * @return {Object} Action object.
 */
export function toggleBlockMode( uid ) {
	return {
		type: 'TOGGLE_BLOCK_MODE',
		uid,
	};
}

/**
 * Returns an action object used in signalling that the user has begun to type.
 *
 * @return {Object} Action object.
 */
export function startTyping() {
	return {
		type: 'START_TYPING',
	};
}

/**
 * Returns an action object used in signalling that the user has stopped typing.
 *
 * @return {Object} Action object.
 */
export function stopTyping() {
	return {
		type: 'STOP_TYPING',
	};
}

/**
 * Returns an action object used to create a notice.
 *
 * @param {string}    status  The notice status.
 * @param {WPElement} content The notice content.
 * @param {?Object}   options The notice options.  Available options:
 *                              `id` (string; default auto-generated)
 *                              `isDismissible` (boolean; default `true`).
 *
 * @return {Object} Action object.
 */
export function createNotice( status, content, options = {} ) {
	const {
		id = uuid(),
		isDismissible = true,
		spokenMessage,
	} = options;
	return {
		type: 'CREATE_NOTICE',
		notice: {
			id,
			status,
			content,
			isDismissible,
			spokenMessage,
		},
	};
}

/**
 * Returns an action object used to remove a notice.
 *
 * @param {string} id The notice id.
 *
 * @return {Object} Action object.
 */
export function removeNotice( id ) {
	return {
		type: 'REMOVE_NOTICE',
		noticeId: id,
	};
}

export const createSuccessNotice = partial( createNotice, 'success' );
export const createInfoNotice = partial( createNotice, 'info' );
export const createErrorNotice = partial( createNotice, 'error' );
export const createWarningNotice = partial( createNotice, 'warning' );

/**
 * Returns an action object used to fetch a single reusable block or all
 * reusable blocks from the REST API into the store.
 *
 * @param {?string} id If given, only a single reusable block with this ID will
 *                     be fetched.
 *
 * @return {Object} Action object.
 */
export function fetchReusableBlocks( id ) {
	return {
		type: 'FETCH_REUSABLE_BLOCKS',
		id,
	};
}

/**
 * Returns an action object used in signalling that reusable blocks have been
 * received. Results is an array of objects containing reusableBlock (details
 * about reusable persistence) and parsedBlock (the original block).
 *
 * @param {Object[]} results Reusable blocks received.
 *
 * @return {Object} Action object.
 */
export function receiveReusableBlocks( results ) {
	return {
		type: 'RECEIVE_REUSABLE_BLOCKS',
		results,
	};
}

/**
 * Returns an action object used to save a reusable block that's in the store
 * to the REST API.
 *
 * @param {Object} id The ID of the reusable block to save.
 *
 * @return {Object} Action object.
 */
export function saveReusableBlock( id ) {
	return {
		type: 'SAVE_REUSABLE_BLOCK',
		id,
	};
}

/**
 * Returns an action object used to delete a reusable block via the REST API.
 *
 * @param {number} id The ID of the reusable block to delete.
 *
 * @return {Object} Action object.
 */
export function deleteReusableBlock( id ) {
	return {
		type: 'DELETE_REUSABLE_BLOCK',
		id,
	};
}

/**
 * Returns an action object used in signalling that a reusable block's title is
 * to be updated.
 *
 * @param {number} id    The ID of the reusable block to update.
 * @param {string} title The new title.
 *
 * @return {Object} Action object.
 */
export function updateReusableBlockTitle( id, title ) {
	return {
		type: 'UPDATE_REUSABLE_BLOCK_TITLE',
		id,
		title,
	};
}

/**
 * Returns an action object used to convert a reusable block into a static
 * block.
 *
 * @param {Object} uid The ID of the block to attach.
 *
 * @return {Object} Action object.
 */
export function convertBlockToStatic( uid ) {
	return {
		type: 'CONVERT_BLOCK_TO_STATIC',
		uid,
	};
}

/**
 * Returns an action object used to convert a static block into a reusable
 * block.
 *
 * @param {Object} uid The ID of the block to detach.
 *
 * @return {Object} Action object.
 */
export function convertBlockToReusable( uid ) {
	return {
		type: 'CONVERT_BLOCK_TO_REUSABLE',
		uid,
	};
}
/**
 * Returns an action object used in signalling that a new block of the default
 * type should be added to the block list.
 *
 * @param {?Object} attributes Optional attributes of the block to assign.
 * @param {?string} rootUID    Optional root UID of block list to append.
 * @param {?number} index      Optional index where to insert the default block
 *
 * @return {Object} Action object
 */
export function insertDefaultBlock( attributes, rootUID, index ) {
	const block = createBlock( getDefaultBlockName(), attributes );

	return {
		...insertBlock( block, index, rootUID ),
		isProvisional: true,
	};
}
