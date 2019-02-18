/**
 * External dependencies
 */
import React from 'react';
import { Switch, Text, TextInput, View } from 'react-native';
import Modal from 'react-native-modal';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { URLInput } from '@wordpress/editor';
import { prependHTTP } from '@wordpress/url';
import {
	withSpokenMessages,
} from '@wordpress/components';
import {
	create,
	insert,
	isCollapsed,
	applyFormat,
	getTextContent,
	slice,
} from '@wordpress/rich-text';

/**
 * Internal dependencies
 */
import { createLinkFormat, isValidHref } from './utils';
import Button from './button';

import styles from './modal.scss';

class ModalLinkUI extends Component {
	constructor( props ) {
		super( ...arguments );

		this.submitLink = this.submitLink.bind( this );
		this.onChangeInputValue = this.onChangeInputValue.bind( this );
		this.onChangeText = this.onChangeText.bind( this );
		this.onChangeOpensInNewWindow = this.onChangeOpensInNewWindow.bind( this );
		this.removeLink = this.removeLink.bind( this );

		this.state = {
			inputValue: props.activeAttributes.url || '',
			text: getTextContent( slice( props.value ) ),
			opensInNewWindow: false,
		};
	}

	onChangeInputValue( inputValue ) {
		this.setState( { inputValue } );
	}

	onChangeText( text ) {
		this.setState( { text } );
	}

	onChangeOpensInNewWindow( opensInNewWindow ) {
		this.setState( { opensInNewWindow } );
	}

	submitLink() {
		const { isActive, onChange, speak, value } = this.props;
		const { inputValue, opensInNewWindow, text } = this.state;
		const url = prependHTTP( inputValue );
		const linkText = text || inputValue;
		const format = createLinkFormat( {
			url,
			opensInNewWindow,
			text: linkText,
		} );
		const placeholderFormats = ( value.formatPlaceholder && value.formatPlaceholder.formats ) || [];

		if ( isCollapsed( value ) && ! isActive ) { // insert link
			const toInsert = applyFormat( create( { text: linkText } ), [ ...placeholderFormats, format ], 0, text.length );
			onChange( insert( value, toInsert ) );
		} else if ( text !== getTextContent( slice( value ) ) ) { // edit text in selected link
			const toInsert = applyFormat( create( { text } ), [ ...placeholderFormats, format ], 0, text.length );
			onChange( insert( value, toInsert, value.start, value.end ) );
		} else { // transform selected text into link
			onChange( applyFormat( value, [ ...placeholderFormats, format ] ) );
		}

		if ( ! isValidHref( url ) ) {
			speak( __( 'Warning: the link has been inserted but may have errors. Please test it.' ), 'assertive' );
		} else if ( isActive ) {
			speak( __( 'Link edited.' ), 'assertive' );
		} else {
			speak( __( 'Link inserted' ), 'assertive' );
		}

		this.props.onClose();
	}

	removeLink() {
		this.props.onRemove();
		this.props.onClose();
	}

	render() {
		const { isVisible } = this.props;

		return (
			<Modal
				isVisible={ isVisible }
				style={ styles.bottomModal }
				animationInTiming={ 500 }
				animationOutTiming={ 500 }
				backdropTransitionInTiming={ 500 }
				backdropTransitionOutTiming={ 500 }
				onBackdropPress={ this.props.onClose }
				onSwipe={ this.props.onClose }
				swipeDirection="down"
				avoidKeyboard={ true }
			>
				<View style={ { ...styles.content, borderColor: 'rgba(0, 0, 0, 0.1)' } }>
					<View style={ styles.dragIndicator } />
					<View style={ styles.head }>
						<Button onClick={ this.removeLink }>
							<Text style={ { ...styles.buttonText, color: 'red' } }>
								{ __( 'Remove' ) }
							</Text>
						</Button>
						<Text style={ styles.title }>
							{ __( 'Link Settings' ) }
						</Text>
						<Button onClick={ this.submitLink }>
							<Text style={ { ...styles.buttonText, color: '#0087be' } } >
								{ __( 'Done' ) }
							</Text>
						</Button>
					</View>
					<View style={ styles.separator } />
					<View style={ styles.inlineInput }>
						<Text style={ styles.inlineInputLabel }>
							{ __( 'URL' ) }
						</Text>
						<URLInput
							style={ styles.inlineInputValue }
							value={ this.state.inputValue }
							onChange={ this.onChangeInputValue }
						/>
					</View>
					<View style={ styles.separator } />
					<View style={ styles.inlineInput }>
						<Text style={ styles.inlineInputLabel }>
							{ __( 'Link Text' ) }
						</Text>
						<TextInput
							style={ styles.inlineInputValue }
							value={ this.state.text }
							onChangeText={ this.onChangeText }
						/>
					</View>
					<View style={ styles.separator } />
					<View style={ styles.inlineInput }>
						<Text style={ styles.inlineInputLabel }>
							{ __( 'Open in a new window' ) }
						</Text>
						<View style={ { ...styles.inlineInputValue, ...styles.inlineInputValueSwitch, alignItems: 'flex-end' } }>
							<Switch
								value={ this.state.opensInNewWindow }
								onValueChange={ this.onChangeOpensInNewWindow }
							/>
						</View>
					</View>
				</View>
			</Modal>
		);
	}
}

export default withSpokenMessages( ModalLinkUI );
