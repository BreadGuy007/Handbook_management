/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	registerStore,
	registerReducer,
	registerSelectors,
	registerActions,
	dispatch,
	select,
	withSelect,
	withDispatch,
	subscribe,
} from '../';

describe( 'registerStore', () => {
	it( 'should be shorthand for reducer, actions, selectors registration', () => {
		const store = registerStore( 'butcher', {
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
		expect( dispatch( 'butcher' ) ).toHaveProperty( 'startSale' );
		expect( select( 'butcher' ) ).toHaveProperty( 'getPrice' );
		expect( select( 'butcher' ).getPrice( 'chicken' ) ).toBe( 4 );
		expect( select( 'butcher' ).getPrice( 'ribs' ) ).toBe( 6 );
		dispatch( 'butcher' ).startSale( 'chicken' );
		expect( select( 'butcher' ).getPrice( 'chicken' ) ).toBe( 2 );
		expect( select( 'butcher' ).getPrice( 'ribs' ) ).toBe( 6 );
	} );
} );

describe( 'registerReducer', () => {
	it( 'Should append reducers to the state', () => {
		const reducer1 = () => 'chicken';
		const reducer2 = () => 'ribs';

		const store = registerReducer( 'red1', reducer1 );
		expect( store.getState() ).toEqual( 'chicken' );

		const store2 = registerReducer( 'red2', reducer2 );
		expect( store2.getState() ).toEqual( 'ribs' );
	} );
} );

describe( 'select', () => {
	it( 'registers multiple selectors to the public API', () => {
		const store = registerReducer( 'reducer1', () => 'state1' );
		const selector1 = jest.fn( () => 'result1' );
		const selector2 = jest.fn( () => 'result2' );

		registerSelectors( 'reducer1', {
			selector1,
			selector2,
		} );

		expect( select( 'reducer1' ).selector1() ).toEqual( 'result1' );
		expect( selector1 ).toBeCalledWith( store.getState() );

		expect( select( 'reducer1' ).selector2() ).toEqual( 'result2' );
		expect( selector2 ).toBeCalledWith( store.getState() );
	} );

	it( 'provides upgrade path for deprecated usage', () => {
		const store = registerReducer( 'reducer', () => 'state' );
		const selector = jest.fn( () => 'result' );

		registerSelectors( 'reducer', { selector } );

		expect( select( 'reducer', 'selector', 'arg' ) ).toEqual( 'result' );
		expect( selector ).toBeCalledWith( store.getState(), 'arg' );
		expect( console ).toHaveWarned();
	} );
} );

describe( 'withSelect', () => {
	it( 'passes the relevant data to the component', () => {
		registerReducer( 'reactReducer', () => ( { reactKey: 'reactState' } ) );
		registerSelectors( 'reactReducer', {
			reactSelector: ( state, key ) => state[ key ],
		} );

		// In normal circumstances, the fact that we have to add an arbitrary
		// prefix to the variable name would be concerning, and perhaps an
		// argument that we ought to expect developer to use select from the
		// wp.data export. But in-fact, this serves as a good deterrent for
		// including both `withSelect` and `select` in the same scope, which
		// shouldn't occur for a typical component, and if it did might wrongly
		// encourage the developer to use `select` within the component itself.
		const Component = withSelect( ( _select, ownProps ) => ( {
			data: _select( 'reactReducer' ).reactSelector( ownProps.keyName ),
		} ) )( ( props ) => <div>{ props.data }</div> );

		const wrapper = mount( <Component keyName="reactKey" /> );

		// Wrapper is the enhanced component. Find props on the rendered child.
		const child = wrapper.childAt( 0 );
		expect( child.props() ).toEqual( {
			keyName: 'reactKey',
			data: 'reactState',
		} );
		expect( wrapper.text() ).toBe( 'reactState' );

		wrapper.unmount();
	} );

	it( 'should rerun selection on state changes', () => {
		registerReducer( 'counter', ( state = 0, action ) => {
			if ( action.type === 'increment' ) {
				return state + 1;
			}

			return state;
		} );

		registerSelectors( 'counter', {
			getCount: ( state ) => state,
		} );

		registerActions( 'counter', {
			increment: () => ( { type: 'increment' } ),
		} );

		const Component = compose( [
			withSelect( ( _select ) => ( {
				count: _select( 'counter' ).getCount(),
			} ) ),
			withDispatch( ( _dispatch ) => ( {
				increment: _dispatch( 'counter' ).increment,
			} ) ),
		] )( ( props ) => (
			<button onClick={ props.increment }>
				{ props.count }
			</button>
		) );

		const wrapper = mount( <Component /> );

		const button = wrapper.find( 'button' );

		button.simulate( 'click' );

		expect( button.text() ).toBe( '1' );

		wrapper.unmount();
	} );

	it( 'should rerun selection on props changes', () => {
		registerReducer( 'counter', ( state = 0, action ) => {
			if ( action.type === 'increment' ) {
				return state + 1;
			}

			return state;
		} );

		registerSelectors( 'counter', {
			getCount: ( state, offset ) => state + offset,
		} );

		const Component = withSelect( ( _select, ownProps ) => ( {
			count: _select( 'counter' ).getCount( ownProps.offset ),
		} ) )( ( props ) => <div>{ props.count }</div> );

		const wrapper = mount( <Component offset={ 0 } /> );

		wrapper.setProps( { offset: 10 } );

		expect( wrapper.childAt( 0 ).text() ).toBe( '10' );

		wrapper.unmount();
	} );
} );

describe( 'withDispatch', () => {
	it( 'passes the relevant data to the component', () => {
		const store = registerReducer( 'counter', ( state = 0, action ) => {
			if ( action.type === 'increment' ) {
				return state + action.count;
			}
			return state;
		} );

		const increment = ( count = 1 ) => ( { type: 'increment', count } );
		registerActions( 'counter', {
			increment,
		} );

		const Component = withDispatch( ( _dispatch, ownProps ) => {
			const { count } = ownProps;

			return {
				increment: () => _dispatch( 'counter' ).increment( count ),
			};
		} )( ( props ) => <button onClick={ props.increment } /> );

		const wrapper = mount( <Component count={ 0 } /> );

		// Wrapper is the enhanced component. Find props on the rendered child.
		const child = wrapper.childAt( 0 );

		const incrementBeforeSetProps = child.prop( 'increment' );

		// Verify that dispatch respects props at the time of being invoked by
		// changing props after the initial mount.
		wrapper.setProps( { count: 2 } );

		// Function value reference should not have changed in props update.
		expect( child.prop( 'increment' ) ).toBe( incrementBeforeSetProps );

		wrapper.find( 'button' ).simulate( 'click' );

		expect( store.getState() ).toBe( 2 );

		wrapper.unmount();
	} );
} );

describe( 'subscribe', () => {
	it( 'registers multiple selectors to the public API', () => {
		let incrementedValue = null;
		const store = registerReducer( 'myAwesomeReducer', ( state = 0 ) => state + 1 );
		registerSelectors( 'myAwesomeReducer', {
			globalSelector: ( state ) => state,
		} );
		const unsubscribe = subscribe( () => {
			incrementedValue = select( 'myAwesomeReducer' ).globalSelector();
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
} );

describe( 'dispatch', () => {
	it( 'registers actions to the public API', () => {
		const store = registerReducer( 'counter', ( state = 0, action ) => {
			if ( action.type === 'increment' ) {
				return state + action.count;
			}
			return state;
		} );
		const increment = ( count = 1 ) => ( { type: 'increment', count } );
		registerActions( 'counter', {
			increment,
		} );

		dispatch( 'counter' ).increment(); // state = 1
		dispatch( 'counter' ).increment( 4 ); // state = 5
		expect( store.getState() ).toBe( 5 );
	} );
} );
