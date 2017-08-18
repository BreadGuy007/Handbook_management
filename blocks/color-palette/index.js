/**
 * External dependencies
 */
import classnames from 'classnames';
import { ChromePicker } from 'react-color';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { Popover } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';
import withEditorSettings from '../with-editor-settings';

class ColorPalette extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			opened: false,
		};
		this.openPicker = this.openPicker.bind( this );
		this.closePicker = this.closePicker.bind( this );
	}

	openPicker() {
		this.setState( { opened: true } );
	}

	closePicker() {
		this.setState( { opened: false } );
	}

	render() {
		const { colors, value, onChange } = this.props;
		return (
			<div className="blocks-color-palette">
				{ colors.map( ( color ) => {
					const style = { color: color };
					const className = classnames( 'blocks-color-palette__item', { 'is-active': value === color } );
					/* Disable reason: aria-current seems like a valid aria-prop and well-suited for this */
					/* eslint-disable jsx-a11y/aria-props */
					return (
						<div key={ color } className="blocks-color-palette__item-wrapper">
							<button
								className={ className }
								style={ style }
								onClick={ () => onChange( value === color ? undefined : color ) }
								aria-label={ __( 'Color: ' ) + color }
								aria-current={ value === color && __( 'Selected color' ) }
							/>
						</div>
					);
					/* eslint-enable jsx-a11y/aria-props */
				} ) }

				<div className="blocks-color-palette__item-wrapper blocks-color-palette__custom-color">
					<button
						className="blocks-color-palette__item"
						onClick={ this.openPicker }
						aria-label={ __( 'Open custom color picker' ) }
					/>
					<Popover
						isOpen={ this.state.opened }
						onClose={ this.closePicker }
						className="blocks-color-palette__picker"
					>
						<ChromePicker
							color={ value }
							onChangeComplete={ ( color ) => {
								onChange( color.hex );
								this.closePicker();
							} }
							style={ { width: '100%' } }
							disableAlpha
						/>
					</Popover>
				</div>

				<div className="blocks-color-palette__item-wrapper blocks-color-palette__clear-color">
					<button className="blocks-color-palette__item" onClick={ () => onChange( undefined ) }>
						<div className="blocks-color-palette__clear-color-line" />
					</button>
				</div>
			</div>
		);
	}
}

export default withEditorSettings(
	( settings ) => ( {
		colors: settings.colors,
	} )
)( ColorPalette );
