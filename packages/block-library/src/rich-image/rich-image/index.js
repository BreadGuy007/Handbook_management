/**
 * External dependencies
 */

import classnames from 'classnames';
import Cropper from 'react-easy-crop';

/**
 * WordPress dependencies
 */

import {
	BlockControls,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';
import { Fragment, Component } from '@wordpress/element';
import {
	ToolbarGroup,
	ToolbarButton,
	__experimentalToolbarItem as ToolbarItem,
	Icon,
	Spinner,
	withNotices,
	RangeControl,
	DropdownMenu,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import richImageRequest from './api';
import {
	RotateLeftIcon,
	RotateRightIcon,
	FlipHorizontalIcon,
	FlipVerticalIcon,
	CropIcon,
	AspectIcon,
} from './icon';

const ROTATE_STEP = 90;
const DEFAULT_CROP = {
	unit: '%',
	x: 25,
	y: 25,
	width: 50,
	height: 50,
};
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;
const POPOVER_PROPS = { position: 'bottom right' };

class RichImage extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			isCrop: false,
			inProgress: null,
			imageSrc: null,
			imageSize: { naturalHeight: 0, naturalWidth: 0 },
			crop: null,
			position: { x: 0, y: 0 },
			zoom: 1,
			aspect: 4 / 3,
			isPortrait: false,
		};

		this.adjustImage = this.adjustImage.bind( this );
		this.cropImage = this.cropImage.bind( this );
	}

	adjustImage( action, attrs ) {
		const { setAttributes, attributes, noticeOperations } = this.props;
		const { id } = attributes;

		this.setState( { inProgress: action } );
		noticeOperations.removeAllNotices();

		richImageRequest( id, action, attrs )
			.then( ( response ) => {
				this.setState( { inProgress: null, isCrop: false } );

				if ( response.mediaID && response.mediaID !== id ) {
					setAttributes( {
						id: response.mediaID,
						url: response.url,
					} );
				}
			} )
			.catch( () => {
				noticeOperations.createErrorNotice(
					__(
						'Unable to perform the image modification. Please check your media storage.'
					)
				);
				this.setState( { inProgress: null, isCrop: false } );
			} );
	}

	cropImage() {
		const { crop } = this.state;

		this.adjustImage( 'crop', {
			cropX: crop.x,
			cropY: crop.y,
			cropWidth: crop.width,
			cropHeight: crop.height,
		} );
	}

	render() {
		const {
			isSelected,
			attributes,
			originalBlock: OriginalBlock,
			noticeUI,
		} = this.props;
		const {
			isCrop,
			inProgress,
			position,
			zoom,
			aspect,
			imageSize,
			isPortrait,
		} = this.state;
		const { url } = attributes;
		const isEditing = ! isCrop && isSelected && url;

		if ( ! isSelected ) {
			return <OriginalBlock { ...this.props } />;
		}

		const classes = classnames( {
			richimage__working: inProgress !== null,
			[ 'richimage__working__' + inProgress ]: inProgress !== null,
		} );

		return (
			<Fragment>
				{ noticeUI }

				<div className={ classes }>
					{ inProgress && (
						<div className="richimage__working-spinner">
							<Spinner />
						</div>
					) }

					{ isCrop ? (
						<Block.div className="richimage__crop-controls">
							<div
								className="richimage__crop-area"
								style={ {
									paddingBottom: `${
										( 100 * imageSize.naturalHeight ) /
										imageSize.naturalWidth
									}%`,
								} }
							>
								<Cropper
									image={ url }
									disabled={ inProgress }
									minZoom={ MIN_ZOOM }
									maxZoom={ MAX_ZOOM }
									crop={ position }
									zoom={ zoom }
									aspect={ isPortrait ? 1 / aspect : aspect }
									onCropChange={ ( newPosition ) => {
										this.setState( {
											position: newPosition,
										} );
									} }
									onCropComplete={ ( newCrop ) => {
										this.setState( { crop: newCrop } );
									} }
									onZoomChange={ ( newZoom ) => {
										this.setState( { zoom: newZoom } );
									} }
									onMediaLoaded={ ( newImageSize ) => {
										this.setState( {
											imageSize: newImageSize,
										} );
									} }
								/>
							</div>
							<RangeControl
								className="richimage__zoom-control"
								label={ __( 'Zoom' ) }
								min={ MIN_ZOOM }
								max={ MAX_ZOOM }
								step={ ZOOM_STEP }
								value={ zoom }
								onChange={ ( newZoom ) => {
									this.setState( { zoom: newZoom } );
								} }
							/>
						</Block.div>
					) : (
						<OriginalBlock
							{ ...this.props }
							className={ classes }
						/>
					) }
				</div>

				{ isEditing && (
					<BlockControls>
						<ToolbarGroup>
							<ToolbarItem>
								{ ( toggleProps ) => (
									<DropdownMenu
										icon={ <RotateLeftIcon /> }
										label={ __( 'Rotate' ) }
										popoverProps={ POPOVER_PROPS }
										toggleProps={ toggleProps }
										controls={ [
											{
												icon: <RotateLeftIcon />,
												title: __( 'Rotate left' ),
												isDisabled: inProgress,
												onClick: () =>
													this.adjustImage(
														'rotate',
														{
															angle: -ROTATE_STEP,
														}
													),
											},
											{
												icon: <RotateRightIcon />,
												title: __( 'Rotate right' ),
												isDisabled: inProgress,
												onClick: () =>
													this.adjustImage(
														'rotate',
														{
															angle: ROTATE_STEP,
														}
													),
											},
										] }
									/>
								) }
							</ToolbarItem>
							<ToolbarItem>
								{ ( toggleProps ) => (
									<DropdownMenu
										icon={ <FlipVerticalIcon /> }
										label={ __( 'Flip' ) }
										popoverProps={ POPOVER_PROPS }
										toggleProps={ toggleProps }
										controls={ [
											{
												icon: <FlipVerticalIcon />,
												title: __( 'Flip vertical' ),
												isDisabled: inProgress,
												onClick: () =>
													this.adjustImage( 'flip', {
														direction: 'vertical',
													} ),
											},
											{
												icon: <FlipHorizontalIcon />,
												title: __( 'Flip horizontal' ),
												isDisabled: inProgress,
												onClick: () =>
													this.adjustImage( 'flip', {
														direction: 'horizontal',
													} ),
											},
										] }
									/>
								) }
							</ToolbarItem>
							<ToolbarButton
								disabled={ inProgress }
								icon={ <CropIcon /> }
								label={ __( 'Crop' ) }
								onClick={ () =>
									this.setState( {
										isCrop: ! isCrop,
										crop: DEFAULT_CROP,
									} )
								}
							/>
						</ToolbarGroup>
					</BlockControls>
				) }

				{ isCrop && (
					<BlockControls>
						<ToolbarGroup>
							<div className="richimage__crop-icon">
								<Icon icon={ CropIcon } />
							</div>
						</ToolbarGroup>
						<ToolbarGroup>
							<ToolbarItem>
								{ ( toggleProps ) => (
									<DropdownMenu
										icon={ <AspectIcon /> }
										label={ __( 'Aspect Ratio' ) }
										popoverProps={ POPOVER_PROPS }
										toggleProps={ toggleProps }
										controls={ [
											{
												title: __( '16:10' ),
												isDisabled: inProgress,
												onClick: () =>
													this.setState( {
														aspect: 16 / 10,
													} ),
											},
											{
												title: __( '16:9' ),
												isDisabled: inProgress,
												onClick: () =>
													this.setState( {
														aspect: 16 / 9,
													} ),
											},
											{
												title: __( '4:3' ),
												isDisabled: inProgress,
												onClick: () =>
													this.setState( {
														aspect: 4 / 3,
													} ),
											},
											{
												title: __( '3:2' ),
												isDisabled: inProgress,
												onClick: () =>
													this.setState( {
														aspect: 3 / 2,
													} ),
											},
											{
												title: __( '1:1' ),
												isDisabled: inProgress,
												onClick: () =>
													this.setState( {
														aspect: 1,
													} ),
											},
										] }
									/>
								) }
							</ToolbarItem>
							<ToolbarButton
								className="richimage-toolbar__dropdown"
								disabled={ inProgress }
								icon="image-rotate-right"
								label={ __( 'Orientation' ) }
								onClick={ () =>
									this.setState( ( prev ) => ( {
										isPortrait: ! prev.isPortrait,
									} ) )
								}
							/>
						</ToolbarGroup>
						<ToolbarGroup>
							<ToolbarButton onClick={ this.cropImage }>
								{ __( 'Apply' ) }
							</ToolbarButton>
							<ToolbarButton
								onClick={ () =>
									this.setState( { isCrop: false } )
								}
							>
								{ __( 'Cancel' ) }
							</ToolbarButton>
						</ToolbarGroup>
					</BlockControls>
				) }
			</Fragment>
		);
	}
}

export default compose( [ withNotices ] )( RichImage );
