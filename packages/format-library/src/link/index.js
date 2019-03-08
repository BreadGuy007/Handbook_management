/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { withSpokenMessages } from '@wordpress/components';
import {
	getTextContent,
	applyFormat,
	removeFormat,
	slice,
} from '@wordpress/rich-text';
import { isURL } from '@wordpress/url';
import { RichTextToolbarButton, RichTextShortcut } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import InlineLinkUI from './inline';

const name = 'core/link';

export const link = {
	name,
	title: __( 'Link' ),
	tagName: 'a',
	className: null,
	attributes: {
		url: 'href',
		target: 'target',
	},
	edit: withSpokenMessages( class LinkEdit extends Component {
		constructor() {
			super( ...arguments );

			this.addLink = this.addLink.bind( this );
			this.stopAddingLink = this.stopAddingLink.bind( this );
			this.onRemoveFormat = this.onRemoveFormat.bind( this );
			this.state = {
				addingLink: false,
			};
		}

		addLink() {
			const { value, onChange } = this.props;
			const text = getTextContent( slice( value ) );

			if ( text && isURL( text ) ) {
				onChange( applyFormat( value, { type: name, attributes: { url: text } } ) );
			} else {
				this.setState( { addingLink: true } );
			}
		}

		stopAddingLink() {
			this.setState( { addingLink: false } );
		}

		onRemoveFormat() {
			const { value, onChange, speak } = this.props;

			onChange( removeFormat( value, name ) );
			speak( __( 'Link removed.' ), 'assertive' );
		}

		render() {
			const { isActive, activeAttributes, value, onChange } = this.props;

			return (
				<Fragment>
					<RichTextShortcut
						type="access"
						character="a"
						onUse={ this.addLink }
					/>
					<RichTextShortcut
						type="access"
						character="s"
						onUse={ this.onRemoveFormat }
					/>
					<RichTextShortcut
						type="primary"
						character="k"
						onUse={ this.addLink }
					/>
					<RichTextShortcut
						type="primaryShift"
						character="k"
						onUse={ this.onRemoveFormat }
					/>
					{ isActive && <RichTextToolbarButton
						name="link"
						icon="editor-unlink"
						title={ __( 'Unlink' ) }
						onClick={ this.onRemoveFormat }
						isActive={ isActive }
						shortcutType="primaryShift"
						shortcutCharacter="k"
					/> }
					{ ! isActive && <RichTextToolbarButton
						name="link"
						icon="admin-links"
						title={ __( 'Link' ) }
						onClick={ this.addLink }
						isActive={ isActive }
						shortcutType="primary"
						shortcutCharacter="k"
					/> }
					<InlineLinkUI
						addingLink={ this.state.addingLink }
						stopAddingLink={ this.stopAddingLink }
						isActive={ isActive }
						activeAttributes={ activeAttributes }
						value={ value }
						onChange={ onChange }
					/>
				</Fragment>
			);
		}
	} ),
};
