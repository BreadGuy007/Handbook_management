/**
 * External dependencies
 */
import classnames from 'classnames';
import {
	defer,
	find,
	isNil,
	isEqual,
	omit,
} from 'lodash';
import memize from 'memize';

/**
 * WordPress dependencies
 */
import { Component, Fragment, RawHTML } from '@wordpress/element';
import {
	isHorizontalEdge,
	getRectangleFromRange,
	getScrollContainer,
} from '@wordpress/dom';
import { createBlobURL } from '@wordpress/blob';
import { BACKSPACE, DELETE, ENTER, rawShortcut } from '@wordpress/keycodes';
import { withDispatch, withSelect } from '@wordpress/data';
import { pasteHandler, children, getBlockTransforms, findTransform } from '@wordpress/blocks';
import { withInstanceId, withSafeTimeout, compose } from '@wordpress/compose';
import { isURL } from '@wordpress/url';
import {
	isEmpty,
	create,
	apply,
	applyFormat,
	split,
	toHTMLString,
	getTextContent,
	insert,
	insertLineSeparator,
	isEmptyLine,
	unstableToDom,
	getSelectionStart,
	getSelectionEnd,
	remove,
	isCollapsed,
	LINE_SEPARATOR,
	charAt,
} from '@wordpress/rich-text';
import { decodeEntities } from '@wordpress/html-entities';
import { withFilters } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Autocomplete from '../autocomplete';
import BlockFormatControls from '../block-format-controls';
import FormatEdit from './format-edit';
import FormatToolbar from './format-toolbar';
import TinyMCE, { TINYMCE_ZWSP } from './tinymce';
import { pickAriaProps } from './aria';
import { getPatterns } from './patterns';
import { withBlockEditContext } from '../block-edit/context';

/**
 * Browser dependencies
 */

const { getSelection } = window;

export class RichText extends Component {
	constructor( { value, onReplace, multiline } ) {
		super( ...arguments );

		if ( multiline === true || multiline === 'p' || multiline === 'li' ) {
			this.multilineTag = multiline === true ? 'p' : multiline;
		}

		if ( this.multilineTag === 'li' ) {
			this.multilineWrapperTags = [ 'ul', 'ol' ];
		}

		this.onInit = this.onInit.bind( this );
		this.getSettings = this.getSettings.bind( this );
		this.onSetup = this.onSetup.bind( this );
		this.onFocus = this.onFocus.bind( this );
		this.onChange = this.onChange.bind( this );
		this.onNodeChange = this.onNodeChange.bind( this );
		this.onDeleteKeyDown = this.onDeleteKeyDown.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.onKeyUp = this.onKeyUp.bind( this );
		this.onPropagateUndo = this.onPropagateUndo.bind( this );
		this.onPaste = this.onPaste.bind( this );
		this.onCreateUndoLevel = this.onCreateUndoLevel.bind( this );
		this.setFocusedElement = this.setFocusedElement.bind( this );
		this.onInput = this.onInput.bind( this );
		this.onSelectionChange = this.onSelectionChange.bind( this );
		this.getRecord = this.getRecord.bind( this );
		this.createRecord = this.createRecord.bind( this );
		this.applyRecord = this.applyRecord.bind( this );
		this.isEmpty = this.isEmpty.bind( this );
		this.valueToFormat = this.valueToFormat.bind( this );
		this.setRef = this.setRef.bind( this );
		this.isActive = this.isActive.bind( this );

		this.formatToValue = memize( this.formatToValue.bind( this ), { size: 1 } );

		this.savedContent = value;
		this.patterns = getPatterns( {
			onReplace,
			multilineTag: this.multilineTag,
			valueToFormat: this.valueToFormat,
		} );
		this.enterPatterns = getBlockTransforms( 'from' ).filter( ( { type, trigger } ) =>
			type === 'pattern' && trigger === 'enter'
		);

		this.state = {};

		this.usedDeprecatedChildrenSource = Array.isArray( value );
	}

	componentDidMount() {
		document.addEventListener( 'selectionchange', this.onSelectionChange );
	}

