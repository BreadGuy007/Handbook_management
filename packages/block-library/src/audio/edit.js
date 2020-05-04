/**
 * WordPress dependencies
 */
import { getBlobByURL, isBlobURL } from '@wordpress/blob';
import { compose } from '@wordpress/compose';
import {
	Disabled,
	PanelBody,
	SelectControl,
	ToggleControl,
	withNotices,
} from '@wordpress/components';
import {
	BlockControls,
	BlockIcon,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	RichText,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { withSelect } from '@wordpress/data';
import { audio as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { createUpgradedEmbedBlock } from '../embed/util';

const ALLOWED_MEDIA_TYPES = [ 'audio' ];

class AudioEdit extends Component {
	constructor() {
		super( ...arguments );
		this.toggleAttribute = this.toggleAttribute.bind( this );
		this.onSelectURL = this.onSelectURL.bind( this );
		this.onUploadError = this.onUploadError.bind( this );
	}

	componentDidMount() {
		const {
			attributes,
			mediaUpload,
			noticeOperations,
			setAttributes,
		} = this.props;
		const { id, src = '' } = attributes;

		if ( ! id && isBlobURL( src ) ) {
			const file = getBlobByURL( src );

			if ( file ) {
				mediaUpload( {
					filesList: [ file ],
					onFileChange: ( [ { id: mediaId, url } ] ) => {
						setAttributes( { id: mediaId, src: url } );
					},
					onError: ( e ) => {
						setAttributes( { src: undefined, id: undefined } );
						noticeOperations.createErrorNotice( e );
					},
					allowedTypes: ALLOWED_MEDIA_TYPES,
				} );
			}
		}
	}

	toggleAttribute( attribute ) {
		return ( newValue ) => {
			this.props.setAttributes( { [ attribute ]: newValue } );
		};
	}

	onSelectURL( newSrc ) {
		const { attributes, setAttributes } = this.props;
		const { src } = attributes;

		// Set the block's src from the edit component's state, and switch off
		// the editing UI.
		if ( newSrc !== src ) {
			// Check if there's an embed block that handles this URL.
			const embedBlock = createUpgradedEmbedBlock( {
				attributes: { url: newSrc },
			} );
			if ( undefined !== embedBlock ) {
				this.props.onReplace( embedBlock );
				return;
			}
			setAttributes( { src: newSrc, id: undefined } );
		}
	}

	onUploadError( message ) {
		const { noticeOperations } = this.props;
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	}

	getAutoplayHelp( checked ) {
		return checked
			? __(
					'Note: Autoplaying audio may cause usability issues for some visitors.'
			  )
			: null;
	}

	render() {
		const {
			id,
			autoplay,
			caption,
			loop,
			preload,
			src,
		} = this.props.attributes;
		const { setAttributes, isSelected, noticeUI } = this.props;
		const onSelectAudio = ( media ) => {
			if ( ! media || ! media.url ) {
				// in this case there was an error and we should continue in the editing state
				// previous attributes should be removed because they may be temporary blob urls
				setAttributes( { src: undefined, id: undefined } );
				return;
			}
			// sets the block's attribute and updates the edit component from the
			// selected media, then switches off the editing UI
			setAttributes( { src: media.url, id: media.id } );
		};
		if ( ! src ) {
			return (
				<Block.div>
					<MediaPlaceholder
						icon={ <BlockIcon icon={ icon } /> }
						onSelect={ onSelectAudio }
						onSelectURL={ this.onSelectURL }
						accept="audio/*"
						allowedTypes={ ALLOWED_MEDIA_TYPES }
						value={ this.props.attributes }
						notices={ noticeUI }
						onError={ this.onUploadError }
					/>
				</Block.div>
			);
		}

		return (
			<>
				<BlockControls>
					<MediaReplaceFlow
						mediaId={ id }
						mediaURL={ src }
						allowedTypes={ ALLOWED_MEDIA_TYPES }
						accept="audio/*"
						onSelect={ onSelectAudio }
						onSelectURL={ this.onSelectURL }
						onError={ this.onUploadError }
					/>
				</BlockControls>
				<InspectorControls>
					<PanelBody title={ __( 'Audio settings' ) }>
						<ToggleControl
							label={ __( 'Autoplay' ) }
							onChange={ this.toggleAttribute( 'autoplay' ) }
							checked={ autoplay }
							help={ this.getAutoplayHelp }
						/>
						<ToggleControl
							label={ __( 'Loop' ) }
							onChange={ this.toggleAttribute( 'loop' ) }
							checked={ loop }
						/>
						<SelectControl
							label={ __( 'Preload' ) }
							value={ preload || '' }
							// `undefined` is required for the preload attribute to be unset.
							onChange={ ( value ) =>
								setAttributes( {
									preload: value || undefined,
								} )
							}
							options={ [
								{ value: '', label: __( 'Browser default' ) },
								{ value: 'auto', label: __( 'Auto' ) },
								{ value: 'metadata', label: __( 'Metadata' ) },
								{ value: 'none', label: __( 'None' ) },
							] }
						/>
					</PanelBody>
				</InspectorControls>
				<Block.figure>
					{ /*
						Disable the audio tag so the user clicking on it won't play the
						file or change the position slider when the controls are enabled.
					*/ }
					<Disabled>
						<audio controls="controls" src={ src } />
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
						/>
					) }
				</Block.figure>
			</>
		);
	}
}
export default compose( [
	withSelect( ( select ) => {
		const { getSettings } = select( 'core/block-editor' );
		const { mediaUpload } = getSettings();
		return { mediaUpload };
	} ),
	withNotices,
] )( AudioEdit );
