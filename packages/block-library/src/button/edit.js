/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useCallback, useState } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import {
	KeyboardShortcuts,
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
	withFallbackStyles,
	ToolbarButton,
	ToolbarGroup,
	Popover,
} from '@wordpress/components';
import {
	BlockControls,
	__experimentalUseGradient,
	ContrastChecker,
	InspectorControls,
	__experimentalPanelColorGradientSettings as PanelColorGradientSettings,
	RichText,
	withColors,
	__experimentalLinkControl as LinkControl,
} from '@wordpress/block-editor';
import { rawShortcut, displayShortcut } from '@wordpress/keycodes';
import { link } from '@wordpress/icons';

const { getComputedStyle } = window;

const applyFallbackStyles = withFallbackStyles( ( node, ownProps ) => {
	const { textColor, backgroundColor } = ownProps;
	const backgroundColorValue = backgroundColor && backgroundColor.color;
	const textColorValue = textColor && textColor.color;
	//avoid the use of querySelector if textColor color is known and verify if node is available.
	const textNode =
		! textColorValue && node
			? node.querySelector( '[contenteditable="true"]' )
			: null;
	return {
		fallbackBackgroundColor:
			backgroundColorValue || ! node
				? undefined
				: getComputedStyle( node ).backgroundColor,
		fallbackTextColor:
			textColorValue || ! textNode
				? undefined
				: getComputedStyle( textNode ).color,
	};
} );

const NEW_TAB_REL = 'noreferrer noopener';
const MIN_BORDER_RADIUS_VALUE = 0;
const MAX_BORDER_RADIUS_VALUE = 50;
const INITIAL_BORDER_RADIUS_POSITION = 5;

function BorderPanel( { borderRadius = '', setAttributes } ) {
	const setBorderRadius = useCallback(
		( newBorderRadius ) => {
			setAttributes( { borderRadius: newBorderRadius } );
		},
		[ setAttributes ]
	);
	return (
		<PanelBody title={ __( 'Border settings' ) }>
			<RangeControl
				value={ borderRadius }
				label={ __( 'Border radius' ) }
				min={ MIN_BORDER_RADIUS_VALUE }
				max={ MAX_BORDER_RADIUS_VALUE }
				initialPosition={ INITIAL_BORDER_RADIUS_POSITION }
				allowReset
				onChange={ setBorderRadius }
			/>
		</PanelBody>
	);
}

function URLPicker( {
	isSelected,
	url,
	setAttributes,
	opensInNewTab,
	onToggleOpenInNewTab,
} ) {
	const [ isURLPickerOpen, setIsURLPickerOpen ] = useState( false );
	const openLinkControl = () => {
		setIsURLPickerOpen( true );
	};
	const linkControl = isURLPickerOpen && (
		<Popover
			position="bottom center"
			onClose={ () => setIsURLPickerOpen( false ) }
		>
			<LinkControl
				className="wp-block-navigation-link__inline-link-input"
				value={ { url, opensInNewTab } }
				onChange={ ( {
					url: newURL = '',
					opensInNewTab: newOpensInNewTab,
				} ) => {
					setAttributes( { url: newURL } );

					if ( opensInNewTab !== newOpensInNewTab ) {
						onToggleOpenInNewTab( newOpensInNewTab );
					}
				} }
			/>
		</Popover>
	);
	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						name="link"
						icon={ link }
						title={ __( 'Link' ) }
						shortcut={ displayShortcut.primary( 'k' ) }
						onClick={ openLinkControl }
					/>
				</ToolbarGroup>
			</BlockControls>
			{ isSelected && (
				<KeyboardShortcuts
					bindGlobal
					shortcuts={ {
						[ rawShortcut.primary( 'k' ) ]: openLinkControl,
					} }
				/>
			) }
			{ linkControl }
		</>
	);
}

function ButtonEdit( {
	attributes,
	backgroundColor,
	textColor,
	setBackgroundColor,
	setTextColor,
	fallbackBackgroundColor,
	fallbackTextColor,
	setAttributes,
	className,
	isSelected,
} ) {
	const {
		borderRadius,
		linkTarget,
		placeholder,
		rel,
		text,
		url,
	} = attributes;
	const onSetLinkRel = useCallback(
		( value ) => {
			setAttributes( { rel: value } );
		},
		[ setAttributes ]
	);

	const onToggleOpenInNewTab = useCallback(
		( value ) => {
			const newLinkTarget = value ? '_blank' : undefined;

			let updatedRel = rel;
			if ( newLinkTarget && ! rel ) {
				updatedRel = NEW_TAB_REL;
			} else if ( ! newLinkTarget && rel === NEW_TAB_REL ) {
				updatedRel = undefined;
			}

			setAttributes( {
				linkTarget: newLinkTarget,
				rel: updatedRel,
			} );
		},
		[ rel, setAttributes ]
	);
	const {
		gradientClass,
		gradientValue,
		setGradient,
	} = __experimentalUseGradient();

	return (
		<div className={ className }>
			<RichText
				placeholder={ placeholder || __( 'Add text…' ) }
				value={ text }
				onChange={ ( value ) => setAttributes( { text: value } ) }
				withoutInteractiveFormatting
				className={ classnames( 'wp-block-button__link', {
					'has-background': backgroundColor.color || gradientValue,
					[ backgroundColor.class ]:
						! gradientValue && backgroundColor.class,
					'has-text-color': textColor.color,
					[ textColor.class ]: textColor.class,
					[ gradientClass ]: gradientClass,
					'no-border-radius': borderRadius === 0,
				} ) }
				style={ {
					...( ! backgroundColor.color && gradientValue
						? { background: gradientValue }
						: { backgroundColor: backgroundColor.color } ),
					color: textColor.color,
					borderRadius: borderRadius
						? borderRadius + 'px'
						: undefined,
				} }
			/>
			<URLPicker
				url={ url }
				setAttributes={ setAttributes }
				isSelected={ isSelected }
				opensInNewTab={ linkTarget === '_blank' }
				onToggleOpenInNewTab={ onToggleOpenInNewTab }
			/>
			<InspectorControls>
				<PanelColorGradientSettings
					title={ __( 'Background & Text Color' ) }
					settings={ [
						{
							colorValue: textColor.color,
							onColorChange: setTextColor,
							label: __( 'Text color' ),
						},
						{
							colorValue: backgroundColor.color,
							onColorChange: setBackgroundColor,
							gradientValue,
							onGradientChange: setGradient,
							label: __( 'Background' ),
						},
					] }
				>
					<ContrastChecker
						{ ...{
							// Text is considered large if font size is greater or equal to 18pt or 24px,
							// currently that's not the case for button.
							isLargeText: false,
							textColor: textColor.color,
							backgroundColor: backgroundColor.color,
							fallbackBackgroundColor,
							fallbackTextColor,
						} }
					/>
				</PanelColorGradientSettings>
				<BorderPanel
					borderRadius={ borderRadius }
					setAttributes={ setAttributes }
				/>
				<PanelBody title={ __( 'Link settings' ) }>
					<ToggleControl
						label={ __( 'Open in new tab' ) }
						onChange={ onToggleOpenInNewTab }
						checked={ linkTarget === '_blank' }
					/>
					<TextControl
						label={ __( 'Link rel' ) }
						value={ rel || '' }
						onChange={ onSetLinkRel }
					/>
				</PanelBody>
			</InspectorControls>
		</div>
	);
}

export default compose( [
	withColors( 'backgroundColor', { textColor: 'color' } ),
	applyFallbackStyles,
] )( ButtonEdit );
