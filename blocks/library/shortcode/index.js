/**
 * External dependencies
 */
import TextareaAutosize from 'react-autosize-textarea';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { withInstanceId, Dashicon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';
import { registerBlockType } from '../../api';
import InspectorControls from '../../inspector-controls';
import BlockDescription from '../../block-description';

registerBlockType( 'core/shortcode', {
	title: __( 'Shortcode' ),

	icon: 'marker',

	category: 'widgets',

	attributes: {
		text: {
			type: 'string',
			source: 'text',
		},
	},

	transforms: {
		from: [
			{
				type: 'shortcode',
				// Per "Shortcode names should be all lowercase and use all
				// letters, but numbers and underscores should work fine too.
				// Be wary of using hyphens (dashes), you'll be better off not
				// using them." in https://codex.wordpress.org/Shortcode_API
				tag: '[a-z0-9_-]+',
				attributes: {
					text: {
						type: 'string',
						shortcode: ( attrs, { content } ) => {
							return content;
						},
					},
				},
			},
		],
	},

	supportHTML: false,

	supports: {
		customClassName: false,
		className: false,
	},

	edit: withInstanceId(
		( { attributes, setAttributes, instanceId, focus } ) => {
			const inputId = `blocks-shortcode-input-${ instanceId }`;

			return (
				<div className="wp-block-shortcode">
					<label htmlFor={ inputId }>
						<Dashicon icon="editor-code" />
						{ __( 'Shortcode' ) }
					</label>
					<TextareaAutosize
						id={ inputId }
						autoComplete="off"
						value={ attributes.text }
						placeholder={ __( 'Write shortcode here…' ) }
						onChange={ ( event ) => setAttributes( {
							text: event.target.value,
						} ) }
					/>
					{ focus &&
						<InspectorControls>
							<BlockDescription>
								<p>{ __( 'A shortcode is a WordPress-specific code snippet that is written between square brackets as [shortcode]. ' ) }</p>
							</BlockDescription>
							<p>{ __( 'No advanced options.' ) }</p>
						</InspectorControls>
					}
				</div>
			);
		}
	),

	save( { attributes } ) {
		return attributes.text;
	},
} );