	componentWillUnmount() {
		document.removeEventListener( 'selectionchange', this.onSelectionChange );
	}

	setRef( node ) {
		this.editableRef = node;
	}

	isActive() {
		return this.editableRef === document.activeElement;
	}

	/**
	 * Retrieves the settings for this block.
	 *
	 * Allows passing in settings which will be overwritten.
	 *
	 * @param {Object} settings The settings to overwrite.
	 * @return {Object} The settings for this block.
	 */
	getSettings( settings ) {
		settings = {
			...settings,
			forced_root_block: this.multilineTag || false,
			// Allow TinyMCE to keep one undo level for comparing changes.
			// Prevent it otherwise from accumulating any history.
			custom_undo_redo_levels: 1,
		};

		const { unstableGetSettings } = this.props;
		if ( unstableGetSettings ) {
			settings = unstableGetSettings( settings );
		}

		return settings;
	}

	/**
	 * Handles the onSetup event for the TinyMCE component.
	 *
	 * Will setup event handlers for the TinyMCE instance.
	 * An `onSetup` function in the props will be called if it is present.
	 *
	 * @param {tinymce} editor The editor instance as passed by TinyMCE.
	 */
	onSetup( editor ) {
		this.editor = editor;

		editor.on( 'init', this.onInit );
		editor.on( 'nodechange', this.onNodeChange );
		editor.on( 'BeforeExecCommand', this.onPropagateUndo );
		// The change event in TinyMCE fires every time an undo level is added.
		editor.on( 'change', this.onCreateUndoLevel );

		const { unstableOnSetup } = this.props;
		if ( unstableOnSetup ) {
			unstableOnSetup( editor );
		}
	}

	setFocusedElement() {
		if ( this.props.setFocusedElement ) {
			this.props.setFocusedElement( this.props.instanceId );
		}
	}

	onInit() {
		this.editor.shortcuts.add( rawShortcut.primary( 'z' ), '', 'Undo' );
		this.editor.shortcuts.add( rawShortcut.primaryShift( 'z' ), '', 'Redo' );

		// Remove TinyMCE Core shortcut for consistency with global editor
		// shortcuts. Also clashes with Mac browsers.
		this.editor.shortcuts.remove( 'meta+y', '', 'Redo' );
	}

	/**
	 * Handles an undo event from TinyMCE.
	 *
	 * @param {UndoEvent} event The undo event as triggered by TinyMCE.
	 */
	onPropagateUndo( event ) {
		const { onUndo, onRedo } = this.props;
		const { command } = event;

		if ( command === 'Undo' && onUndo ) {
			defer( onUndo );
			event.preventDefault();
		}

		if ( command === 'Redo' && onRedo ) {
			defer( onRedo );
			event.preventDefault();
		}
	}

	/**
	 * Get the current record (value and selection) from props and state.
	 *
	 * @return {Object} The current record (value and selection).
	 */
	getRecord() {
		const { formats, text } = this.formatToValue( this.props.value );
		const { start, end } = this.state;

		return { formats, text, start, end };
	}

	createRecord() {
		const range = getSelection().getRangeAt( 0 );

		return create( {
			element: this.editableRef,
			range,
			multilineTag: this.multilineTag,
			multilineWrapperTags: this.multilineWrapperTags,
			removeNode: ( node ) => node.getAttribute( 'data-mce-bogus' ) === 'all',
			unwrapNode: ( node ) => !! node.getAttribute( 'data-mce-bogus' ),
			removeAttribute: ( attribute ) => attribute.indexOf( 'data-mce-' ) === 0,
			filterString: ( string ) => string.replace( TINYMCE_ZWSP, '' ),
			prepareEditableTree: this.props.prepareEditableTree,
		} );
	}

	applyRecord( record ) {
		apply( {
			value: record,
			current: this.editableRef,
			multilineTag: this.multilineTag,
			multilineWrapperTags: this.multilineWrapperTags,
			createLinePadding( doc ) {
				const element = doc.createElement( 'br' );
				element.setAttribute( 'data-mce-bogus', '1' );
				return element;
			},
			prepareEditableTree: this.props.prepareEditableTree,
		} );
	}

