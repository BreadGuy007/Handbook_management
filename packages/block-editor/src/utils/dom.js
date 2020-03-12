/**
 * Given a block client ID, returns the corresponding DOM node for the block,
 * if exists. As much as possible, this helper should be avoided, and used only
 * in cases where isolated behaviors need remote access to a block node.
 *
 * @param {string} clientId Block client ID.
 * @param {Element} scope an optional DOM Element to which the selector should be scoped
 *
 * @return {Element} Block DOM node.
 */
export function getBlockDOMNode( clientId ) {
	return document.getElementById( 'block-' + clientId );
}

export function getBlockPreviewContainerDOMNode( clientId ) {
	const domNode = getBlockDOMNode( clientId );

	if ( ! domNode ) {
		return;
	}

	return domNode.firstChild || domNode;
}

/**
 * Returns true if the given HTMLElement is a block focus stop. Blocks without
 * their own text fields rely on the focus stop to be keyboard navigable.
 *
 * @param {HTMLElement} element Element to test.
 *
 * @return {boolean} Whether element is a block focus stop.
 */
export function isBlockFocusStop( element ) {
	return element.classList.contains( 'block-editor-block-list__block' );
}

/**
 * Returns true if two elements are contained within the same block.
 *
 * @param {HTMLElement} a First element.
 * @param {HTMLElement} b Second element.
 *
 * @return {boolean} Whether elements are in the same block.
 */
export function isInSameBlock( a, b ) {
	return (
		a.closest( '.block-editor-block-list__block' ) ===
		b.closest( '.block-editor-block-list__block' )
	);
}

/**
 * Returns true if an elements is considered part of the block and not its children.
 *
 * @param {HTMLElement} blockElement Block container element.
 * @param {HTMLElement} element      Element.
 *
 * @return {boolean} Whether element is in the block Element but not its children.
 */
export function isInsideRootBlock( blockElement, element ) {
	const parentBlock = element.closest( '.block-editor-block-list__block' );
	return parentBlock === blockElement;
}

/**
 * Returns true if the given HTMLElement contains inner blocks (an InnerBlocks
 * element).
 *
 * @param {HTMLElement} element Element to test.
 *
 * @return {boolean} Whether element contains inner blocks.
 */
export function hasInnerBlocksContext( element ) {
	return (
		element.classList.contains( 'block-editor-block-list__layout' ) ||
		!! element.querySelector( '.block-editor-block-list__layout' )
	);
}

/**
 * Finds the block client ID given any DOM node inside the block.
 *
 * @param {Node} node DOM node.
 *
 * @return {string|undefined} Client ID or undefined if the node is not part of a block.
 */
export function getBlockClientId( node ) {
	if ( node.nodeType !== node.ELEMENT_NODE ) {
		node = node.parentElement;
	}

	const blockNode = node.closest( '.block-editor-block-list__block' );

	if ( ! blockNode ) {
		return;
	}

	return blockNode.id.slice( 'block-'.length );
}
