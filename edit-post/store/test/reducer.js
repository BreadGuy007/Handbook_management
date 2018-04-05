/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	preferences,
	isSavingMetaBoxes,
	metaBoxes,
} from '../reducer';

describe( 'state', () => {
	describe( 'preferences()', () => {
		it( 'should apply all defaults', () => {
			const state = preferences( undefined, {} );

			expect( state ).toEqual( {
				activeGeneralSidebar: 'edit-post/document',
				editorMode: 'visual',
				panels: { 'post-status': true },
				features: { fixedToolbar: false },
			} );
		} );

		it( 'should set the general sidebar', () => {
			const original = deepFreeze( preferences( undefined, {} ) );
			const state = preferences( original, {
				type: 'OPEN_GENERAL_SIDEBAR',
				name: 'edit-post/document',
			} );

			expect( state.activeGeneralSidebar ).toBe( 'edit-post/document' );
		} );

		it( 'should does not update if sidebar is already set to value', () => {
			const original = deepFreeze( preferences( undefined, {
				type: 'OPEN_GENERAL_SIDEBAR',
				name: 'edit-post/document',
			} ) );
			const state = preferences( original, {
				type: 'OPEN_GENERAL_SIDEBAR',
				name: 'edit-post/document',
			} );

			expect( original ).toBe( state );
		} );

		it( 'should unset the general sidebar', () => {
			const original = deepFreeze( preferences( undefined, {
				type: 'OPEN_GENERAL_SIDEBAR',
				name: 'edit-post/document',
			} ) );
			const state = preferences( original, {
				type: 'CLOSE_GENERAL_SIDEBAR',
			} );

			expect( state.activeGeneralSidebar ).toBe( null );
		} );

		it( 'should set the sidebar panel open flag to true if unset', () => {
			const state = preferences( deepFreeze( { panels: {} } ), {
				type: 'TOGGLE_GENERAL_SIDEBAR_EDITOR_PANEL',
				panel: 'post-taxonomies',
			} );

			expect( state.panels ).toEqual( { 'post-taxonomies': true } );
		} );

		it( 'should toggle the sidebar panel open flag', () => {
			const state = preferences( deepFreeze( { panels: { 'post-taxonomies': true } } ), {
				type: 'TOGGLE_GENERAL_SIDEBAR_EDITOR_PANEL',
				panel: 'post-taxonomies',
			} );

			expect( state.panels ).toEqual( { 'post-taxonomies': false } );
		} );

		it( 'should return switched mode', () => {
			const state = preferences( deepFreeze( { editorMode: 'visual' } ), {
				type: 'SWITCH_MODE',
				mode: 'text',
			} );

			expect( state.editorMode ).toBe( 'text' );
		} );

		it( 'should toggle a feature flag', () => {
			const state = preferences( deepFreeze( { features: { chicken: true } } ), {
				type: 'TOGGLE_FEATURE',
				feature: 'chicken',
			} );

			expect( state.features ).toEqual( { chicken: false } );
		} );
	} );

	describe( 'isSavingMetaBoxes', () => {
		it( 'should return default state', () => {
			const actual = isSavingMetaBoxes( undefined, {} );
			expect( actual ).toBe( false );
		} );

		it( 'should set saving flag to true', () => {
			const action = {
				type: 'REQUEST_META_BOX_UPDATES',
			};
			const actual = isSavingMetaBoxes( false, action );

			expect( actual ).toBe( true );
		} );

		it( 'should set saving flag to false', () => {
			const action = {
				type: 'META_BOX_UPDATES_SUCCESS',
			};
			const actual = isSavingMetaBoxes( true, action );

			expect( actual ).toBe( false );
		} );
	} );

	describe( 'metaBoxes()', () => {
		it( 'should return default state', () => {
			const actual = metaBoxes( undefined, {} );
			const expected = {
				normal: {
					isActive: false,
				},
				side: {
					isActive: false,
				},
				advanced: {
					isActive: false,
				},
			};

			expect( actual ).toEqual( expected );
		} );

		it( 'should set the sidebar to active', () => {
			const theMetaBoxes = {
				normal: false,
				advanced: false,
				side: true,
			};

			const action = {
				type: 'INITIALIZE_META_BOX_STATE',
				metaBoxes: theMetaBoxes,
			};

			const actual = metaBoxes( undefined, action );
			const expected = {
				normal: {
					isActive: false,
				},
				side: {
					isActive: true,
				},
				advanced: {
					isActive: false,
				},
			};

			expect( actual ).toEqual( expected );
		} );

		it( 'should set the meta boxes saved data', () => {
			const action = {
				type: 'META_BOX_SET_SAVED_DATA',
				dataPerLocation: {
					side: 'a=b',
				},
			};

			const theMetaBoxes = metaBoxes( { normal: { isActive: true }, side: { isActive: false } }, action );
			expect( theMetaBoxes ).toEqual( {
				advanced: { data: undefined },
				normal: { isActive: true, data: undefined },
				side: { isActive: false, data: 'a=b' },
			} );
		} );
	} );
} );
