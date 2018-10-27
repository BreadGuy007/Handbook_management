/**
 * External dependencies
 */
import { castArray, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { createRegistry } from '../registry';

describe( 'createRegistry', () => {
	let registry;

	const unsubscribes = [];
	function subscribeWithUnsubscribe( ...args ) {
		const unsubscribe = registry.subscribe( ...args );
		unsubscribes.push( unsubscribe );
		return unsubscribe;
	}
	function subscribeUntil( predicates ) {
		predicates = castArray( predicates );

		return new Promise( ( resolve ) => {
			subscribeWithUnsubscribe( () => {
				if ( predicates.every( ( predicate ) => predicate() ) ) {
					resolve();
				}
			} );
		} );
	}

	beforeEach( () => {
		registry = createRegistry();
	} );

	afterEach( () => {
		let unsubscribe;
		while ( ( unsubscribe = unsubscribes.shift() ) ) {
			unsubscribe();
		}
	} );

	describe( 'registerStore', () => {
		it( 'should be shorthand for reducer, actions, selectors registration', () => {
			const store = registry.registerStore( 'butcher', {
				reducer( state = { ribs: 6, chicken: 4 }, action ) {
					switch ( action.type ) {
						case 'sale':
							return {
								...state,
								[ action.meat ]: state[ action.meat ] / 2,
							};
					}

					return state;
				},
				selectors: {
					getPrice: ( state, meat ) => state[ meat ],
				},
				actions: {
					startSale: ( meat ) => ( { type: 'sale', meat } ),
				},
			} );

			expect( store.getState() ).toEqual( { ribs: 6, chicken: 4 } );
			expect( registry.dispatch( 'butcher' ) ).toHaveProperty( 'startSale' );
			expect( registry.select( 'butcher' ) ).toHaveProperty( 'getPrice' );
			expect( registry.select( 'butcher' ).getPrice( 'chicken' ) ).toBe( 4 );
			expect( registry.select( 'butcher' ).getPrice( 'ribs' ) ).toBe( 6 );
			registry.dispatch( 'butcher' ).startSale( 'chicken' );
			expect( registry.select( 'butcher' ).getPrice( 'chicken' ) ).toBe( 2 );
			expect( registry.select( 'butcher' ).getPrice( 'ribs' ) ).toBe( 6 );
		} );
	} );

	describe( 'registerReducer', () => {
		it( 'Should append reducers to the state', () => {
			const reducer1 = () => 'chicken';
			const reducer2 = () => 'ribs';

			const store = registry.registerReducer( 'red1', reducer1 );
			expect( store.getState() ).toEqual( 'chicken' );

			const store2 = registry.registerReducer( 'red2', reducer2 );
			expect( store2.getState() ).toEqual( 'ribs' );
		} );
	} );

	describe( 'registerResolvers', () => {
		it( 'should not do anything for selectors which do not have resolvers', () => {
			registry.registerReducer( 'demo', ( state = 'OK' ) => state );
			registry.registerSelectors( 'demo', {
				getValue: ( state ) => state,
			} );
			registry.registerResolvers( 'demo', {} );

			expect( registry.select( 'demo' ).getValue() ).toBe( 'OK' );
		} );

		it( 'should behave as a side effect for the given selector, with arguments', () => {
			const resolver = jest.fn();

			registry.registerReducer( 'demo', ( state = 'OK' ) => state );
			registry.registerSelectors( 'demo', {
				getValue: ( state ) => state,
			} );
			registry.registerResolvers( 'demo', {
				getValue: resolver,
			} );

			const value = registry.select( 'demo' ).getValue( 'arg1', 'arg2' );
			expect( value ).toBe( 'OK' );
			expect( resolver ).toHaveBeenCalledWith( 'arg1', 'arg2' );
			registry.select( 'demo' ).getValue( 'arg1', 'arg2' );
			expect( resolver ).toHaveBeenCalledTimes( 1 );
			registry.select( 'demo' ).getValue( 'arg3', 'arg4' );
			expect( resolver ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should support the object resolver definition', () => {
			const resolver = jest.fn();

			registry.registerReducer( 'demo', ( state = 'OK' ) => state );
			registry.registerSelectors( 'demo', {
				getValue: ( state ) => state,
			} );
			registry.registerResolvers( 'demo', {
				getValue: { fulfill: resolver },
			} );

			const value = registry.select( 'demo' ).getValue( 'arg1', 'arg2' );
			expect( value ).toBe( 'OK' );
		} );

		it( 'should use isFulfilled definition before calling the side effect', () => {
			const fulfill = jest.fn().mockImplementation( ( state, page ) => {
				return { type: 'SET_PAGE', page, result: [] };
			} );

			const store = registry.registerReducer( 'demo', ( state = {}, action ) => {
				switch ( action.type ) {
					case 'SET_PAGE':
						return {
							...state,
							[ action.page ]: action.result,
						};
				}

				return state;
			} );

			store.dispatch( { type: 'SET_PAGE', page: 4, result: [] } );

			registry.registerSelectors( 'demo', {
				getPage: ( state, page ) => state[ page ],
			} );
			registry.registerResolvers( 'demo', {
				getPage: {
					fulfill,
					isFulfilled( state, page ) {
						return state.hasOwnProperty( page );
					},
				},
			} );

			registry.select( 'demo' ).getPage( 1 );
			registry.select( 'demo' ).getPage( 2 );

			expect( fulfill ).toHaveBeenCalledTimes( 2 );

			registry.select( 'demo' ).getPage( 1 );
			registry.select( 'demo' ).getPage( 2 );
			registry.select( 'demo' ).getPage( 3, {} );

			// Expected: First and second page fulfillments already triggered, so
			// should only be one more than previous assertion set.
			expect( fulfill ).toHaveBeenCalledTimes( 3 );

			registry.select( 'demo' ).getPage( 1 );
			registry.select( 'demo' ).getPage( 2 );
			registry.select( 'demo' ).getPage( 3, {} );
			registry.select( 'demo' ).getPage( 4 );

			// Expected:
			//  - Fourth page was pre-filled. Necessary to determine via
			//    isFulfilled, but fulfillment resolver should not be triggered.
			//  - Third page arguments are not strictly equal but are equivalent,
			//    so fulfillment should already be satisfied.
			expect( fulfill ).toHaveBeenCalledTimes( 3 );

			registry.select( 'demo' ).getPage( 4, {} );
		} );

		it( 'should resolve action to dispatch', () => {
			registry.registerReducer( 'demo', ( state = 'NOTOK', action ) => {
				return action.type === 'SET_OK' ? 'OK' : state;
			} );
			registry.registerSelectors( 'demo', {
				getValue: ( state ) => state,
			} );
			registry.registerResolvers( 'demo', {
				getValue: () => ( { type: 'SET_OK' } ),
			} );

			const promise = subscribeUntil( [
				() => registry.select( 'demo' ).getValue() === 'OK',
				() => registry.select( 'core/data' ).hasFinishedResolution( 'demo', 'getValue' ),
			] );

			registry.select( 'demo' ).getValue();

			return promise;
		} );

		it( 'should resolve promise action to dispatch', () => {
			registry.registerReducer( 'demo', ( state = 'NOTOK', action ) => {
				return action.type === 'SET_OK' ? 'OK' : state;
			} );
			registry.registerSelectors( 'demo', {
				getValue: ( state ) => state,
			} );
			registry.registerResolvers( 'demo', {
				getValue: () => Promise.resolve( { type: 'SET_OK' } ),
			} );

			const promise = subscribeUntil( [
				() => registry.select( 'demo' ).getValue() === 'OK',
				() => registry.select( 'core/data' ).hasFinishedResolution( 'demo', 'getValue' ),
			] );

			registry.select( 'demo' ).getValue();

			return promise;
		} );

		it( 'should resolve promise non-action to dispatch', ( done ) => {
			let shouldThrow = false;
			registry.registerReducer( 'demo', ( state = 'OK' ) => {
				if ( shouldThrow ) {
					throw 'Should not have dispatched';
				}

				return state;
			} );
			shouldThrow = true;
			registry.registerSelectors( 'demo', {
				getValue: ( state ) => state,
			} );
			registry.registerResolvers( 'demo', {
				getValue: () => Promise.resolve(),
			} );

			registry.select( 'demo' ).getValue();

			process.nextTick( () => {
				done();
			} );
		} );

		it( 'should not dispatch resolved promise action on subsequent selector calls', () => {
			registry.registerReducer( 'demo', ( state = 'NOTOK', action ) => {
				return action.type === 'SET_OK' && state === 'NOTOK' ? 'OK' : 'NOTOK';
			} );
			registry.registerSelectors( 'demo', {
				getValue: ( state ) => state,
			} );
			registry.registerResolvers( 'demo', {
				getValue: () => Promise.resolve( { type: 'SET_OK' } ),
			} );

			const promise = subscribeUntil( () => registry.select( 'demo' ).getValue() === 'OK' );

			registry.select( 'demo' ).getValue();
			registry.select( 'demo' ).getValue();

			return promise;
		} );

		it( 'should invalidate the resolver\'s resolution cache', async () => {
			registry.registerStore( 'demo', {
				reducer: ( state = 'NOTOK', action ) => {
					return action.type === 'SET_OK' && state === 'NOTOK' ? 'OK' : 'NOTOK';
				},
				selectors: {
					getValue: ( state ) => state,
				},
				resolvers: {
					getValue: {
						fulfill: () => Promise.resolve( { type: 'SET_OK' } ),
						shouldInvalidate: ( action ) => action.type === 'INVALIDATE',
					},
				},
				actions: {
					invalidate: () => ( { type: 'INVALIDATE' } ),
				},
			} );

			let promise = subscribeUntil( () => registry.select( 'demo' ).getValue() === 'OK' );
			registry.select( 'demo' ).getValue(); // Triggers resolver switches to OK
			await promise;

			// Invalidate the cache
			registry.dispatch( 'demo' ).invalidate();

			promise = subscribeUntil( () => registry.select( 'demo' ).getValue() === 'NOTOK' );
			registry.select( 'demo' ).getValue(); // Triggers the resolver again and switch to NOTOK
			await promise;
		} );
	} );

	describe( 'select', () => {
		it( 'registers multiple selectors to the public API', () => {
			const store = registry.registerReducer( 'reducer1', () => 'state1' );
			const selector1 = jest.fn( () => 'result1' );
			const selector2 = jest.fn( () => 'result2' );

			registry.registerSelectors( 'reducer1', {
				selector1,
				selector2,
			} );

			expect( registry.select( 'reducer1' ).selector1() ).toEqual( 'result1' );
			expect( selector1 ).toBeCalledWith( store.getState() );

			expect( registry.select( 'reducer1' ).selector2() ).toEqual( 'result2' );
			expect( selector2 ).toBeCalledWith( store.getState() );
		} );
	} );

	describe( 'subscribe', () => {
		it( 'registers multiple selectors to the public API', () => {
			let incrementedValue = null;
			const store = registry.registerReducer( 'myAwesomeReducer', ( state = 0 ) => state + 1 );
			registry.registerSelectors( 'myAwesomeReducer', {
				globalSelector: ( state ) => state,
			} );
			const unsubscribe = registry.subscribe( () => {
				incrementedValue = registry.select( 'myAwesomeReducer' ).globalSelector();
			} );
			const action = { type: 'dummy' };

			store.dispatch( action ); // increment the data by => data = 2
			expect( incrementedValue ).toBe( 2 );

			store.dispatch( action ); // increment the data by => data = 3
			expect( incrementedValue ).toBe( 3 );

			unsubscribe(); // Store subscribe to changes, the data variable stops upgrading.

			store.dispatch( action );
			store.dispatch( action );

			expect( incrementedValue ).toBe( 3 );
		} );

		it( 'snapshots listeners on change, avoiding a later listener if subscribed during earlier callback', () => {
			const store = registry.registerReducer( 'myAwesomeReducer', ( state = 0 ) => state + 1 );
			const secondListener = jest.fn();
			const firstListener = jest.fn( () => {
				subscribeWithUnsubscribe( secondListener );
			} );

			subscribeWithUnsubscribe( firstListener );

			store.dispatch( { type: 'dummy' } );

			expect( secondListener ).not.toHaveBeenCalled();
		} );

		it( 'snapshots listeners on change, calling a later listener even if unsubscribed during earlier callback', () => {
			const store = registry.registerReducer( 'myAwesomeReducer', ( state = 0 ) => state + 1 );
			const firstListener = jest.fn( () => {
				secondUnsubscribe();
			} );
			const secondListener = jest.fn();

			subscribeWithUnsubscribe( firstListener );
			const secondUnsubscribe = subscribeWithUnsubscribe( secondListener );

			store.dispatch( { type: 'dummy' } );

			expect( secondListener ).toHaveBeenCalled();
		} );

		it( 'does not call listeners if state has not changed', () => {
			const store = registry.registerReducer( 'unchanging', ( state = {} ) => state );
			const listener = jest.fn();
			subscribeWithUnsubscribe( listener );

			store.dispatch( { type: 'dummy' } );

			expect( listener ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'dispatch', () => {
		it( 'registers actions to the public API', () => {
			const store = registry.registerReducer( 'counter', ( state = 0, action ) => {
				if ( action.type === 'increment' ) {
					return state + action.count;
				}
				return state;
			} );
			const increment = ( count = 1 ) => ( { type: 'increment', count } );
			registry.registerActions( 'counter', {
				increment,
			} );

			registry.dispatch( 'counter' ).increment(); // state = 1
			registry.dispatch( 'counter' ).increment( 4 ); // state = 5
			expect( store.getState() ).toBe( 5 );
		} );
	} );

	describe( 'use', () => {
		it( 'should pass through options object to plugin', () => {
			const expectedOptions = {};
			let actualOptions;

			function plugin( _registry, options ) {
				// The registry passed to a plugin is not the same as the one
				// returned by createRegistry, as the former uses the internal
				// representation of the object, the latter applying its
				// function proxying.
				expect( _registry ).toMatchObject(
					mapValues( registry, ( value, key ) => {
						if ( key === 'namespaces' ) {
							return expect.any( Object );
						}
						return expect.any( Function );
					} )
				);

				actualOptions = options;

				return {};
			}

			registry.use( plugin, expectedOptions );

			expect( actualOptions ).toBe( expectedOptions );
		} );

		it( 'should override base method', () => {
			function plugin( _registry, options ) {
				return { select: () => options.value };
			}

			registry.use( plugin, { value: 10 } );

			expect( registry.select() ).toBe( 10 );
		} );
	} );
} );
