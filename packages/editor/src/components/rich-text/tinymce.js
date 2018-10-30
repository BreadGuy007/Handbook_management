/**
 * External dependencies
 */
import tinymce from 'tinymce';
import { isEqual } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Component, createElement } from '@wordpress/element';
import { BACKSPACE, DELETE } from '@wordpress/keycodes';
import { toHTMLString } from '@wordpress/rich-text';
import { children } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { diffAriaProps, pickAriaProps } from './aria';

/**
 * Determines whether we need a fix to provide `input` events for contenteditable.
 *
 * @param {Element} editorNode The root editor node.
 *
 * @return {boolean} A boolean indicating whether the fix is needed.
 */
function needsInternetExplorerInputFix( editorNode ) {
	return (
		// Rely on userAgent in the absence of a reasonable feature test for contenteditable `input` events.
		/Trident/.test( window.navigator.userAgent ) &&
		// IE11 dispatches input events for `<input>` and `<textarea>`.
		! /input/i.test( editorNode.tagName ) &&
		! /textarea/i.test( editorNode.tagName )
	);
}

/**
 * Applies a fix that provides `input` events for contenteditable in Internet Explorer.
 *
 * @param {Element} editorNode The root editor node.
 *
 * @return {Function} A function to remove the fix (for cleanup).
 */
function applyInternetExplorerInputFix( editorNode ) {
	/**
	 * Dispatches `input` events in response to `textinput` events.
	 *
	 * IE provides a `textinput` event that is similar to an `input` event,
	 * and we use it to manually dispatch an `input` event.
	 * `textinput` is dispatched for text entry but for not deletions.
	 *
	 * @param {Event} textInputEvent An Internet Explorer `textinput` event.
	 */
	function mapTextInputEvent( textInputEvent ) {
		textInputEvent.stopImmediatePropagation();

		const inputEvent = document.createEvent( 'Event' );
		inputEvent.initEvent( 'input', true, false );
		inputEvent.data = textInputEvent.data;
		textInputEvent.target.dispatchEvent( inputEvent );
	}

	/**
	 * Dispatches `input` events in response to Delete and Backspace keyup.
	 *
	 * It would be better dispatch an `input` event after each deleting
	 * `keydown` because the DOM is updated after each, but it is challenging
	 * to determine the right time to dispatch `input` since propagation of
	 * `keydown` can be stopped at any point.
	 *
	 * It's easier to listen for `keyup` in the capture phase and dispatch
	 * `input` before `keyup` propagates further. It's not perfect, but should
	 * be good enough.
	 *
	 * @param {KeyboardEvent} keyUp
	 * @param {Node}          keyUp.target  The event target.
	 * @param {number}        keyUp.keyCode The key code.
	 */
	function mapDeletionKeyUpEvents( { target, keyCode } ) {
		const isDeletion = BACKSPACE === keyCode || DELETE === keyCode;

		if ( isDeletion && editorNode.contains( target ) ) {
			const inputEvent = document.createEvent( 'Event' );
			inputEvent.initEvent( 'input', true, false );
			inputEvent.data = null;
			target.dispatchEvent( inputEvent );
		}
	}

	editorNode.addEventListener( 'textinput', mapTextInputEvent );
	document.addEventListener( 'keyup', mapDeletionKeyUpEvents, true );
	return function removeInternetExplorerInputFix() {
		editorNode.removeEventListener( 'textinput', mapTextInputEvent );
		document.removeEventListener( 'keyup', mapDeletionKeyUpEvents, true );
	};
}

const IS_PLACEHOLDER_VISIBLE_ATTR_NAME = 'data-is-placeholder-visible';
export default class TinyMCE extends Component {
	constructor() {
		super();
		this.bindEditorNode = this.bindEditorNode.bind( this );
		this.onFocus = this.onFocus.bind( this );
	}

	onFocus() {
		this.initialize();
	}

	shouldComponentUpdate() {
		// We must prevent rerenders because TinyMCE will modify the DOM, thus
		// breaking React's ability to reconcile changes.
		//
		// See: https://github.com/facebook/react/issues/6802
		return false;
	}

	componentWillReceiveProps( nextProps ) {
		this.configureIsPlaceholderVisible( nextProps.isPlaceholderVisible );

		if ( ! isEqual( this.props.style, nextProps.style ) ) {
			this.editorNode.setAttribute( 'style', '' );
			Object.assign( this.editorNode.style, nextProps.style );
		}

		if ( ! isEqual( this.props.className, nextProps.className ) ) {
			this.editorNode.className = classnames( nextProps.className, 'editor-rich-text__tinymce' );
		}

		const { removedKeys, updatedKeys } = diffAriaProps( this.props, nextProps );
		removedKeys.forEach( ( key ) =>
			this.editorNode.removeAttribute( key ) );
		updatedKeys.forEach( ( key ) =>
			this.editorNode.setAttribute( key, nextProps[ key ] ) );
	}

