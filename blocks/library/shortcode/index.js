/**
 * WordPress dependencies
 */
import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { withInstanceId, Dashicon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';
import PlainText from '../../plain-text';

export const name = 'core/shortcode';

export const settings = {
	title: __( 'Shortcode' ),

	description: __( 'A shortcode is a WordPress-specific code snippet that is written between square brackets as [shortcode]. ' ),

	icon: 'shortcode',

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
				// Require that the first character be a letter. This notably
				// prevents footnote markings ([1]) from being caught as
				// shortcodes.
				tag: '[a-z][a-z0-9_-]*',
				attributes: {
					text: {
						type: 'string',
						shortcode: ( attrs, { content } ) => {
							return content;
						},
					},
				},
				priority: 20,
			},
		],
	},

	supports: {
		customClassName: false,
		className: false,
		html: false,
	},

	edit: withInstanceId(
		( { attributes, setAttributes, instanceId } ) => {
			const inputId = `blocks-shortcode-input-${ instanceId }`;

			return (
				<div className="wp-block-shortcode">
					<label htmlFor={ inputId }>
						<Dashicon icon="shortcode" />
						{ __( 'Shortcode' ) }
					</label>
					<PlainText
						className="input-control"
						id={ inputId }
						value={ attributes.text }
						placeholder={ __( 'Write shortcode here…' ) }
						onChange={ ( text ) => setAttributes( { text } ) }
					/>
				</div>
			);
		}
	),

	save( { attributes } ) {
		return <RawHTML>{ attributes.text }</RawHTML>;
	},
};
