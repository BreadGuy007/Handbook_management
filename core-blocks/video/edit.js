/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton, Toolbar } from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import {
	MediaPlaceholder,
	RichText,
	BlockControls,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';

export default class VideoEdit extends Component {
	constructor() {
		super( ...arguments );
		// edit component has its own src in the state so it can be edited
		// without setting the actual value outside of the edit UI
		this.state = {
			editing: ! this.props.attributes.src,
		};
	}

	render() {
		const { caption, src } = this.props.attributes;
		const { setAttributes, isSelected, className } = this.props;
		const { editing } = this.state;
		const switchToEditing = () => {
			this.setState( { editing: true } );
		};
		const onSelectVideo = ( media ) => {
			if ( media && media.url ) {
				// sets the block's attribute and updates the edit component from the
				// selected media, then switches off the editing UI
				setAttributes( { src: media.url, id: media.id } );
				this.setState( { src: media.url, editing: false } );
			}
		};
		const onSelectUrl = ( newSrc ) => {
			// set the block's src from the edit component's state, and switch off the editing UI
			if ( newSrc !== src ) {
				setAttributes( { src: newSrc, id: undefined } );
			}
			this.setState( { editing: false } );
		};

		if ( editing ) {
			return (
				<MediaPlaceholder
					icon="media-video"
					labels={ {
						title: __( 'Video' ),
						name: __( 'a video' ),
					} }
					className={ className }
					onSelect={ onSelectVideo }
					onSelectUrl={ onSelectUrl }
					accept="video/*"
					type="video"
					value={ this.props.attributes }
				/>
			);
		}

		/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
		return (
			<Fragment>
				<BlockControls>
					<Toolbar>
						<IconButton
							className="components-icon-button components-toolbar__control"
							label={ __( 'Edit video' ) }
							onClick={ switchToEditing }
							icon="edit"
						/>
					</Toolbar>
				</BlockControls>
				<figure className={ className }>
					<video controls src={ src } />
					{ ( ( caption && caption.length ) || !! isSelected ) && (
						<RichText
							tagName="figcaption"
							placeholder={ __( 'Write caption…' ) }
							value={ caption }
							onChange={ ( value ) => setAttributes( { caption: value } ) }
							inlineToolbar
						/>
					) }
				</figure>
			</Fragment>
		);
		/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
	}
}
