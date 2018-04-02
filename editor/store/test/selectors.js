/**
 * External dependencies
 */
import { filter, property, union } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType, unregisterBlockType, registerCoreBlocks, getBlockTypes } from '@wordpress/blocks';
import { moment } from '@wordpress/date';

/**
 * Internal dependencies
 */
import * as selectors from '../selectors';

const {
	hasEditorUndo,
	hasEditorRedo,
	isEditedPostNew,
	isEditedPostDirty,
	isCleanNewPost,
	getCurrentPost,
	getCurrentPostId,
	getCurrentPostLastRevisionId,
	getCurrentPostRevisionsCount,
	getCurrentPostType,
	getPostEdits,
	getDocumentTitle,
	getEditedPostExcerpt,
	getEditedPostVisibility,
	isCurrentPostPending,
	isCurrentPostPublished,
	isCurrentPostScheduled,
	isEditedPostPublishable,
	isEditedPostSaveable,
	isEditedPostEmpty,
	isEditedPostBeingScheduled,
	getEditedPostPreviewLink,
	getBlockDependantsCacheBust,
	getBlockName,
	getBlock,
	getBlocks,
	getBlockCount,
	hasSelectedBlock,
	getSelectedBlock,
	getBlockRootUID,
	getEditedPostAttribute,
	getMultiSelectedBlockUids,
	getMultiSelectedBlocks,
	getMultiSelectedBlocksStartUid,
	getMultiSelectedBlocksEndUid,
	getBlockOrder,
	getBlockIndex,
	getPreviousBlockUid,
	getNextBlockUid,
	isBlockSelected,
	isBlockWithinSelection,
	hasMultiSelection,
	isBlockMultiSelected,
	isFirstMultiSelectedBlock,
	getBlockMode,
	isTyping,
	getBlockInsertionPoint,
	isBlockInsertionPointVisible,
	isSavingPost,
	didPostSaveRequestSucceed,
	didPostSaveRequestFail,
	getSuggestedPostFormat,
	getNotices,
	getReusableBlock,
	isSavingReusableBlock,
	isFetchingReusableBlock,
	isSelectionEnabled,
	getReusableBlocks,
	getStateBeforeOptimisticTransaction,
	isPublishingPost,
	getInserterItems,
	getFrecentInserterItems,
	getProvisionalBlockUID,
	isValidTemplate,
	getTemplate,
	getTemplateLock,
	POST_UPDATE_TRANSACTION_ID,
} = selectors;

