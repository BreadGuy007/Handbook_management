/**
 * External dependencies
 */
import RCTAztecView from 'react-native-aztec';
import { View } from 'react-native';
import {
	forEach,
	merge,
} from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, RawHTML, renderToString } from '@wordpress/element';
import { withInstanceId, compose } from '@wordpress/compose';
import { children } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import FormatToolbar from './format-toolbar';
import { FORMATTING_CONTROLS } from './formatting-controls';

export function getFormatValue( formatName ) {
	if ( 'link' === formatName ) {
		//TODO: Implement link command
	}
	return { isActive: true };
}

export class RichText extends Component {
	constructor() {
		super( ...arguments );
		this.onChange = this.onChange.bind( this );
		this.onContentSizeChange = this.onContentSizeChange.bind( this );
		this.changeFormats = this.changeFormats.bind( this );
		this.onActiveFormatsChange = this.onActiveFormatsChange.bind( this );
		this.state = {
			formats: {},
			selectedNodeId: 0,
		};

		this.lastEventCount = 0;
	}

	onActiveFormatsChange( formats ) {
		// force re-render the component skipping shouldComponentUpdate() See: https://reactjs.org/docs/react-component.html#forceupdate
		// This is needed because our shouldComponentUpdate impl. doesn't take in consideration props yet.
		this.forceUpdate();
		const newFormats = formats.reduce( ( accFormats, activeFormat ) => {
			accFormats[ activeFormat ] = getFormatValue( activeFormat );
			return accFormats;
		}, {} );

		this.setState( {
			formats: merge( {}, newFormats ),
			selectedNodeId: this.state.selectedNodeId + 1,
		} );
	}
	/**
	 * Handles any case where the content of the AztecRN instance has changed.
	 */

	onChange( event ) {
		if ( !! this.currentTimer ) {
			clearTimeout( this.currentTimer );
		}
		this.lastEventCount = event.nativeEvent.eventCount;
		// The following method just cleans up any <p> tags produced by aztec and replaces them with a br tag
		// This should be removed on a later version when aztec doesn't return the top tag of the text being edited
		const openingTagRegexp = RegExp( '^<' + this.props.tagName + '>', 'gim' );
		const closingTagRegexp = RegExp( '</' + this.props.tagName + '>$', 'gim' );
		const contentWithoutRootTag = event.nativeEvent.text.replace( openingTagRegexp, '' ).replace( closingTagRegexp, '' );
		this.lastContent = contentWithoutRootTag;

		this.currentTimer = setTimeout( function() {
			this.props.onChange( {
				content: this.lastContent,
				eventCount: this.lastEventCount,
			} );
		}.bind( this ), 1000 );
	}

	/**
	 * Handles any case where the content of the AztecRN instance has changed in size
	 */

	onContentSizeChange( contentSize ) {
		const contentHeight = contentSize.height;
		this.forceUpdate(); // force re-render the component skipping shouldComponentUpdate() See: https://reactjs.org/docs/react-component.html#forceupdate
		this.props.onContentSizeChange( {
			aztecHeight: contentHeight,
		}
		);
	}

	shouldComponentUpdate( nextProps ) {
		// The check below allows us to avoid updating the content right after an `onChange` call
		if ( nextProps.content.contentTree &&
			nextProps.content.eventCount &&
			this.lastContent && // first time the component is drawn with empty content `lastContent` is undefined
			this.lastEventCount &&
			nextProps.content.contentTree.eventCount !== this.lastEventCount ) {
			return false;
		}

		return true;
	}

	isFormatActive( format ) {
		return this.state.formats[ format ] && this.state.formats[ format ].isActive;
	}

	// eslint-disable-next-line no-unused-vars
	removeFormat( format ) {
		this._editor.applyFormat( format );
	}

	// eslint-disable-next-line no-unused-vars
	applyFormat( format, args, node ) {
		this._editor.applyFormat( format );
	}

	changeFormats( formats ) {
		const newStateFormats = {};
		forEach( formats, ( formatValue, format ) => {
			newStateFormats[ format ] = getFormatValue( format );
			const isActive = this.isFormatActive( format );
			if ( isActive && ! formatValue ) {
				this.removeFormat( format );
			} else if ( ! isActive && formatValue ) {
				this.applyFormat( format );
			}
		} );

		this.setState( ( state ) => ( {
			formats: merge( {}, state.formats, newStateFormats ),
		} ) );
	}

	render() {
		const {
			tagName,
			style,
			formattingControls,
			formatters,
		} = this.props;

		const formatToolbar = (
			<FormatToolbar
				formats={ this.state.formats }
				onChange={ this.changeFormats }
				enabledControls={ formattingControls }
				customControls={ formatters }
			/>
		);

		// Save back to HTML from React tree
		const html = '<' + tagName + '>' + renderToString( this.props.content.contentTree ) + '</' + tagName + '>';
		const eventCount = this.props.content.eventCount;

		return (
			<View>
				{ formatToolbar }
				<RCTAztecView
					ref={ ( ref ) => {
						this._editor = ref;
					}
					}
					text={ { text: html, eventCount: eventCount } }
					onChange={ this.onChange }
					onContentSizeChange={ this.onContentSizeChange }
					onActiveFormatsChange={ this.onActiveFormatsChange }
					color={ 'black' }
					maxImagesWidth={ 200 }
					style={ style }
				/>
			</View>
		);
	}
}

RichText.defaultProps = {
	formattingControls: FORMATTING_CONTROLS.map( ( { format } ) => format ),
	formatters: [],
	format: 'children',
};

const RichTextContainer = compose( [
	withInstanceId,
] )( RichText );

RichTextContainer.Content = ( { value, format, tagName: Tag, ...props } ) => {
	let content;
	switch ( format ) {
		case 'string':
			content = <RawHTML>{ value }</RawHTML>;
			break;

		case 'children':
			content = <RawHTML>{ children.toHTML( value ) }</RawHTML>;
			break;
	}

	if ( Tag ) {
		return <Tag { ...props }>{ content }</Tag>;
	}

	return content;
};

RichTextContainer.Content.defaultProps = {
	format: 'children',
};

export default RichTextContainer;
