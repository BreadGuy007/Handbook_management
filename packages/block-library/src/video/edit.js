/**
 * WordPress dependencies
 */
import { getBlobByURL, isBlobURL } from '@wordpress/blob';
import {
	BaseControl,
	Button,
	Disabled,
	PanelBody,
	withNotices,
} from '@wordpress/components';
import {
	BlockControls,
	BlockIcon,
	InspectorControls,
	MediaPlaceholder,
	MediaUpload,
	MediaUploadCheck,
	MediaReplaceFlow,
	RichText,
	__experimentalUseBlockWrapperProps as useBlockWrapperProps,
} from '@wordpress/block-editor';
import { useRef, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useInstanceId } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { video as icon } from '@wordpress/icons';
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { createUpgradedEmbedBlock } from '../embed/util';
import VideoCommonSettings from './edit-common-settings';

const ALLOWED_MEDIA_TYPES = [ 'video' ];
const VIDEO_POSTER_ALLOWED_MEDIA_TYPES = [ 'image' ];

function VideoEdit( {
	isSelected,
	noticeUI,
	attributes,
	setAttributes,
	insertBlocksAfter,
	onReplace,
	noticeOperations,
} ) {
	const instanceId = useInstanceId( VideoEdit );
	const videoPlayer = useRef();
	const posterImageButton = useRef();
	const { id, caption, controls, poster, src } = attributes;
	const mediaUpload = useSelect(
		( select ) => select( 'core/block-editor' ).getSettings().mediaUpload
	);

	useEffect( () => {
		if ( ! id && isBlobURL( src ) ) {
			const file = getBlobByURL( src );
			if ( file ) {
				mediaUpload( {
					filesList: [ file ],
					onFileChange: ( [ { url } ] ) => {
						setAttributes( { src: url } );
					},
					onError: ( message ) => {
						noticeOperations.createErrorNotice( message );
					},
					allowedTypes: ALLOWED_MEDIA_TYPES,
				} );
			}
		}
	}, [] );

	useEffect( () => {
		// Placeholder may be rendered.
		if ( videoPlayer.current ) {
			videoPlayer.current.load();
		}
	}, [ poster ] );

	function onSelectVideo( media ) {
		if ( ! media || ! media.url ) {
			// in this case there was an error
			// previous attributes should be removed
			// because they may be temporary blob urls
			setAttributes( { src: undefined, id: undefined } );
			return;
		}
		// sets the block's attribute and updates the edit component from the
		// selected media
		setAttributes( { src: media.url, id: media.id } );
	}

	function onSelectURL( newSrc ) {
		if ( newSrc !== src ) {
			// Check if there's an embed block that handles this URL.
			const embedBlock = createUpgradedEmbedBlock( {
				attributes: { url: newSrc },
			} );
			if ( undefined !== embedBlock ) {
				onReplace( embedBlock );
				return;
			}
			setAttributes( { src: newSrc, id: undefined } );
		}
	}

	function onUploadError( message ) {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	}

	const blockWrapperProps = useBlockWrapperProps();

	if ( ! src ) {
		return (
			<div { ...blockWrapperProps }>
				<MediaPlaceholder
					icon={ <BlockIcon icon={ icon } /> }
					onSelect={ onSelectVideo }
					onSelectURL={ onSelectURL }
					accept="video/*"
					allowedTypes={ ALLOWED_MEDIA_TYPES }
					value={ attributes }
					notices={ noticeUI }
					onError={ onUploadError }
				/>
			</div>
		);
	}

	function onSelectPoster( image ) {
		setAttributes( { poster: image.url } );
	}

	function onRemovePoster() {
		setAttributes( { poster: '' } );

		// Move focus back to the Media Upload button.
		this.posterImageButton.current.focus();
	}

	const videoPosterDescription = `video-block__poster-image-description-${ instanceId }`;

	return (
		<>
			<BlockControls>
				<MediaReplaceFlow
					mediaId={ id }
					mediaURL={ src }
					allowedTypes={ ALLOWED_MEDIA_TYPES }
					accept="video/*"
					onSelect={ onSelectVideo }
					onSelectURL={ onSelectURL }
					onError={ onUploadError }
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Video settings' ) }>
					<VideoCommonSettings
						setAttributes={ setAttributes }
						attributes={ attributes }
					/>
					<MediaUploadCheck>
						<BaseControl className="editor-video-poster-control">
							<BaseControl.VisualLabel>
								{ __( 'Poster image' ) }
							</BaseControl.VisualLabel>
							<MediaUpload
								title={ __( 'Select poster image' ) }
								onSelect={ onSelectPoster }
								allowedTypes={
									VIDEO_POSTER_ALLOWED_MEDIA_TYPES
								}
								render={ ( { open } ) => (
									<Button
										isPrimary
										onClick={ open }
										ref={ posterImageButton }
										aria-describedby={
											videoPosterDescription
										}
									>
										{ ! poster
											? __( 'Select' )
											: __( 'Replace' ) }
									</Button>
								) }
							/>
							<p id={ videoPosterDescription } hidden>
								{ poster
									? sprintf(
											/* translators: %s: poster image URL. */
											__(
												'The current poster image url is %s'
											),
											poster
									  )
									: __(
											'There is no poster image currently selected'
									  ) }
							</p>
							{ !! poster && (
								<Button onClick={ onRemovePoster } isTertiary>
									{ __( 'Remove' ) }
								</Button>
							) }
						</BaseControl>
					</MediaUploadCheck>
				</PanelBody>
			</InspectorControls>
			<figure { ...blockWrapperProps }>
				{ /*
					Disable the video tag so the user clicking on it won't play the
					video when the controls are enabled.
				*/ }
				<Disabled>
					<video
						controls={ controls }
						poster={ poster }
						src={ src }
						ref={ videoPlayer }
					/>
				</Disabled>
				{ ( ! RichText.isEmpty( caption ) || isSelected ) && (
					<RichText
						tagName="figcaption"
						placeholder={ __( 'Write caption…' ) }
						value={ caption }
						onChange={ ( value ) =>
							setAttributes( { caption: value } )
						}
						inlineToolbar
						__unstableOnSplitAtEnd={ () =>
							insertBlocksAfter( createBlock( 'core/paragraph' ) )
						}
					/>
				) }
			</figure>
		</>
	);
}

export default withNotices( VideoEdit );