	componentWillUnmount() {
		if ( ! this.editor ) {
			return;
		}

		this.editor.destroy();
		delete this.editor;
	}

	configureIsPlaceholderVisible( isPlaceholderVisible ) {
		const isPlaceholderVisibleString = String( !! isPlaceholderVisible );
		if ( this.editorNode.getAttribute( IS_PLACEHOLDER_VISIBLE_ATTR_NAME ) !== isPlaceholderVisibleString ) {
			this.editorNode.setAttribute( IS_PLACEHOLDER_VISIBLE_ATTR_NAME, isPlaceholderVisibleString );
		}
	}

	initialize() {
		const settings = this.props.getSettings( {
			theme: false,
			inline: true,
			toolbar: false,
			browser_spellcheck: true,
			entity_encoding: 'raw',
			convert_urls: false,
			// Disables TinyMCE's parsing to verify HTML. It makes
			// initialisation a bit faster. Since we're setting raw HTML
			// already with dangerouslySetInnerHTML, we don't need this to be
			// verified.
			verify_html: false,
			inline_boundaries_selector: 'a[href],code,b,i,strong,em,del,ins,sup,sub',
			plugins: [],
		} );

		tinymce.init( {
			...settings,
			target: this.editorNode,
			setup: ( editor ) => {
				this.editor = editor;
				this.props.onSetup( editor );

				// TinyMCE resets the element content on initialization, even
				// when it's already identical to what exists currently. This
				// behavior clobbers a selection which exists at the time of
				// initialization, thus breaking writing flow navigation. The
				// hack here neutralizes setHTML during initialization.
				let setHTML;

				editor.on( 'preinit', () => {
					setHTML = editor.dom.setHTML;
					editor.dom.setHTML = () => {};
				} );

				editor.on( 'init', () => {
					// See https://github.com/tinymce/tinymce/blob/master/src/core/main/ts/keyboard/FormatShortcuts.ts
					[ 'b', 'i', 'u' ].forEach( ( character ) => {
						editor.shortcuts.remove( `meta+${ character }` );
					} );
					[ 1, 2, 3, 4, 5, 6, 7, 8, 9 ].forEach( ( number ) => {
						editor.shortcuts.remove( `access+${ number }` );
					} );

					editor.dom.setHTML = setHTML;
				} );
			},
		} );
	}

	bindEditorNode( editorNode ) {
		this.editorNode = editorNode;

		if ( this.props.setRef ) {
			this.props.setRef( editorNode );
		}

		/**
		 * A ref function can be used for cleanup because React calls it with
		 * `null` when unmounting.
		 */
		if ( this.removeInternetExplorerInputFix ) {
			this.removeInternetExplorerInputFix();
			this.removeInternetExplorerInputFix = null;
		}

		if ( editorNode && needsInternetExplorerInputFix( editorNode ) ) {
			this.removeInternetExplorerInputFix = applyInternetExplorerInputFix( editorNode );
		}
	}

	render() {
		const ariaProps = pickAriaProps( this.props );
		const {
			tagName = 'div',
			style,
			defaultValue,
			className,
			isPlaceholderVisible,
			onPaste,
			onInput,
			multilineTag,
			multilineWrapperTags,
		} = this.props;

		/*
		 * The role=textbox and aria-multiline=true must always be used together
		 * as TinyMCE always behaves like a sort of textarea where text wraps in
		 * multiple lines. Only the table block editable element is excluded.
		 */
		if ( tagName !== 'table' ) {
			ariaProps.role = 'textbox';
			ariaProps[ 'aria-multiline' ] = true;
		}

		// If a default value is provided, render it into the DOM even before
		// TinyMCE finishes initializing. This avoids a short delay by allowing
		// us to show and focus the content before it's truly ready to edit.
		let initialHTML = defaultValue;

		// Guard for blocks passing `null` in onSplit callbacks. May be removed
		// if onSplit is revised to not pass a `null` value.
		if ( defaultValue === null ) {
			initialHTML = '';
		// Handle deprecated `children` and `node` sources.
		} else if ( Array.isArray( defaultValue ) ) {
			initialHTML = children.toHTML( defaultValue );
		} else if ( typeof defaultValue !== 'string' ) {
			initialHTML = toHTMLString( {
				value: defaultValue,
				multilineTag,
				multilineWrapperTags,
			} );
		}

		if ( initialHTML === '' ) {
			// Ensure the field is ready to receive focus by TinyMCE.
			initialHTML = '<br data-mce-bogus="1">';
		}

		return createElement( tagName, {
			...ariaProps,
			className: classnames( className, 'editor-rich-text__tinymce' ),
			contentEditable: true,
			[ IS_PLACEHOLDER_VISIBLE_ATTR_NAME ]: isPlaceholderVisible,
			ref: this.bindEditorNode,
			style,
			suppressContentEditableWarning: true,
			dangerouslySetInnerHTML: { __html: initialHTML },
			onPaste,
			onInput,
			onFocus: this.onFocus,
		} );
	}
}
