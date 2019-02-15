/**
 * Internal dependencies
 */

import { toTree } from './to-tree';
import { createElement } from './create-element';

/**
 * Browser dependencies
 */

const { TEXT_NODE } = window.Node;

/**
 * Creates a path as an array of indices from the given root node to the given
 * node.
 *
 * @param {Node}        node     Node to find the path of.
 * @param {HTMLElement} rootNode Root node to find the path from.
 * @param {Array}       path     Initial path to build on.
 *
 * @return {Array} The path from the root node to the node.
 */
function createPathToNode( node, rootNode, path ) {
	const parentNode = node.parentNode;
	let i = 0;

	while ( ( node = node.previousSibling ) ) {
		i++;
	}

	path = [ i, ...path ];

	if ( parentNode !== rootNode ) {
		path = createPathToNode( parentNode, rootNode, path );
	}

	return path;
}

/**
 * Gets a node given a path (array of indices) from the given node.
 *
 * @param {HTMLElement} node Root node to find the wanted node in.
 * @param {Array}       path Path (indices) to the wanted node.
 *
 * @return {Object} Object with the found node and the remaining offset (if any).
 */
function getNodeByPath( node, path ) {
	path = [ ...path ];

	while ( node && path.length > 1 ) {
		node = node.childNodes[ path.shift() ];
	}

	return {
		node,
		offset: path[ 0 ],
	};
}

/**
 * Returns a new instance of a DOM tree upon which RichText operations can be
 * applied.
 *
 * Note: The current implementation will return a shared reference, reset on
 * each call to `createEmpty`. Therefore, you should not hold a reference to
 * the value to operate upon asynchronously, as it may have unexpected results.
 *
 * @return {WPRichTextTree} RichText tree.
 */
const createEmpty = () => createElement( document, '' );

function append( element, child ) {
	if ( typeof child === 'string' ) {
		child = element.ownerDocument.createTextNode( child );
	}

	const { type, attributes } = child;

	if ( type ) {
		child = element.ownerDocument.createElement( type );

		for ( const key in attributes ) {
			child.setAttribute( key, attributes[ key ] );
		}
	}

	return element.appendChild( child );
}

function appendText( node, text ) {
	node.appendData( text );
}

function getLastChild( { lastChild } ) {
	return lastChild;
}

function getParent( { parentNode } ) {
	return parentNode;
}

function isText( { nodeType } ) {
	return nodeType === TEXT_NODE;
}

function getText( { nodeValue } ) {
	return nodeValue;
}

function remove( node ) {
	return node.parentNode.removeChild( node );
}

function createLinePadding( doc ) {
	const element = doc.createElement( 'br' );
	element.setAttribute( 'data-rich-text-padding', 'true' );
	return element;
}

function padEmptyLines( { element, multilineWrapperTags } ) {
	const length = element.childNodes.length;
	const doc = element.ownerDocument;

	for ( let index = 0; index < length; index++ ) {
		const child = element.childNodes[ index ];

		if ( child.nodeType === TEXT_NODE ) {
			if ( length === 1 && ! child.nodeValue ) {
				// Pad if the only child is an empty text node.
				element.appendChild( createLinePadding( doc ) );
			}
		} else {
			if (
				multilineWrapperTags &&
				! child.previousSibling &&
				multilineWrapperTags.indexOf( child.nodeName.toLowerCase() ) !== -1
			) {
				// Pad the line if there is no content before a nested wrapper.
				element.insertBefore( createLinePadding( doc ), child );
			}

			padEmptyLines( { element: child, multilineWrapperTags } );
		}
	}
}

function prepareFormats( prepareEditableTree = [], value ) {
	return prepareEditableTree.reduce( ( accumlator, fn ) => {
		return fn( accumlator, value.text );
	}, value.formats );
}

export function toDom( {
	value,
	multilineTag,
	multilineWrapperTags,
	prepareEditableTree,
	isEditableTree = true,
} ) {
	let startPath = [];
	let endPath = [];

	const tree = toTree( {
		value: {
			...value,
			formats: prepareFormats( prepareEditableTree, value ),
		},
		multilineTag,
		multilineWrapperTags,
		createEmpty,
		append,
		getLastChild,
		getParent,
		isText,
		getText,
		remove,
		appendText,
		onStartIndex( body, pointer ) {
			startPath = createPathToNode( pointer, body, [ pointer.nodeValue.length ] );
		},
		onEndIndex( body, pointer ) {
			endPath = createPathToNode( pointer, body, [ pointer.nodeValue.length ] );
		},
		isEditableTree,
	} );

	if ( isEditableTree ) {
		padEmptyLines( { element: tree, multilineWrapperTags } );
	}

	return {
		body: tree,
		selection: { startPath, endPath },
	};
}

