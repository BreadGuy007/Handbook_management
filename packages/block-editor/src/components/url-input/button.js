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
		const buttonLabel = url ? __( 'Edit link' ) : __( 'Insert link' );

		return (
			<div className="editor-url-input__button block-editor-url-input__button">
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
						className="editor-url-input__button-modal block-editor-url-input__button-modal"
						onSubmit={ this.submitLink }
					>
						<div className="editor-url-input__button-modal-line block-editor-url-input__button-modal-line">
							<IconButton
								className="editor-url-input__back block-editor-url-input__back"
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

/**
 * @see https://github.com/WordPress/gutenberg/blob/master/packages/block-editor/src/components/url-input/README.md
 */
export default URLInputButton;
