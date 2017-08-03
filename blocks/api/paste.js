/**
 * External dependencies
 */
import { find, get, flowRight as compose } from 'lodash';

/**
 * WordPress dependencies
 */
import { nodetypes } from '@wordpress/utils';

/**
 * Internal dependencies
 */
import { createBlock } from './factory';
import { getBlockTypes, getUnknownTypeHandler } from './registration';
import { parseBlockAttributes } from './parser';
import convertTables from './paste/convert-tables';
import stripAttributes from './paste/strip-attributes';
import removeSpans from './paste/remove-spans';

const { ELEMENT_NODE, TEXT_NODE } = nodetypes;

/**
 * Normalises array nodes of any node type to an array of block level nodes.
 * @param  {Array} nodes Array of Nodes.
 * @return {Array}       Array of block level HTMLElements
 */
export function normaliseToBlockLevelNodes( nodes ) {
	const decu = document.createDocumentFragment();
	const accu = document.createDocumentFragment();

	// A fragment is easier to work with.
	nodes.forEach( node => decu.appendChild( node.cloneNode( true ) ) );

	while ( decu.firstChild ) {
		const node = decu.firstChild;

		// Text nodes: wrap in a paragraph, or append to previous.
		if ( node.nodeType === TEXT_NODE ) {
			if ( ! accu.lastChild || accu.lastChild.nodeName !== 'P' ) {
				accu.appendChild( document.createElement( 'P' ) );
			}

			accu.lastChild.appendChild( node );
		// Element nodes.
		} else if ( node.nodeType === ELEMENT_NODE ) {
			// BR nodes: create a new paragraph on double, or append to previous.
			if ( node.nodeName === 'BR' ) {
				if ( node.nextSibling && node.nextSibling.nodeName === 'BR' ) {
					accu.appendChild( document.createElement( 'P' ) );
					decu.removeChild( node.nextSibling );
				}

				// Don't append to an empty paragraph.
				if (
					accu.lastChild &&
					accu.lastChild.nodeName === 'P' &&
					accu.lastChild.hasChildNodes()
				) {
					accu.lastChild.appendChild( node );
				} else {
					decu.removeChild( node );
				}
			} else if ( node.nodeName === 'P' ) {
				// Only append non-empty paragraph nodes.
				if ( /^(\s|&nbsp;)*$/.test( node.innerHTML ) ) {
					decu.removeChild( node );
				} else {
					accu.appendChild( node );
				}
			} else {
				accu.appendChild( node );
			}
		} else {
			decu.removeChild( node );
		}
	}

	return Array.from( accu.childNodes );
}

export default function( nodes ) {
	const prepare = compose( [ normaliseToBlockLevelNodes, removeSpans, stripAttributes, convertTables ] );

	return prepare( nodes ).map( ( node ) => {
		const block = getBlockTypes().reduce( ( acc, blockType ) => {
			if ( acc ) {
				return acc;
			}

			const transformsFrom = get( blockType, 'transforms.from', [] );
			const transform = find( transformsFrom, ( { type } ) => type === 'raw' );

			if ( ! transform || ! transform.matcher( node ) ) {
				return acc;
			}

			const { name, defaultAttributes = [] } = blockType;
			const attributes = parseBlockAttributes( node.outerHTML, transform.attributes );

			return createBlock( name, { ...defaultAttributes, ...attributes } );
		}, null );

		if ( block ) {
			return block;
		}

		return createBlock( getUnknownTypeHandler(), {
			content: node.outerHTML,
		} );
	} );
}
