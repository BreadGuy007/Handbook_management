/**
 * External dependencies
 */
import {
	every,
	filter,
	find,
	forEach,
	get,
	isEmpty,
	map,
	reduce,
	some,
	toString,
} from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	withNotices,
	RangeControl,
} from '@wordpress/components';
import { MediaPlaceholder, InspectorControls } from '@wordpress/block-editor';
import { Platform, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getBlobByURL, isBlobURL, revokeBlobURL } from '@wordpress/blob';
import { withSelect } from '@wordpress/data';
import { withViewportMatch } from '@wordpress/viewport';

/**
 * Internal dependencies
 */
import { sharedIcon } from './shared-icon';
import { defaultColumnsNumber, pickRelevantMediaFiles } from './shared';
import Gallery from './gallery';
import {
	LINK_DESTINATION_ATTACHMENT,
	LINK_DESTINATION_MEDIA,
	LINK_DESTINATION_NONE,
} from './constants';

const MAX_COLUMNS = 8;
const linkOptions = [
	{ value: LINK_DESTINATION_ATTACHMENT, label: __( 'Attachment Page' ) },
	{ value: LINK_DESTINATION_MEDIA, label: __( 'Media File' ) },
	{ value: LINK_DESTINATION_NONE, label: __( 'None' ) },
];
const ALLOWED_MEDIA_TYPES = [ 'image' ];

const PLACEHOLDER_TEXT = Platform.select( {
	web: __(
		'Drag images, upload new ones or select files from your library.'
	),
	native: __( 'ADD MEDIA' ),
} );

const MOBILE_CONTROL_PROPS_RANGE_CONTROL = Platform.select( {
	web: {},
	native: { type: 'stepper' },
} );

