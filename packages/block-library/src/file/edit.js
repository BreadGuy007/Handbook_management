/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { getBlobByURL, isBlobURL, revokeBlobURL } from '@wordpress/blob';
import { Animate, ClipboardButton, withNotices } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import {
	BlockControls,
	BlockIcon,
	MediaPlaceholder,
	MediaReplaceFlow,
	RichText,
} from '@wordpress/block-editor';
import { Component } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';
import { file as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import FileBlockInspector from './inspector';

class FileEdit extends Component {
	constructor() {
		super( ...arguments );

		this.onSelectFile = this.onSelectFile.bind( this );
		this.confirmCopyURL = this.confirmCopyURL.bind( this );
		this.resetCopyConfirmation = this.resetCopyConfirmation.bind( this );
		this.changeLinkDestinationOption = this.changeLinkDestinationOption.bind(
			this
		);
		this.changeOpenInNewWindow = this.changeOpenInNewWindow.bind( this );
		this.changeShowDownloadButton = this.changeShowDownloadButton.bind(
			this
		);
		this.onUploadError = this.onUploadError.bind( this );

		this.state = {
			hasError: false,
			showCopyConfirmation: false,
		};
	}

	componentDidMount() {
		const {
			attributes,
			mediaUpload,
			noticeOperations,
			setAttributes,
		} = this.props;
		const { downloadButtonText, href } = attributes;

		// Upload a file drag-and-dropped into the editor
		if ( isBlobURL( href ) ) {
			const file = getBlobByURL( href );

			mediaUpload( {
				filesList: [ file ],
				onFileChange: ( [ media ] ) => this.onSelectFile( media ),
				onError: ( message ) => {
					this.setState( { hasError: true } );
					noticeOperations.createErrorNotice( message );
				},
			} );

			revokeBlobURL( href );
		}

		if ( downloadButtonText === undefined ) {
			setAttributes( {
				downloadButtonText: _x( 'Download', 'button label' ),
			} );
		}
	}

	componentDidUpdate( prevProps ) {
		// Reset copy confirmation state when block is deselected
		if ( prevProps.isSelected && ! this.props.isSelected ) {
			this.setState( { showCopyConfirmation: false } );
		}
	}

	onSelectFile( media ) {
		if ( media && media.url ) {
			this.setState( { hasError: false } );
			this.props.setAttributes( {
				href: media.url,
				fileName: media.title,
				textLinkHref: media.url,
				id: media.id,
			} );
		}
	}

	onUploadError( message ) {
		const { noticeOperations } = this.props;
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	}

	confirmCopyURL() {
		this.setState( { showCopyConfirmation: true } );
	}

	resetCopyConfirmation() {
		this.setState( { showCopyConfirmation: false } );
	}

	changeLinkDestinationOption( newHref ) {
		// Choose Media File or Attachment Page (when file is in Media Library)
		this.props.setAttributes( { textLinkHref: newHref } );
	}

	changeOpenInNewWindow( newValue ) {
		this.props.setAttributes( {
			textLinkTarget: newValue ? '_blank' : false,
		} );
	}

	changeShowDownloadButton( newValue ) {
		this.props.setAttributes( { showDownloadButton: newValue } );
	}

	render() {
		const {
			className,
			isSelected,
			attributes,
			setAttributes,
			noticeUI,
			media,
		} = this.props;
		const {
			id,
			fileName,
			href,
			textLinkHref,
			textLinkTarget,
			showDownloadButton,
			downloadButtonText,
		} = attributes;
		const { hasError, showCopyConfirmation } = this.state;
		const attachmentPage = media && media.link;

		if ( ! href || hasError ) {
			return (
				<MediaPlaceholder
					icon={ <BlockIcon icon={ icon } /> }
					labels={ {
						title: __( 'File' ),
						instructions: __(
							'Upload a file or pick one from your media library.'
						),
					} }
					onSelect={ this.onSelectFile }
					notices={ noticeUI }
					onError={ this.onUploadError }
					accept="*"
				/>
			);
		}

		const classes = classnames( className, {
			'is-transient': isBlobURL( href ),
		} );

		return (
			<>
				<FileBlockInspector
					hrefs={ { href, textLinkHref, attachmentPage } }
					{ ...{
						openInNewWindow: !! textLinkTarget,
						showDownloadButton,
						changeLinkDestinationOption: this
							.changeLinkDestinationOption,
						changeOpenInNewWindow: this.changeOpenInNewWindow,
						changeShowDownloadButton: this.changeShowDownloadButton,
					} }
				/>
				<BlockControls>
					<MediaReplaceFlow
						mediaId={ id }
						mediaURL={ href }
						accept="*"
						onSelect={ this.onSelectFile }
						onError={ this.onUploadError }
					/>
				</BlockControls>
				<Animate type={ isBlobURL( href ) ? 'loading' : null }>
					{ ( { className: animateClassName } ) => (
						<div
							className={ classnames(
								classes,
								animateClassName
							) }
						>
							<div className={ 'wp-block-file__content-wrapper' }>
								<div className="wp-block-file__textlink">
									<RichText
										tagName="div" // must be block-level or else cursor disappears
										value={ fileName }
										placeholder={ __( 'Write file name…' ) }
										withoutInteractiveFormatting
										onChange={ ( text ) =>
											setAttributes( { fileName: text } )
										}
									/>
								</div>
								{ showDownloadButton && (
									<div
										className={
											'wp-block-file__button-richtext-wrapper'
										}
									>
										{ /* Using RichText here instead of PlainText so that it can be styled like a button */ }
										<RichText
											tagName="div" // must be block-level or else cursor disappears
											className={
												'wp-block-file__button'
											}
											value={ downloadButtonText }
											withoutInteractiveFormatting
											placeholder={ __( 'Add text…' ) }
											onChange={ ( text ) =>
												setAttributes( {
													downloadButtonText: text,
												} )
											}
										/>
									</div>
								) }
							</div>
							{ isSelected && (
								<ClipboardButton
									isSecondary
									text={ href }
									className={
										'wp-block-file__copy-url-button'
									}
									onCopy={ this.confirmCopyURL }
									onFinishCopy={ this.resetCopyConfirmation }
									disabled={ isBlobURL( href ) }
								>
									{ showCopyConfirmation
										? __( 'Copied!' )
										: __( 'Copy URL' ) }
								</ClipboardButton>
							) }
						</div>
					) }
				</Animate>
			</>
		);
	}
}

export default compose( [
	withSelect( ( select, props ) => {
		const { getMedia } = select( 'core' );
		const { getSettings } = select( 'core/block-editor' );
		const { mediaUpload } = getSettings();
		const { id } = props.attributes;
		return {
			media: id === undefined ? undefined : getMedia( id ),
			mediaUpload,
		};
	} ),
	withNotices,
] )( FileEdit );