	isEmpty() {
		return isEmpty( this.formatToValue( this.props.value ) );
	}

	/**
	 * Handles a paste event.
	 *
	 * Saves the pasted data as plain text in `pastedPlainText`.
	 *
	 * @param {PasteEvent} event The paste event.
	 */
	onPaste( event ) {
		const clipboardData = event.clipboardData;
		let { items, files } = clipboardData;

		// In Edge these properties can be null instead of undefined, so a more
		// rigorous test is required over using default values.
		items = isNil( items ) ? [] : items;
		files = isNil( files ) ? [] : files;

		const item = find( [ ...items, ...files ], ( { type } ) => /^image\/(?:jpe?g|png|gif)$/.test( type ) );
		let plainText = '';
		let html = '';

		// IE11 only supports `Text` as an argument for `getData` and will
		// otherwise throw an invalid argument error, so we try the standard
		// arguments first, then fallback to `Text` if they fail.
		try {
			plainText = clipboardData.getData( 'text/plain' );
			html = clipboardData.getData( 'text/html' );
		} catch ( error1 ) {
			try {
				html = clipboardData.getData( 'Text' );
			} catch ( error2 ) {
				// Some browsers like UC Browser paste plain text by default and
				// don't support clipboardData at all, so allow default
				// behaviour.
				return;
			}
		}

		event.preventDefault();

		// Allows us to ask for this information when we get a report.
		window.console.log( 'Received HTML:\n\n', html );
		window.console.log( 'Received plain text:\n\n', plainText );

		// Only process file if no HTML is present.
		// Note: a pasted file may have the URL as plain text.
		if ( item && ! html ) {
			const file = item.getAsFile ? item.getAsFile() : item;
			const content = pasteHandler( {
				HTML: `<img src="${ createBlobURL( file ) }">`,
				mode: 'BLOCKS',
				tagName: this.props.tagName,
			} );
			const shouldReplace = this.props.onReplace && this.isEmpty();

			// Allows us to ask for this information when we get a report.
			window.console.log( 'Received item:\n\n', file );

			if ( shouldReplace ) {
				// Necessary to allow the paste bin to be removed without errors.
				this.props.setTimeout( () => this.props.onReplace( content ) );
			} else if ( this.props.onSplit ) {
				// Necessary to get the right range.
				// Also done in the TinyMCE paste plugin.
				this.props.setTimeout( () => this.splitContent( content ) );
			}

			return;
		}

		// There is a selection, check if a URL is pasted.
		if ( ! this.editor.selection.isCollapsed() ) {
			const pastedText = ( html || plainText ).replace( /<[^>]+>/g, '' ).trim();

			// A URL was pasted, turn the selection into a link
			if ( isURL( pastedText ) ) {
				this.onChange( applyFormat( this.getRecord(), {
					type: 'a',
					attributes: {
						href: decodeEntities( pastedText ),
					},
				} ) );

				// Allows us to ask for this information when we get a report.
				window.console.log( 'Created link:\n\n', pastedText );

				return;
			}
		}

		const shouldReplace = this.props.onReplace && this.isEmpty();

		let mode = 'INLINE';

		if ( shouldReplace ) {
			mode = 'BLOCKS';
		} else if ( this.props.onSplit ) {
			mode = 'AUTO';
		}

		const content = pasteHandler( {
			HTML: html,
			plainText,
			mode,
			tagName: this.props.tagName,
			canUserUseUnfilteredHTML: this.props.canUserUseUnfilteredHTML,
		} );

		if ( typeof content === 'string' ) {
			const recordToInsert = create( { html: content } );
			this.onChange( insert( this.getRecord(), recordToInsert ) );
		} else if ( this.props.onSplit ) {
			if ( ! content.length ) {
				return;
			}

			if ( shouldReplace ) {
				this.props.onReplace( content );
			} else {
				this.splitContent( content, { paste: true } );
			}
		}
	}

