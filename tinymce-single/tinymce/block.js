( function( tinymce, wp, _ ) {
	tinymce.PluginManager.add( 'block', function( editor ) {
		var getSelectedBlock = wp.blocks.getSelectedBlock;
		var getSelectedBlocks = wp.blocks.getSelectedBlocks;
		var editorPadding = 50;

		// Global controls

		function isNodeEligibleForControl( node, name ) {
			var block;

			if ( ! node ) {
				return false;
			}

			block = wp.blocks.getBlockSettingsByElement( node );
			return block && _.includes( block.controls, name );
		}

		_.forEach( wp.blocks.getControls(), function( control, name ) {
			var settings = {
				icon: control.icon
			};

			if ( control.onClick ) {
				settings.onClick = function() {
					control.onClick( getSelectedBlock() );
					editor.nodeChanged();
				};
			}

			if ( control.isActive ) {
				settings.onPostRender = function() {
					var button = this;

					editor.on( 'nodechange', function() {
						var block = getSelectedBlock();

						if ( isNodeEligibleForControl( block, name ) ) {
							button.active( control.isActive( block ) );
						}
					} );
				};
			}

			editor.addButton( name, settings );
		} );

		// Attach block UI.

		editor.on( 'preinit', function() {
			var DOM = tinymce.DOM;

			editor.on( 'mousedown click', function( event ) {
				if ( event.target.getAttribute( 'contenteditable' ) === 'true' ) {
					if ( event.target !== editor.selection.getNode() ) {
						setTimeout( function() {
							editor.selection.placeCaretAt( event.clientX, event.clientY );
						}, 50 );
					}
				}
			}, true );

			editor.addButton( 'block', {
				icon: 'gridicons-posts',
				tooltip: 'Add Block',
				onPostRender: function() {
					var button = this;

					editor.on( 'nodechange', function( event ) {
						var block = getSelectedBlock();
						var settings = wp.blocks.getBlockSettingsByElement( block );

						if ( settings ) {
							button.icon( settings.icon );
						}
					} );
				}
			});

			function removeBlock() {
				var $blocks = editor.$( getSelectedBlock() );
				var p = editor.$( '<p><br></p>' );

				editor.undoManager.transact( function() {
					$blocks.first().before( p );
					editor.selection.setCursorLocation( p[0], 0 );
					$blocks.remove();
				} );
			}

			function moveBlockUp() {
				$blocks = editor.$( getSelectedBlocks() );
				$first = $blocks.first();
				$last = $blocks.last();
				$prev = $first.prev();

				rect = $first[0].getBoundingClientRect();

				if ( $prev.length ) {
					editor.undoManager.transact( function() {
						$last.after( $prev );
					} );

					editor.nodeChanged();
					window.scrollBy( 0, - rect.top + $first[0].getBoundingClientRect().top );
				}
			}

			function moveBlockDown() {
				$blocks = editor.$( getSelectedBlocks() );
				$first = $blocks.first();
				$last = $blocks.last();
				$next = $last.next();

				rect = $first[0].getBoundingClientRect();

				if ( $next.length ) {
					editor.undoManager.transact( function() {
						$first.before( $next );
					} );

					editor.nodeChanged();
					window.scrollBy( 0, - rect.top + $first[0].getBoundingClientRect().top );
				}
			}

			editor.addButton( 'up', {
				icon: 'gridicons-chevron-up',
				tooltip: 'Up',
				onClick: moveBlockUp,
				classes: 'widget btn move-up',
				onPostRender: function() {
					var button = this;

					editor.on( 'nodeChange', function() {
						var selectedBlocks = getSelectedBlocks();
						var firstBlock = selectedBlocks[0];

						button.disabled( ! firstBlock.previousSibling );
					} );
				}
			} );

			editor.addButton( 'down', {
				icon: 'gridicons-chevron-down',
				tooltip: 'Down',
				onClick: moveBlockDown,
				classes: 'widget btn move-down',
				onPostRender: function() {
					var button = this;

					editor.on( 'nodeChange', function() {
						var selectedBlocks = getSelectedBlocks();
						var lastBlock = selectedBlocks[ selectedBlocks.length - 1 ];

						button.disabled( ! lastBlock.nextSibling );
					} );
				}
			} );

			var insert = false;

			editor.addButton( 'add', {
				icon: 'gridicons-add-outline',
				tooltip: 'Add Block',
				onClick: function() {
					var selection = window.getSelection();

					if ( ! selection.isCollapsed || ! isEmptySlot( selection.anchorNode, true ) ) {
						var $blocks = editor.$( getSelectedBlock() );
						var $p = editor.$( '<p><br></p>' );

						editor.undoManager.transact( function() {
							$blocks.last().after( $p );
							editor.selection.setCursorLocation( $p[0], 0 );
						} );
					}

					setTimeout( function() {
						insert = true;
						editor.nodeChanged();
					} );
				}
			} );

			// Adjust icon of TinyMCE core buttons.
			editor.buttons.bold.icon = 'gridicons-bold';
			editor.buttons.italic.icon = 'gridicons-italic';
			editor.buttons.strikethrough.icon = 'gridicons-strikethrough';
			editor.buttons.link.icon = 'gridicons-link';

			var blockToolbarWidth = 0;

			function createBlockOutline() {
				var outline = document.createElement( 'div' );

				outline.className = 'block-outline';
				document.body.appendChild( outline );

				return outline;
			}

			function createInsertToolbar() {
				var insert = editor.wp._createToolbar( [ 'add' ] );

				insert.$el.addClass( 'block-toolbar' );
				insert.$el.addClass( 'insert-toolbar' );

				insert.reposition = function ( settings ) {
					settings = settings || {};

					var toolbar = this.getEl();
					var block = getSelectedBlock();
					var isFullBleed = editor.$( block ).hasClass( 'alignfull' );
					var toolbarRect = toolbar.getBoundingClientRect();
					var blockRect = block.getBoundingClientRect();
					var contentRect = editor.getBody().getBoundingClientRect();

					if ( settings.isEmpty ) {
						DOM.setStyles( toolbar, {
							position: 'absolute',
							left: contentRect.left + 'px',
							top: blockRect.top + 3 + window.pageYOffset + 'px'
						} );
					} else {
						if ( isFullBleed ) {
							var left = contentRect.left;
						} else {
							var left = blockRect.left - 6;
						}

						DOM.setStyles( toolbar, {
							position: 'absolute',
							left: left + 'px',
							top: blockRect.bottom - 3 + window.pageYOffset + 'px'
						} );
					}

					this.show();
				}

				return insert;
			}

			tinymce.ui.Factory.add( 'WPInsertSeparator', tinymce.ui.Control.extend( {
				renderHtml: function() {
					return (
						'<div id="' + this._id + '" class="insert-separator">' + this.settings.text + '</div>'
					);
				}
			} ) );

			function createInsertMenu() {
				var insertMenu = editor.wp._createToolbar( ( function() {
					var allSettings = wp.blocks.getBlocks();
					var buttons = [];
					var key;
					var types = [ 'text', 'media', 'separator' ];

					function onClick( callback ) {
						return function( block ) {
							var content = callback.apply( this, arguments );

							if ( content ) {
								if ( typeof content === 'string' ) {
									var temp = document.createElement( 'div' );
									temp.innerHTML = content;
									content = temp.firstChild;
									temp = null;
								}

								block.parentNode.replaceChild( content, block );
							}

							window.wp.blocks.selectBlock( content );

							setTimeout( showBlockUI )
						}
					}

					types.forEach( function( type ) {
						buttons.push( {
							type: 'WPInsertSeparator',
							text: type
						} );

						for ( key in allSettings ) {
							if ( allSettings[ key ].type === type ) {
								buttons.push( {
									text: allSettings[ key ].displayName,
									icon: allSettings[ key ].icon,
									onClick: onClick( allSettings[ key ].insert )
								} );
							}
						}
					} );

					return buttons;
				} )() );

				insertMenu.$el.addClass( 'insert-menu' );

				insertMenu.reposition = function () {
					var toolbar = this.getEl();
					var toolbarRect = toolbar.getBoundingClientRect();
					var elementRect = getSelectedBlock().getBoundingClientRect();
					var contentRect = editor.getBody().getBoundingClientRect();

					DOM.setStyles( toolbar, {
						position: 'absolute',
						left: contentRect.left + editorPadding + 'px',
						top: elementRect.top + window.pageYOffset + 'px'
					} );

					this.show();
				}

				return insertMenu;
			}

			function createInlineToolbar() {
				var inline = editor.wp._createToolbar( [ 'bold', 'italic', 'strikethrough', 'link' ] );

				inline.reposition = function () {
					var toolbar = this.getEl();
					var toolbarRect = toolbar.getBoundingClientRect();
					var elementRect = getSelectedBlock().getBoundingClientRect();
					var contentRect = editor.getBody().getBoundingClientRect();

					DOM.setStyles( toolbar, {
						position: 'absolute',
						left: Math.max( contentRect.left + editorPadding, elementRect.left ) + 8 + blockToolbarWidth + 'px',
						top: elementRect.top + window.pageYOffset - toolbarRect.height - 8 + 'px'
					} );

					this.show();
				}

				return inline;
			}

			function createBlockNavigation() {
				var navigation = editor.wp._createToolbar( [ 'up', 'down' ] );

				navigation.$el.addClass( 'block-toolbar' );

				navigation.reposition = function () {
					var toolbar = this.getEl();
					var block = getSelectedBlock();
					var isRightAligned = editor.$( block ).hasClass( 'alignright' );
					var isFullBleed = editor.$( block ).hasClass( 'alignfull' );
					var toolbarRect = toolbar.getBoundingClientRect();
					var blockRect = block.getBoundingClientRect();
					var contentRect = editor.getBody().getBoundingClientRect();

					if ( isRightAligned ) {
						var left = contentRect.right - toolbarRect.width;
					} else {
						var left = contentRect.left;
					}

					if ( isFullBleed ) {
						var top = blockRect.top - toolbarRect.height - 10;
					} else {
						var top = blockRect.top;
					}

					DOM.setStyles( toolbar, {
						position: 'absolute',
						left: left + 'px',
						top: top + window.pageYOffset + 'px'
					} );

					this.show();
				}

				return navigation;
			}

			function createBlockToolbars() {
				var settings = wp.blocks.getBlocks();
				var toolbars = {};
				var key;

				for ( key in settings ) {
					toolbars[ key ] = editor.wp._createToolbar( settings[ key ].controls || [] );
					toolbars[ key ].reposition = function () {
						var toolbar = this.getEl();
						var toolbarRect = toolbar.getBoundingClientRect();
						var elementRect = getSelectedBlock().getBoundingClientRect();
						var contentRect = editor.getBody().getBoundingClientRect();

						DOM.setStyles( toolbar, {
							position: 'absolute',
							left: Math.max( contentRect.left + editorPadding, elementRect.left ) + 'px',
							top: elementRect.top + window.pageYOffset - toolbarRect.height - 8 + 'px'
						} );

						blockToolbarWidth = toolbarRect.width;

						this.show();
					}
				}

				return toolbars;
			}

			var UI = {
				outline: createBlockOutline(),
				insert: createInsertToolbar(),
				insertMenu: createInsertMenu(),
				inline: createInlineToolbar(),
				navigation: createBlockNavigation(),
				blocks: createBlockToolbars()
			};

			var range;

			editor.on( 'blur', function() {
				UI.inline.hide();
				UI.insert.hide();
				hideBlockUI();
			} );

			function isEmptySlot( node, isAtRoot ) {
				// Text node.
				if ( node.nodeType === 3 ) {
					// Has text.
					if ( node.data.length ) {
						return false;
					} else {
						node = node.parentNode;
					}
				}

				if ( node.nodeName === 'BR' ) {
					node = node.parentNode;
				}

				// Element node.
				if ( node.nodeType === 1 ) {
					// Element is no direct child.
					if ( isAtRoot && node.parentNode !== editor.getBody() && node.nodeName !== 'P' ) {
						return false;
					}

					var childNodes = node.childNodes;
					var i = childNodes.length;

					// Loop over children.
					while ( i-- ) {
						// Text node.
						if ( childNodes[ i ].nodeType === 3 ) {
							// Has text.
							if ( childNodes[ i ].data.length ) {
								return false;
							}
						}

						// Element node.
						if ( childNodes[ i ].nodeType === 1 ) {
							// Is not BR.
							if ( childNodes[ i ].nodeName !== 'BR' ) {
								return false;
							}
						}
					}
				}

				return true;
			}

			var hasBlockUI = false;

			function hideBlockUI() {
				if ( hasBlockUI ) {
					tinymce.$( editor.getBody() ).removeClass( 'has-block-ui' );
					hasBlockUI = false;
				}

				UI.inline.hide();
				UI.navigation.hide();

				tinymce.each( UI.blocks, function( toolbar ) {
					toolbar.hide();
				} );

				DOM.setStyles( UI.outline, {
					display: 'none'
				} );
			}

			function focusToolbar( toolbar ) {
				var node = toolbar.find( 'toolbar' )[0];
				node && node.focus( true );
			}

			function showBlockUI( focus ) {
				var selectedBlocks = getSelectedBlocks();
				var settings = wp.blocks.getBlockSettingsByElement( selectedBlocks[0] ),
					controls;

				if ( ! settings ) {
					return;
				}

				if ( ! hasBlockUI ) {
					tinymce.$( editor.getBody() ).addClass( 'has-block-ui' );
					hasBlockUI = true;
				}

				UI.navigation.reposition();

				tinymce.each( UI.blocks, function( toolbar, key ) {
					if ( key !== settings._id ) {
						toolbar.hide();
					}
				} );

				if ( selectedBlocks.length === 1 ) {
					UI.blocks[ settings._id ].reposition();
					focus && focusToolbar( UI.blocks[ settings._id ] );

					var selection = window.getSelection();

					if ( selection.anchorNode.nodeType === 3 ) {
						UI.inline.reposition();
					} else {
						UI.inline.hide();
					}

					UI.insert.reposition();
				} else {
					UI.blocks[ settings._id ].hide();
					UI.inline.hide();
					UI.insert.hide();
				}

				var startRect = selectedBlocks[0].getBoundingClientRect();
				var endRect = selectedBlocks[ selectedBlocks.length - 1 ].getBoundingClientRect();

				DOM.setStyles( UI.outline, {
					display: 'block',
					position: 'absolute',
					left: Math.min( startRect.left, endRect.left ) + 'px',
					top: startRect.top + window.pageYOffset + 'px',
					height: endRect.bottom - startRect.top + 'px',
					width: Math.max( startRect.width, endRect.width ) + 'px'
				} );
			}

			var hidden = true;

			editor.on( 'keydown', function( event ) {
				if ( tinymce.util.VK.metaKeyPressed( event ) ) {
					return;
				}

				hidden = true;
				insert = false;
			} );

			editor.on( 'mousedown touchstart', function() {
				hidden = false;
				insert = false;
			} );

			editor.on( 'selectionChange nodeChange', function( event ) {
				var isCollapsed = editor.selection.isCollapsed();
				var startNode = editor.selection.getStart();

				if ( ! startNode ) {
					return;
				}

				if ( startNode.id === 'mcepastebin' ) {
					return;
				}

				if ( ! editor.getBody().contains( startNode ) ) {
					return;
				}

				var isEmpty = isCollapsed && isEmptySlot( startNode, true );
				var isBlockUIVisible = ! hidden;

				if ( isEmpty ) {
					hideBlockUI();
					UI.inline.hide();
					UI.insert.reposition( { isEmpty: isEmpty } );
				} else {
					if ( isBlockUIVisible ) {
						showBlockUI();
					} else {
						hideBlockUI();
						UI.insert.hide();
					}
				}

				if ( insert ) {
					UI.insertMenu.reposition();
				} else {
					UI.insertMenu.hide();
				}
			} );

			editor.on( 'nodeChange', function( event ) {
				insert = false;
			} );

			var metaCount = 0;

			editor.on( 'keydown', function( event ) {
				var keyCode = event.keyCode;
				var VK = tinymce.util.VK;
				var block = getSelectedBlock();

				if ( keyCode === VK.BACKSPACE ) {
					var selection = window.getSelection();

					if ( ! selection.isCollapsed && editor.dom.isBlock( selection.focusNode ) ) {
						if ( selection.anchorOffset === 0 && selection.focusOffset === 0 ) {
							if ( block.nextSibling && block.nextSibling.contains( selection.focusNode ) ) {
								removeBlock();
								event.preventDefault();
							}
						}

						if ( selection.anchorOffset === 0 && selection.anchorNode === selection.focusNode ) {
							removeBlock();
							event.preventDefault();
						}
					}
				}

				if ( VK.metaKeyPressed( event ) ) {
					metaCount ++;
				} else {
					metaCount = 0;
				}

				if ( keyCode === 27 ) {
					hideBlockUI();
				}
			}, true );

			editor.on( 'keyup', function( event ) {
				if ( metaCount === 1 ) {
					var selection = window.getSelection();

					if ( selection.isCollapsed && isEmptySlot( selection.anchorNode, true ) ) {
						return;
					}

					UI.insert.reposition();

					showBlockUI( true );
				}

				metaCount = 0;
			} );

			editor.on( 'nodeChange', function() {
				editor.$( editor.getBody() ).children().attr( 'data-mce-selected', null );
				editor.$( getSelectedBlock() ).attr( 'data-mce-selected', 'true' );
			} );
		} );
	} );
} )( window.tinymce, window.wp, window._ );