function GalleryEdit( props ) {
	const {
		attributes,
		className,
		isSelected,
		noticeUI,
		noticeOperations,
		mediaUpload,
		imageSizes,
		resizedImages,
		onFocus,
	} = props;
	const {
		columns = defaultColumnsNumber( attributes ),
		imageCrop,
		images,
		linkTo,
		sizeSlug,
	} = attributes;
	const [ selectedImage, setSelectedImage ] = useState();
	const [ attachmentCaptions, setAttachmentCaptions ] = useState();

	function setAttributes( newAttrs ) {
		if ( newAttrs.ids ) {
			throw new Error(
				'The "ids" attribute should not be changed directly. It is managed automatically when "images" attribute changes'
			);
		}

		if ( newAttrs.images ) {
			newAttrs = {
				...newAttrs,
				// Unlike images[ n ].id which is a string, always ensure the
				// ids array contains numbers as per its attribute type.
				ids: map( newAttrs.images, ( { id } ) => parseInt( id, 10 ) ),
			};
		}

		props.setAttributes( newAttrs );
	}

	function onSelectImage( index ) {
		return () => {
			setSelectedImage( index );
		};
	}

	function onDeselectImage() {
		return () => {
			setSelectedImage();
		};
	}

	function onMove( oldIndex, newIndex ) {
		const newImages = [ ...images ];
		newImages.splice( newIndex, 1, images[ oldIndex ] );
		newImages.splice( oldIndex, 1, images[ newIndex ] );
		setSelectedImage( newIndex );
		setAttributes( { images: newImages } );
	}

	function onMoveForward( oldIndex ) {
		return () => {
			if ( oldIndex === images.length - 1 ) {
				return;
			}
			onMove( oldIndex, oldIndex + 1 );
		};
	}

	function onMoveBackward( oldIndex ) {
		return () => {
			if ( oldIndex === 0 ) {
				return;
			}
			onMove( oldIndex, oldIndex - 1 );
		};
	}

	function onRemoveImage( index ) {
		return () => {
			const newImages = filter( images, ( img, i ) => index !== i );
			setSelectedImage();
			setAttributes( {
				images: newImages,
				columns: attributes.columns
					? Math.min( newImages.length, attributes.columns )
					: attributes.columns,
			} );
		};
	}

	function selectCaption( newImage ) {
		// The image id in both the images and attachmentCaptions arrays is a
		// string, so ensure comparison works correctly by converting the
		// newImage.id to a string.
		const newImageId = toString( newImage.id );
		const currentImage = find( images, { id: newImageId } );
		const currentImageCaption = currentImage
			? currentImage.caption
			: newImage.caption;

		if ( ! attachmentCaptions ) {
			return currentImageCaption;
		}

		const attachment = find( attachmentCaptions, {
			id: newImageId,
		} );

		// if the attachment caption is updated
		if ( attachment && attachment.caption !== newImage.caption ) {
			return newImage.caption;
		}

		return currentImageCaption;
	}

	function onSelectImages( newImages ) {
		setAttachmentCaptions(
			newImages.map( ( newImage ) => ( {
				// Store the attachmentCaption id as a string for consistency
				// with the type of the id in the images attribute.
				id: toString( newImage.id ),
				caption: newImage.caption,
			} ) )
		);
		setAttributes( {
			images: newImages.map( ( newImage ) => ( {
				...pickRelevantMediaFiles( newImage, sizeSlug ),
				caption: selectCaption( newImage, images, attachmentCaptions ),
				// The id value is stored in a data attribute, so when the
				// block is parsed it's converted to a string. Converting
				// to a string here ensures it's type is consistent.
				id: toString( newImage.id ),
			} ) ),
			columns: attributes.columns
				? Math.min( newImages.length, attributes.columns )
				: attributes.columns,
		} );
	}

	function onUploadError( message ) {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	}

	function setLinkTo( value ) {
		setAttributes( { linkTo: value } );
	}

	function setColumnsNumber( value ) {
		setAttributes( { columns: value } );
	}

	function toggleImageCrop() {
		setAttributes( { imageCrop: ! imageCrop } );
	}

	function getImageCropHelp( checked ) {
		return checked
			? __( 'Thumbnails are cropped to align.' )
			: __( 'Thumbnails are not cropped.' );
	}

	function onFocusGalleryCaption() {
		setSelectedImage();
	}

	function setImageAttributes( index, newAttributes ) {
		if ( ! images[ index ] ) {
			return;
		}

		setAttributes( {
			images: [
				...images.slice( 0, index ),
				{
					...images[ index ],
					...newAttributes,
				},
				...images.slice( index + 1 ),
			],
		} );
	}

	function getImagesSizeOptions() {
		return map(
			filter( imageSizes, ( { slug } ) =>
				some( resizedImages, ( sizes ) => sizes[ slug ] )
			),
			( { name, slug } ) => ( { value: slug, label: name } )
		);
	}

	function updateImagesSize( newSizeSlug ) {
		const updatedImages = map( images, ( image ) => {
			if ( ! image.id ) {
				return image;
			}
			const url = get( resizedImages, [
				parseInt( image.id, 10 ),
				newSizeSlug,
			] );
			return {
				...image,
				...( url && { url } ),
			};
		} );

		setAttributes( { images: updatedImages, newSizeSlug } );
	}

	useEffect( () => {
		if (
			Platform.OS === 'web' &&
			images &&
			images.length > 0 &&
			every( images, ( { url } ) => isBlobURL( url ) )
		) {
			const filesList = map( images, ( { url } ) => getBlobByURL( url ) );
			forEach( images, ( { url } ) => revokeBlobURL( url ) );
			mediaUpload( {
				filesList,
				onFileChange: onSelectImages,
				allowedTypes: [ 'image' ],
			} );
		}
	}, [] );

	useEffect( () => {
		// Deselect images when deselecting the block
		if ( ! isSelected ) {
			setSelectedImage();
		}
	}, [ isSelected ] );

	useEffect( () => {
		// linkTo attribute must be saved so blocks don't break when changing
		// image_default_link_type in options.php
		if ( ! linkTo ) {
			setAttributes( {
				linkTo:
					window?.wp?.media?.view?.settings?.defaultProps?.link ||
					LINK_DESTINATION_NONE,
			} );
		}
	}, [ linkTo ] );

	const hasImages = !! images.length;

	const mediaPlaceholder = (
		<MediaPlaceholder
			addToGallery={ hasImages }
			isAppender={ hasImages }
			className={ className }
			disableMediaButtons={ hasImages && ! isSelected }
			icon={ ! hasImages && sharedIcon }
			labels={ {
				title: ! hasImages && __( 'Gallery' ),
				instructions: ! hasImages && PLACEHOLDER_TEXT,
			} }
			onSelect={ onSelectImages }
			accept="image/*"
			allowedTypes={ ALLOWED_MEDIA_TYPES }
			multiple
			value={ images }
			onError={ onUploadError }
			notices={ hasImages ? undefined : noticeUI }
			onFocus={ onFocus }
		/>
	);

	if ( ! hasImages ) {
		return mediaPlaceholder;
	}

	const imageSizeOptions = getImagesSizeOptions();
	const shouldShowSizeOptions = hasImages && ! isEmpty( imageSizeOptions );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Gallery settings' ) }>
					{ images.length > 1 && (
						<RangeControl
							label={ __( 'Columns' ) }
							value={ columns }
							onChange={ setColumnsNumber }
							min={ 1 }
							max={ Math.min( MAX_COLUMNS, images.length ) }
							{ ...MOBILE_CONTROL_PROPS_RANGE_CONTROL }
							required
						/>
					) }
					<ToggleControl
						label={ __( 'Crop images' ) }
						checked={ !! imageCrop }
						onChange={ toggleImageCrop }
						help={ getImageCropHelp }
					/>
					<SelectControl
						label={ __( 'Link to' ) }
						value={ linkTo }
						onChange={ setLinkTo }
						options={ linkOptions }
					/>
					{ shouldShowSizeOptions && (
						<SelectControl
							label={ __( 'Image size' ) }
							value={ sizeSlug }
							options={ imageSizeOptions }
							onChange={ updateImagesSize }
						/>
					) }
				</PanelBody>
			</InspectorControls>
			{ noticeUI }
			<Gallery
				{ ...props }
				selectedImage={ selectedImage }
				mediaPlaceholder={ mediaPlaceholder }
				onMoveBackward={ onMoveBackward }
				onMoveForward={ onMoveForward }
				onRemoveImage={ onRemoveImage }
				onSelectImage={ onSelectImage }
				onDeselectImage={ onDeselectImage }
				onSetImageAttributes={ setImageAttributes }
				onFocusGalleryCaption={ onFocusGalleryCaption }
			/>
		</>
	);
}

export default compose( [
	withSelect( ( select, { attributes: { ids }, isSelected } ) => {
		const { getMedia } = select( 'core' );
		const { getSettings } = select( 'core/block-editor' );
		const { imageSizes, mediaUpload } = getSettings();

		let resizedImages = {};

		if ( isSelected ) {
			resizedImages = reduce(
				ids,
				( currentResizedImages, id ) => {
					if ( ! id ) {
						return currentResizedImages;
					}
					const image = getMedia( id );
					const sizes = reduce(
						imageSizes,
						( currentSizes, size ) => {
							const defaultUrl = get( image, [
								'sizes',
								size.slug,
								'url',
							] );
							const mediaDetailsUrl = get( image, [
								'media_details',
								'sizes',
								size.slug,
								'source_url',
							] );
							return {
								...currentSizes,
								[ size.slug ]: defaultUrl || mediaDetailsUrl,
							};
						},
						{}
					);
					return {
						...currentResizedImages,
						[ parseInt( id, 10 ) ]: sizes,
					};
				},
				{}
			);
		}

		return {
			imageSizes,
			mediaUpload,
			resizedImages,
		};
	} ),
	withNotices,
	withViewportMatch( { isNarrow: '< small' } ),
] )( GalleryEdit );