	/**
	 * Handles a focus event on the contenteditable field, calling the
	 * `unstableOnFocus` prop callback if one is defined. The callback does not
	 * receive any arguments.
	 *
	 * This is marked as a private API and the `unstableOnFocus` prop is not
	 * documented, as the current requirements where it is used are subject to
	 * future refactoring following `isSelected` handling.
	 *
	 * In contrast with `setFocusedElement`, this is only triggered in response
	 * to focus within the contenteditable field, whereas `setFocusedElement`
	 * is triggered on focus within any `RichText` descendent element.
	 *
	 * @see setFocusedElement
	 *
	 * @private
	 */
	onFocus() {
		const { unstableOnFocus } = this.props;
		if ( unstableOnFocus ) {
			unstableOnFocus();
		}
	}

	/**
	 * Handle input on the next selection change event.
	 */
	onInput() {
		const record = this.createRecord();
		const transformed = this.patterns.reduce( ( accumlator, transform ) => transform( accumlator ), record );

		this.onChange( transformed );
	}

	/**
	 * Handles the `selectionchange` event: sync the selection to local state.
	 */
	onSelectionChange() {
		// Ensure it's the active element. This is a global event.
		if ( ! this.isActive() ) {
			return;
		}

		const { start, end, formats } = this.createRecord();

		if ( start !== this.state.start || end !== this.state.end ) {
			const isCaretWithinFormattedText = this.props.isCaretWithinFormattedText;
			if ( ! isCaretWithinFormattedText && formats[ start ] ) {
				this.props.onEnterFormattedText();
			} else if ( isCaretWithinFormattedText && ! formats[ start ] ) {
				this.props.onExitFormattedText();
			}

			this.setState( { start, end } );
		}
	}

	/**
	 * Sync the value to global state. The node tree and selection will also be
	 * updated if differences are found.
	 *
	 * @param {Object}  record        The record to sync and apply.
	 * @param {boolean} _withoutApply If true, the record won't be applied to
	 *                                the live DOM.
	 */
	onChange( record, _withoutApply ) {
		if ( ! _withoutApply ) {
			this.applyRecord( record );
		}

		const { start, end } = record;

		this.savedContent = this.valueToFormat( record );
		this.props.onChange( this.savedContent );
		this.setState( { start, end } );
	}

	onCreateUndoLevel( event ) {
		// TinyMCE fires a `change` event when the first letter in an instance
		// is typed. This should not create a history record in Gutenberg.
		// https://github.com/tinymce/tinymce/blob/4.7.11/src/core/main/ts/api/UndoManager.ts#L116-L125
		// In other cases TinyMCE won't fire a `change` with at least a previous
		// record present, so this is a reliable check.
		// https://github.com/tinymce/tinymce/blob/4.7.11/src/core/main/ts/api/UndoManager.ts#L272-L275
		if ( event && event.lastLevel === null ) {
			return;
		}

		// Always ensure the content is up-to-date. This is needed because e.g.
		// making something bold will trigger a TinyMCE change event but no
		// input event. Avoid dispatching an action if the original event is
		// blur because the content will already be up-to-date.
		if ( ! event || ! event.originalEvent || event.originalEvent.type !== 'blur' ) {
			this.onChange( this.createRecord(), true );
		}

		this.props.onCreateUndoLevel();
	}

	/**
	 * Handles a delete keyDown event to handle merge or removal for collapsed
	 * selection where caret is at directional edge: forward for a delete key,
	 * reverse for a backspace key.
	 *
	 * @link https://en.wikipedia.org/wiki/Caret_navigation
	 *
	 * @param {KeyboardEvent} event Keydown event.
	 */
	onDeleteKeyDown( event ) {
		const { onMerge, onRemove } = this.props;
		if ( ! onMerge && ! onRemove ) {
			return;
		}

		const { keyCode } = event;
		const isReverse = keyCode === BACKSPACE;

		// Only process delete if the key press occurs at uncollapsed edge.
		if ( ! isCollapsed( this.createRecord() ) ) {
			return;
		}

		const empty = this.isEmpty();

		// It is important to consider emptiness because an empty container
		// will include a bogus TinyMCE BR node _after_ the caret, so in a
		// forward deletion the isHorizontalEdge function will incorrectly
		// interpret the presence of the bogus node as not being at the edge.
		const isEdge = ( empty || isHorizontalEdge( this.editableRef, isReverse ) );

		if ( ! isEdge ) {
			return;
		}

		if ( onMerge ) {
			onMerge( ! isReverse );
		}

		// Only handle remove on Backspace. This serves dual-purpose of being
		// an intentional user interaction distinguishing between Backspace and
		// Delete to remove the empty field, but also to avoid merge & remove
		// causing destruction of two fields (merge, then removed merged).
		if ( onRemove && empty && isReverse ) {
			onRemove( ! isReverse );
		}

		event.preventDefault();
	}

