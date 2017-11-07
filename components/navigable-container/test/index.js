/**
 * External dependencies
 */
import { mount } from 'enzyme';
import { each } from 'lodash';

/**
 * WordPress dependencies
 */
import { keycodes } from '@wordpress/utils';

/**
 * Internal dependencies
 */
import { NavigableGrid, TabbableContainer, NavigableMenu } from '../';

const { UP, DOWN, TAB, LEFT, RIGHT } = keycodes;

function simulateVisible( wrapper, selector ) {
	const elements = wrapper.getDOMNode().querySelectorAll( selector );
	each( elements, ( elem ) => {
		elem.getClientRects = () => [ 'trick-jsdom-into-having-size-for-element-rect' ];
	} );
}

function fireKeyDown( container, keyCode ) {
	container.simulate( 'keydown', {
		stopPropagation: () => {},
		preventDefault: () => {},
		nativeEvent: {
			stopImmediatePropagation: () => { },
		},
		keyCode,
	} );
}

describe( 'NavigableMenu', () => {
	// Skipping this this because the `isVisible` check in utils/focus/tabbable.js always returns false in tests
	// Probbably a jsdom issue
	// eslint-disable-next-line jest/no-disabled-tests
	it( 'should navigate by keypresses', () => {
		let currentIndex = 0;
		const wrapper = mount( (
			<NavigableMenu onNavigate={ ( index ) => currentIndex = index }>
				<button id="btn1">One</button>
				<button id="btn2">Two</button>
				<button id="btn3">Three</button>
			</NavigableMenu >
		) );

		simulateVisible( wrapper, '*' );

		const container = wrapper.find( 'div' );
		wrapper.getDOMNode().querySelector( '#btn1' ).focus();

		// Navigate options
		function assertKeyDown( keyCode, expectedActiveIndex ) {
			fireKeyDown( container, keyCode );
			expect( currentIndex ).toBe( expectedActiveIndex );
		}

		assertKeyDown( DOWN, 1 );
		assertKeyDown( DOWN, 2 );
		assertKeyDown( UP, 1 );
	} );
} );

describe( 'TabbableContainer', () => {
	// Skipping this this because the `isVisible` check in utils/focus/tabbable.js always returns false in tests
	// Probbably a jsdom issue
	// eslint-disable-next-line jest/no-disabled-tests
	it( 'should navigate by keypresses', () => {
		let currentIndex = 0;
		const wrapper = mount( (
			<TabbableContainer className="wrapper" onNavigate={ ( index ) => currentIndex = index }>
				<div className="section" id="section1" tabIndex="0">Section One</div>
				<div className="section" id="section2" tabIndex="0">Section Two</div>
				<div className="section" id="section3" tabIndex="0">Section Three</div>
			</TabbableContainer >
		) );

		simulateVisible( wrapper, '*' );

		const container = wrapper.find( 'div.wrapper' );
		wrapper.getDOMNode().querySelector( '#section1' ).focus();

		// Navigate options
		function assertKeyDown( keyCode, expectedActiveIndex ) {
			fireKeyDown( container, keyCode );
			expect( currentIndex ).toBe( expectedActiveIndex );
		}

		assertKeyDown( TAB, 1 );
		assertKeyDown( TAB, 2 );
		assertKeyDown( TAB, 0 );
	} );
} );
