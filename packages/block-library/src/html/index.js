/**
 * WordPress dependencies
 */
import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Disabled, SandBox, SVG, Path } from '@wordpress/components';
import { getPhrasingContentSchema } from '@wordpress/blocks';
import { BlockControls, PlainText } from '@wordpress/editor';
import { withState } from '@wordpress/compose';

export const name = 'core/html';

export const settings = {
	title: __( 'Custom HTML' ),

	description: __( 'Add your own HTML (and view it right here as you edit!).' ),

	icon: <SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><Path d="M4.5,11h-2V9H1v6h1.5v-2.5h2V15H6V9H4.5V11z M7,10.5h1.5V15H10v-4.5h1.5V9H7V10.5z M14.5,10l-1-1H12v6h1.5v-3.9  l1,1l1-1V15H17V9h-1.5L14.5,10z M19.5,13.5V9H18v6h5v-1.5H19.5z" /></SVG>,

	category: 'formatting',

	keywords: [ __( 'embed' ) ],

	supports: {
		customClassName: false,
		className: false,
		html: false,
	},

	attributes: {
		content: {
			type: 'string',
			source: 'html',
		},
	},

	transforms: {
		from: [
			{
				type: 'raw',
				isMatch: ( node ) => node.nodeName === 'FIGURE' && !! node.querySelector( 'iframe' ),
				schema: {
					figure: {
						require: [ 'iframe' ],
						children: {
							iframe: {
								attributes: [ 'src', 'allowfullscreen', 'height', 'width' ],
							},
							figcaption: {
								children: getPhrasingContentSchema(),
							},
						},
					},
				},
			},
		],
	},

	edit: withState( {
		isPreview: false,
	} )( ( { attributes, setAttributes, setState, isPreview } ) => (
		<div className="wp-block-html">
			<BlockControls>
				<div className="components-toolbar">
					<button
						className={ `components-tab-button ${ ! isPreview ? 'is-active' : '' }` }
						onClick={ () => setState( { isPreview: false } ) }
					>
						<span>HTML</span>
					</button>
					<button
						className={ `components-tab-button ${ isPreview ? 'is-active' : '' }` }
						onClick={ () => setState( { isPreview: true } ) }
					>
						<span>{ __( 'Preview' ) }</span>
					</button>
				</div>
			</BlockControls>
			<Disabled.Consumer>
				{ ( isDisabled ) => (
					( isPreview || isDisabled ) ? (
						<SandBox html={ attributes.content } />
					) : (
						<PlainText
							value={ attributes.content }
							onChange={ ( content ) => setAttributes( { content } ) }
							placeholder={ __( 'Write HTML…' ) }
							aria-label={ __( 'HTML' ) }
						/>
					)
				) }
			</Disabled.Consumer>
		</div>
	) ),

	save( { attributes } ) {
		return <RawHTML>{ attributes.content }</RawHTML>;
	},
};
