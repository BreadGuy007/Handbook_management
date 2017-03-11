( function( wp ) {

	function insertEmpty() {
		return '<ul><li><br></li></ul>';
	}

	function fromBaseState( state ) {
		var list = document.createElement( 'UL' );
		var item = document.createElement( 'LI' );

		list.appendChild( item );

		while ( state.firstChild ) {
			if ( state.firstChild.nodeName === 'BR' ) {
				item = document.createElement( 'LI' );
				list.appendChild( item );
				state.removeChild( state.firstChild );
			} else {
				item.appendChild( state.firstChild );
			}
		}

		state.parentNode.replaceChild( list, state );
	}

	function toBaseState( block ) {
		var state = document.createElement( 'P' );

		function build( list, state ) {
			var item;

			while ( item = list.firstChild ) {
				if ( state.childNodes.length ) {
					state.appendChild( document.createElement( 'BR' ) );
				}

				while ( item.firstChild ) {
					if ( item.firstChild.nodeName === 'UL' || item.firstChild.nodeName === 'OL' ) {
						build( item.firstChild, state )
						item.removeChild( item.firstChild );
					} else {
						state.appendChild( item.firstChild );
					}
				}

				list.removeChild( item );
			}
		}

		build( block, state );

		block.parentNode.replaceChild( state, block );
	}

	wp.blocks.registerBlock( {
		name: 'list',
		displayName: 'List',
		elements: [ 'ul', 'ol' ],
		type: 'text',
		icon: 'gridicons-list-unordered',
		base: 'elements:paragraph',
		insert: insertEmpty,
		toBaseState: toBaseState,
		fromBaseState: fromBaseState,
		controls: [
			{
				icon: 'gridicons-list-unordered',
				stateSelector: 'ul',
				onClick: function( block, editor ) {
					// Use native command to toggle current selected list.
					editor.execCommand( 'InsertUnorderedList' );
				}
			},
			{
				icon: 'gridicons-list-ordered',
				stateSelector: 'ol',
				onClick: function( block, editor ) {
					// Use native command to toggle current selected list.
					editor.execCommand( 'InsertOrderedList' );
				}
			},
			{
				classes: 'remove-formatting',
				icon: 'gridicons-list-unordered',
				onClick: toBaseState
			}
		]
	} );

} )( window.wp );
