/**
 * External dependencies
 */
import React from 'react';
import { Switch, Platform } from 'react-native';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { BottomSheet } from '@wordpress/editor';
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

import styles from './modal.scss';

class ModalLinkUI extends Component {
	constructor() {
		super( ...arguments );

		this.submitLink = this.submitLink.bind( this );
		this.onChangeInputValue = this.onChangeInputValue.bind( this );
		this.onChangeText = this.onChangeText.bind( this );
		this.onChangeOpensInNewWindow = this.onChangeOpensInNewWindow.bind( this );
		this.removeLink = this.removeLink.bind( this );

		this.state = {
			inputValue: '',
			text: '',
			opensInNewWindow: false,
		};
	}

	componentDidUpdate( oldProps ) {
		if ( oldProps === this.props ) {
			return;
		}

		this.setState( {
			inputValue: this.props.activeAttributes.url || '',
			text: getTextContent( slice( this.props.value ) ),
			opensInNewWindow: false,
		} );
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
			const toInsert = applyFormat( create( { text: linkText } ), [ ...placeholderFormats, format ], 0, linkText.length );
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
			<BottomSheet
				isVisible={ isVisible }
				onClose={ this.submitLink }
				hideHeader
			>
				{ /* eslint-disable jsx-a11y/no-autofocus */
					<BottomSheet.Cell
						icon={ 'admin-links' }
						label={ __( 'URL' ) }
						value={ this.state.inputValue }
						placeholder={ __( 'Add URL' ) }
						autoCapitalize="none"
						autoCorrect={ false }
						textContentType="URL"
						onChangeValue={ this.onChangeInputValue }
						autoFocus={ Platform.OS === 'ios' }
					/>
				/* eslint-enable jsx-a11y/no-autofocus */ }
				<BottomSheet.Cell
					icon={ 'editor-textcolor' }
					label={ __( 'Link Text' ) }
					value={ this.state.text }
					placeholder={ __( 'Add Link Text' ) }
					onChangeValue={ this.onChangeText }
				/>
				<BottomSheet.Cell
					icon={ 'external' }
					label={ __( 'Open in New Tab' ) }
					value={ '' }
				>
					<Switch
						value={ this.state.opensInNewWindow }
						onValueChange={ this.onChangeOpensInNewWindow }
					/>
				</BottomSheet.Cell>
				<BottomSheet.Cell
					label={ __( 'Remove Link' ) }
					labelStyle={ styles.clearLinkButton }
					separatorType={ 'none' }
					onPress={ this.removeLink }
				/>
			</BottomSheet>
		);
	}
}

export default withSpokenMessages( ModalLinkUI );
