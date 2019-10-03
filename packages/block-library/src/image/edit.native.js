/**
 * External dependencies
 */
import React from 'react';
import { View, ImageBackground, Text, TouchableWithoutFeedback, Dimensions } from 'react-native';
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
	TextControl,
	ToggleControl,
	Icon,
	Toolbar,
	ToolbarButton,
	PanelBody,
} from '@wordpress/components';

import {
	Caption,
	MediaPlaceholder,
	MediaUpload,
	MediaUploadProgress,
	MEDIA_TYPE_IMAGE,
	BlockControls,
	InspectorControls,
} from '@wordpress/block-editor';
import { __, sprintf } from '@wordpress/i18n';
import { isURL } from '@wordpress/url';
import { doAction, hasAction } from '@wordpress/hooks';
import { withPreferredColorScheme } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import styles from './styles.scss';
import SvgIcon from './icon';
import SvgIconRetry from './icon-retry';
import { getUpdatedLinkTargetSettings } from './utils';

import {
	LINK_DESTINATION_CUSTOM,
	LINK_DESTINATION_NONE,
} from './constants';

// Default Image ratio 4:3
const IMAGE_ASPECT_RATIO = 4 / 3;

export class ImageEdit extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			isCaptionSelected: false,
		};

		this.finishMediaUploadWithSuccess = this.finishMediaUploadWithSuccess.bind( this );
		this.finishMediaUploadWithFailure = this.finishMediaUploadWithFailure.bind( this );
		this.mediaUploadStateReset = this.mediaUploadStateReset.bind( this );
		this.onSelectMediaUploadOption = this.onSelectMediaUploadOption.bind( this );
		this.updateMediaProgress = this.updateMediaProgress.bind( this );
		this.updateAlt = this.updateAlt.bind( this );
		this.updateImageURL = this.updateImageURL.bind( this );
		this.onSetLinkDestination = this.onSetLinkDestination.bind( this );
		this.onSetNewTab = this.onSetNewTab.bind( this );
		this.onImagePressed = this.onImagePressed.bind( this );
		this.onClearSettings = this.onClearSettings.bind( this );
		this.onFocusCaption = this.onFocusCaption.bind( this );
	}

	componentDidMount() {
		const { attributes, setAttributes } = this.props;

		// This will warn when we have `id` defined, while `url` is undefined.
		// This may help track this issue: https://github.com/wordpress-mobile/WordPress-Android/issues/9768
		// where a cancelled image upload was resulting in a subsequent crash.
		if ( attributes.id && ! attributes.url ) {
			// eslint-disable-next-line no-console
			console.warn( 'Attributes has id with no url.' );
		}

		if ( attributes.id && attributes.url && ! isURL( attributes.url ) ) {
			if ( attributes.url.indexOf( 'file:' ) === 0 ) {
				requestMediaImport( attributes.url, ( id, url ) => {
					if ( url ) {
						setAttributes( { id, url } );
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

	static getDerivedStateFromProps( props, state ) {
		// Avoid a UI flicker in the toolbar by insuring that isCaptionSelected
		// is updated immediately any time the isSelected prop becomes false
		return {
			isCaptionSelected: props.isSelected && state.isCaptionSelected,
		};
	}

	onImagePressed() {
		const { attributes } = this.props;

		if ( this.state.isUploadInProgress ) {
			requestImageUploadCancelDialog( attributes.id );
		} else if ( attributes.id && ! isURL( attributes.url ) ) {
			requestImageFailedRetryDialog( attributes.id );
		}

		this.setState( {
			isCaptionSelected: false,
		} );
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

	onSetNewTab( value ) {
		const updatedLinkTarget = getUpdatedLinkTargetSettings( value, this.props.attributes );
		this.props.setAttributes( updatedLinkTarget );
	}

	onClearSettings() {
		this.props.setAttributes( {
			alt: '',
			linkDestination: LINK_DESTINATION_NONE,
			href: undefined,
			linkTarget: undefined,
			rel: undefined,
		} );
	}

	onSelectMediaUploadOption( { id, url } ) {
		const { setAttributes } = this.props;
		setAttributes( { id, url } );
	}

	onFocusCaption() {
		if ( this.props.onFocus ) {
			this.props.onFocus();
		}
		if ( ! this.state.isCaptionSelected ) {
			this.setState( {
				isCaptionSelected: true,
			} );
		}
	}

	getIcon( isRetryIcon ) {
		if ( isRetryIcon ) {
			return <Icon icon={ SvgIconRetry } { ...styles.iconRetry } />;
		}

		const iconStyle = this.props.getStylesFromColorScheme( styles.icon, styles.iconDark );
		return <Icon icon={ SvgIcon } { ...iconStyle } />;
	}

	render() {
		const { attributes, isSelected } = this.props;
		const { url, height, width, alt, href, id, linkTarget } = attributes;

		const getToolbarEditButton = ( open ) => (
			<BlockControls>
				<Toolbar>
					<ToolbarButton
						title={ __( 'Edit image' ) }
						icon="edit"
						onClick={ open }
					/>
				</Toolbar>
			</BlockControls>
		);

		const getInspectorControls = () => (
			<InspectorControls>
				<PanelBody title={ __( 'Image Settings' ) } >
					<TextControl
						icon={ 'admin-links' }
						label={ __( 'Link To' ) }
						value={ href || '' }
						valuePlaceholder={ __( 'Add URL' ) }
						onChange={ this.onSetLinkDestination }
						autoCapitalize="none"
						autoCorrect={ false }
						keyboardType="url"
					/>
					<ToggleControl
						icon={ 'external' }
						label={ __( 'Open in new tab' ) }
						checked={ linkTarget === '_blank' }
						onChange={ this.onSetNewTab }
					/>
					<TextControl
						icon={ 'editor-textcolor' }
						label={ __( 'Alt Text' ) }
						value={ alt || '' }
						valuePlaceholder={ __( 'None' ) }
						separatorType={ 'fullWidth' }
						onChange={ this.updateAlt }
					/>
					<TextControl
						label={ __( 'Clear All Settings' ) }
						labelStyle={ styles.clearSettingsButton }
						separatorType={ 'none' }
						onPress={ this.onClearSettings }
					/>
				</PanelBody>
			</InspectorControls>
		);

		if ( ! url ) {
			return (
				<View style={ { flex: 1 } } >
					<MediaPlaceholder
						allowedTypes={ [ MEDIA_TYPE_IMAGE ] }
						onSelect={ this.onSelectMediaUploadOption }
						icon={ this.getIcon( false ) }
						onFocus={ this.props.onFocus }
					/>
				</View>
			);
		}

		const imageContainerHeight = Dimensions.get( 'window' ).width / IMAGE_ASPECT_RATIO;
		const getImageComponent = ( openMediaOptions, getMediaOptions ) => (
			<TouchableWithoutFeedback
				accessible={ ! isSelected }
				onPress={ this.onImagePressed }
				onLongPress={ openMediaOptions }
				disabled={ ! isSelected }
			>
				<View style={ { flex: 1 } }>
					{ getInspectorControls() }
					{ getMediaOptions() }
					{ ( ! this.state.isCaptionSelected ) &&
						getToolbarEditButton( openMediaOptions )
					}
					<MediaUploadProgress
						height={ height }
						width={ width }
						coverUrl={ url }
						mediaId={ id }
						onUpdateMediaProgress={ this.updateMediaProgress }
						onFinishMediaUploadWithSuccess={ this.finishMediaUploadWithSuccess }
						onFinishMediaUploadWithFailure={ this.finishMediaUploadWithFailure }
						onMediaUploadStateReset={ this.mediaUploadStateReset }
						renderContent={ ( { isUploadInProgress, isUploadFailed, finalWidth, finalHeight, imageWidthWithinContainer, retryMessage } ) => {
							const opacity = isUploadInProgress ? 0.3 : 1;
							const icon = this.getIcon( isUploadFailed );

							const iconContainer = (
								<View style={ styles.modalIcon }>
									{ icon }
								</View>
							);

							return (
								<View style={ { flex: 1 } } >
									{ ! imageWidthWithinContainer &&
										<View style={ [ styles.imageContainer, { height: imageContainerHeight } ] } >
											{ this.getIcon( false ) }
										</View> }
									<ImageBackground
										accessible={ true }
										disabled={ ! isSelected }
										accessibilityLabel={ alt }
										accessibilityHint={ __( 'Double tap and hold to edit' ) }
										accessibilityRole={ 'imagebutton' }
										style={ { width: finalWidth, height: finalHeight, opacity } }
										resizeMethod="scale"
										source={ { uri: url } }
										key={ url }
									>
										{ isUploadFailed &&
											<View style={ [ styles.imageContainer, { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' } ] } >
												{ iconContainer }
												<Text style={ styles.uploadFailedText }>{ retryMessage }</Text>
											</View>
										}
									</ImageBackground>
								</View>
							);
						} }
					/>
					<Caption
						clientId={ this.props.clientId }
						isSelected={ this.state.isCaptionSelected }
						accessible={ true }
						accessibilityLabelCreator={ ( caption ) =>
							isEmpty( caption ) ?
							/* translators: accessibility text. Empty image caption. */
								( 'Image caption. Empty' ) :
								sprintf(
								/* translators: accessibility text. %s: image caption. */
									__( 'Image caption. %s' ),
									caption )
						}
						onFocus={ this.onFocusCaption }
						onBlur={ this.props.onBlur } // always assign onBlur as props
					/>
				</View>
			</TouchableWithoutFeedback>
		);

		return (
			<MediaUpload allowedTypes={ [ MEDIA_TYPE_IMAGE ] }
				onSelect={ this.onSelectMediaUploadOption }
				render={ ( { open, getMediaOptions } ) => {
					return getImageComponent( open, getMediaOptions );
				} }
			/>
		);
	}
}

export default withPreferredColorScheme( ImageEdit );