	/**
	 * Handles a keydown event.
	 *
	 * @param {KeyboardEvent} event The keydown event.
	 */
	onKeyDown( event ) {
		const { keyCode } = event;

		if ( keyCode === DELETE || keyCode === BACKSPACE ) {
			const value = this.createRecord();
			const start = getSelectionStart( value );
			const end = getSelectionEnd( value );

			// Always handle uncollapsed selections ourselves.
			if ( ! isCollapsed( value ) ) {
				this.onChange( remove( value ) );
				event.preventDefault();
				return;
			}

			if ( this.multilineTag ) {
				let newValue;

				if ( keyCode === BACKSPACE ) {
					if ( charAt( value, start - 1 ) === LINE_SEPARATOR ) {
						newValue = remove(
							value,
							// Only remove the line if the selection is
							// collapsed.
							isCollapsed( value ) ? start - 1 : start,
							end
						);
					}
				} else if ( charAt( value, end ) === LINE_SEPARATOR ) {
					newValue = remove(
						value,
						start,
						// Only remove the line if the selection is collapsed.
						isCollapsed( value ) ? end + 1 : end,
					);
				}

				if ( newValue ) {
					this.onChange( newValue );
					event.preventDefault();
				}
			}

			this.onDeleteKeyDown( event );
		} else if ( keyCode === ENTER ) {
			event.preventDefault();

			const record = this.createRecord();

			if ( this.props.onReplace ) {
				const text = getTextContent( record );
				const transformation = findTransform( this.enterPatterns, ( item ) => {
					return item.regExp.test( text );
				} );

				if ( transformation ) {
					this.props.onReplace( [
						transformation.transform( { content: text } ),
					] );
					return;
				}
			}

			if ( this.multilineTag ) {
				if ( this.props.onSplit && isEmptyLine( record ) ) {
					this.props.onSplit( ...split( record ).map( this.valueToFormat ) );
				} else {
					this.onChange( insertLineSeparator( record ) );
				}
			} else if ( event.shiftKey || ! this.props.onSplit ) {
				const text = getTextContent( record );
				const length = text.length;
				let toInsert = '\n';

				// If the caret is at the end of the text, and there is no
				// trailing line break or no text at all, we have to insert two
				// line breaks in order to create a new line visually and place
				// the caret there.
				if ( record.end === length && (
					text.charAt( length - 1 ) !== '\n' || length === 0
				) ) {
					toInsert = '\n\n';
				}

				this.onChange( insert( record, toInsert ) );
			} else {
				this.splitContent();
			}
		}
	}

	/**
	 * Handles a keyup event.
	 *
	 * @param {number} $1.keyCode The key code that has been pressed on the
	 *                            keyboard.
	 */
	onKeyUp( { keyCode } ) {
		// The input event does not fire when the whole field is selected and
		// BACKSPACE is pressed.
		if ( keyCode === BACKSPACE ) {
			this.onChange( this.createRecord(), true );
		}

		// `scrollToRect` is called on `nodechange`, whereas calling it on
		// `keyup` *when* moving to a new RichText element results in incorrect
		// scrolling. Though the following allows false positives, it results
		// in much smoother scrolling.
		if ( this.props.isViewportSmall && keyCode !== BACKSPACE && keyCode !== ENTER ) {
			this.scrollToRect( getRectangleFromRange( this.editor.selection.getRng() ) );
		}
	}

