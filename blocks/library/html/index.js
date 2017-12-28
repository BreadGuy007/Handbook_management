/**
 * External dependencies
 */
import TextareaAutosize from 'react-autosize-textarea';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { withState } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';
import { registerBlockType } from '../../api';
import BlockControls from '../../block-controls';

registerBlockType( 'core/html', {
	title: __( 'Custom HTML' ),

	description: __( 'Add custom HTML code and preview it right here in the editor.' ),

	icon: 'html',

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

	edit: withState( {
		preview: false,
	} )( ( { attributes, setAttributes, setState, focus, preview } ) => [
		focus && (
			<BlockControls key="controls">
				<div className="components-toolbar">
					<button
						className={ `components-tab-button ${ ! preview ? 'is-active' : '' }` }
						onClick={ () => setState( { preview: false } ) }>
						<span>HTML</span>
					</button>
					<button
						className={ `components-tab-button ${ preview ? 'is-active' : '' }` }
						onClick={ () => setState( { preview: true } ) }>
						<span>{ __( 'Preview' ) }</span>
					</button>
				</div>
			</BlockControls>
		),
		preview ?
			<div
				key="preview"
				dangerouslySetInnerHTML={ { __html: attributes.content } } /> :
			<TextareaAutosize
				className="wp-block-html"
				key="editor"
				value={ attributes.content }
				onChange={ ( event ) => setAttributes( { content: event.target.value } ) }
				aria-label={ __( 'HTML' ) }
			/>,
	] ),

	save( { attributes } ) {
		return attributes.content;
	},
} );
