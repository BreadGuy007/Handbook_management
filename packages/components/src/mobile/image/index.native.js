/**
 * External dependencies
 */
import { Image, Text, TouchableWithoutFeedback, View } from 'react-native';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/components';
import { image as icon } from '@wordpress/icons';
import { usePreferredColorSchemeStyle } from '@wordpress/compose';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { MediaEdit } from '../media-edit';
import { getImageWithFocalPointStyles } from '../image-with-focalpoint';
import styles from './style.scss';
import SvgIconRetry from './icon-retry';
import SvgIconCustomize from './icon-customize';

const ICON_TYPE = {
	PLACEHOLDER: 'placeholder',
	RETRY: 'retry',
	UPLOAD: 'upload',
};

function editImageComponent( { open, mediaOptions } ) {
	return (
		<TouchableWithoutFeedback onPress={ open }>
			<View style={ styles.editContainer }>
				<View style={ styles.edit }>
					{ mediaOptions() }
					<Icon
						size={ 16 }
						icon={ SvgIconCustomize }
						{ ...styles.iconCustomise }
					/>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
}

const ImageComponent = ( {
	align,
	alt,
	isSelected,
	isUploadFailed,
	isUploadInProgress,
	onSelectMediaUploadOption,
	openMediaOptions,
	retryMessage,
	url,
	width: imageWidth,
	focalPoint,
} ) => {
	const [ imageData, setImageData ] = useState( null );
	const [ containerSize, setContainerSize ] = useState( null );

	useEffect( () => {
		if ( url ) {
			Image.getSize( url, ( imgWidth, imgHeight ) => {
				setImageData( {
					aspectRatio: imgWidth / imgHeight,
					width: imgWidth,
					height: imgHeight,
				} );
			} );
		}
	}, [ url ] );

	const onContainerLayout = ( event ) => {
		const { height, width } = event.nativeEvent.layout;

		if (
			width !== 0 &&
			height !== 0 &&
			( containerSize?.width !== width ||
				containerSize?.height !== height )
		) {
			setContainerSize( { width, height } );
		}
	};

	const getIcon = ( iconType ) => {
		let iconStyle;
		switch ( iconType ) {
			case ICON_TYPE.RETRY:
				return <Icon icon={ SvgIconRetry } { ...styles.iconRetry } />;
			case ICON_TYPE.PLACEHOLDER:
				iconStyle = iconPlaceholderStyles;
				break;
			case ICON_TYPE.UPLOAD:
				iconStyle = iconUploadStyles;
				break;
		}
		return <Icon icon={ icon } { ...iconStyle } />;
	};

	const iconPlaceholderStyles = usePreferredColorSchemeStyle(
		styles.iconPlaceholder,
		styles.iconPlaceholderDark
	);

	const iconUploadStyles = usePreferredColorSchemeStyle(
		styles.iconUpload,
		styles.iconUploadDark
	);

	const placeholderStyles = usePreferredColorSchemeStyle(
		styles.imageContainerUpload,
		styles.imageContainerUploadDark
	);

	const customWidth =
		imageData?.width < containerSize?.width ? imageData?.width : '100%';

	const imageContainerStyles = [
		styles.imageContent,
		{
			width:
				imageData && imageWidth > 0 && imageWidth < containerSize?.width
					? imageWidth
					: customWidth,
		},
		focalPoint && styles.focalPointContainer,
	];

	const imageStyles = [
		{
			opacity: isUploadInProgress ? 0.3 : 1,
			height: containerSize?.height,
		},
		focalPoint && styles.focalPoint,
		focalPoint &&
			getImageWithFocalPointStyles(
				focalPoint,
				containerSize,
				imageData
			),
		! focalPoint &&
			imageData &&
			containerSize && {
				height:
					imageData?.width > containerSize?.width
						? containerSize?.width / imageData?.aspectRatio
						: undefined,
			},
	];

	return (
		<View
			style={ [
				styles.container,
				// only set alignItems if an image exists because alignItems causes the placeholder
				// to disappear when an aligned image can't be downloaded
				// https://github.com/wordpress-mobile/gutenberg-mobile/issues/1592
				imageData && align && { alignItems: align },
			] }
			onLayout={ onContainerLayout }
		>
			<View
				accessible
				disabled={ ! isSelected }
				accessibilityLabel={ alt }
				accessibilityHint={ __( 'Double tap and hold to edit' ) }
				accessibilityRole={ 'imagebutton' }
				key={ url }
				style={ imageContainerStyles }
			>
				{ isSelected && ! ( isUploadInProgress || isUploadFailed ) && (
					<View
						style={ [
							styles.imageBorder,
							{ height: containerSize?.height },
						] }
					/>
				) }

				{ ! imageData ? (
					<View style={ placeholderStyles }>
						<View style={ styles.imageUploadingIconContainer }>
							{ getIcon( ICON_TYPE.UPLOAD ) }
						</View>
					</View>
				) : (
					<View style={ focalPoint && styles.focalPointContent }>
						<Image
							aspectRatio={ imageData?.aspectRatio }
							style={ imageStyles }
							source={ { uri: url } }
							{ ...( ! focalPoint && { resizeMethod: 'scale' } ) }
						/>
					</View>
				) }

				{ isUploadFailed && (
					<View
						style={ [
							styles.imageContainer,
							styles.retryContainer,
						] }
					>
						<View style={ styles.modalIcon }>
							{ getIcon( ICON_TYPE.RETRY ) }
						</View>
						<Text style={ styles.uploadFailedText }>
							{ retryMessage }
						</Text>
					</View>
				) }
				{ isSelected &&
					! isUploadInProgress &&
					! isUploadFailed &&
					( imageData || focalPoint ) && (
						<MediaEdit
							onSelect={ onSelectMediaUploadOption }
							source={ { uri: url } }
							openReplaceMediaOptions={ openMediaOptions }
							render={ editImageComponent }
						/>
					) }
			</View>
		</View>
	);
};

export default ImageComponent;