	scrollToRect( rect ) {
		const { top: caretTop } = rect;
		const container = getScrollContainer( this.editableRef );

		if ( ! container ) {
			return;
		}

		// When scrolling, avoid positioning the caret at the very top of
		// the viewport, providing some "air" and some textual context for
		// the user, and avoiding toolbars.
		const graceOffset = 100;

		// Avoid pointless scrolling by establishing a threshold under
		// which scrolling should be skipped;
		const epsilon = 10;
		const delta = caretTop - graceOffset;

		if ( Math.abs( delta ) > epsilon ) {
			container.scrollTo(
				container.scrollLeft,
				container.scrollTop + delta,
			);
		}
	}

	/**
	 * Splits the content at the location of the selection.
	 *
	 * Replaces the content of the editor inside this element with the contents
	 * before the selection. Sends the elements after the selection to the `onSplit`
	 * handler.
	 *
	 * @param {Array}  blocks  The blocks to add after the split point.
	 * @param {Object} context The context for splitting.
	 */
	splitContent( blocks = [], context = {} ) {
		const { onSplit } = this.props;
		const record = this.createRecord();

		if ( ! onSplit ) {
			return;
		}

		let [ before, after ] = split( record );

		// In case split occurs at the trailing or leading edge of the field,
		// assume that the before/after values respectively reflect the current
		// value. This also provides an opportunity for the parent component to
		// determine whether the before/after value has changed using a trivial
		//  strict equality operation.
		if ( isEmpty( after ) ) {
			before = record;
		} else if ( isEmpty( before ) ) {
			after = record;
		}

		// If pasting and the split would result in no content other than the
		// pasted blocks, remove the before and after blocks.
		if ( context.paste ) {
			before = isEmpty( before ) ? null : before;
			after = isEmpty( after ) ? null : after;
		}

		if ( before ) {
			before = this.valueToFormat( before );
		}

		if ( after ) {
			after = this.valueToFormat( after );
		}

		onSplit( before, after, ...blocks );
	}

	onNodeChange( { parents } ) {
		if ( ! this.isActive() ) {
			return;
		}

		if ( this.props.isViewportSmall ) {
			let rect;
			const selectedAnchor = find( parents, ( node ) => node.tagName === 'A' );
			if ( selectedAnchor ) {
				// If we selected a link, position the Link UI below the link
				rect = selectedAnchor.getBoundingClientRect();
			} else {
				// Otherwise, position the Link UI below the cursor or text selection
				rect = getRectangleFromRange( this.editor.selection.getRng() );
			}

			// Originally called on `focusin`, that hook turned out to be
			// premature. On `nodechange` we can work with the finalized TinyMCE
			// instance and scroll to proper position.
			this.scrollToRect( rect );
		}
	}

	componentDidUpdate( prevProps ) {
		const { tagName, value, isSelected } = this.props;

		if (
			tagName === prevProps.tagName &&
			value !== prevProps.value &&
			value !== this.savedContent
		) {
			// Handle deprecated `children` and `node` sources.
			// The old way of passing a value with the `node` matcher required
			// the value to be mapped first, creating a new array each time, so
			// a shallow check wouldn't work. We need to check deep equality.
			// This is only executed for a deprecated API and will eventually be
			// removed.
			if ( Array.isArray( value ) && isEqual( value, this.savedContent ) ) {
				return;
			}

			const record = this.formatToValue( value );

			if ( isSelected ) {
				const prevRecord = this.formatToValue( prevProps.value );
				const length = getTextContent( prevRecord ).length;
				record.start = length;
				record.end = length;
			}

			this.applyRecord( record );
			this.savedContent = value;
		}

		// If blocks are merged, but the content remains the same, e.g. merging
		// an empty paragraph into another, then also set the selection to the
		// end.
		if ( isSelected && ! prevProps.isSelected && ! this.isActive() ) {
			const record = this.formatToValue( value );
			const prevRecord = this.formatToValue( prevProps.value );
			const length = getTextContent( prevRecord ).length;
			record.start = length;
			record.end = length;
			this.applyRecord( record );
		}

		// If any format props update, reapply value.
		const shouldReapply = Object.keys( this.props ).some( ( name ) => {
			if ( name.indexOf( 'format_' ) !== 0 ) {
				return false;
			}

			return Object.keys( this.props[ name ] ).some( ( subName ) => {
				return this.props[ name ][ subName ] !== prevProps[ name ][ subName ];
			} );
		} );

		if ( shouldReapply ) {
			const record = this.formatToValue( value );
			this.applyRecord( record );
		}
	}

