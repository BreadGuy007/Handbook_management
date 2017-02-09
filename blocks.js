"use strict";

/**
 * Derived functions
 */
var getNextSibling = siblingGetter( 'next' );
var getPreviousSibling = siblingGetter( 'previous' );
var getTagType = getConfig.bind( null, 'tagTypes' );
var getTypeKinds = getConfig.bind( null, 'typeKinds' );

/**
 * Globals
 */
var config = {
	tagTypes: {
		'IMG': 'image',
		'H1': 'heading',
		'H2': 'heading',
		'H3': 'heading',
		'H4': 'heading',
		'H5': 'heading',
		'H6': 'heading',
		'default': 'paragraph'
	},
	typeKinds: {
		'paragraph': [ 'text' ],
		'heading': [ 'heading', 'text' ],
		'image': [ 'image' ],
		'default': []
	}
};
var editor = queryFirst( '.editor' );
var switcher = queryFirst( '.block-switcher' );
var switcherButtons = query( '.block-switcher .type svg' );
var blockControls = queryFirst( '.block-controls' );
var inlineControls = queryFirst( '.inline-controls' );
var insertBlockButton = queryFirst( '.insert-block__button' );
var imageFullBleed = queryFirst( '.block-image__full-width' );
var imageAlignNone = queryFirst( '.block-image__no-align' );
var imageAlignLeft = queryFirst( '.block-image__align-left' );
var imageAlignRight = queryFirst( '.block-image__align-right' );
var selectedBlock = null;


/**
 * Initialization
 */
window.addEventListener( 'click', clearBlocks, false );
editor.addEventListener( 'input', attachBlockHandlers, false );
editor.addEventListener( 'input', clearBlocks, false );
insertBlockButton.addEventListener( 'click', openBlockMenu, false );
window.addEventListener( 'mouseup', onSelectText, false );

attachBlockHandlers();
attachControlActions();

/**
 * Core logic
 */
function attachBlockHandlers() {
	getBlocks().forEach( function( block ) {
		block.removeEventListener( 'click', selectBlock, false );
		block.addEventListener( 'click', selectBlock, false );
	} );
}

function getBlocks() {
	return Array.prototype.concat.apply( [],
			[ 'p', 'h2', 'img' ].map( query ) );
}

function selectBlock( event ) {
	clearBlocks();
	event.stopPropagation();
	event.target.className += ' is-selected';

	selectedBlock = event.target;
	showControls( selectedBlock );
}

function clearBlocks() {
	getBlocks().forEach( function( block ) {
		block.className = block.className.replace( 'is-selected', '' );
	} );
	var selectedBlock = null;

	hideControls();
	hideMenu();
}

function showControls( node ) {
	// toggle block-specific switcher
	switcherButtons.forEach( function( element ) {
		element.style.display = 'none';
	} );
	var blockType = getTagType( node.nodeName );
	var switcherQuery = '.type-icon-' + blockType;
	queryFirst( switcherQuery ).style.display = 'block';

	// reposition switcher
	var position = node.getBoundingClientRect();
	switcher.style.opacity = 1;
	switcher.style.top = ( position.top + 18 + window.scrollY ) + 'px';

	// show/hide block-specific block controls
	var kinds = getTypeKinds( blockType );
	var kindClasses = kinds.map( function( kind ) {
		return 'is-' + kind;
	} ).join( ' ' );
	blockControls.className = 'block-controls ' + kindClasses;
	blockControls.style.display = 'block';

	// reposition block-specific block controls
	blockControls.style.top = ( position.top - 36 + window.scrollY ) + 'px';
	blockControls.style.maxHeight = 'none';
}

function hideControls() {
	switcher.style.opacity = 0;
	blockControls.style.display = 'none';
}