describe( 'selectors', () => {
	let cachedSelectors;

	beforeAll( () => {
		registerBlockType( 'core/test-block', {
			save: ( props ) => props.attributes.text,
			category: 'common',
			title: 'test block',
			icon: 'test',
			keywords: [ 'testing' ],
			useOnce: true,
		} );

		cachedSelectors = filter( selectors, property( 'clear' ) );
	} );

	beforeEach( () => {
		cachedSelectors.forEach( ( { clear } ) => clear() );
	} );

	afterAll( () => {
		unregisterBlockType( 'core/test-block' );
	} );

	describe( 'hasEditorUndo', () => {
		it( 'should return true when the past history is not empty', () => {
			const state = {
				editor: {
					past: [
						{},
					],
				},
			};

			expect( hasEditorUndo( state ) ).toBe( true );
		} );

		it( 'should return false when the past history is empty', () => {
			const state = {
				editor: {
					past: [],
				},
			};

			expect( hasEditorUndo( state ) ).toBe( false );
		} );
	} );

	describe( 'hasEditorRedo', () => {
		it( 'should return true when the future history is not empty', () => {
			const state = {
				editor: {
					future: [
						{},
					],
				},
			};

			expect( hasEditorRedo( state ) ).toBe( true );
		} );

		it( 'should return false when the future history is empty', () => {
			const state = {
				editor: {
					future: [],
				},
			};

			expect( hasEditorRedo( state ) ).toBe( false );
		} );
	} );

	describe( 'isEditedPostNew', () => {
		it( 'should return true when the post is new', () => {
			const state = {
				currentPost: {
					status: 'auto-draft',
				},
				editor: {
					present: {
						edits: {
							status: 'draft',
						},
					},
				},
			};

			expect( isEditedPostNew( state ) ).toBe( true );
		} );

		it( 'should return false when the post is not new', () => {
			const state = {
				currentPost: {
					status: 'draft',
				},
				editor: {
					present: {
						edits: {
							status: 'draft',
						},
					},
				},
			};

			expect( isEditedPostNew( state ) ).toBe( false );
		} );
	} );

	describe( 'isEditedPostDirty', () => {
		it( 'should return true when post saved state dirty', () => {
			const state = {
				editor: {
					isDirty: true,
				},
			};

			expect( isEditedPostDirty( state ) ).toBe( true );
		} );

		it( 'should return false when post saved state not dirty', () => {
			const state = {
				editor: {
					isDirty: false,
				},
			};

			expect( isEditedPostDirty( state ) ).toBe( false );
		} );
	} );

	describe( 'isCleanNewPost', () => {
		it( 'should return true when the post is not dirty and has not been saved before', () => {
			const state = {
				editor: {
					isDirty: false,
				},
				currentPost: {
					id: 1,
					status: 'auto-draft',
				},
			};

			expect( isCleanNewPost( state ) ).toBe( true );
		} );

		it( 'should return false when the post is not dirty but the post has been saved', () => {
			const state = {
				editor: {
					isDirty: false,
				},
				currentPost: {
					id: 1,
					status: 'draft',
				},
			};

			expect( isCleanNewPost( state ) ).toBe( false );
		} );

		it( 'should return false when the post is dirty but the post has not been saved', () => {
			const state = {
				editor: {
					isDirty: true,
				},
				currentPost: {
					id: 1,
					status: 'auto-draft',
				},
			};

			expect( isCleanNewPost( state ) ).toBe( false );
		} );
	} );

	describe( 'getCurrentPost', () => {
		it( 'should return the current post', () => {
			const state = {
				currentPost: { id: 1 },
			};

			expect( getCurrentPost( state ) ).toEqual( { id: 1 } );
		} );
	} );

	describe( 'getCurrentPostId', () => {
		it( 'should return null if the post has not yet been saved', () => {
			const state = {
				currentPost: {},
			};

			expect( getCurrentPostId( state ) ).toBeNull();
		} );

		it( 'should return the current post ID', () => {
			const state = {
				currentPost: { id: 1 },
			};

			expect( getCurrentPostId( state ) ).toBe( 1 );
		} );
	} );

	describe( 'getEditedPostAttribute', () => {
		it( 'should return the current post\'s slug if no edits have been made', () => {
			const state = {
				currentPost: { slug: 'post slug' },
			};

			expect( getEditedPostAttribute( state, 'slug' ) ).toBe( 'post slug' );
		} );

		it( 'should return the latest slug if edits have been made to the post', () => {
			const state = {
				currentPost: { slug: 'old slug' },
				editor: {
					present: {
						edits: {
							slug: 'new slug',
						},
					},
				},
			};

			expect( getEditedPostAttribute( state, 'slug' ) ).toBe( 'new slug' );
		} );

		it( 'should return the post saved title if the title is not edited', () => {
			const state = {
				currentPost: {
					title: 'sassel',
				},
				editor: {
					present: {
						edits: { status: 'private' },
					},
				},
			};

			expect( getEditedPostAttribute( state, 'title' ) ).toBe( 'sassel' );
		} );

		it( 'should return the edited title', () => {
			const state = {
				currentPost: {
					title: 'sassel',
				},
				editor: {
					present: {
						edits: { title: 'youcha' },
					},
				},
			};

			expect( getEditedPostAttribute( state, 'title' ) ).toBe( 'youcha' );
		} );
	} );

	describe( 'getCurrentPostLastRevisionId', () => {
		it( 'should return null if the post has not yet been saved', () => {
			const state = {
				currentPost: {},
			};

			expect( getCurrentPostLastRevisionId( state ) ).toBeNull();
		} );

		it( 'should return the last revision ID', () => {
			const state = {
				currentPost: {
					revisions: {
						last_id: 123,
					},
				},
			};

			expect( getCurrentPostLastRevisionId( state ) ).toBe( 123 );
		} );
	} );

	describe( 'getCurrentPostRevisionsCount', () => {
		it( 'should return 0 if the post has no revisions', () => {
			const state = {
				currentPost: {},
			};

			expect( getCurrentPostRevisionsCount( state ) ).toBe( 0 );
		} );

		it( 'should return the number of revisions', () => {
			const state = {
				currentPost: {
					revisions: {
						count: 5,
					},
				},
			};

			expect( getCurrentPostRevisionsCount( state ) ).toBe( 5 );
		} );
	} );

	describe( 'getCurrentPostType', () => {
		it( 'should return the post type', () => {
			const state = {
				currentPost: {
					type: 'post',
				},
			};

			expect( getCurrentPostType( state ) ).toBe( 'post' );
		} );
	} );

	describe( 'getPostEdits', () => {
		it( 'should return the post edits', () => {
			const state = {
				editor: {
					present: {
						edits: { title: 'terga' },
					},
				},
			};

			expect( getPostEdits( state ) ).toEqual( { title: 'terga' } );
		} );
	} );

	describe( 'getDocumentTitle', () => {
		it( 'should return current title unedited existing post', () => {
			const state = {
				currentPost: {
					id: 123,
					title: 'The Title',
				},
				editor: {
					present: {
						edits: {},
						blocksByUid: {},
						blockOrder: {},
					},
					isDirty: false,
				},
			};

			expect( getDocumentTitle( state ) ).toBe( 'The Title' );
		} );

		it( 'should return current title for edited existing post', () => {
			const state = {
				currentPost: {
					id: 123,
					title: 'The Title',
				},
				editor: {
					present: {
						edits: {
							title: 'Modified Title',
						},
					},
				},
			};

			expect( getDocumentTitle( state ) ).toBe( 'Modified Title' );
		} );

		it( 'should return new post title when new post is clean', () => {
			const state = {
				currentPost: {
					id: 1,
					status: 'auto-draft',
					title: '',
				},
				editor: {
					present: {
						edits: {},
						blocksByUid: {},
						blockOrder: {},
					},
					isDirty: false,
				},
			};

			expect( getDocumentTitle( state ) ).toBe( __( 'New post' ) );
		} );

		it( 'should return untitled title', () => {
			const state = {
				currentPost: {
					id: 123,
					status: 'draft',
					title: '',
				},
				editor: {
					present: {
						edits: {},
						blocksByUid: {},
						blockOrder: {},
					},
					isDirty: true,
				},
			};

			expect( getDocumentTitle( state ) ).toBe( __( '(Untitled)' ) );
		} );
	} );

	describe( 'getEditedPostExcerpt', () => {
		it( 'should return the post saved excerpt if the excerpt is not edited', () => {
			const state = {
				currentPost: {
					excerpt: 'sassel',
				},
				editor: {
					present: {
						edits: { status: 'private' },
					},
				},
			};

			expect( getEditedPostExcerpt( state ) ).toBe( 'sassel' );
		} );

		it( 'should return the edited excerpt', () => {
			const state = {
				currentPost: {
					excerpt: 'sassel',
				},
				editor: {
					present: {
						edits: { excerpt: 'youcha' },
					},
				},
			};

			expect( getEditedPostExcerpt( state ) ).toBe( 'youcha' );
		} );
	} );

	describe( 'getEditedPostVisibility', () => {
		it( 'should return public by default', () => {
			const state = {
				currentPost: {
					status: 'draft',
				},
				editor: {
					present: {
						edits: {},
					},
				},
			};

			expect( getEditedPostVisibility( state ) ).toBe( 'public' );
		} );

		it( 'should return private for private posts', () => {
			const state = {
				currentPost: {
					status: 'private',
				},
				editor: {
					present: {
						edits: {},
					},
				},
			};

			expect( getEditedPostVisibility( state ) ).toBe( 'private' );
		} );

		it( 'should return private for password for password protected posts', () => {
			const state = {
				currentPost: {
					status: 'draft',
					password: 'chicken',
				},
				editor: {
					present: {
						edits: {},
					},
				},
			};

			expect( getEditedPostVisibility( state ) ).toBe( 'password' );
		} );

		it( 'should use the edited status and password if edits present', () => {
			const state = {
				currentPost: {
					status: 'draft',
					password: 'chicken',
				},
				editor: {
					present: {
						edits: {
							status: 'private',
							password: null,
						},
					},
				},
			};

			expect( getEditedPostVisibility( state ) ).toBe( 'private' );
		} );
	} );

	describe( 'isCurrentPostPending', () => {
		it( 'should return true for posts in pending state', () => {
			const state = {
				currentPost: {
					status: 'pending',
				},
			};

			expect( isCurrentPostPending( state ) ).toBe( true );
		} );

		it( 'should return false for draft posts', () => {
			const state = {
				currentPost: {
					status: 'draft',
				},
			};

			expect( isCurrentPostPending( state ) ).toBe( false );
		} );

		it( 'should return false if status is unknown', () => {
			const state = {
				currentPost: {},
			};

			expect( isCurrentPostPending( state ) ).toBe( false );
		} );
	} );

	describe( 'isCurrentPostPublished', () => {
		it( 'should return true for public posts', () => {
			const state = {
				currentPost: {
					status: 'publish',
				},
			};

			expect( isCurrentPostPublished( state ) ).toBe( true );
		} );

		it( 'should return true for private posts', () => {
			const state = {
				currentPost: {
					status: 'private',
				},
			};

			expect( isCurrentPostPublished( state ) ).toBe( true );
		} );

		it( 'should return false for draft posts', () => {
			const state = {
				currentPost: {
					status: 'draft',
				},
			};

			expect( isCurrentPostPublished( state ) ).toBe( false );
		} );

		it( 'should return true for old scheduled posts', () => {
			const state = {
				currentPost: {
					status: 'future',
					date: '2016-05-30T17:21:39',
				},
			};

			expect( isCurrentPostPublished( state ) ).toBe( true );
		} );
	} );

	describe( 'isCurrentPostScheduled', () => {
		it( 'should return true for future scheduled posts', () => {
			const state = {
				currentPost: {
					status: 'future',
					date: '2100-05-30T17:21:39',
				},
			};

			expect( isCurrentPostScheduled( state ) ).toBe( true );
		} );

		it( 'should return false for old scheduled posts that were already published', () => {
			const state = {
				currentPost: {
					status: 'future',
					date: '2016-05-30T17:21:39',
				},
			};

			expect( isCurrentPostScheduled( state ) ).toBe( false );
		} );

		it( 'should return false for auto draft posts', () => {
			const state = {
				currentPost: {
					status: 'auto-draft',
				},
			};

			expect( isCurrentPostScheduled( state ) ).toBe( false );
		} );

		it( 'should return false if status is unknown', () => {
			const state = {
				currentPost: {},
			};

			expect( isCurrentPostScheduled( state ) ).toBe( false );
		} );
	} );

	describe( 'isEditedPostPublishable', () => {
		it( 'should return true for pending posts', () => {
			const state = {
				editor: {
					isDirty: false,
				},
				currentPost: {
					status: 'pending',
				},
			};

			expect( isEditedPostPublishable( state ) ).toBe( true );
		} );

		it( 'should return true for draft posts', () => {
			const state = {
				editor: {
					isDirty: false,
				},
				currentPost: {
					status: 'draft',
				},
			};

			expect( isEditedPostPublishable( state ) ).toBe( true );
		} );

		it( 'should return false for published posts', () => {
			const state = {
				editor: {
					isDirty: false,
				},
				currentPost: {
					status: 'publish',
				},
			};

			expect( isEditedPostPublishable( state ) ).toBe( false );
		} );

		it( 'should return true for published, dirty posts', () => {
			const state = {
				editor: {
					isDirty: true,
				},
				currentPost: {
					status: 'publish',
				},
			};

			expect( isEditedPostPublishable( state ) ).toBe( true );
		} );

		it( 'should return false for private posts', () => {
			const state = {
				editor: {
					isDirty: false,
				},
				currentPost: {
					status: 'private',
				},
			};

			expect( isEditedPostPublishable( state ) ).toBe( false );
		} );

		it( 'should return false for scheduled posts', () => {
			const state = {
				editor: {
					isDirty: false,
				},
				currentPost: {
					status: 'future',
				},
			};

			expect( isEditedPostPublishable( state ) ).toBe( false );
		} );

		it( 'should return true for dirty posts with usable title', () => {
			const state = {
				currentPost: {
					status: 'private',
				},
				editor: {
					isDirty: true,
				},
			};

			expect( isEditedPostPublishable( state ) ).toBe( true );
		} );
	} );

	describe( 'isEditedPostSaveable', () => {
		it( 'should return false if the post has no title, excerpt, content', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {},
						blockOrder: {},
						edits: {},
					},
				},
				currentPost: {},
			};

			expect( isEditedPostSaveable( state ) ).toBe( false );
		} );

		it( 'should return true if the post has a title', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {},
						blockOrder: {},
						edits: {},
					},
				},
				currentPost: {
					title: 'sassel',
				},
			};

			expect( isEditedPostSaveable( state ) ).toBe( true );
		} );

		it( 'should return true if the post has an excerpt', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {},
						blockOrder: {},
						edits: {},
					},
				},
				currentPost: {
					excerpt: 'sassel',
				},
			};

			expect( isEditedPostSaveable( state ) ).toBe( true );
		} );

		it( 'should return true if the post has content', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {
							123: {
								uid: 123,
								name: 'core/test-block',
								attributes: {
									text: '',
								},
							},
						},
						blockOrder: {
							'': [ 123 ],
						},
						edits: {},
					},
				},
				currentPost: {},
			};

			expect( isEditedPostSaveable( state ) ).toBe( true );
		} );
	} );

	describe( 'isEditedPostEmpty', () => {
		it( 'should return true if no blocks and no content', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {},
						blockOrder: {},
						edits: {},
					},
				},
				currentPost: {},
			};

			expect( isEditedPostEmpty( state ) ).toBe( true );
		} );

		it( 'should return false if blocks', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {
							123: {
								uid: 123,
								name: 'core/test-block',
								attributes: {
									text: '',
								},
							},
						},
						blockOrder: {
							'': [ 123 ],
						},
						edits: {},
					},
				},
				currentPost: {},
			};

			expect( isEditedPostEmpty( state ) ).toBe( false );
		} );

		it( 'should return true if the post has an empty content property', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {},
						blockOrder: {},
						edits: {},
					},
				},
				currentPost: {
					content: '',
				},
			};

			expect( isEditedPostEmpty( state ) ).toBe( true );
		} );

		it( 'should return false if edits include a non-empty content property', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {},
						blockOrder: {},
						edits: {
							content: 'sassel',
						},
					},
				},
				currentPost: {},
			};

			expect( isEditedPostEmpty( state ) ).toBe( false );
		} );
	} );

	describe( 'isEditedPostBeingScheduled', () => {
		it( 'should return true for posts with a future date', () => {
			const state = {
				editor: {
					present: {
						edits: { date: moment().add( 7, 'days' ).format( '' ) },
					},
				},
			};

			expect( isEditedPostBeingScheduled( state ) ).toBe( true );
		} );

		it( 'should return false for posts with an old date', () => {
			const state = {
				editor: {
					present: {
						edits: { date: '2016-05-30T17:21:39' },
					},
				},
			};

			expect( isEditedPostBeingScheduled( state ) ).toBe( false );
		} );
	} );

	describe( 'getEditedPostPreviewLink', () => {
		it( 'should return null if the post has not link yet', () => {
			const state = {
				currentPost: {},
			};

			expect( getEditedPostPreviewLink( state ) ).toBeNull();
		} );

		it( 'should return the correct url adding a preview parameter to the query string', () => {
			const state = {
				currentPost: {
					link: 'https://andalouses.com/beach',
				},
			};

			expect( getEditedPostPreviewLink( state ) ).toBe( 'https://andalouses.com/beach?preview=true' );
		} );
	} );

	describe( 'getBlockDependantsCacheBust', () => {
		const rootBlock = { uid: 123, name: 'core/paragraph', attributes: {} };
		const rootOrder = [ 123 ];

		it( 'returns an unchanging reference', () => {
			const rootBlockOrder = [];

			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							123: rootBlock,
						},
						blockOrder: {
							'': rootOrder,
							123: rootBlockOrder,
						},
						edits: {},
					},
				},
			};

			const nextState = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							123: rootBlock,
						},
						blockOrder: {
							'': rootOrder,
							123: rootBlockOrder,
						},
						edits: {},
					},
				},
			};

			expect(
				getBlockDependantsCacheBust( state, 123 )
			).toBe( getBlockDependantsCacheBust( nextState, 123 ) );
		} );

		it( 'returns a new reference on added inner block', () => {
			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							123: rootBlock,
						},
						blockOrder: {
							'': rootOrder,
							123: [],
						},
						edits: {},
					},
				},
			};

			const nextState = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							123: rootBlock,
							456: { uid: 456, name: 'core/paragraph', attributes: {} },
						},
						blockOrder: {
							'': rootOrder,
							123: [ 456 ],
							456: [],
						},
						edits: {},
					},
				},
			};

			expect(
				getBlockDependantsCacheBust( state, 123 )
			).not.toBe( getBlockDependantsCacheBust( nextState, 123 ) );
		} );

		it( 'returns an unchanging reference on unchanging inner block', () => {
			const rootBlockOrder = [ 456 ];
			const childBlock = { uid: 456, name: 'core/paragraph', attributes: {} };
			const childBlockOrder = [];

			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							123: rootBlock,
							456: childBlock,
						},
						blockOrder: {
							'': rootOrder,
							123: rootBlockOrder,
							456: childBlockOrder,
						},
						edits: {},
					},
				},
			};

			const nextState = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							123: rootBlock,
							456: childBlock,
						},
						blockOrder: {
							'': rootOrder,
							123: rootBlockOrder,
							456: childBlockOrder,
						},
						edits: {},
					},
				},
			};

			expect(
				getBlockDependantsCacheBust( state, 123 )
			).toBe( getBlockDependantsCacheBust( nextState, 123 ) );
		} );

		it( 'returns a new reference on updated inner block', () => {
			const rootBlockOrder = [ 456 ];
			const childBlockOrder = [];

			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							123: rootBlock,
							456: { uid: 456, name: 'core/paragraph', attributes: {} },
						},
						blockOrder: {
							'': rootOrder,
							123: rootBlockOrder,
							456: childBlockOrder,
						},
						edits: {},
					},
				},
			};

			const nextState = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							123: rootBlock,
							456: { uid: 456, name: 'core/paragraph', attributes: { content: [ 'foo' ] } },
						},
						blockOrder: {
							'': rootOrder,
							123: rootBlockOrder,
							456: childBlockOrder,
						},
						edits: {},
					},
				},
			};

			expect(
				getBlockDependantsCacheBust( state, 123 )
			).not.toBe( getBlockDependantsCacheBust( nextState, 123 ) );
		} );

		it( 'returns a new reference on updated grandchild inner block', () => {
			const rootBlockOrder = [ 456 ];
			const childBlock = { uid: 456, name: 'core/paragraph', attributes: {} };
			const childBlockOrder = [ 789 ];
			const grandChildBlockOrder = [];

			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							123: rootBlock,
							456: childBlock,
							789: { uid: 789, name: 'core/paragraph', attributes: {} },
						},
						blockOrder: {
							'': rootOrder,
							123: rootBlockOrder,
							456: childBlockOrder,
							789: grandChildBlockOrder,
						},
						edits: {},
					},
				},
			};

			const nextState = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							123: rootBlock,
							456: childBlock,
							789: { uid: 789, name: 'core/paragraph', attributes: { content: [ 'foo' ] } },
						},
						blockOrder: {
							'': rootOrder,
							123: rootBlockOrder,
							456: childBlockOrder,
							789: grandChildBlockOrder,
						},
						edits: {},
					},
				},
			};

			expect(
				getBlockDependantsCacheBust( state, 123 )
			).not.toBe( getBlockDependantsCacheBust( nextState, 123 ) );
		} );
	} );

	describe( 'getBlockName', () => {
		it( 'returns null if no block by uid', () => {
			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {},
						blockOrder: {},
						edits: {},
					},
				},
			};

			const name = getBlockName( state, 'afd1cb17-2c08-4e7a-91be-007ba7ddc3a1' );

			expect( name ).toBe( null );
		} );

		it( 'returns block name', () => {
			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							'afd1cb17-2c08-4e7a-91be-007ba7ddc3a1': {
								uid: 'afd1cb17-2c08-4e7a-91be-007ba7ddc3a1',
								name: 'core/paragraph',
								attributes: {},
							},
						},
						blockOrder: {
							'': [ 'afd1cb17-2c08-4e7a-91be-007ba7ddc3a1' ],
							'afd1cb17-2c08-4e7a-91be-007ba7ddc3a1': [],
						},
						edits: {},
					},
				},
			};

			const name = getBlockName( state, 'afd1cb17-2c08-4e7a-91be-007ba7ddc3a1' );

			expect( name ).toBe( 'core/paragraph' );
		} );
	} );

	describe( 'getBlock', () => {
		it( 'should return the block', () => {
			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							123: { uid: 123, name: 'core/paragraph', attributes: {} },
						},
						blockOrder: {
							'': [ 123 ],
							123: [],
						},
						edits: {},
					},
				},
			};

			expect( getBlock( state, 123 ) ).toEqual( {
				uid: 123,
				name: 'core/paragraph',
				attributes: {},
				innerBlocks: [],
			} );
		} );

		it( 'should return null if the block is not present in state', () => {
			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {},
						blockOrder: {},
						edits: {},
					},
				},
			};

			expect( getBlock( state, 123 ) ).toBe( null );
		} );

		it( 'should include inner blocks', () => {
			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							123: { uid: 123, name: 'core/paragraph', attributes: {} },
							456: { uid: 456, name: 'core/paragraph', attributes: {} },
						},
						blockOrder: {
							'': [ 123 ],
							123: [ 456 ],
							456: [],
						},
						edits: {},
					},
				},
			};

			expect( getBlock( state, 123 ) ).toEqual( {
				uid: 123,
				name: 'core/paragraph',
				attributes: {},
				innerBlocks: [ {
					uid: 456,
					name: 'core/paragraph',
					attributes: {},
					innerBlocks: [],
				} ],
			} );
		} );

		it( 'should merge meta attributes for the block', () => {
			registerBlockType( 'core/meta-block', {
				save: ( props ) => props.attributes.text,
				category: 'common',
				title: 'test block',
				attributes: {
					foo: {
						type: 'string',
						source: 'meta',
						meta: 'foo',
					},
				},
			} );

			const state = {
				currentPost: {
					meta: {
						foo: 'bar',
					},
				},
				editor: {
					present: {
						blocksByUid: {
							123: { uid: 123, name: 'core/meta-block', attributes: {} },
						},
						blockOrder: {
							'': [ 123 ],
							123: [],
						},
						edits: {},
					},
				},
			};

			expect( getBlock( state, 123 ) ).toEqual( {
				uid: 123,
				name: 'core/meta-block',
				attributes: {
					foo: 'bar',
				},
				innerBlocks: [],
			} );
		} );
	} );

	describe( 'getBlocks', () => {
		it( 'should return the ordered blocks', () => {
			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							23: { uid: 23, name: 'core/heading', attributes: {} },
							123: { uid: 123, name: 'core/paragraph', attributes: {} },
						},
						blockOrder: {
							'': [ 123, 23 ],
						},
						edits: {},
					},
				},
			};

			expect( getBlocks( state ) ).toEqual( [
				{ uid: 123, name: 'core/paragraph', attributes: {}, innerBlocks: [] },
				{ uid: 23, name: 'core/heading', attributes: {}, innerBlocks: [] },
			] );
		} );
	} );

	describe( 'getBlockCount', () => {
		it( 'should return the number of top-level blocks in the post', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {
							23: { uid: 23, name: 'core/heading', attributes: {} },
							123: { uid: 123, name: 'core/paragraph', attributes: {} },
						},
						blockOrder: {
							'': [ 123, 23 ],
						},
					},
				},
			};

			expect( getBlockCount( state ) ).toBe( 2 );
		} );

		it( 'should return the number of blocks in a nested context', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {
							123: { uid: 123, name: 'core/columns', attributes: {} },
							456: { uid: 456, name: 'core/paragraph', attributes: {} },
							789: { uid: 789, name: 'core/paragraph', attributes: {} },
						},
						blockOrder: {
							'': [ 123 ],
							123: [ 456, 789 ],
						},
					},
				},
			};

			expect( getBlockCount( state, '123' ) ).toBe( 2 );
		} );
	} );

	describe( 'hasSelectedBlock', () => {
		it( 'should return false if no selection', () => {
			const state = {
				blockSelection: {
					start: null,
					end: null,
				},
			};

			expect( hasSelectedBlock( state ) ).toBe( false );
		} );

		it( 'should return false if multi-selection', () => {
			const state = {
				blockSelection: {
					start: 'afd1cb17-2c08-4e7a-91be-007ba7ddc3a1',
					end: '9db792c6-a25a-495d-adbd-97d56a4c4189',
				},
			};

			expect( hasSelectedBlock( state ) ).toBe( false );
		} );

		it( 'should return true if singular selection', () => {
			const state = {
				blockSelection: {
					start: 'afd1cb17-2c08-4e7a-91be-007ba7ddc3a1',
					end: 'afd1cb17-2c08-4e7a-91be-007ba7ddc3a1',
				},
			};

			expect( hasSelectedBlock( state ) ).toBe( true );
		} );
	} );

	describe( 'getSelectedBlock', () => {
		it( 'should return null if no block is selected', () => {
			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							23: { uid: 23, name: 'core/heading', attributes: {} },
							123: { uid: 123, name: 'core/paragraph', attributes: {} },
						},
						blockOrder: {
							'': [ 23, 123 ],
							23: [],
							123: [],
						},
						edits: {},
					},
				},
				blockSelection: { start: null, end: null },
			};

			expect( getSelectedBlock( state ) ).toBe( null );
		} );

		it( 'should return null if there is multi selection', () => {
			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							23: { uid: 23, name: 'core/heading', attributes: {} },
							123: { uid: 123, name: 'core/paragraph', attributes: {} },
						},
						blockOrder: {
							'': [ 23, 123 ],
							23: [],
							123: [],
						},
						edits: {},
					},
				},
				blockSelection: { start: 23, end: 123 },
			};

			expect( getSelectedBlock( state ) ).toBe( null );
		} );

		it( 'should return the selected block', () => {
			const state = {
				currentPost: {},
				editor: {
					present: {
						blocksByUid: {
							23: { uid: 23, name: 'core/heading', attributes: {} },
							123: { uid: 123, name: 'core/paragraph', attributes: {} },
						},
						blockOrder: {
							'': [ 23, 123 ],
							23: [],
							123: [],
						},
						edits: {},
					},
				},
				blockSelection: { start: 23, end: 23 },
			};

			expect( getSelectedBlock( state ) ).toEqual( {
				uid: 23,
				name: 'core/heading',
				attributes: {},
				innerBlocks: [],
			} );
		} );
	} );

	describe( 'getBlockRootUID', () => {
		it( 'should return null if the block does not exist', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {},
					},
				},
			};

			expect( getBlockRootUID( state, 56 ) ).toBeNull();
		} );

		it( 'should return root UID relative the block UID', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
							123: [ 456, 56 ],
						},
					},
				},
			};

			expect( getBlockRootUID( state, 56 ) ).toBe( '123' );
		} );
	} );

	describe( 'getMultiSelectedBlockUids', () => {
		it( 'should return empty if there is no multi selection', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
						},
					},
				},
				blockSelection: { start: null, end: null },
			};

			expect( getMultiSelectedBlockUids( state ) ).toEqual( [] );
		} );

		it( 'should return selected block uids if there is multi selection', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 5, 4, 3, 2, 1 ],
						},
					},
				},
				blockSelection: { start: 2, end: 4 },
			};

			expect( getMultiSelectedBlockUids( state ) ).toEqual( [ 4, 3, 2 ] );
		} );

		it( 'should return selected block uids if there is multi selection (nested context)', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 5, 4, 3, 2, 1 ],
							4: [ 9, 8, 7, 6 ],
						},
					},
				},
				blockSelection: { start: 7, end: 9 },
			};

			expect( getMultiSelectedBlockUids( state ) ).toEqual( [ 9, 8, 7 ] );
		} );
	} );

	describe( 'getMultiSelectedBlocks', () => {
		it( 'should return the same reference on subsequent invocations of empty selection', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {},
						blockOrder: {},
						edits: {},
					},
				},
				blockSelection: { start: null, end: null },
				currentPost: {},
			};

			expect(
				getMultiSelectedBlocks( state )
			).toBe( getMultiSelectedBlocks( state ) );
		} );
	} );

	describe( 'getMultiSelectedBlocksStartUid', () => {
		it( 'returns null if there is no multi selection', () => {
			const state = {
				blockSelection: { start: null, end: null },
			};

			expect( getMultiSelectedBlocksStartUid( state ) ).toBeNull();
		} );

		it( 'returns multi selection start', () => {
			const state = {
				blockSelection: { start: 2, end: 4 },
			};

			expect( getMultiSelectedBlocksStartUid( state ) ).toBe( 2 );
		} );
	} );

	describe( 'getMultiSelectedBlocksEndUid', () => {
		it( 'returns null if there is no multi selection', () => {
			const state = {
				blockSelection: { start: null, end: null },
			};

			expect( getMultiSelectedBlocksEndUid( state ) ).toBeNull();
		} );

		it( 'returns multi selection end', () => {
			const state = {
				blockSelection: { start: 2, end: 4 },
			};

			expect( getMultiSelectedBlocksEndUid( state ) ).toBe( 4 );
		} );
	} );

	describe( 'getBlockOrder', () => {
		it( 'should return the ordered block UIDs of top-level blocks by default', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
						},
					},
				},
			};

			expect( getBlockOrder( state ) ).toEqual( [ 123, 23 ] );
		} );

		it( 'should return the ordered block UIDs at a specified rootUID', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
							123: [ 456 ],
						},
					},
				},
			};

			expect( getBlockOrder( state, '123' ) ).toEqual( [ 456 ] );
		} );
	} );

	describe( 'getBlockIndex', () => {
		it( 'should return the block order', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
						},
					},
				},
			};

			expect( getBlockIndex( state, 23 ) ).toBe( 1 );
		} );

		it( 'should return the block order (nested context)', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
							123: [ 456, 56 ],
						},
					},
				},
			};

			expect( getBlockIndex( state, 56, '123' ) ).toBe( 1 );
		} );
	} );

	describe( 'getPreviousBlockUid', () => {
		it( 'should return the previous block', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
						},
					},
				},
			};

			expect( getPreviousBlockUid( state, 23 ) ).toEqual( 123 );
		} );

		it( 'should return the previous block (nested context)', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
							123: [ 456, 56 ],
						},
					},
				},
			};

			expect( getPreviousBlockUid( state, 56, '123' ) ).toEqual( 456 );
		} );

		it( 'should return null for the first block', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
						},
					},
				},
			};

			expect( getPreviousBlockUid( state, 123 ) ).toBeNull();
		} );

		it( 'should return null for the first block (nested context)', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
							123: [ 456, 56 ],
						},
					},
				},
			};

			expect( getPreviousBlockUid( state, 456, '123' ) ).toBeNull();
		} );
	} );

	describe( 'getNextBlockUid', () => {
		it( 'should return the following block', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
						},
					},
				},
			};

			expect( getNextBlockUid( state, 123 ) ).toEqual( 23 );
		} );

		it( 'should return the following block (nested context)', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
							123: [ 456, 56 ],
						},
					},
				},
			};

			expect( getNextBlockUid( state, 456, '123' ) ).toEqual( 56 );
		} );

		it( 'should return null for the last block', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
						},
					},
				},
			};

			expect( getNextBlockUid( state, 23 ) ).toBeNull();
		} );

		it( 'should return null for the last block (nested context)', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 23 ],
							123: [ 456, 56 ],
						},
					},
				},
			};

			expect( getNextBlockUid( state, 56, '123' ) ).toBeNull();
		} );
	} );

	describe( 'isBlockSelected', () => {
		it( 'should return true if the block is selected', () => {
			const state = {
				blockSelection: { start: 123, end: 123 },
			};

			expect( isBlockSelected( state, 123 ) ).toBe( true );
		} );

		it( 'should return false if a multi-selection range exists', () => {
			const state = {
				blockSelection: { start: 123, end: 124 },
			};

			expect( isBlockSelected( state, 123 ) ).toBe( false );
		} );

		it( 'should return false if the block is not selected', () => {
			const state = {
				blockSelection: { start: null, end: null },
			};

			expect( isBlockSelected( state, 23 ) ).toBe( false );
		} );
	} );

	describe( 'isBlockWithinSelection', () => {
		it( 'should return true if the block is selected but not the last', () => {
			const state = {
				blockSelection: { start: 5, end: 3 },
				editor: {
					present: {
						blockOrder: {
							'': [ 5, 4, 3, 2, 1 ],
						},
					},
				},
			};

			expect( isBlockWithinSelection( state, 4 ) ).toBe( true );
		} );

		it( 'should return false if the block is the last selected', () => {
			const state = {
				blockSelection: { start: 5, end: 3 },
				editor: {
					present: {
						blockOrder: {
							'': [ 5, 4, 3, 2, 1 ],
						},
					},
				},
			};

			expect( isBlockWithinSelection( state, 3 ) ).toBe( false );
		} );

		it( 'should return false if the block is not selected', () => {
			const state = {
				blockSelection: { start: 5, end: 3 },
				editor: {
					present: {
						blockOrder: {
							'': [ 5, 4, 3, 2, 1 ],
						},
					},
				},
			};

			expect( isBlockWithinSelection( state, 2 ) ).toBe( false );
		} );

		it( 'should return false if there is no selection', () => {
			const state = {
				blockSelection: {},
				editor: {
					present: {
						blockOrder: {
							'': [ 5, 4, 3, 2, 1 ],
						},
					},
				},
			};

			expect( isBlockWithinSelection( state, 4 ) ).toBe( false );
		} );
	} );

	describe( 'hasMultiSelection', () => {
		it( 'should return false if no selection', () => {
			const state = {
				blockSelection: {
					start: null,
					end: null,
				},
			};

			expect( hasMultiSelection( state ) ).toBe( false );
		} );

		it( 'should return false if singular selection', () => {
			const state = {
				blockSelection: {
					start: 'afd1cb17-2c08-4e7a-91be-007ba7ddc3a1',
					end: 'afd1cb17-2c08-4e7a-91be-007ba7ddc3a1',
				},
			};

			expect( hasMultiSelection( state ) ).toBe( false );
		} );

		it( 'should return true if multi-selection', () => {
			const state = {
				blockSelection: {
					start: 'afd1cb17-2c08-4e7a-91be-007ba7ddc3a1',
					end: '9db792c6-a25a-495d-adbd-97d56a4c4189',
				},
			};

			expect( hasMultiSelection( state ) ).toBe( true );
		} );
	} );

	describe( 'isBlockMultiSelected', () => {
		const state = {
			editor: {
				present: {
					blockOrder: {
						'': [ 5, 4, 3, 2, 1 ],
					},
				},
			},
			blockSelection: { start: 2, end: 4 },
		};

		it( 'should return true if the block is multi selected', () => {
			expect( isBlockMultiSelected( state, 3 ) ).toBe( true );
		} );

		it( 'should return false if the block is not multi selected', () => {
			expect( isBlockMultiSelected( state, 5 ) ).toBe( false );
		} );
	} );

	describe( 'isFirstMultiSelectedBlock', () => {
		const state = {
			editor: {
				present: {
					blockOrder: {
						'': [ 5, 4, 3, 2, 1 ],
					},
				},
			},
			blockSelection: { start: 2, end: 4 },
		};

		it( 'should return true if the block is first in multi selection', () => {
			expect( isFirstMultiSelectedBlock( state, 4 ) ).toBe( true );
		} );

		it( 'should return false if the block is not first in multi selection', () => {
			expect( isFirstMultiSelectedBlock( state, 3 ) ).toBe( false );
		} );
	} );

	describe( 'geteBlockMode', () => {
		it( 'should return "visual" if unset', () => {
			const state = {
				blocksMode: {},
			};

			expect( getBlockMode( state, 123 ) ).toEqual( 'visual' );
		} );

		it( 'should return the block mode', () => {
			const state = {
				blocksMode: {
					123: 'html',
				},
			};

			expect( getBlockMode( state, 123 ) ).toEqual( 'html' );
		} );
	} );

	describe( 'isTyping', () => {
		it( 'should return the isTyping flag if the block is selected', () => {
			const state = {
				isTyping: true,
			};

			expect( isTyping( state ) ).toBe( true );
		} );

		it( 'should return false if the block is not selected', () => {
			const state = {
				isTyping: false,
			};

			expect( isTyping( state ) ).toBe( false );
		} );
	} );

	describe( 'isSelectionEnabled', () => {
		it( 'should return true if selection is enable', () => {
			const state = {
				blockSelection: {
					isEnabled: true,
				},
			};

			expect( isSelectionEnabled( state ) ).toBe( true );
		} );

		it( 'should return false if selection is disabled', () => {
			const state = {
				blockSelection: {
					isEnabled: false,
				},
			};

			expect( isSelectionEnabled( state ) ).toBe( false );
		} );
	} );

	describe( 'getBlockInsertionPoint', () => {
		it( 'should return an object for the selected block', () => {
			const state = {
				currentPost: {},
				preferences: { mode: 'visual' },
				blockSelection: {
					start: 'uid1',
					end: 'uid1',
				},
				editor: {
					present: {
						blocksByUid: {
							uid1: { uid: 'uid1' },
						},
						blockOrder: {
							'': [ 'uid1' ],
							uid1: [],
						},
						edits: {},
					},
				},
				isInsertionPointVisible: false,
			};

			expect( getBlockInsertionPoint( state ) ).toEqual( {
				rootUID: undefined,
				layout: undefined,
				index: 1,
			} );
		} );

		it( 'should return an object for the nested selected block', () => {
			const state = {
				currentPost: {},
				preferences: { mode: 'visual' },
				blockSelection: {
					start: 'uid2',
					end: 'uid2',
				},
				editor: {
					present: {
						blocksByUid: {
							uid1: { uid: 'uid1' },
							uid2: { uid: 'uid2' },
						},
						blockOrder: {
							'': [ 'uid1' ],
							uid1: [ 'uid2' ],
							uid2: [],
						},
						edits: {},
					},
				},
				isInsertionPointVisible: false,
			};

			expect( getBlockInsertionPoint( state ) ).toEqual( {
				rootUID: 'uid1',
				layout: undefined,
				index: 1,
			} );
		} );

		it( 'should return an object for the selected block with layout', () => {
			const state = {
				currentPost: {},
				preferences: { mode: 'visual' },
				blockSelection: {
					start: 'uid1',
					end: 'uid1',
				},
				editor: {
					present: {
						blocksByUid: {
							uid1: { uid: 'uid1', attributes: { layout: 'wide' } },
						},
						blockOrder: {
							'': [ 'uid1' ],
							uid1: [],
						},
						edits: {},
					},
				},
				isInsertionPointVisible: false,
			};

			expect( getBlockInsertionPoint( state ) ).toEqual( {
				rootUID: undefined,
				layout: 'wide',
				index: 1,
			} );
		} );

		it( 'should return an object for the last multi selected uid', () => {
			const state = {
				currentPost: {},
				preferences: { mode: 'visual' },
				blockSelection: {
					start: 'uid1',
					end: 'uid2',
				},
				editor: {
					present: {
						blocksByUid: {
							uid1: { uid: 'uid1' },
							uid2: { uid: 'uid2' },
						},
						blockOrder: {
							'': [ 'uid1', 'uid2' ],
							uid1: [],
							uid2: [],
						},
						edits: {},
					},
				},
				isInsertionPointVisible: false,
			};

			expect( getBlockInsertionPoint( state ) ).toEqual( {
				rootUID: undefined,
				layout: undefined,
				index: 2,
			} );
		} );

		it( 'should return an object for the last block if no selection', () => {
			const state = {
				currentPost: {},
				preferences: { mode: 'visual' },
				blockSelection: {
					start: null,
					end: null,
				},
				editor: {
					present: {
						blocksByUid: {
							uid1: { uid: 'uid1' },
							uid2: { uid: 'uid2' },
						},
						blockOrder: {
							'': [ 'uid1', 'uid2' ],
							uid1: [],
							uid2: [],
						},
						edits: {},
					},
				},
				isInsertionPointVisible: false,
			};

			expect( getBlockInsertionPoint( state ) ).toEqual( {
				rootUID: undefined,
				layout: undefined,
				index: 2,
			} );
		} );
	} );

	describe( 'isBlockInsertionPointVisible', () => {
		it( 'should return the value in state', () => {
			const state = {
				isInsertionPointVisible: true,
			};

			expect( isBlockInsertionPointVisible( state ) ).toBe( true );
		} );
	} );

	describe( 'isSavingPost', () => {
		it( 'should return true if the post is currently being saved', () => {
			const state = {
				saving: {
					requesting: true,
				},
			};

			expect( isSavingPost( state ) ).toBe( true );
		} );

		it( 'should return false if the post is not currently being saved', () => {
			const state = {
				saving: {
					requesting: false,
				},
			};

			expect( isSavingPost( state ) ).toBe( false );
		} );
	} );

	describe( 'didPostSaveRequestSucceed', () => {
		it( 'should return true if the post save request is successful', () => {
			const state = {
				saving: {
					successful: true,
				},
			};

			expect( didPostSaveRequestSucceed( state ) ).toBe( true );
		} );

		it( 'should return true if the post save request has failed', () => {
			const state = {
				saving: {
					successful: false,
				},
			};

			expect( didPostSaveRequestSucceed( state ) ).toBe( false );
		} );
	} );

	describe( 'didPostSaveRequestFail', () => {
		it( 'should return true if the post save request has failed', () => {
			const state = {
				saving: {
					error: 'error',
				},
			};

			expect( didPostSaveRequestFail( state ) ).toBe( true );
		} );

		it( 'should return true if the post save request is successful', () => {
			const state = {
				saving: {
					error: false,
				},
			};

			expect( didPostSaveRequestFail( state ) ).toBe( false );
		} );
	} );

	describe( 'getSuggestedPostFormat', () => {
		it( 'returns null if cannot be determined', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {},
						blocksByUid: {},
						edits: {},
					},
				},
				currentPost: {},
			};

			expect( getSuggestedPostFormat( state ) ).toBeNull();
		} );

		it( 'returns null if there is more than one block in the post', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123, 456 ],
						},
						blocksByUid: {
							123: { uid: 123, name: 'core/image', attributes: {} },
							456: { uid: 456, name: 'core/quote', attributes: {} },
						},
						edits: {},
					},
				},
				currentPost: {},
			};

			expect( getSuggestedPostFormat( state ) ).toBeNull();
		} );

		it( 'returns Image if the first block is of type `core/image`', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 123 ],
						},
						blocksByUid: {
							123: { uid: 123, name: 'core/image', attributes: {} },
						},
						edits: {},
					},
				},
				currentPost: {},
			};

			expect( getSuggestedPostFormat( state ) ).toBe( 'image' );
		} );

		it( 'returns Quote if the first block is of type `core/quote`', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 456 ],
						},
						blocksByUid: {
							456: { uid: 456, name: 'core/quote', attributes: {} },
						},
						edits: {},
					},
				},
				currentPost: {},
			};

			expect( getSuggestedPostFormat( state ) ).toBe( 'quote' );
		} );

		it( 'returns Video if the first block is of type `core-embed/youtube`', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 567 ],
						},
						blocksByUid: {
							567: { uid: 567, name: 'core-embed/youtube', attributes: {} },
						},
						edits: {},
					},
				},
				currentPost: {},
			};

			expect( getSuggestedPostFormat( state ) ).toBe( 'video' );
		} );

		it( 'returns Quote if the first block is of type `core/quote` and second is of type `core/paragraph`', () => {
			const state = {
				editor: {
					present: {
						blockOrder: {
							'': [ 456, 789 ],
						},
						blocksByUid: {
							456: { uid: 456, name: 'core/quote', attributes: {} },
							789: { uid: 789, name: 'core/paragraph', attributes: {} },
						},
						edits: {},
					},
				},
				currentPost: {},
			};

			expect( getSuggestedPostFormat( state ) ).toBe( 'quote' );
		} );
	} );

	describe( 'getNotices', () => {
		it( 'should return the notices array', () => {
			const state = {
				notices: [
					{ id: 'b', content: 'Post saved' },
					{ id: 'a', content: 'Error saving' },
				],
			};

			expect( getNotices( state ) ).toEqual( state.notices );
		} );
	} );

	describe( 'getInserterItems', () => {
		it( 'should list all non-private regular block types', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {},
						blockOrder: {},
						edits: {},
					},
				},
				currentPost: {},
				reusableBlocks: {
					data: {},
				},
			};

			const blockTypes = getBlockTypes().filter( blockType => ! blockType.isPrivate );
			expect( getInserterItems( state ) ).toHaveLength( blockTypes.length );
		} );

		it( 'should properly list a regular block type', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {},
						blockOrder: {},
						edits: {},
					},
				},
				currentPost: {},
				reusableBlocks: {
					data: {},
				},
			};

			expect( getInserterItems( state, [ 'core/test-block' ] ) ).toEqual( [
				{
					id: 'core/test-block',
					name: 'core/test-block',
					initialAttributes: {},
					title: 'test block',
					icon: 'test',
					category: 'common',
					keywords: [ 'testing' ],
					isDisabled: false,
				},
			] );
		} );

		it( 'should set isDisabled when a regular block type with useOnce has been used', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {
							1: { uid: 1, name: 'core/test-block', attributes: {} },
						},
						blockOrder: {
							'': [ 1 ],
						},
						edits: {},
					},
				},
				currentPost: {},
				reusableBlocks: {
					data: {},
				},
			};

			const items = getInserterItems( state, [ 'core/test-block' ] );
			expect( items[ 0 ].isDisabled ).toBe( true );
		} );

		it( 'should properly list reusable blocks', () => {
			const state = {
				editor: {
					present: {
						blocksByUid: {
							carrot: { name: 'core/test-block' },
						},
						blockOrder: {},
						edits: {},
					},
				},
				currentPost: {},
				reusableBlocks: {
					data: {
						123: { uid: 'carrot', title: 'My reusable block' },
					},
				},
			};

			expect( getInserterItems( state, [ 'core/block' ] ) ).toEqual( [
				{
					id: 'core/block/123',
					name: 'core/block',
					initialAttributes: { ref: 123 },
					title: 'My reusable block',
					icon: 'test',
					category: 'shared',
					keywords: [],
					isDisabled: false,
				},
			] );
		} );

		it( 'should return nothing when all block types are disabled', () => {
			expect( getInserterItems( {}, false ) ).toEqual( [] );
		} );
	} );

	describe( 'getFrecentInserterItems', () => {
		beforeAll( () => {
			registerCoreBlocks();
		} );

		it( 'should return the most frecently used blocks', () => {
			const state = {
				preferences: {
					insertUsage: {
						'core/deleted-block': { time: 1000, count: 10, insert: { name: 'core/deleted-block' } }, // Deleted blocks should be filtered out
						'core/block/456': { time: 1000, count: 4, insert: { name: 'core/block', ref: 456 } }, // Deleted reusable blocks should be filtered out
						'core/image': { time: 1000, count: 3, insert: { name: 'core/image' } },
						'core/block/123': { time: 1000, count: 5, insert: { name: 'core/block', ref: 123 } },
						'core/paragraph': { time: 1000, count: 2, insert: { name: 'core/paragraph' } },
					},
				},
				editor: {
					present: {
						blocksByUid: {
							carrot: { name: 'core/test-block' },
						},
						blockOrder: [],
						edits: {},
					},
				},
				reusableBlocks: {
					data: {
						123: { uid: 'carrot' },
					},
				},
				currentPost: {},
			};

			expect( getFrecentInserterItems( state, true, 3 ) ).toMatchObject( [
				{ name: 'core/block', initialAttributes: { ref: 123 } },
				{ name: 'core/image', initialAttributes: {} },
				{ name: 'core/paragraph', initialAttributes: {} },
			] );
		} );

		it( 'should weight by time', () => {
			const state = {
				preferences: {
					insertUsage: {
						'core/image': { time: Date.now() - 1000, count: 2, insert: { name: 'core/image' } },
						'core/paragraph': { time: Date.now() - 4000, count: 3, insert: { name: 'core/paragraph' } },
					},
				},
				editor: {
					present: {
						blockOrder: [],
					},
				},
				reusableBlocks: {
					data: {},
				},
			};

			expect( getFrecentInserterItems( state, true, 2 ) ).toMatchObject( [
				{ name: 'core/image', initialAttributes: {} },
				{ name: 'core/paragraph', initialAttributes: {} },
			] );
		} );

		it( 'should be backwards-compatible with old preferences values', () => {
			const state = {
				preferences: {
					insertUsage: {
						'core/image': { time: Date.now(), count: 1, insert: { name: 'core/image' } },
						'core/paragraph': { time: undefined, count: 5, insert: { name: 'core/paragraph' } },
					},
				},
				editor: {
					present: {
						blockOrder: [],
					},
				},
				reusableBlocks: {
					data: {},
				},
			};

			expect( getFrecentInserterItems( state, true, 2 ) ).toMatchObject( [
				{ name: 'core/paragraph', initialAttributes: {} },
				{ name: 'core/image', initialAttributes: {} },
			] );
		} );

		it( 'should pad list out with blocks from the common category', () => {
			const state = {
				preferences: {
					insertUsage: {
						'core/image': { time: 1000, count: 2, insert: { name: 'core/paragraph' } },
					},
				},
				editor: {
					present: {
						blockOrder: [],
					},
				},
			};

			// We should get back 4 items with no duplicates
			const items = getFrecentInserterItems( state, true, 4 );
			const blockNames = items.map( item => item.name );
			expect( union( blockNames ) ).toHaveLength( 4 );
		} );
	} );

	describe( 'getReusableBlock', () => {
		it( 'should return a reusable block', () => {
			const state = {
				reusableBlocks: {
					data: {
						8109: {
							uid: 'foo',
							title: 'My cool block',
						},
					},
				},
			};

			const actualReusableBlock = getReusableBlock( state, 8109 );
			expect( actualReusableBlock ).toEqual( {
				id: 8109,
				isTemporary: false,
				uid: 'foo',
				title: 'My cool block',
			} );
		} );

		it( 'should return a temporary reusable block', () => {
			const state = {
				reusableBlocks: {
					data: {
						reusable1: {
							uid: 'foo',
							title: 'My cool block',
						},
					},
				},
			};

			const actualReusableBlock = getReusableBlock( state, 'reusable1' );
			expect( actualReusableBlock ).toEqual( {
				id: 'reusable1',
				isTemporary: true,
				uid: 'foo',
				title: 'My cool block',
			} );
		} );

		it( 'should return null when no reusable block exists', () => {
			const state = {
				reusableBlocks: {
					data: {},
				},
			};

			const reusableBlock = getReusableBlock( state, '358b59ee-bab3-4d6f-8445-e8c6971a5605' );
			expect( reusableBlock ).toBeNull();
		} );
	} );

	describe( 'isSavingReusableBlock', () => {
		it( 'should return false when the block is not being saved', () => {
			const state = {
				reusableBlocks: {
					isSaving: {},
				},
			};

			const isSaving = isSavingReusableBlock( state, 5187 );
			expect( isSaving ).toBe( false );
		} );

		it( 'should return true when the block is being saved', () => {
			const state = {
				reusableBlocks: {
					isSaving: {
						5187: true,
					},
				},
			};

			const isSaving = isSavingReusableBlock( state, 5187 );
			expect( isSaving ).toBe( true );
		} );
	} );

	describe( 'isFetchingReusableBlock', () => {
		it( 'should return false when the block is not being fetched', () => {
			const state = {
				reusableBlocks: {
					isFetching: {},
				},
			};

			const isFetching = isFetchingReusableBlock( state, 5187 );
			expect( isFetching ).toBe( false );
		} );

		it( 'should return true when the block is being fetched', () => {
			const state = {
				reusableBlocks: {
					isFetching: {
						5187: true,
					},
				},
			};

			const isFetching = isFetchingReusableBlock( state, 5187 );
			expect( isFetching ).toBe( true );
		} );
	} );

	describe( 'getReusableBlocks', () => {
		it( 'should return an array of reusable blocks', () => {
			const state = {
				reusableBlocks: {
					data: {
						123: { uid: 'carrot' },
						reusable1: { uid: 'broccoli' },
					},
				},
			};

			const reusableBlocks = getReusableBlocks( state );
			expect( reusableBlocks ).toEqual( [
				{ id: 123, isTemporary: false, uid: 'carrot' },
				{ id: 'reusable1', isTemporary: true, uid: 'broccoli' },
			] );
		} );

		it( 'should return an empty array when no reusable blocks exist', () => {
			const state = {
				reusableBlocks: {
					data: {},
				},
			};

			const reusableBlocks = getReusableBlocks( state );
			expect( reusableBlocks ).toEqual( [] );
		} );
	} );

	describe( 'getStateBeforeOptimisticTransaction', () => {
		it( 'should return null if no transaction can be found', () => {
			const beforeState = getStateBeforeOptimisticTransaction( {
				optimist: [],
			}, 'foo' );

			expect( beforeState ).toBe( null );
		} );

		it( 'should return null if a transaction with ID can be found, but lacks before state', () => {
			const beforeState = getStateBeforeOptimisticTransaction( {
				optimist: [
					{
						action: {
							optimist: {
								id: 'foo',
							},
						},
					},
				],
			}, 'foo' );

			expect( beforeState ).toBe( null );
		} );

		it( 'should return the before state matching the given transaction id', () => {
			const expectedBeforeState = {};
			const beforeState = getStateBeforeOptimisticTransaction( {
				optimist: [
					{
						beforeState: expectedBeforeState,
						action: {
							optimist: {
								id: 'foo',
							},
						},
					},
				],
			}, 'foo' );

			expect( beforeState ).toBe( expectedBeforeState );
		} );
	} );

	describe( 'isPublishingPost', () => {
		it( 'should return false if the post is not being saved', () => {
			const isPublishing = isPublishingPost( {
				optimist: [],
				saving: {
					requesting: false,
				},
				editor: {
					edits: {},
				},
				currentPost: {
					status: 'publish',
				},
			} );

			expect( isPublishing ).toBe( false );
		} );

		it( 'should return false if the current post is not considered published', () => {
			const isPublishing = isPublishingPost( {
				optimist: [],
				saving: {
					requesting: true,
				},
				editor: {
					edits: {},
				},
				currentPost: {
					status: 'draft',
				},
			} );

			expect( isPublishing ).toBe( false );
		} );

		it( 'should return false if the optimistic transaction cannot be found', () => {
			const isPublishing = isPublishingPost( {
				optimist: [],
				saving: {
					requesting: true,
				},
				editor: {
					edits: {},
				},
				currentPost: {
					status: 'publish',
				},
			} );

			expect( isPublishing ).toBe( false );
		} );

		it( 'should return false if the current post prior to request was already published', () => {
			const isPublishing = isPublishingPost( {
				optimist: [
					{
						beforeState: {
							saving: {
								requesting: false,
							},
							editor: {
								edits: {},
							},
							currentPost: {
								status: 'publish',
							},
						},
						action: {
							optimist: {
								id: POST_UPDATE_TRANSACTION_ID,
							},
						},
					},
				],
				saving: {
					requesting: true,
				},
				editor: {
					edits: {},
				},
				currentPost: {
					status: 'publish',
				},
			} );

			expect( isPublishing ).toBe( false );
		} );

		it( 'should return true if the current post prior to request was not published', () => {
			const isPublishing = isPublishingPost( {
				optimist: [
					{
						beforeState: {
							saving: {
								requesting: false,
							},
							editor: {
								edits: {
									status: 'publish',
								},
							},
							currentPost: {
								status: 'draft',
							},
						},
						action: {
							optimist: {
								id: POST_UPDATE_TRANSACTION_ID,
							},
						},
					},
				],
				saving: {
					requesting: true,
				},
				editor: {
					edits: {},
				},
				currentPost: {
					status: 'publish',
				},
			} );

			expect( isPublishing ).toBe( true );
		} );
	} );

	describe( 'getProvisionalBlockUID()', () => {
		it( 'should return null if not set', () => {
			const provisionalBlockUID = getProvisionalBlockUID( {
				provisionalBlockUID: null,
			} );

			expect( provisionalBlockUID ).toBe( null );
		} );

		it( 'should return UID of provisional block', () => {
			const provisionalBlockUID = getProvisionalBlockUID( {
				provisionalBlockUID: 'chicken',
			} );

			expect( provisionalBlockUID ).toBe( 'chicken' );
		} );
	} );

	describe( 'isValidTemplate', () => {
		it( 'should return true if template is valid', () => {
			const state = {
				template: { isValid: true },
			};

			expect( isValidTemplate( state ) ).toBe( true );
		} );

		it( 'should return false if template is not valid', () => {
			const state = {
				template: { isValid: false },
			};

			expect( isValidTemplate( state ) ).toBe( false );
		} );
	} );

	describe( 'getTemplate', () => {
		it( 'should return the template object', () => {
			const template = [];
			const state = {
				template: { isValid: true, template },
			};

			expect( getTemplate( state ) ).toBe( template );
		} );
	} );

	describe( 'getTemplateLock', () => {
		it( 'should return the template object', () => {
			const state = {
				template: { isValid: true, lock: 'all' },
			};

			expect( getTemplateLock( state ) ).toBe( 'all' );
		} );
	} );
} );
