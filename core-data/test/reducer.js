/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { terms, entities } from '../reducer';

describe( 'terms()', () => {
	it( 'returns an empty object by default', () => {
		const state = terms( undefined, {} );

		expect( state ).toEqual( {} );
	} );

	it( 'returns with received terms', () => {
		const originalState = deepFreeze( {} );
		const state = terms( originalState, {
			type: 'RECEIVE_TERMS',
			taxonomy: 'categories',
			terms: [ { id: 1 } ],
		} );

		expect( state ).toEqual( {
			categories: [ { id: 1 } ],
		} );
	} );

	it( 'assigns requested taxonomy to null', () => {
		const originalState = deepFreeze( {} );
		const state = terms( originalState, {
			type: 'SET_REQUESTED',
			dataType: 'terms',
			subType: 'categories',
		} );

		expect( state ).toEqual( {
			categories: null,
		} );
	} );

	it( 'does not assign requested taxonomy to null if received', () => {
		const originalState = deepFreeze( {
			categories: [ { id: 1 } ],
		} );
		const state = terms( originalState, {
			type: 'SET_REQUESTED',
			dataType: 'terms',
			subType: 'categories',
		} );

		expect( state ).toEqual( {
			categories: [ { id: 1 } ],
		} );
	} );

	it( 'does not assign requested taxonomy if not terms data type', () => {
		const originalState = deepFreeze( {} );
		const state = terms( originalState, {
			type: 'SET_REQUESTED',
			dataType: 'foo',
			subType: 'categories',
		} );

		expect( state ).toEqual( {} );
	} );
} );

describe( 'entities', () => {
	it( 'returns the default state for all defined entities', () => {
		const state = entities( undefined, {} );

		expect( state.root.postType ).toEqual( { byKey: {} } );
	} );

	it( 'returns with received post types by slug', () => {
		const originalState = deepFreeze( {} );
		const state = entities( originalState, {
			type: 'RECEIVE_ENTITY_RECORDS',
			records: [ { slug: 'b', title: 'beach' }, { slug: 's', title: 'sun' } ],
			kind: 'root',
			name: 'postType',
		} );

		expect( state.root.postType ).toEqual( {
			byKey: {
				b: { slug: 'b', title: 'beach' },
				s: { slug: 's', title: 'sun' },
			},
		} );
	} );

	it( 'appends the received post types by slug', () => {
		const originalState = deepFreeze( {
			root: {
				postType: {
					byKey: {
						w: { slug: 'w', title: 'water' },
					},
				},
			},
		} );
		const state = entities( originalState, {
			type: 'RECEIVE_ENTITY_RECORDS',
			records: [ { slug: 'b', title: 'beach' } ],
			kind: 'root',
			name: 'postType',
		} );

		expect( state.root.postType ).toEqual( {
			byKey: {
				w: { slug: 'w', title: 'water' },
				b: { slug: 'b', title: 'beach' },
			},
		} );
	} );
} );
