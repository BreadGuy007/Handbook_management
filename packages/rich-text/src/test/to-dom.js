/**
 * External dependencies
 */

import { JSDOM } from 'jsdom';

/**
 * Internal dependencies
 */

import { create } from '../create';
import { toDom, applyValue } from '../to-dom';

const { window } = new JSDOM();
const { document } = window;

function createNode( HTML ) {
	const doc = document.implementation.createHTMLDocument( '' );
	doc.body.innerHTML = HTML;
	return doc.body.firstChild;
}

function createElement( html ) {
	const htmlDocument = document.implementation.createHTMLDocument( '' );
	htmlDocument.body.innerHTML = html;
	return htmlDocument.body;
}

describe( 'recordToDom', () => {
	it( 'should extract recreate HTML 1', () => {
		const HTML = 'one <em>two 🍒</em> <a href="#"><img src=""><strong>three</strong></a><img src="">';
		const element = createNode( `<p>${ HTML }</p>` );
		const range = {
			startOffset: 1,
			startContainer: element.querySelector( 'em' ).firstChild,
			endOffset: 1,
			endContainer: element.querySelector( 'strong' ).firstChild,
		};
		const { body, selection } = toDom( create( { element, range } ) );

		expect( body.innerHTML ).toEqual( element.innerHTML );
		expect( selection ).toEqual( {
			startPath: [ 1, 0, 1 ],
			endPath: [ 3, 1, 0, 1 ],
		} );
	} );

	it( 'should extract recreate HTML 2', () => {
		const HTML = 'one <em>two 🍒</em> <a href="#">test <img src=""><strong>three</strong></a><img src="">';
		const element = createNode( `<p>${ HTML }</p>` );
		const range = {
			startOffset: 1,
			startContainer: element.querySelector( 'em' ).firstChild,
			endOffset: 0,
			endContainer: element.querySelector( 'strong' ).firstChild,
		};
		const { body, selection } = toDom( create( { element, range } ) );

		expect( body.innerHTML ).toEqual( element.innerHTML );
		expect( selection ).toEqual( {
			startPath: [ 1, 0, 1 ],
			endPath: [ 3, 2, 0 ],
		} );
	} );

	it( 'should extract recreate HTML 3', () => {
		const HTML = '<img src="">';
		const element = createNode( `<p>${ HTML }</p>` );
		const range = {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element,
		};
		const { body, selection } = toDom( create( { element, range } ) );

		expect( body.innerHTML ).toEqual( element.innerHTML );
		expect( selection ).toEqual( {
			startPath: [],
			endPath: [],
		} );
	} );

	it( 'should extract recreate HTML 4', () => {
		const HTML = '<em>two 🍒</em>';
		const element = createNode( `<p>${ HTML }</p>` );
		const range = {
			startOffset: 1,
			startContainer: element.querySelector( 'em' ).firstChild,
			endOffset: 2,
			endContainer: element.querySelector( 'em' ).firstChild,
		};
		const { body, selection } = toDom( create( { element, range } ) );

		expect( body.innerHTML ).toEqual( element.innerHTML );
		expect( selection ).toEqual( {
			startPath: [ 0, 0, 1 ],
			endPath: [ 0, 0, 2 ],
		} );
	} );

	it( 'should extract recreate HTML 5', () => {
		const HTML = '<em>If you want to learn more about how to build additional blocks, or if you are interested in helping with the project, head over to the <a href="https://github.com/WordPress/gutenberg">GitHub repository</a>.</em>';
		const element = createNode( `<p>${ HTML }</p>` );
		const range = {
			startOffset: 1,
			startContainer: element.querySelector( 'em' ).firstChild,
			endOffset: 0,
			endContainer: element.querySelector( 'a' ).firstChild,
		};
		const { body, selection } = toDom( create( { element, range } ) );

		expect( body.innerHTML ).toEqual( element.innerHTML );
		expect( selection ).toEqual( {
			startPath: [ 0, 0, 1 ],
			endPath: [ 0, 0, 135 ],
		} );
	} );

	it( 'should create correct selection path ', () => {
		const HTML = 'test <em>italic</em>';
		const element = createNode( `<p>${ HTML }</p>` );
		const range = {
			startOffset: 1,
			startContainer: element,
			endOffset: 2,
			endContainer: element,
		};
		const { body, selection } = toDom( create( { element, range } ) );

		expect( body.innerHTML ).toEqual( element.innerHTML );
		expect( selection ).toEqual( {
			startPath: [ 0, 5 ],
			endPath: [ 1, 0, 6 ],
		} );
	} );

	it( 'should extract recreate HTML 6', () => {
		const HTML = '<li>one<ul><li>two</li></ul></li><li>three</li>';
		const element = createNode( `<ul>${ HTML }</ul>` );
		const range = {
			startOffset: 1,
			startContainer: element.querySelector( 'li' ).firstChild,
			endOffset: 2,
			endContainer: element.querySelector( 'li' ).firstChild,
		};
		const multilineTag = 'li';
		const { body, selection } = toDom( create( { element, range, multilineTag } ), 'li' );

		expect( body.innerHTML ).toEqual( element.innerHTML );
		expect( selection ).toEqual( {
			startPath: [ 0, 0, 1 ],
			endPath: [ 0, 0, 2 ],
		} );
	} );
} );

describe( 'applyValue', () => {
	const cases = [
		{
			current: 'test',
			future: '',
			movedCount: 0,
			description: 'should remove nodes',
		},
		{
			current: '',
			future: 'test',
			movedCount: 1,
			description: 'should add nodes',
		},
		{
			current: 'test',
			future: 'test',
			movedCount: 0,
			description: 'should not modify',
		},
	];

	cases.forEach( ( { current, future, description, movedCount } ) => {
		it( description, () => {
			const body = createElement( current );
			const futureBody = createElement( future );
			const childNodes = Array.from( futureBody.childNodes );
			applyValue( futureBody, body );
			const count = childNodes.reduce( ( acc, { parentNode } ) => {
				return parentNode === body ? acc + 1 : acc;
			}, 0 );
			expect( body.innerHTML ).toEqual( future );
			expect( count ).toEqual( movedCount );
		} );
	} );
} );
