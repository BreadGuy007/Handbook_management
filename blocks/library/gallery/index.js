/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import { registerBlockType, source } from '../../api';
import { default as GalleryBlock, defaultColumnsNumber } from './block';

const { query, attr } = source;

registerBlockType( 'core/gallery', {
	title: __( 'Gallery' ),
	icon: 'format-gallery',
	category: 'common',
	keywords: [ __( 'images' ), __( 'photos' ) ],

	attributes: {
		align: {
			type: 'string',
			default: 'none',
		},
		images: {
			type: 'array',
			default: [],
			source: query( 'div.wp-block-gallery figure.blocks-gallery-image img', {
				url: attr( 'src' ),
				alt: attr( 'alt' ),
				id: attr( 'data-id' ),
			} ),
		},
		columns: {
			type: 'number',
		},
		imageCrop: {
			type: 'boolean',
			default: true,
		},
		linkTo: {
			type: 'string',
			default: 'none',
		},
	},

	transforms: {
		from: [
			{
				type: 'shortcode',
				tag: 'gallery',
				content: {
					images: {
						type: 'array',
						default: [],
					},
					columns: {
						type: 'number',
					},
					linkTo: {
						type: 'string',
						default: 'attachment',
					},
				},
				attributes: ( { named } ) => ( {
					linkTo: named.link === 'file' ? 'media' : named.link,
					columns: parseInt( named.columns, 10 ) || 3,
					images: named.ids.split( ',' ).map( ( id ) => ( {
						id: parseInt( id, 10 ),
					} ) ),
				} ),
			},
		],
	},

	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( 'left' === align || 'right' === align || 'wide' === align || 'full' === align ) {
			return { 'data-align': align };
		}
	},

	edit: GalleryBlock,

	save( { attributes } ) {
		const { images, columns = defaultColumnsNumber( attributes ), align, imageCrop, linkTo } = attributes;
		return (
			<div className={ `align${ align } columns-${ columns } ${ imageCrop ? 'is-cropped' : '' }` } >
				{ images.map( ( image ) => {
					let href;

					switch ( linkTo ) {
						case 'media':
							href = image.url;
							break;
						case 'attachment':
							href = image.link;
							break;
					}

					const img = <img src={ image.url } alt={ image.alt } data-id={ image.id } />;

					return (
						<figure key={ image.id || image.url } className="blocks-gallery-image">
							{ href ? <a href={ href }>{ img }</a> : img }
						</figure>
					);
				} ) }
			</div>
		);
	},

} );
