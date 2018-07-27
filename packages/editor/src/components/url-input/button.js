/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { IconButton } from '@wordpress/components';
import deprecated from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import URLInput from './';

class URLInputButton extends Component {
	constructor() {
		super( ...arguments );
		this.toggle = this.toggle.bind( this );
		this.submitLink = this.submitLink.bind( this );
		this.state = {
			expanded: false,
		};
	}

	toggle() {
		this.setState( { expanded: ! this.state.expanded } );
	}

	submitLink( event ) {
		event.preventDefault();
		this.toggle();
	}

	render() {
		const { url, onChange } = this.props;
		const { expanded } = this.state;
		const buttonLabel = url ? __( 'Edit Link' ) : __( 'Insert Link' );

		return (
			<div className="editor-url-input__button">
				<IconButton
					icon="admin-links"
					label={ buttonLabel }
					onClick={ this.toggle }
					className={ classnames( 'components-toolbar__control', {
						'is-active': url,
					} ) }
				/>
				{ expanded &&
					<form
						className="editor-url-input__button-modal"
						onSubmit={ this.submitLink }
					>
						<div className="editor-url-input__button-modal-line">
							<IconButton
								className="editor-url-input__back"
								icon="arrow-left-alt"
								label={ __( 'Close' ) }
								onClick={ this.toggle }
							/>
							<URLInput value={ url || '' } onChange={ onChange } />
							<IconButton
								icon="editor-break"
								label={ __( 'Submit' ) }
								type="submit"
							/>
						</div>
					</form>
				}
			</div>
		);
	}
}

export class UrlInputButton extends URLInputButton {
	constructor() {
		super( ...arguments );

		deprecated( 'wp.editor.UrlInputButton', {
			alternative: 'wp.editor.URLInputButton',
			plugin: 'Gutenberg',
			version: 'v3.4',
			hint: 'The component has been renamed.',
		} );
	}
}

export default URLInputButton;