/**
 * Create an `Element` tree from a Rich Text value and applies the difference to
 * the `Element` tree contained by `current`. If a `multilineTag` is provided,
 * text separated by two new lines will be wrapped in an `Element` of that type.
 *
 * @param {Object}      value        Value to apply.
 * @param {HTMLElement} current      The live root node to apply the element
 *                                   tree to.
 * @param {string}      multilineTag Multiline tag.
 */
export function apply( {
	value,
	current,
	multilineTag,
	multilineWrapperTags,
	prepareEditableTree,
	__unstableDomOnly,
} ) {
	// Construct a new element tree in memory.
	const { body, selection } = toDom( {
		value,
		multilineTag,
		multilineWrapperTags,
		prepareEditableTree,
	} );

	applyValue( body, current );

	if ( value.start !== undefined && ! __unstableDomOnly ) {
		applySelection( selection, current );
	}
}

export function applyValue( future, current ) {
	let i = 0;
	let futureChild;

	while ( ( futureChild = future.firstChild ) ) {
		const currentChild = current.childNodes[ i ];

		if ( ! currentChild ) {
			current.appendChild( futureChild );
		} else if ( ! currentChild.isEqualNode( futureChild ) ) {
			if (
				currentChild.nodeName !== futureChild.nodeName ||
				( currentChild.nodeType === TEXT_NODE && currentChild.data !== futureChild.data )
			) {
				current.replaceChild( futureChild, currentChild );
			} else {
				const currentAttributes = currentChild.attributes;
				const futureAttributes = futureChild.attributes;

				if ( currentAttributes ) {
					for ( let ii = 0; ii < currentAttributes.length; ii++ ) {
						const { name } = currentAttributes[ ii ];

						if ( ! futureChild.getAttribute( name ) ) {
							currentChild.removeAttribute( name );
						}
					}
				}

				if ( futureAttributes ) {
					for ( let ii = 0; ii < futureAttributes.length; ii++ ) {
						const { name, value } = futureAttributes[ ii ];

						if ( currentChild.getAttribute( name ) !== value ) {
							currentChild.setAttribute( name, value );
						}
					}
				}

				applyValue( futureChild, currentChild );
				future.removeChild( futureChild );
			}
		} else {
			future.removeChild( futureChild );
		}

		i++;
	}

	while ( current.childNodes[ i ] ) {
		current.removeChild( current.childNodes[ i ] );
	}
}

/**
 * Returns true if two ranges are equal, or false otherwise. Ranges are
 * considered equal if their start and end occur in the same container and
 * offset.
 *
 * @param {Range} a First range object to test.
 * @param {Range} b First range object to test.
 *
 * @return {boolean} Whether the two ranges are equal.
 */
function isRangeEqual( a, b ) {
	return (
		a.startContainer === b.startContainer &&
		a.startOffset === b.startOffset &&
		a.endContainer === b.endContainer &&
		a.endOffset === b.endOffset
	);
}

export function applySelection( { startPath, endPath }, current ) {
	const { node: startContainer, offset: startOffset } = getNodeByPath( current, startPath );
	const { node: endContainer, offset: endOffset } = getNodeByPath( current, endPath );
	const selection = window.getSelection();
	const { ownerDocument } = current;
	const range = ownerDocument.createRange();

	range.setStart( startContainer, startOffset );
	range.setEnd( endContainer, endOffset );

	if ( selection.rangeCount > 0 ) {
		// If the to be added range and the live range are the same, there's no
		// need to remove the live range and add the equivalent range.
		if ( isRangeEqual( range, selection.getRangeAt( 0 ) ) ) {
			// Set back focus if focus is lost.
			if ( ownerDocument.activeElement !== current ) {
				current.focus();
			}

			return;
		}

		selection.removeAllRanges();
	}

	selection.addRange( range );
}
