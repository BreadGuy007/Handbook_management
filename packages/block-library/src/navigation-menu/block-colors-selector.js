/**
 * External dependencies
 */
import classnames from 'classnames';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { IconButton, Dropdown, Toolbar, SVG, Path } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DOWN } from '@wordpress/keycodes';
import { ColorPaletteControl, ContrastChecker } from '@wordpress/block-editor';

const ColorSelectorSVGIcon = () => (
	<SVG xmlns="https://www.w3.org/2000/svg" viewBox="0 0 20 20">
		<Path d="M7.434 5l3.18 9.16H8.538l-.692-2.184H4.628l-.705 2.184H2L5.18 5h2.254zm-1.13 1.904h-.115l-1.148 3.593H7.44L6.304 6.904zM14.348 7.006c1.853 0 2.9.876 2.9 2.374v4.78h-1.79v-.914h-.114c-.362.64-1.123 1.022-2.031 1.022-1.346 0-2.292-.826-2.292-2.108 0-1.27.972-2.006 2.71-2.107l1.696-.102V9.38c0-.584-.42-.914-1.18-.914-.667 0-1.112.228-1.264.647h-1.701c.12-1.295 1.307-2.107 3.066-2.107zm1.079 4.1l-1.416.09c-.793.056-1.18.342-1.18.844 0 .52.45.837 1.091.837.857 0 1.505-.545 1.505-1.256v-.515z" />
	</SVG>
);

/**
 * Color Selector Icon component.
 *
 * @param {Object} colorControlProps colorControl properties.
 * @return {*} React Icon component.
 */
const ColorSelectorIcon = ( { backgroundColor, textColor, backgroundColorValue, textColorValue } ) => {
	const iconStyle = {};

	if ( backgroundColorValue ) {
		iconStyle.backgroundColor = backgroundColorValue;
	}

	if ( textColorValue ) {
		iconStyle.color = textColorValue;
	}

	const iconClasses = classnames( 'block-library-colors-selector__state-selection', {
		'has-background-color': backgroundColor && backgroundColor.color,
		'has-text-color': backgroundColor && backgroundColor.color,
		[ backgroundColor.class ]: backgroundColor && backgroundColor.class,
		[ textColor.class ]: textColor && textColor.class,
	} );

	return (
		<div className="block-library-colors-selector__icon-container">
			<div className={ iconClasses } style={ iconStyle }>
				<ColorSelectorSVGIcon />
			</div>
		</div>
	);
};

/**
 * Renders the Colors Selector Toolbar with the icon button.
 *
 * @param {Object} colorControlProps colorControl properties.
 * @return {*} React toggle button component.
 */
const renderToggleComponent = ( { backgroundColor, textColor, backgroundColorValue, textColorValue } ) => ( { onToggle, isOpen } ) => {
	const openOnArrowDown = ( event ) => {
		if ( ! isOpen && event.keyCode === DOWN ) {
			event.preventDefault();
			event.stopPropagation();
			onToggle();
		}
	};

	return (
		<Toolbar>
			<IconButton
				className="components-icon-button components-toolbar__control block-library-colors-selector__toggle"
				label={ __( 'Open Colors Selector' ) }
				onClick={ onToggle }
				onKeyDown={ openOnArrowDown }
				icon={ <ColorSelectorIcon
					backgroundColor={ backgroundColor }
					textColor={ textColor }
					backgroundColorValue={ backgroundColorValue }
					textColorValue={ textColorValue }
				/> }
			/>
		</Toolbar>
	);
};

const renderContent = ( { backgroundColor, textColor, onColorChange = noop } ) => ( () => {
	const setColor = ( attr ) => ( value ) => onColorChange( { attr, value } );

	return (
		<>
			<div className="color-palette-controller-container">
				<ColorPaletteControl
					value={ backgroundColor.color }
					onChange={ setColor( 'backgroundColor' ) }
					label={ __( 'Background Color' ) }
				/>
			</div>

			<div className="color-palette-controller-container">
				<ColorPaletteControl
					value={ textColor.color }
					onChange={ setColor( 'textColor' ) }
					label={ __( 'Text Color' ) }
				/>
			</div>

			<ContrastChecker
				textColor={ textColor.color }
				backgroundColor={ backgroundColor.color }
				isLargeText={ false }
			/>
		</>
	);
} );

export default ( colorControlProps ) => (
	<Dropdown
		position="bottom right"
		className="block-library-colors-selector"
		contentClassName="block-library-colors-selector__popover"
		renderToggle={ renderToggleComponent( colorControlProps ) }
		renderContent={ renderContent( colorControlProps ) }
	/>
);