// Show popup on text selection
function onSelectText( event ) {
	event.stopPropagation();
	var txt = "";

	if ( window.getSelection ) {
		txt = window.getSelection();
	} else if ( document.getSelection ) {
		txt = document.getSelection();
	} else if ( document.selection ) {
		txt = document.selection.createRange().text;
	}

	// Show formatting bar
	if ( txt != '' ) {
		inlineControls.style.display = 'block';
		var range = txt.getRangeAt(0);
		var pos = range.getBoundingClientRect();
		var selectCenter = pos.width / 2;
		var controlsCenter = inlineControls.offsetWidth / 2;
		inlineControls.style.left = ( pos.left + selectCenter - controlsCenter ) + 'px';
		inlineControls.style.top = ( pos.top - 48 + window.scrollY ) + 'px';
	} else {
		inlineControls.style.display = 'none';
	}
}

function attachControlActions() {
	Array.from( switcher.childNodes ).forEach( function( node ) {
		if ( 'svg' !== node.nodeName ) {
			return;
		}

		var classes = node.className.baseVal;

		if ( 'up' === classes ) {
			node.addEventListener( 'click', function() {
				event.stopPropagation();
				swapNodes( selectedBlock, getPreviousSibling( selectedBlock ) );
				attachBlockHandlers();
				reselect();
			}, false );
		} else if ( 'down' === classes ) {
			node.addEventListener( 'click', function() {
				event.stopPropagation();
				swapNodes( selectedBlock, getNextSibling( selectedBlock ) );
				attachBlockHandlers();
				reselect();
			}, false );
		}
	} );

	imageFullBleed.addEventListener( 'click', setImageFullBleed, false );
	imageAlignNone.addEventListener( 'click', setImageAlignNone, false );
	imageAlignLeft.addEventListener( 'click', setImageAlignLeft, false );
	imageAlignRight.addEventListener( 'click', setImageAlignRight, false );
}

function reselect() {
	queryFirst( '.is-selected' ).click();
}

function swapNodes( a, b ) {
	if ( ! ( a && b ) ) {
		return false;
	}

	var parent = a.parentNode;
	if ( ! parent ) {
		return false;
	}

	// insert node copies before removal
	parent.replaceChild( b.cloneNode( true ), a );
	parent.replaceChild( a.cloneNode( true ), b );

	return true;
}

/**
 * Utility functions
 */
function siblingGetter( direction ) {
	var sibling = direction + 'Sibling';

	return function getAdjacentSibling( node ) {
		if ( null === node ) {
			return null;
		}

		if ( null === node[ sibling ] ) {
			return null;
		}

		if ( '#text' === node[ sibling ].nodeName ) {
			return getAdjacentSibling( node[ sibling ] );
		}

		return node[ sibling ];
	}
}

function openBlockMenu( event ) {
	event.stopPropagation();
	var menu = document.getElementsByClassName( 'insert-block__menu' )[0];
	menu.style.display = 'block';
	menu.addEventListener( 'click', function( event ) {
		event.stopPropagation();
	}, false );
}

function hideMenu() {
	var menu = document.getElementsByClassName( 'insert-block__menu' )[0];
	menu.style.display = 'none';
}

function setImageFullBleed( event ) {
	event.stopPropagation();
	var image = query('img')[0];
	console.log(image);
	image.className = 'is-selected align-full-bleed';
}

function setImageAlignNone( event ) {
	event.stopPropagation();
	var image = query('img')[0];
	console.log(image);
	image.className = 'is-selected';
}

function setImageAlignLeft( event ) {
	event.stopPropagation();
	var image = query('img')[0];
	image.className = 'is-selected align-left';
}

function setImageAlignRight( event ) {
	event.stopPropagation();
	var image = query('img')[0];
	image.className = 'is-selected align-right';
}

function l( data ) {
	console.log.apply( console.log, arguments );
	return data;
}

function query( selector ) {
	return Array.from( document.querySelectorAll( selector ) );
}

function queryFirst( selector ) {
	return query( selector )[ 0 ];
}

function getConfig( configName, tagName ) {
	return config[ configName ][ tagName ] ||
		config[ configName ].default;
}
