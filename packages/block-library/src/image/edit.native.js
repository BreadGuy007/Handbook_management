/**
 * External dependencies
 */
import React from 'react';
import { View, TextInput, ImageBackground, Text, TouchableWithoutFeedback } from 'react-native';
import {
	requestMediaImport,
	mediaUploadSync,
	requestImageFailedRetryDialog,
	requestImageUploadCancelDialog,
} from 'react-native-gutenberg-bridge';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	Toolbar,
	ToolbarButton,
	Dashicon,
} from '@wordpress/components';
import {
	MediaPlaceholder,
	MediaUpload,
	MEDIA_TYPE_IMAGE,
	RichText,
	BlockControls,
	InspectorControls,
	BottomSheet,
} from '@wordpress/block-editor';
import { __, sprintf } from '@wordpress/i18n';
import { isURL } from '@wordpress/url';
import { doAction, hasAction } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import styles from './styles.scss';
import MediaUploadProgress from './media-upload-progress';

const LINK_DESTINATION_CUSTOM = 'custom';
const LINK_DESTINATION_NONE = 'none';

class ImageEdit extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			showSettings: false,
		};

		this.finishMediaUploadWithSuccess = this.finishMediaUploadWithSuccess.bind( this );
		this.finishMediaUploadWithFailure = this.finishMediaUploadWithFailure.bind( this );
		this.mediaUploadStateReset = this.mediaUploadStateReset.bind( this );
		this.onSelectMediaUploadOption = this.onSelectMediaUploadOption.bind( this );
		this.updateMediaProgress = this.updateMediaProgress.bind( this );
		this.updateAlt = this.updateAlt.bind( this );
		this.updateImageURL = this.updateImageURL.bind( this );
		this.onSetLinkDestination = this.onSetLinkDestination.bind( this );
		this.onImagePressed = this.onImagePressed.bind( this );
		this.onClearSettings = this.onClearSettings.bind( this );
	}

	componentDidMount() {
		const { attributes, setAttributes } = this.props;

		if ( attributes.id && attributes.url && ! isURL( attributes.url ) ) {
			if ( attributes.url.indexOf( 'file:' ) === 0 ) {
				requestMediaImport( attributes.url, ( mediaId, mediaUri ) => {
					if ( mediaUri ) {
						setAttributes( { url: mediaUri, id: mediaId } );
					}
				} );
			}
			mediaUploadSync();
		}
	}

	componentWillUnmount() {
		// this action will only exist if the user pressed the trash button on the block holder
		if ( hasAction( 'blocks.onRemoveBlockCheckUpload' ) && this.state.isUploadInProgress ) {
			doAction( 'blocks.onRemoveBlockCheckUpload', this.props.attributes.id );
		}
	}

	onImagePressed() {
		const { attributes } = this.props;

		if ( this.state.isUploadInProgress ) {
			requestImageUploadCancelDialog( attributes.id );
		} else if ( attributes.id && ! isURL( attributes.url ) ) {
			requestImageFailedRetryDialog( attributes.id );
		}
	}

	updateMediaProgress( payload ) {
		const { setAttributes } = this.props;
		if ( payload.mediaUrl ) {
			setAttributes( { url: payload.mediaUrl } );
		}

		if ( ! this.state.isUploadInProgress ) {
			this.setState( { isUploadInProgress: true } );
		}
	}

	finishMediaUploadWithSuccess( payload ) {
		const { setAttributes } = this.props;

		setAttributes( { url: payload.mediaUrl, id: payload.mediaServerId } );
		this.setState( { isUploadInProgress: false } );
	}

	finishMediaUploadWithFailure( payload ) {
		const { setAttributes } = this.props;

		setAttributes( { id: payload.mediaId } );
		this.setState( { isUploadInProgress: false } );
	}

	mediaUploadStateReset() {
		const { setAttributes } = this.props;

		setAttributes( { id: null, url: null } );
		this.setState( { isUploadInProgress: false } );
	}

	updateAlt( newAlt ) {
		this.props.setAttributes( { alt: newAlt } );
	}

	updateImageURL( url ) {
		this.props.setAttributes( { url, width: undefined, height: undefined } );
	}

	onSetLinkDestination( href ) {
		this.props.setAttributes( {
			linkDestination: LINK_DESTINATION_CUSTOM,
			href,
		} );
	}

	onClearSettings() {
		this.props.setAttributes( {
			alt: '',
			linkDestination: LINK_DESTINATION_NONE,
			href: undefined,
		} );
	}

	onSelectMediaUploadOption( mediaId, mediaUrl ) {
		const { setAttributes } = this.props;
		setAttributes( { url: mediaUrl, id: mediaId } );
	}

	render() {
		const { attributes, isSelected, setAttributes } = this.props;
		const { url, caption, height, width, alt, href, id } = attributes;

		const onImageSettingsButtonPressed = () => {
			this.setState( { showSettings: true } );
		};

		const onImageSettingsClose = () => {
			this.setState( { showSettings: false } );
		};

		const toolbarEditButton = (
			<MediaUpload mediaType={ MEDIA_TYPE_IMAGE }
				onSelectURL={ this.onSelectMediaUploadOption }
				render={ ( { open, getMediaOptions } ) => {
					return (
						<Toolbar>
							{ getMediaOptions() }
							<ToolbarButton
								title={ __( 'Edit image' ) }
								icon="edit"
								onClick={ open }
							/>
						</Toolbar>
					);
				} } >
			</MediaUpload>
		);

		const getInspectorControls = () => (
			<BottomSheet
				isVisible={ this.state.showSettings }
				onClose={ onImageSettingsClose }
				hideHeader
			>
				<BottomSheet.Cell
					icon={ 'admin-links' }
					label={ __( 'Link To' ) }
					value={ href || '' }
					valuePlaceholder={ __( 'Add URL' ) }
					onChangeValue={ this.onSetLinkDestination }
					autoCapitalize="none"
					autoCorrect={ false }
				/>
				<BottomSheet.Cell
					icon={ 'editor-textcolor' }
					label={ __( 'Alt Text' ) }
					value={ alt || '' }
					valuePlaceholder={ __( 'None' ) }
					separatorType={ 'fullWidth' }
					onChangeValue={ this.updateAlt }
				/>
				<BottomSheet.Cell
					label={ __( 'Clear All Settings' ) }
					labelStyle={ styles.clearSettingsButton }
					separatorType={ 'none' }
					onPress={ this.onClearSettings }
				/>
			</BottomSheet>
		);

		if ( ! url ) {
			return (
				<View style={ { flex: 1 } } >
					<MediaPlaceholder
						mediaType={ MEDIA_TYPE_IMAGE }
						onSelectURL={ this.onSelectMediaUploadOption }
					/>
				</View>
			);
		}

		return (
			<TouchableWithoutFeedback
				accessible={ ! isSelected }

				accessibilityLabel={ sprintf(
					/* translators: accessibility text. 1: image alt text. 2: image caption. */
					__( 'Image block. %1$s. %2$s' ),
					alt,
					caption
				) }
				accessibilityRole={ 'button' }
				onPress={ this.onImagePressed }
				disabled={ ! isSelected }
			>
				<View style={ { flex: 1 } }>
					{ getInspectorControls() }
					<BlockControls>
						{ toolbarEditButton }
					</BlockControls>
					<InspectorControls>
						<ToolbarButton
							title={ __( 'Image Settings' ) }
							icon="admin-generic"
							onClick={ onImageSettingsButtonPressed }
						/>
					</InspectorControls>
					<MediaUploadProgress
						height={ height }
						width={ width }
						coverUrl={ url }
						mediaId={ id }
						onUpdateMediaProgress={ this.updateMediaProgress }
						onFinishMediaUploadWithSuccess={ this.finishMediaUploadWithSuccess }
						onFinishMediaUploadWithFailure={ this.finishMediaUploadWithFailure }
						onMediaUploadStateReset={ this.mediaUploadStateReset }
						renderContent={ ( { isUploadInProgress, isUploadFailed, finalWidth, finalHeight, imageWidthWithinContainer, retryIconName, retryMessage } ) => {
							const opacity = isUploadInProgress ? 0.3 : 1;
							return (
								<View style={ { flex: 1 } } >
									{ ! imageWidthWithinContainer && <View style={ styles.imageContainer } >
										<Dashicon icon={ 'format-image' } size={ 300 } />
									</View> }
									<ImageBackground
										style={ { width: finalWidth, height: finalHeight, opacity } }
										resizeMethod="scale"
										source={ { uri: url } }
										key={ url }
										accessible={ true }
										accessibilityLabel={ alt }
									>
										{ isUploadFailed &&
											<View style={ styles.imageContainer } >
												<Dashicon icon={ retryIconName } ariaPressed={ 'dashicon-active' } />
												<Text style={ styles.uploadFailedText }>{ retryMessage }</Text>
											</View>
										}
									</ImageBackground>
								</View>
							);
						} }
					/>
					{ ( ! RichText.isEmpty( caption ) > 0 || isSelected ) && (
						<View
							style={ { padding: 12, flex: 1 } }
							accessible={ true }
							accessibilityLabel={
								isEmpty( caption ) ?
									/* translators: accessibility text. Empty image caption. */
									__( 'Image caption. Empty' ) :
									sprintf(
										/* translators: accessibility text. %s: image caption. */
										__( 'Image caption. %s' ),
										caption
									)
							}
							accessibilityRole={ 'button' }
						>
							<TextInput
								style={ { textAlign: 'center' } }
								fontFamily={ this.props.fontFamily || ( styles[ 'caption-text' ].fontFamily ) }
								underlineColorAndroid="transparent"
								value={ caption }
								placeholder={ __( 'Write caption…' ) }
								onChangeText={ ( newCaption ) => setAttributes( { caption: newCaption } ) }
							/>
						</View>
					) }
				</View>
			</TouchableWithoutFeedback>
		);
	}
}

export default ImageEdit;
