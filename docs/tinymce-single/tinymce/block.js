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

		var textBlocks = wp.blocks.getType( 'text' );

		editor.addButton( 'text-switcher', {
			type: 'svglistbox',
			icon: 'gridicons-paragraph',
			values: textBlocks.map( function( settings ) {
				return {
					text: settings.displayName,
					icon: settings.icon,
					value: settings._id
				}
			} ),
			onPostRender: function() {
				var button = this;

				editor.on( 'nodeChange', function() {
					var block = wp.blocks.getSelectedBlock();
					var settings = wp.blocks.getBlockSettingsByElement( block );

					if ( settings ) {
						button.value( settings._id );
						button.icon( settings.icon );
						button.text( settings.displayName );
					}
				} );
			},
			onClick: function( event ) {
				if ( event.control && event.control.settings.value ) {
					var block = wp.blocks.getSelectedBlock();
					var currentSettings = wp.blocks.getBlockSettingsByElement( block );
					var nextSettings = wp.blocks.getBlockSettings( event.control.settings.value );

					editor.selection.collapse();

					var bookmark = editor.selection.getBookmark();

					editor.undoManager.transact( function() {
						var newBlock = nextSettings.fromBaseState(
							currentSettings.toBaseState( block, editor ), editor );

						wp.blocks.selectBlock( newBlock, bookmark );
					} );
				}
			}
		} );

		editor.on( 'pastePreProcess', function( event ) {
			var block = getSelectedBlock();
			var settings = wp.blocks.getBlockSettingsByElement( block );

			if ( settings.onPaste ) {
				settings.onPaste( event, block )
			}
		} );

		editor.on( 'click', function( event ) {
			var block = getSelectedBlock();
			var settings = wp.blocks.getBlockSettingsByElement( block );

			if ( settings.onClick ) {
				settings.onClick( event, block, function() { editor.nodeChanged() } )
			}
		} );

		editor.on( 'setContent', function( event ) {
			$blocks = editor.$( editor.getBody() ).children();
			$blocks.each( function( i, block ) {
				var settings = wp.blocks.getBlockSettingsByElement( block );

				if ( ! settings ) {
					return;
				}

				if ( settings.editable && settings.editable.length ) {
					editor.$( block ).attr( 'contenteditable', 'false' );

					settings.editable.forEach( function( selector ) {
						if ( ! selector ) {
							editor.$( block ).attr( 'contenteditable', null );
						} else {
							editor.$( block ).find( selector ).attr( 'contenteditable', 'true' );
						}
					} );
				} else {
					editor.$( block ).attr( 'contenteditable', 'false' );
				}
			} );
		} );

		function setFields() {
			var block = wp.blocks.getSelectedBlock();
			var settings = wp.blocks.getBlockSettingsByElement( block );

			if ( settings ) {
				if ( settings.editable && settings.editable.length ) {
					settings.editable.forEach( function( selector ) {
						editor.$( block ).find( selector ).attr( 'contenteditable', 'true' );
					} );
				}

				if ( settings.placeholders ) {
					for ( var selector in settings.placeholders ) {
						( selector ? editor.$( block ).find( selector ) : editor.$( block ) )
							.each( function( i, node ) {
								if ( ! node.textContent ) {
									editor.$( node ).attr( 'data-wp-placeholder', settings.placeholders[ selector ] );
								} else {
									editor.$( node ).attr( 'data-wp-placeholder', null );
								}
							} );
					}
				}
			}
		}

		function toInlineContent( content ) {
			var settings = {
				valid_elements: 'strong,em,del,a[href]'
			};

			var schema = new tinymce.html.Schema( settings );
			var parser = new tinymce.html.DomParser( settings, schema );
			var serializer = new tinymce.html.Serializer( settings, schema );

			return serializer.serialize( parser.parse( content, { forced_root_block: false } ) )
		}

		editor.on( 'beforeSetContent', function( event ) {
			if ( event.initial ) {
				return;
			}

			var block = wp.blocks.getSelectedBlock();
			var settings = wp.blocks.getBlockSettingsByElement( block );

			if ( settings && settings.editable && settings.editable.length ) {
				settings.editable.forEach( function( selector ) {
					var node = editor.selection.getNode();

					if ( ! selector ) {
						return;
					}

					if ( editor.$( node ).is( selector ) || editor.$( node ).parents( selector ).length ) {
						event.content = toInlineContent( event.content );
					}
				} );
			}
		} );

		editor.on( 'keydown', function( event ) {
			if ( event.keyCode !== tinymce.util.VK.ENTER ) {
				return;
			}

			var block = wp.blocks.getSelectedBlock();
			var settings = wp.blocks.getBlockSettingsByElement( block );

			if ( settings && settings.editable && settings.editable.length ) {
				settings.editable.forEach( function( selector ) {
					var node = editor.selection.getNode();

					if ( ! selector ) {
						return;
					}

					if ( editor.$( node ).is( selector ) || editor.$( node ).parents( selector ).length ) {
						event.preventDefault();
					}
				} );
			}
		} );

		editor.on( 'newBlock', function( event ) {
			editor.$( event.newBlock )
				.attr( 'data-wp-placeholder', null )
				.attr( 'data-wp-block-selected', null );
		} );

		// Attach block UI.

		editor.on( 'preinit', function() {
			var DOM = tinymce.DOM;
			var hidden = true;
			var hoverTarget;
			var dragTarget;
			var isDragging = false;

			editor.serializer.addTempAttr( 'data-wp-block-selected' );
			editor.serializer.addTempAttr( 'data-wp-placeholder' );

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

			function createBlockOutline( hover ) {
				var outline = document.createElement( 'div' );
				var handleLeft = document.createElement( 'div' );
				var handleRight = document.createElement( 'div' );

				if ( hover ) {
					outline.className = 'block-outline block-outline-hover';
				} else {
					outline.className = 'block-outline';
				}

				handleLeft.className = 'block-outline-handle block-outline-handle-right';
				handleRight.className = 'block-outline-handle block-outline-handle-left';
				outline.appendChild( handleLeft );
				outline.appendChild( handleRight );
				document.body.appendChild( outline );

				DOM.bind( outline, 'mousedown', function( event ) {
					var newEvent = Object.assign( {}, event );

					if ( hover ) {
						dragTarget = hoverTarget;
					} else {
						dragTarget = getSelectedBlock();
					}

					dragTarget.setAttribute( 'contenteditable', 'false' );

					newEvent.target = dragTarget;

					editor.fire( 'mousedown', newEvent );
				} );

				return outline;
			}

			editor.on( 'dragstart', function( event ) {
				if ( ! dragTarget ) {
					event.preventDefault();
					return;
				}

				isDragging = true;
				hidden = true;

				hideBlockUI();

				dragTarget.setAttribute( 'data-wp-block-dragging', 'true' );

				function end( event ) {
					DOM.unbind( editor.getDoc(), 'mouseup', end );

					isDragging = false;
					dragTarget = null;

					setTimeout( function() {
						var $draggedNode = editor.$( '*[data-wp-block-dragging]' );

						if ( $draggedNode.length ) {
							$draggedNode[0].removeAttribute( 'data-wp-block-dragging' );

							var settings = wp.blocks.getBlockSettingsByElement( $draggedNode[0] );

							if ( settings && settings.editable && settings.editable.length ) {
								settings.editable.forEach( function( selector ) {
									if ( ! selector ) {
										editor.$( block ).attr( 'contenteditable', null );
									}
								} );
							}
						}

						editor.nodeChanged();
					} );
				}

				DOM.bind( editor.getDoc(), 'mouseup', end );
			} );

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
					var types = [ 'text', 'media', 'data visualisation', 'separator' ];

					function onClick( callback, settings ) {
						return function( block ) {
							var content = callback.apply( this, arguments );
							var args = {
									format: 'html',
									set: true,
									selection: true,
									content: content
								};

							if ( content ) {
								editor.fire( 'beforeSetContent', args );

								if ( typeof content === 'string' ) {
									var temp = document.createElement( 'div' );
									temp.innerHTML = content;
									content = temp.firstChild;
									temp = null;
								}

								block.parentNode.replaceChild( content, block );

								if ( ! settings.elements ) {
									content.setAttribute( 'data-wp-block-type', settings._id );
								}

								editor.fire( 'setContent', args );
							}

							window.wp.blocks.selectBlock( content );
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
									onClick: onClick( allSettings[ key ].insert, allSettings[ key ] )
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

				inline.reposition = function( editableRoot ) {
					this.show();

					var toolbar = this.getEl();
					var toolbarRect = toolbar.getBoundingClientRect();
					var elementRect = ( editableRoot || getSelectedBlock() ).getBoundingClientRect();
					var contentRect = editor.getBody().getBoundingClientRect();
					var offset = editableRoot ? 0 : blockToolbarWidth;

					DOM.setStyles( toolbar, {
						position: 'absolute',
						left: Math.max( contentRect.left + editorPadding, elementRect.left ) + offset + 'px',
						top: elementRect.top + window.pageYOffset - toolbarRect.height - 8 + 'px'
					} );
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
				hoverOutline: createBlockOutline( true ),
				insert: createInsertToolbar(),
				insertMenu: createInsertMenu(),
				inline: createInlineToolbar(),
				navigation: createBlockNavigation(),
				blocks: createBlockToolbars()
			};

			editor.on( 'mouseover', function( event ) {
				var target = wp.blocks.getParentBlock( event.target );

				if ( target !== hoverTarget ) {
					if ( ! target || isDragging || wp.blocks.getSelectedBlock() === hoverTarget ) {
						DOM.setStyles( UI.hoverOutline, {
							display: 'none'
						} );
					} else {
						var rect = target.getBoundingClientRect();

						DOM.setStyles( UI.hoverOutline, {
							display: 'block',
							position: 'absolute',
							left: rect.left + 'px',
							top: rect.top + window.pageYOffset + 'px',
							height: rect.height + 'px',
							width: rect.width + 'px'
						} );
					}

					hoverTarget = target;
				}
			} );

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
					if ( isAtRoot && ( node.parentNode !== editor.getBody() || node.nodeName !== 'P' ) ) {
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

				DOM.setStyles( UI.hoverOutline, {
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

				var $prevSelected = editor.$( '*[data-wp-block-selected]' );

				if ( selectedBlocks && $prevSelected[0] !== selectedBlocks[0] ) {
					if ( $prevSelected.length ) {
						var prevSettings = wp.blocks.getBlockSettingsByElement( $prevSelected[0] );

						if ( prevSettings ) {
							if ( prevSettings.onDeselect ) {
								prevSettings.onDeselect( $prevSelected[0] );
							}

							$prevSelected.attr( 'data-wp-block-selected', null );

							window.console.log( 'Deselected: ' + prevSettings._id );
						}
					}

					if ( selectedBlocks.length === 1 ) {
						if ( settings.onSelect ) {
							settings.onSelect( selectedBlocks[0] );
						}

						editor.$( selectedBlocks[0] ).attr( 'data-wp-block-selected', 'true' );

						window.console.log( 'Selected: ' + settings._id );
					}
				}

				if ( selectedBlocks.length === 1 ) {
					UI.blocks[ settings._id ].reposition();
					focus && focusToolbar( UI.blocks[ settings._id ] );

					UI.inline.hide();

					if ( settings.editable && settings.editable.length ) {
						var selection = window.getSelection();
						var editableRoot = getEditableRoot( selection.anchorNode );

						settings.editable.forEach( function( selector ) {
							if ( selector ) {
								if ( editor.$( editableRoot ).is( selector ) ) {
									UI.inline.reposition( editableRoot );
									return;
								}
							} else {
								UI.inline.reposition();
							}
						} );
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

			editor.on( 'keydown', function( event ) {
				if ( tinymce.util.VK.metaKeyPressed( event ) ) {
					return;
				}

				hidden = true;
				insert = false;
			} );

			editor.on( 'mousedown touchstart setSelectionRange', function( event ) {
				// Show UI on setSelectionRange for non editable blocks.
				if ( event.range ) {
					if ( editor.selection.getNode().isContentEditable ) {
						return;
					}
				}

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

				setFields();

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

			function getEditableRoot( node ) {
				var rootNode = editor.getBody();

				while ( node && node !== rootNode ) {
					if ( node.contentEditable === 'true' ) {
						return node;
					}

					node = node.parentNode;
				}

				return null;
			}

			editor.on( 'keydown', function( event ) {
				var keyCode = event.keyCode;
				var VK = tinymce.util.VK;

				if ( keyCode === VK.BACKSPACE ) {
					var rng = editor.selection.getRng();
					var startNode = editor.selection.getStart();
					var endNode = editor.selection.getEnd();
					var editableRoot = getEditableRoot( editor.selection.getNode() );

					if ( editableRoot ) {
						if ( editor.dom.isEmpty( editableRoot ) ) {
							event.preventDefault();
						}
					}

					// Handle tripple click
					// Some browsers select start of the next block.
					if (
						// It's a selection.
						! rng.isCollapsed &&
						// Cursor is at start of node.
						rng.startOffset === 0 &&
						// Cursor is at start of parent.
						( startNode === rng.startContainer || startNode.firstChild === rng.startContainer ) &&
						// Cursor is at end of parent.
						(
							endNode === rng.endContainer ||
							( startNode.lastChild === rng.startContainer && rng.endOffset === rng.startContainer.data.length ) ||
							( editor.dom.isBlock( rng.endContainer ) && rng.endOffset === 0 )
						)
					) {
						editor.undoManager.transact( function() {
							startNode.innerHTML = '<br>';
							editor.selection.setCursorLocation( startNode, 0 );
						} );

						console.log('adjust');

						event.preventDefault();
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
				if ( event.keyCode === tinymce.util.VK.BACKSPACE ) {
					var block = getSelectedBlock();

					if ( block.contentEditable === 'false' && editor.dom.isEmpty( block ) ) {
						var p = editor.$( '<p><br></p>' );

						editor.$( block ).before( p );
						editor.selection.setCursorLocation( p[0], 0 );
						editor.$( block ).remove();
					}
				}
			} );

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
		} );
	} );
} )( window.tinymce, window.wp, window._ );