	formatToValue( value ) {
		// Handle deprecated `children` and `node` sources.
		if ( Array.isArray( value ) ) {
			return create( {
				html: children.toHTML( value ),
				multilineTag: this.multilineTag,
				multilineWrapperTags: this.multilineWrapperTags,
			} );
		}

		if ( this.props.format === 'string' ) {
			return create( {
				html: value,
				multilineTag: this.multilineTag,
				multilineWrapperTags: this.multilineWrapperTags,
			} );
		}

		// Guard for blocks passing `null` in onSplit callbacks. May be removed
		// if onSplit is revised to not pass a `null` value.
		if ( value === null ) {
			return create();
		}

		return value;
	}

	valueToEditableHTML( value ) {
		return unstableToDom( {
			value,
			multilineTag: this.multilineTag,
			multilineWrapperTags: this.multilineWrapperTags,
			createLinePadding( doc ) {
				const element = doc.createElement( 'br' );
				element.setAttribute( 'data-mce-bogus', '1' );
				return element;
			},
			prepareEditableTree: this.props.prepareEditableTree,
		} ).body.innerHTML;
	}

	valueToFormat( value ) {
		// Handle deprecated `children` and `node` sources.
		if ( this.usedDeprecatedChildrenSource ) {
			return children.fromDOM( unstableToDom( {
				value,
				multilineTag: this.multilineTag,
				multilineWrapperTags: this.multilineWrapperTags,
			} ).body.childNodes );
		}

		if ( this.props.format === 'string' ) {
			return toHTMLString( {
				value,
				multilineTag: this.multilineTag,
				multilineWrapperTags: this.multilineWrapperTags,
			} );
		}

		return value;
	}

	render() {
		const {
			tagName: Tagname = 'div',
			style,
			wrapperClassName,
			className,
			inlineToolbar = false,
			formattingControls,
			placeholder,
			keepPlaceholderOnFocus = false,
			isSelected,
			autocompleters,
		} = this.props;

		const MultilineTag = this.multilineTag;
		const ariaProps = pickAriaProps( this.props );

		// Generating a key that includes `tagName` ensures that if the tag
		// changes, we unmount and destroy the previous TinyMCE element, then
		// mount and initialize a new child element in its place.
		const key = [ 'editor', Tagname ].join();
		const isPlaceholderVisible = placeholder && ( ! isSelected || keepPlaceholderOnFocus ) && this.isEmpty();
		const classes = classnames( wrapperClassName, 'editor-rich-text' );
		const record = this.getRecord();

		return (
			<div className={ classes }
				onFocus={ this.setFocusedElement }
			>
				{ isSelected && ! inlineToolbar && (
					<BlockFormatControls>
						<FormatToolbar controls={ formattingControls } />
					</BlockFormatControls>
				) }
				{ isSelected && inlineToolbar && (
					<div className="editor-rich-text__inline-toolbar">
						<FormatToolbar controls={ formattingControls } />
					</div>
				) }
				<Autocomplete
					onReplace={ this.props.onReplace }
					completers={ autocompleters }
					record={ record }
					onChange={ this.onChange }
				>
					{ ( { isExpanded, listBoxId, activeId } ) => (
						<Fragment>
							<TinyMCE
								tagName={ Tagname }
								getSettings={ this.getSettings }
								onSetup={ this.onSetup }
								style={ style }
								defaultValue={ this.valueToEditableHTML( record ) }
								isPlaceholderVisible={ isPlaceholderVisible }
								aria-label={ placeholder }
								aria-autocomplete="list"
								aria-expanded={ isExpanded }
								aria-owns={ listBoxId }
								aria-activedescendant={ activeId }
								{ ...ariaProps }
								className={ className }
								key={ key }
								onPaste={ this.onPaste }
								onInput={ this.onInput }
								onKeyDown={ this.onKeyDown }
								onKeyUp={ this.onKeyUp }
								onFocus={ this.onFocus }
								multilineTag={ this.multilineTag }
								multilineWrapperTags={ this.multilineWrapperTags }
								setRef={ this.setRef }
							/>
							{ isPlaceholderVisible &&
								<Tagname
									className={ classnames( 'editor-rich-text__tinymce', className ) }
									style={ style }
								>
									{ MultilineTag ? <MultilineTag>{ placeholder }</MultilineTag> : placeholder }
								</Tagname>
							}
							{ isSelected && <FormatEdit value={ record } onChange={ this.onChange } /> }
						</Fragment>
					) }
				</Autocomplete>
			</div>
		);
	}
}

