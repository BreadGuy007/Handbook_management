/**
 * External dependencies
 */
import { values, noop } from 'lodash';
import deepFreeze from 'deep-freeze';

/**
 * WordPress dependencies
 */
import { registerBlockType, unregisterBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import {
	getPostRawValue,
	editor,
	currentPost,
	hoveredBlock,
	isTyping,
	blockSelection,
	mode,
	isSidebarOpened,
	saving,
	notices,
	showInsertionPoint,
	createReduxStore,
	userData,
} from '../state';

describe( 'state', () => {
	describe( 'getPostRawValue', () => {
		it( 'returns original value for non-rendered content', () => {
			const value = getPostRawValue( '' );

			expect( value ).toBe( '' );
		} );

		it( 'returns raw value for rendered content', () => {
			const value = getPostRawValue( { raw: '' } );

			expect( value ).toBe( '' );
		} );
	} );

	describe( 'editor()', () => {
		beforeAll( () => {
			registerBlockType( 'core/test-block', {
				save: noop,
				edit: noop,
				category: 'common',
			} );
		} );

		afterAll( () => {
			unregisterBlockType( 'core/test-block' );
		} );

		it( 'should return empty blocksByUid, blockOrder, history by default', () => {
			const state = editor( undefined, {} );

			expect( state.blocksByUid ).toEqual( {} );
			expect( state.blockOrder ).toEqual( [] );
			expect( state ).toHaveProperty( 'history' );
		} );

		it( 'should key by replaced blocks uid', () => {
			const original = editor( undefined, {} );
			const state = editor( original, {
				type: 'RESET_BLOCKS',
				blocks: [ { uid: 'bananas' } ],
			} );

			expect( Object.keys( state.blocksByUid ) ).toHaveLength( 1 );
			expect( values( state.blocksByUid )[ 0 ].uid ).toBe( 'bananas' );
			expect( state.blockOrder ).toEqual( [ 'bananas' ] );
		} );

		it( 'should insert block', () => {
			const original = editor( undefined, {
				type: 'RESET_BLOCKS',
				blocks: [ {
					uid: 'chicken',
					name: 'core/test-block',
					attributes: {},
				} ],
			} );
			const state = editor( original, {
				type: 'INSERT_BLOCKS',
				blocks: [ {
					uid: 'ribs',
					name: 'core/freeform',
				} ],
			} );

			expect( Object.keys( state.blocksByUid ) ).toHaveLength( 2 );
			expect( values( state.blocksByUid )[ 1 ].uid ).toBe( 'ribs' );
			expect( state.blockOrder ).toEqual( [ 'chicken', 'ribs' ] );
		} );

		it( 'should replace the block', () => {
			const original = editor( undefined, {
				type: 'RESET_BLOCKS',
				blocks: [ {
					uid: 'chicken',
					name: 'core/test-block',
					attributes: {},
				} ],
			} );
			const state = editor( original, {
				type: 'REPLACE_BLOCKS',
				uids: [ 'chicken' ],
				blocks: [ {
					uid: 'wings',
					name: 'core/freeform',
				} ],
			} );

			expect( Object.keys( state.blocksByUid ) ).toHaveLength( 1 );
			expect( values( state.blocksByUid )[ 0 ].name ).toBe( 'core/freeform' );
			expect( values( state.blocksByUid )[ 0 ].uid ).toBe( 'wings' );
			expect( state.blockOrder ).toEqual( [ 'wings' ] );
		} );

		it( 'should move the block up', () => {
			const original = editor( undefined, {
				type: 'RESET_BLOCKS',
				blocks: [ {
					uid: 'chicken',
					name: 'core/test-block',
					attributes: {},
				}, {
					uid: 'ribs',
					name: 'core/test-block',
					attributes: {},
				} ],
			} );
			const state = editor( original, {
				type: 'MOVE_BLOCKS_UP',
				uids: [ 'ribs' ],
			} );

			expect( state.blockOrder ).toEqual( [ 'ribs', 'chicken' ] );
		} );

		it( 'should move multiple blocks up', () => {
			const original = editor( undefined, {
				type: 'RESET_BLOCKS',
				blocks: [ {
					uid: 'chicken',
					name: 'core/test-block',
					attributes: {},
				}, {
					uid: 'ribs',
					name: 'core/test-block',
					attributes: {},
				}, {
					uid: 'veggies',
					name: 'core/test-block',
					attributes: {},
				} ],
			} );
			const state = editor( original, {
				type: 'MOVE_BLOCKS_UP',
				uids: [ 'ribs', 'veggies' ],
			} );

			expect( state.blockOrder ).toEqual( [ 'ribs', 'veggies', 'chicken' ] );
		} );

		it( 'should not move the first block up', () => {
			const original = editor( undefined, {
				type: 'RESET_BLOCKS',
				blocks: [ {
					uid: 'chicken',
					name: 'core/test-block',
					attributes: {},
				}, {
					uid: 'ribs',
					name: 'core/test-block',
					attributes: {},
				} ],
			} );
			const state = editor( original, {
				type: 'MOVE_BLOCKS_UP',
				uids: [ 'chicken' ],
			} );

			expect( state.blockOrder ).toBe( original.blockOrder );
		} );

		it( 'should move the block down', () => {
			const original = editor( undefined, {
				type: 'RESET_BLOCKS',
				blocks: [ {
					uid: 'chicken',
					name: 'core/test-block',
					attributes: {},
				}, {
					uid: 'ribs',
					name: 'core/test-block',
					attributes: {},
				} ],
			} );
			const state = editor( original, {
				type: 'MOVE_BLOCKS_DOWN',
				uids: [ 'chicken' ],
			} );

			expect( state.blockOrder ).toEqual( [ 'ribs', 'chicken' ] );
		} );

		it( 'should move multiple blocks down', () => {
			const original = editor( undefined, {
				type: 'RESET_BLOCKS',
				blocks: [ {
					uid: 'chicken',
					name: 'core/test-block',
					attributes: {},
				}, {
					uid: 'ribs',
					name: 'core/test-block',
					attributes: {},
				}, {
					uid: 'veggies',
					name: 'core/test-block',
					attributes: {},
				} ],
			} );
			const state = editor( original, {
				type: 'MOVE_BLOCKS_DOWN',
				uids: [ 'chicken', 'ribs' ],
			} );

			expect( state.blockOrder ).toEqual( [ 'veggies', 'chicken', 'ribs' ] );
		} );

		it( 'should not move the last block down', () => {
			const original = editor( undefined, {
				type: 'RESET_BLOCKS',
				blocks: [ {
					uid: 'chicken',
					name: 'core/test-block',
					attributes: {},
				}, {
					uid: 'ribs',
					name: 'core/test-block',
					attributes: {},
				} ],
			} );
			const state = editor( original, {
				type: 'MOVE_BLOCKS_DOWN',
				uids: [ 'ribs' ],
			} );

			expect( state.blockOrder ).toBe( original.blockOrder );
		} );

		it( 'should remove the block', () => {
			const original = editor( undefined, {
				type: 'RESET_BLOCKS',
				blocks: [ {
					uid: 'chicken',
					name: 'core/test-block',
					attributes: {},
				}, {
					uid: 'ribs',
					name: 'core/test-block',
					attributes: {},
				} ],
			} );
			const state = editor( original, {
				type: 'REMOVE_BLOCKS',
				uids: [ 'chicken' ],
			} );

			expect( state.blockOrder ).toEqual( [ 'ribs' ] );
			expect( state.blocksByUid ).toEqual( {
				ribs: {
					uid: 'ribs',
					name: 'core/test-block',
					attributes: {},
				},
			} );
		} );

		it( 'should remove multiple blocks', () => {
			const original = editor( undefined, {
				type: 'RESET_BLOCKS',
				blocks: [ {
					uid: 'chicken',
					name: 'core/test-block',
					attributes: {},
				}, {
					uid: 'ribs',
					name: 'core/test-block',
					attributes: {},
				}, {
					uid: 'veggies',
					name: 'core/test-block',
					attributes: {},
				} ],
			} );
			const state = editor( original, {
				type: 'REMOVE_BLOCKS',
				uids: [ 'chicken', 'veggies' ],
			} );

			expect( state.blockOrder ).toEqual( [ 'ribs' ] );
			expect( state.blocksByUid ).toEqual( {
				ribs: {
					uid: 'ribs',
					name: 'core/test-block',
					attributes: {},
				},
			} );
		} );

		it( 'should insert after the specified block uid', () => {
			const original = editor( undefined, {
				type: 'RESET_BLOCKS',
				blocks: [ {
					uid: 'kumquat',
					name: 'core/test-block',
					attributes: {},
				}, {
					uid: 'loquat',
					name: 'core/test-block',
					attributes: {},
				} ],
			} );

			const state = editor( original, {
				type: 'INSERT_BLOCKS',
				after: 'kumquat',
				blocks: [ {
					uid: 'persimmon',
					name: 'core/freeform',
				} ],
			} );

			expect( Object.keys( state.blocksByUid ) ).toHaveLength( 3 );
			expect( state.blockOrder ).toEqual( [ 'kumquat', 'persimmon', 'loquat' ] );
		} );

		describe( 'edits()', () => {
			it( 'should save newly edited properties', () => {
				const original = editor( undefined, {
					type: 'EDIT_POST',
					edits: {
						status: 'draft',
						title: 'post title',
					},
				} );

				const state = editor( original, {
					type: 'EDIT_POST',
					edits: {
						tags: [ 1 ],
					},
				} );

				expect( state.edits ).toEqual( {
					status: 'draft',
					title: 'post title',
					tags: [ 1 ],
				} );
			} );

			it( 'should return same reference if no changed properties', () => {
				const original = editor( undefined, {
					type: 'EDIT_POST',
					edits: {
						status: 'draft',
						title: 'post title',
					},
				} );

				const state = editor( original, {
					type: 'EDIT_POST',
					edits: {
						status: 'draft',
					},
				} );

				expect( state.edits ).toBe( original.edits );
			} );

			it( 'should save modified properties', () => {
				const original = editor( undefined, {
					type: 'EDIT_POST',
					edits: {
						status: 'draft',
						title: 'post title',
						tags: [ 1 ],
					},
				} );

				const state = editor( original, {
					type: 'EDIT_POST',
					edits: {
						title: 'modified title',
						tags: [ 2 ],
					},
				} );

				expect( state.edits ).toEqual( {
					status: 'draft',
					title: 'modified title',
					tags: [ 2 ],
				} );
			} );

			it( 'should save initial post state', () => {
				const state = editor( undefined, {
					type: 'SETUP_NEW_POST',
					edits: {
						status: 'draft',
						title: 'post title',
					},
				} );

				expect( state.edits ).toEqual( {
					status: 'draft',
					title: 'post title',
				} );
			} );

			it( 'should omit content when resetting', () => {
				// Use case: When editing in Text mode, we defer to content on
				// the property, but we reset blocks by parse when switching
				// back to Visual mode.
				const original = deepFreeze( editor( undefined, {} ) );
				let state = editor( original, {
					type: 'EDIT_POST',
					edits: {
						content: 'bananas',
					},
				} );

				expect( state.edits ).toHaveProperty( 'content' );

				state = editor( original, {
					type: 'RESET_BLOCKS',
					blocks: [ {
						uid: 'kumquat',
						name: 'core/test-block',
						attributes: {},
					}, {
						uid: 'loquat',
						name: 'core/test-block',
						attributes: {},
					} ],
				} );

				expect( state.edits ).not.toHaveProperty( 'content' );
			} );
		} );

		describe( 'blocksByUid', () => {
			it( 'should return with attribute block updates', () => {
				const original = deepFreeze( editor( undefined, {
					type: 'RESET_BLOCKS',
					blocks: [ {
						uid: 'kumquat',
						attributes: {},
					} ],
				} ) );
				const state = editor( original, {
					type: 'UPDATE_BLOCK_ATTRIBUTES',
					uid: 'kumquat',
					attributes: {
						updated: true,
					},
				} );

				expect( state.blocksByUid.kumquat.attributes.updated ).toBe( true );
			} );

			it( 'should accumulate attribute block updates', () => {
				const original = deepFreeze( editor( undefined, {
					type: 'RESET_BLOCKS',
					blocks: [ {
						uid: 'kumquat',
						attributes: {
							updated: true,
						},
					} ],
				} ) );
				const state = editor( original, {
					type: 'UPDATE_BLOCK_ATTRIBUTES',
					uid: 'kumquat',
					attributes: {
						moreUpdated: true,
					},
				} );

				expect( state.blocksByUid.kumquat.attributes ).toEqual( {
					updated: true,
					moreUpdated: true,
				} );
			} );

			it( 'should ignore updates to non-existant block', () => {
				const original = deepFreeze( editor( undefined, {
					type: 'RESET_BLOCKS',
					blocks: [],
				} ) );
				const state = editor( original, {
					type: 'UPDATE_BLOCK_ATTRIBUTES',
					uid: 'kumquat',
					attributes: {
						updated: true,
					},
				} );

				expect( state.blocksByUid ).toBe( original.blocksByUid );
			} );

			it( 'should return with same reference if no changes in updates', () => {
				const original = deepFreeze( editor( undefined, {
					type: 'RESET_BLOCKS',
					blocks: [ {
						uid: 'kumquat',
						attributes: {
							updated: true,
						},
					} ],
				} ) );
				const state = editor( original, {
					type: 'UPDATE_BLOCK_ATTRIBUTES',
					uid: 'kumquat',
					attributes: {
						updated: true,
					},
				} );

				expect( state.blocksByUid ).toBe( state.blocksByUid );
			} );
		} );
	} );

	describe( 'currentPost()', () => {
		it( 'should reset a post object', () => {
			const original = deepFreeze( { title: 'unmodified' } );

			const state = currentPost( original, {
				type: 'RESET_POST',
				post: {
					title: 'new post',
				},
			} );

			expect( state ).toEqual( {
				title: 'new post',
			} );
		} );

		it( 'should update the post object with UPDATE_POST', () => {
			const original = deepFreeze( { title: 'unmodified', status: 'publish' } );

			const state = currentPost( original, {
				type: 'UPDATE_POST',
				edits: {
					title: 'updated post object from server',
				},
			} );

			expect( state ).toEqual( {
				title: 'updated post object from server',
				status: 'publish',
			} );
		} );
	} );

	describe( 'hoveredBlock()', () => {
		it( 'should return with block uid as hovered', () => {
			const state = hoveredBlock( null, {
				type: 'TOGGLE_BLOCK_HOVERED',
				uid: 'kumquat',
				hovered: true,
			} );

			expect( state ).toBe( 'kumquat' );
		} );

		it( 'should return null when a block is selected', () => {
			const state = hoveredBlock( 'kumquat', {
				type: 'SELECT_BLOCK',
				uid: 'kumquat',
			} );

			expect( state ).toBeNull();
		} );

		it( 'should replace the hovered block', () => {
			const state = hoveredBlock( 'chicken', {
				type: 'REPLACE_BLOCKS',
				uids: [ 'chicken' ],
				blocks: [ {
					uid: 'wings',
					name: 'core/freeform',
				} ],
			} );

			expect( state ).toBe( 'wings' );
		} );

		it( 'should keep the hovered block', () => {
			const state = hoveredBlock( 'chicken', {
				type: 'REPLACE_BLOCKS',
				uids: [ 'ribs' ],
				blocks: [ {
					uid: 'wings',
					name: 'core/freeform',
				} ],
			} );

			expect( state ).toBe( 'chicken' );
		} );
	} );

	describe( 'showInsertionPoint', () => {
		it( 'should show the insertion point', () => {
			const state = showInsertionPoint( undefined, {
				type: 'SHOW_INSERTION_POINT',
			} );

			expect( state ).toBe( true );
		} );

		it( 'should clear the insertion point', () => {
			const state = showInsertionPoint( {}, {
				type: 'HIDE_INSERTION_POINT',
			} );

			expect( state ).toBe( false );
		} );
	} );

	describe( 'isTyping()', () => {
		it( 'should set the typing flag to true', () => {
			const state = isTyping( false, {
				type: 'START_TYPING',
			} );

			expect( state ).toBe( true );
		} );

		it( 'should set the typing flag to false', () => {
			const state = isTyping( false, {
				type: 'STOP_TYPING',
			} );

			expect( state ).toBe( false );
		} );
	} );

	describe( 'blockSelection()', () => {
		it( 'should return with block uid as selected', () => {
			const state = blockSelection( undefined, {
				type: 'SELECT_BLOCK',
				uid: 'kumquat',
			} );

			expect( state ).toEqual( { start: 'kumquat', end: 'kumquat', focus: {} } );
		} );

		it( 'should set multi selection', () => {
			const state = blockSelection( undefined, {
				type: 'MULTI_SELECT',
				start: 'ribs',
				end: 'chicken',
			} );

			expect( state ).toEqual( { start: 'ribs', end: 'chicken', focus: null } );
		} );

		it( 'should unset multi selection and select inserted block', () => {
			const original = deepFreeze( { start: 'ribs', end: 'chicken' } );

			const state1 = blockSelection( original, {
				type: 'CLEAR_SELECTED_BLOCK',
			} );

			expect( state1 ).toEqual( { start: null, end: null, focus: null } );

			const state3 = blockSelection( original, {
				type: 'INSERT_BLOCKS',
				blocks: [ {
					uid: 'ribs',
					name: 'core/freeform',
				} ],
			} );

			expect( state3 ).toEqual( { start: 'ribs', end: 'ribs', focus: {} } );
		} );

		it( 'should return with block moved up', () => {
			const state = blockSelection( undefined, {
				type: 'MOVE_BLOCKS_UP',
				uids: [ 'ribs' ],
			} );

			expect( state ).toEqual( { start: 'ribs', end: 'ribs', focus: {} } );
		} );

		it( 'should return with block moved down', () => {
			const state = blockSelection( undefined, {
				type: 'MOVE_BLOCKS_DOWN',
				uids: [ 'chicken' ],
			} );

			expect( state ).toEqual( { start: 'chicken', end: 'chicken', focus: {} } );
		} );

		it( 'should not update the state if the block moved is already selected', () => {
			const original = deepFreeze( { start: 'ribs', end: 'ribs', focus: {} } );
			const state = blockSelection( original, {
				type: 'MOVE_BLOCKS_UP',
				uids: [ 'ribs' ],
			} );

			expect( state ).toBe( original );
		} );

		it( 'should update the focus and selects the block', () => {
			const state = blockSelection( undefined, {
				type: 'UPDATE_FOCUS',
				uid: 'chicken',
				config: { editable: 'citation' },
			} );

			expect( state ).toEqual( { start: 'chicken', end: 'chicken', focus: { editable: 'citation' } } );
		} );

		it( 'should update the focus and merge the existing state', () => {
			const original = deepFreeze( { start: 'ribs', end: 'ribs', focus: {} } );
			const state = blockSelection( original, {
				type: 'UPDATE_FOCUS',
				uid: 'ribs',
				config: { editable: 'citation' },
			} );

			expect( state ).toEqual( { start: 'ribs', end: 'ribs', focus: { editable: 'citation' } } );
		} );

		it( 'should replace the selected block', () => {
			const original = deepFreeze( { start: 'chicken', end: 'chicken', focus: { editable: 'citation' } } );
			const state = blockSelection( original, {
				type: 'REPLACE_BLOCKS',
				uids: [ 'chicken' ],
				blocks: [ {
					uid: 'wings',
					name: 'core/freeform',
				} ],
			} );

			expect( state ).toEqual( { start: 'wings', end: 'wings', focus: {} } );
		} );

		it( 'should keep the selected block', () => {
			const original = deepFreeze( { start: 'chicken', end: 'chicken', focus: { editable: 'citation' } } );
			const state = blockSelection( original, {
				type: 'REPLACE_BLOCKS',
				uids: [ 'ribs' ],
				blocks: [ {
					uid: 'wings',
					name: 'core/freeform',
				} ],
			} );

			expect( state ).toBe( original );
		} );
	} );

	describe( 'mode()', () => {
		it( 'should return "visual" by default', () => {
			const state = mode( undefined, {} );

			expect( state ).toBe( 'visual' );
		} );

		it( 'should return switched mode', () => {
			const state = mode( null, {
				type: 'SWITCH_MODE',
				mode: 'text',
			} );

			expect( state ).toBe( 'text' );
		} );
	} );

	describe( 'isSidebarOpened()', () => {
		it( 'should be opened by default', () => {
			const state = isSidebarOpened( undefined, {} );

			expect( state ).toBe( true );
		} );

		it( 'should toggle the sidebar open flag', () => {
			const state = isSidebarOpened( false, {
				type: 'TOGGLE_SIDEBAR',
			} );

			expect( state ).toBe( true );
		} );
	} );

	describe( 'saving()', () => {
		it( 'should update when a request is started', () => {
			const state = saving( null, {
				type: 'REQUEST_POST_UPDATE',
			} );
			expect( state ).toEqual( {
				requesting: true,
				successful: false,
				error: null,
			} );
		} );

		it( 'should update when a request succeeds', () => {
			const state = saving( null, {
				type: 'REQUEST_POST_UPDATE_SUCCESS',
			} );
			expect( state ).toEqual( {
				requesting: false,
				successful: true,
				error: null,
			} );
		} );

		it( 'should update when a request fails', () => {
			const state = saving( null, {
				type: 'REQUEST_POST_UPDATE_FAILURE',
				error: {
					code: 'pretend_error',
					message: 'update failed',
				},
			} );
			expect( state ).toEqual( {
				requesting: false,
				successful: false,
				error: {
					code: 'pretend_error',
					message: 'update failed',
				},
			} );
		} );
	} );

	describe( 'notices()', () => {
		it( 'should create a notice', () => {
			const originalState = {
				b: {
					id: 'b',
					content: 'Error saving',
					status: 'error',
				},
			};
			const state = notices( originalState, {
				type: 'CREATE_NOTICE',
				notice: {
					id: 'a',
					content: 'Post saved',
					status: 'success',
				},
			} );
			expect( state ).toEqual( {
				b: originalState.b,
				a: {
					id: 'a',
					content: 'Post saved',
					status: 'success',
				},
			} );
		} );

		it( 'should remove a notice', () => {
			const originalState = {
				a: {
					id: 'a',
					content: 'Post saved',
					status: 'success',
				},
				b: {
					id: 'b',
					content: 'Error saving',
					status: 'error',
				},
			};
			const state = notices( originalState, {
				type: 'REMOVE_NOTICE',
				noticeId: 'a',
			} );
			expect( state ).toEqual( {
				b: originalState.b,
			} );
		} );
	} );

	describe( 'createReduxStore()', () => {
		it( 'should return a redux store', () => {
			const store = createReduxStore();

			expect( typeof store.dispatch ).toBe( 'function' );
			expect( typeof store.getState ).toBe( 'function' );
		} );

		it( 'should have expected reducer keys', () => {
			const store = createReduxStore();
			const state = store.getState();

			expect( Object.keys( state ) ).toEqual( expect.arrayContaining( [
				'optimist',
				'editor',
				'currentPost',
				'isTyping',
				'blockSelection',
				'hoveredBlock',
				'mode',
				'isSidebarOpened',
				'saving',
				'showInsertionPoint',
				'notices',
			] ) );
		} );
	} );

	describe( 'userData()', () => {
		beforeAll( () => {
			registerBlockType( 'core/test-block', {
				save: noop,
				edit: noop,
				category: 'common',
			} );
		} );

		afterAll( () => {
			unregisterBlockType( 'core/test-block' );
		} );

		it( 'should record recently used blocks', () => {
			const original = userData( undefined, {} );
			const state = userData( original, {
				type: 'INSERT_BLOCKS',
				blocks: [ {
					uid: 'bacon',
					name: 'core-embed/twitter',
				} ],
			} );

			expect( state.recentlyUsedBlocks[ 0 ] ).toEqual( 'core-embed/twitter' );

			const twoRecentBlocks = userData( state, {
				type: 'INSERT_BLOCKS',
				blocks: [ {
					uid: 'eggs',
					name: 'core-embed/youtube',
				} ],
			} );

			expect( twoRecentBlocks.recentlyUsedBlocks[ 0 ] ).toEqual( 'core-embed/youtube' );
			expect( twoRecentBlocks.recentlyUsedBlocks[ 1 ] ).toEqual( 'core-embed/twitter' );
		} );

		it( 'should populate recently used blocks with the common category', () => {
			const initial = userData( undefined, {
				type: 'SETUP_EDITOR',
			} );

			expect( initial.recentlyUsedBlocks ).toEqual( expect.arrayContaining( [ 'core/paragraph' ] ) );
		} );
	} );
} );
