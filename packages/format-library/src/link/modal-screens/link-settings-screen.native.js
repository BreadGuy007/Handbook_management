/**
 * External dependencies
 */
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useContext, useEffect, useMemo } from '@wordpress/element';
import { prependHTTP } from '@wordpress/url';

import { BottomSheet, BottomSheetContext } from '@wordpress/components';
import {
	create,
	insert,
	isCollapsed,
	applyFormat,
	getTextContent,
	slice,
} from '@wordpress/rich-text';
import { external, textColor } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { createLinkFormat, isValidHref } from '../utils';
import linkSettingsScreens from './screens';

import styles from '../modal.scss';

const LinkSettingsScreen = ( {
	onRemove,
	onClose,
	onChange,
	speak,
	value,
	isActive,
	activeAttributes,
} ) => {
	const [ text, setText ] = useState( getTextContent( slice( value ) ) );
	const [ opensInNewWindow, setOpensInNewWindows ] = useState(
		activeAttributes.target === '_blank'
	);

	const {
		shouldEnableBottomSheetMaxHeight,
		onHandleClosingBottomSheet,
		listProps,
	} = useContext( BottomSheetContext );

	const navigation = useNavigation();
	const route = useRoute();
	const { inputValue = activeAttributes.url || '' } = route.params || {};
	const onLinkCellPressed = () => {
		shouldEnableBottomSheetMaxHeight( false );
		navigation.navigate( linkSettingsScreens.picker, { inputValue } );
	};
	useEffect( () => {
		onHandleClosingBottomSheet( () => {
			submit( inputValue );
		} );
	}, [ inputValue, opensInNewWindow, text ] );

	const submitLink = () => {
		const url = prependHTTP( inputValue );
		const linkText = text || inputValue;
		const format = createLinkFormat( {
			url,
			opensInNewWindow,
			text: linkText,
		} );
		let newAttributes;
		if ( isCollapsed( value ) && ! isActive ) {
			// insert link
			const toInsert = applyFormat(
				create( { text: linkText } ),
				format,
				0,
				linkText.length
			);
			newAttributes = insert( value, toInsert );
		} else if ( text !== getTextContent( slice( value ) ) ) {
			// edit text in selected link
			const toInsert = applyFormat(
				create( { text } ),
				format,
				0,
				text.length
			);
			newAttributes = insert( value, toInsert, value.start, value.end );
		} else {
			// transform selected text into link
			newAttributes = applyFormat( value, format );
		}
		//move selection to end of link
		newAttributes.start = newAttributes.end;
		newAttributes.activeFormats = [];
		onChange( { ...newAttributes, needsSelectionUpdate: true } );
		if ( ! isValidHref( url ) ) {
			speak(
				__(
					'Warning: the link has been inserted but may have errors. Please test it.'
				),
				'assertive'
			);
		} else if ( isActive ) {
			speak( __( 'Link edited.' ), 'assertive' );
		} else {
			speak( __( 'Link inserted' ), 'assertive' );
		}

		onClose();
	};

	const removeLink = () => {
		onRemove();
		onClose();
	};

	const submit = ( submitValue ) => {
		if ( submitValue === '' ) {
			removeLink();
		} else {
			submitLink();
		}
	};

	useEffect( () => {
		const unsubscribe = navigation.addListener( 'focus', () => {
			const { params = {} } = route;
			if ( ! text && params.text ) {
				setText( params.text );
			}
		} );
		return unsubscribe;
	}, [ navigation, route.params?.text, text ] );

	return useMemo( () => {
		return (
			<>
				<BottomSheet.LinkCell
					value={ inputValue }
					onPress={ onLinkCellPressed }
				/>
				<BottomSheet.Cell
					icon={ textColor }
					label={ __( 'Link text' ) }
					value={ text }
					placeholder={ __( 'Add link text' ) }
					onChangeValue={ setText }
					onSubmit={ submit }
				/>
				<BottomSheet.SwitchCell
					icon={ external }
					label={ __( 'Open in new tab' ) }
					value={ opensInNewWindow }
					onValueChange={ setOpensInNewWindows }
					separatorType={ 'fullWidth' }
				/>
				<BottomSheet.Cell
					label={ __( 'Remove link' ) }
					labelStyle={ styles.clearLinkButton }
					separatorType={ 'none' }
					onPress={ removeLink }
				/>
			</>
		);
	}, [ inputValue, text, opensInNewWindow, listProps.safeAreaBottomInset ] );
};

export default LinkSettingsScreen;