RichText.defaultProps = {
	formattingControls: [ 'bold', 'italic', 'link', 'strikethrough' ],
	format: 'string',
	value: '',
};

const RichTextContainer = compose( [
	withInstanceId,
	withBlockEditContext( ( context, ownProps ) => {
		// When explicitly set as not selected, do nothing.
		if ( ownProps.isSelected === false ) {
			return {
				clientId: context.clientId,
			};
		}
		// When explicitly set as selected, use the value stored in the context instead.
		if ( ownProps.isSelected === true ) {
			return {
				isSelected: context.isSelected,
				clientId: context.clientId,
			};
		}

		// Ensures that only one RichText component can be focused.
		return {
			isSelected: context.isSelected && context.focusedElement === ownProps.instanceId,
			setFocusedElement: context.setFocusedElement,
			clientId: context.clientId,
		};
	} ),
	withSelect( ( select ) => {
		const { isViewportMatch } = select( 'core/viewport' );
		const { canUserUseUnfilteredHTML, isCaretWithinFormattedText } = select( 'core/editor' );

		return {
			isViewportSmall: isViewportMatch( '< small' ),
			canUserUseUnfilteredHTML: canUserUseUnfilteredHTML(),
			isCaretWithinFormattedText: isCaretWithinFormattedText(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			createUndoLevel,
			redo,
			undo,
			enterFormattedText,
			exitFormattedText,
		} = dispatch( 'core/editor' );

		return {
			onCreateUndoLevel: createUndoLevel,
			onRedo: redo,
			onUndo: undo,
			onEnterFormattedText: enterFormattedText,
			onExitFormattedText: exitFormattedText,
		};
	} ),
	withSafeTimeout,
	withFilters( 'experimentalRichText' ),
] )( RichText );

RichTextContainer.Content = ( { value, tagName: Tag, multiline, ...props } ) => {
	let html = value;
	let MultilineTag;

	if ( multiline === true || multiline === 'p' || multiline === 'li' ) {
		MultilineTag = multiline === true ? 'p' : multiline;
	}

	// Handle deprecated `children` and `node` sources.
	if ( Array.isArray( value ) ) {
		html = children.toHTML( value );
	}

	if ( ! html && MultilineTag ) {
		html = `<${ MultilineTag }></${ MultilineTag }>`;
	}

	const content = <RawHTML>{ html }</RawHTML>;

	if ( Tag ) {
		return <Tag { ...omit( props, [ 'format' ] ) }>{ content }</Tag>;
	}

	return content;
};

RichTextContainer.isEmpty = ( value = '' ) => {
	// Handle deprecated `children` and `node` sources.
	if ( Array.isArray( value ) ) {
		return ! value || value.length === 0;
	}

	return value.length === 0;
};

RichTextContainer.Content.defaultProps = {
	format: 'string',
	value: '',
};

export default RichTextContainer;
export { RichTextShortcut } from './shortcut';
export { RichTextToolbarButton } from './toolbar-button';
export { RichTextInserterItem } from './inserter-list-item';
