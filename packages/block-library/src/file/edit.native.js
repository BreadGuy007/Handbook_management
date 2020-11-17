/**
 * External dependencies
 */
import { View, Text, Clipboard } from 'react-native';
import React from 'react';

/**
 * WordPress dependencies
 */
import {
	BlockIcon,
	MediaPlaceholder,
	MediaUploadProgress,
	RichText,
	PlainText,
	BlockControls,
	MediaUpload,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	ToolbarButton,
	ToolbarGroup,
	PanelBody,
	ToggleControl,
	BottomSheet,
} from '@wordpress/components';
import { file as icon, replace, button, external } from '@wordpress/icons';
import { Component } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';
import { withPreferredColorScheme } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import styles from './style.scss';

const URL_COPIED_NOTIFICATION_DURATION_MS = 1500;

export class FileEdit extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			isUploadInProgress: false,
		};

		this.timerRef = null;

		this.onSelectFile = this.onSelectFile.bind( this );
		this.onChangeFileName = this.onChangeFileName.bind( this );
		this.onChangeDownloadButtonText = this.onChangeDownloadButtonText.bind(
			this
		);
		this.updateMediaProgress = this.updateMediaProgress.bind( this );
		this.finishMediaUploadWithSuccess = this.finishMediaUploadWithSuccess.bind(
			this
		);
		this.getFileComponent = this.getFileComponent.bind( this );
		this.onChangeDownloadButtonVisibility = this.onChangeDownloadButtonVisibility.bind(
			this
		);
		this.onCopyURL = this.onCopyURL.bind( this );
		this.onChangeOpenInNewWindow = this.onChangeOpenInNewWindow.bind(
			this
		);
	}

	componentDidMount() {
		const { attributes, setAttributes } = this.props;
		const { downloadButtonText } = attributes;

		if ( downloadButtonText === undefined || downloadButtonText === '' ) {
			setAttributes( {
				downloadButtonText: _x( 'Download', 'button label' ),
			} );
		}
	}

	componentWillUnmount() {
		clearTimeout( this.timerRef );
	}

	onSelectFile( media ) {
		this.props.setAttributes( {
			href: media.url,
			fileName: media.title,
			textLinkHref: media.url,
			id: media.id,
		} );
	}

	onChangeFileName( fileName ) {
		this.props.setAttributes( { fileName } );
	}

	onChangeDownloadButtonText( downloadButtonText ) {
		this.props.setAttributes( { downloadButtonText } );
	}

	onChangeDownloadButtonVisibility( showDownloadButton ) {
		this.props.setAttributes( { showDownloadButton } );
	}

	onCopyURL() {
		if ( this.state.isUrlCopied ) {
			return;
		}
		const { href } = this.props.attributes;
		Clipboard.setString( href );

		this.setState( { isUrlCopied: true } );
		this.timerRef = setTimeout( () => {
			this.setState( { isUrlCopied: false } );
		}, URL_COPIED_NOTIFICATION_DURATION_MS );
	}

	onChangeOpenInNewWindow( newValue ) {
		this.props.setAttributes( {
			textLinkTarget: newValue ? '_blank' : false,
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

		setAttributes( {
			href: payload.mediaUrl,
			id: payload.mediaServerId,
			textLinkHref: payload.mediaUrl,
		} );
		this.setState( { isUploadInProgress: false } );
	}

	mediaUploadStateReset() {
		const { setAttributes } = this.props;

		setAttributes( { id: null, url: null } );
		this.setState( { isUploadInProgress: false } );
	}

	getErrorComponent( retryMessage ) {
		return (
			retryMessage && (
				<View style={ styles.retryContainer }>
					<Text style={ styles.uploadFailedText }>
						{ retryMessage }
					</Text>
				</View>
			)
		);
	}

	getToolbarEditButton( open ) {
		return (
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						title={ __( 'Edit file' ) }
						icon={ replace }
						onClick={ open }
					/>
				</ToolbarGroup>
			</BlockControls>
		);
	}

	getInspectorControls(
		{ showDownloadButton, textLinkTarget },
		isUploadInProgress,
		isUploadFailed
	) {
		const actionButtonStyle = this.props.getStylesFromColorScheme(
			styles.actionButton,
			styles.actionButtonDark
		);

		const isCopyUrlDisabled = isUploadFailed || isUploadInProgress;
		const dimmedStyle = isCopyUrlDisabled && styles.disabledButton;
		const finalButtonStyle = Object.assign(
			{},
			actionButtonStyle,
			dimmedStyle
		);

		return (
			<InspectorControls>
				<PanelBody title={ __( 'File block settings' ) } />
				<PanelBody>
					<ToggleControl
						icon={ external }
						label={ __( 'Open in new tab' ) }
						checked={ textLinkTarget === '_blank' }
						onChange={ this.onChangeOpenInNewWindow }
					/>
					<ToggleControl
						icon={ button }
						label={ __( 'Show download button' ) }
						checked={ showDownloadButton }
						onChange={ this.onChangeDownloadButtonVisibility }
					/>
					<BottomSheet.Cell
						disabled={ isCopyUrlDisabled }
						label={
							this.state.isUrlCopied
								? __( 'Copied!' )
								: __( 'Copy file URL' )
						}
						labelStyle={
							this.state.isUrlCopied || finalButtonStyle
						}
						onPress={ this.onCopyURL }
					/>
				</PanelBody>
			</InspectorControls>
		);
	}

	getStyleForAlignment( align ) {
		const getFlexAlign = ( alignment ) => {
			switch ( alignment ) {
				case 'right':
					return 'flex-end';
				case 'center':
					return 'center';
				default:
					return 'flex-start';
			}
		};
		return { alignSelf: getFlexAlign( align ) };
	}

	getTextAlignmentForAlignment( align ) {
		switch ( align ) {
			case 'right':
				return 'right';
			case 'center':
				return 'center';
			default:
				return 'left';
		}
	}

	getFileComponent( openMediaOptions, getMediaOptions ) {
		const { attributes } = this.props;
		const {
			fileName,
			downloadButtonText,
			id,
			showDownloadButton,
			align,
		} = attributes;

		const dimmedStyle =
			this.state.isUploadInProgress && styles.disabledButton;
		const finalButtonStyle = Object.assign(
			{},
			styles.defaultButton,
			dimmedStyle
		);

		return (
			<MediaUploadProgress
				mediaId={ id }
				onUpdateMediaProgress={ this.updateMediaProgress }
				onFinishMediaUploadWithSuccess={
					this.finishMediaUploadWithSuccess
				}
				onFinishMediaUploadWithFailure={ () => {} }
				onMediaUploadStateReset={ this.mediaUploadStateReset }
				renderContent={ ( {
					isUploadInProgress,
					isUploadFailed,
					retryMessage,
				} ) => {
					if ( isUploadFailed ) {
						return this.getErrorComponent( retryMessage );
					}

					return (
						<View>
							{ isUploadInProgress ||
								this.getToolbarEditButton( openMediaOptions ) }
							{ getMediaOptions() }
							{ this.getInspectorControls(
								attributes,
								isUploadInProgress,
								isUploadFailed
							) }
							<RichText
								__unstableMobileNoFocusOnMount
								onChange={ this.onChangeFileName }
								placeholder={ __( 'File name' ) }
								rootTagsToEliminate={ [ 'p' ] }
								tagName="p"
								underlineColorAndroid="transparent"
								value={ fileName }
								deleteEnter={ true }
								textAlign={ this.getTextAlignmentForAlignment(
									align
								) }
							/>
							{ showDownloadButton && (
								<View
									style={ [
										finalButtonStyle,
										this.getStyleForAlignment( align ),
									] }
								>
									<PlainText
										style={ styles.buttonText }
										value={ downloadButtonText }
										onChange={
											this.onChangeDownloadButtonText
										}
									/>
								</View>
							) }
						</View>
					);
				} }
			/>
		);
	}

	render() {
		const { attributes } = this.props;
		const { href } = attributes;

		if ( ! href ) {
			return (
				<MediaPlaceholder
					icon={ <BlockIcon icon={ icon } /> }
					labels={ {
						title: __( 'File' ),
						instructions: __( 'CHOOSE A FILE' ),
					} }
					onSelect={ this.onSelectFile }
					onFocus={ this.props.onFocus }
					allowedTypes={ [ 'other' ] }
				/>
			);
		}

		return (
			<MediaUpload
				allowedTypes={ [ 'other' ] }
				isReplacingMedia={ true }
				onSelect={ this.onSelectFile }
				render={ ( { open, getMediaOptions } ) => {
					return this.getFileComponent( open, getMediaOptions );
				} }
			/>
		);
	}
}

export default withPreferredColorScheme( FileEdit );
