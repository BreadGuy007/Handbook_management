/**
 * External dependencies
 */
import { has, get, startsWith } from 'lodash';

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import {
	hasBlockSupport,
	__EXPERIMENTAL_STYLE_PROPERTY as STYLE_PROPERTY,
} from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { COLOR_SUPPORT_KEY, ColorEdit } from './color';
import { TypographyPanel, TYPOGRAPHY_SUPPORT_KEYS } from './typography';
import { PADDING_SUPPORT_KEY, PaddingEdit } from './padding';
import SpacingPanelControl from '../components/spacing-panel-control';

const styleSupportKeys = [
	...TYPOGRAPHY_SUPPORT_KEYS,
	COLOR_SUPPORT_KEY,
	PADDING_SUPPORT_KEY,
];

const hasStyleSupport = ( blockType ) =>
	styleSupportKeys.some( ( key ) => hasBlockSupport( blockType, key ) );

const VARIABLE_REFERENCE_PREFIX = 'var:';
const VARIABLE_PATH_SEPARATOR_TOKEN_ATTRIBUTE = '|';
const VARIABLE_PATH_SEPARATOR_TOKEN_STYLE = '--';
function compileStyleValue( uncompiledValue ) {
	if ( startsWith( uncompiledValue, VARIABLE_REFERENCE_PREFIX ) ) {
		const variable = uncompiledValue
			.slice( VARIABLE_REFERENCE_PREFIX.length )
			.split( VARIABLE_PATH_SEPARATOR_TOKEN_ATTRIBUTE )
			.join( VARIABLE_PATH_SEPARATOR_TOKEN_STYLE );
		return `var(--wp--${ variable })`;
	}
	return uncompiledValue;
}

/**
 * Returns the inline styles to add depending on the style object
 *
 * @param  {Object} styles Styles configuration
 * @return {Object}        Flattened CSS variables declaration
 */
export function getInlineStyles( styles = {} ) {
	const output = {};
	Object.entries( STYLE_PROPERTY ).forEach(
		( [ styleKey, ...otherObjectKeys ] ) => {
			const [ objectKeys ] = otherObjectKeys;

			if ( has( styles, objectKeys ) ) {
				output[ styleKey ] = compileStyleValue(
					get( styles, objectKeys )
				);
			}
		}
	);

	return output;
}

/**
 * Filters registered block settings, extending attributes to include `style` attribute.
 *
 * @param  {Object} settings Original block settings
 * @return {Object}          Filtered block settings
 */
function addAttribute( settings ) {
	if ( ! hasStyleSupport( settings ) ) {
		return settings;
	}

	// allow blocks to specify their own attribute definition with default values if needed.
	if ( ! settings.attributes.style ) {
		Object.assign( settings.attributes, {
			style: {
				type: 'object',
			},
		} );
	}

	return settings;
}

/**
 * Override props assigned to save component to inject the CSS variables definition.
 *
 * @param  {Object} props      Additional props applied to save element
 * @param  {Object} blockType  Block type
 * @param  {Object} attributes Block attributes
 * @return {Object}            Filtered props applied to save element
 */
export function addSaveProps( props, blockType, attributes ) {
	if ( ! hasStyleSupport( blockType ) ) {
		return props;
	}

	const { style } = attributes;
	props.style = {
		...getInlineStyles( style ),
		...props.style,
	};

	return props;
}

/**
 * Filters registered block settings to extand the block edit wrapper
 * to apply the desired styles and classnames properly.
 *
 * @param  {Object} settings Original block settings
 * @return {Object}          Filtered block settings
 */
export function addEditProps( settings ) {
	if ( ! hasStyleSupport( settings ) ) {
		return settings;
	}

	const existingGetEditWrapperProps = settings.getEditWrapperProps;
	settings.getEditWrapperProps = ( attributes ) => {
		let props = {};
		if ( existingGetEditWrapperProps ) {
			props = existingGetEditWrapperProps( attributes );
		}

		return addSaveProps( props, settings, attributes );
	};

	return settings;
}

/**
 * Override the default edit UI to include new inspector controls for
 * all the custom styles configs.
 *
 * @param  {Function} BlockEdit Original component
 * @return {Function}           Wrapped component
 */
export const withBlockControls = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name: blockName } = props;

		const hasPaddingSupport = hasBlockSupport(
			blockName,
			PADDING_SUPPORT_KEY
		);

		return [
			<TypographyPanel key="typography" { ...props } />,
			<ColorEdit key="colors" { ...props } />,
			<BlockEdit key="edit" { ...props } />,
			hasPaddingSupport && (
				<SpacingPanelControl key="spacing">
					<PaddingEdit { ...props } />
				</SpacingPanelControl>
			),
		];
	},
	'withToolbarControls'
);

addFilter(
	'blocks.registerBlockType',
	'core/style/addAttribute',
	addAttribute
);

addFilter(
	'blocks.getSaveContent.extraProps',
	'core/style/addSaveProps',
	addSaveProps
);

addFilter(
	'blocks.registerBlockType',
	'core/style/addEditProps',
	addEditProps
);

addFilter(
	'editor.BlockEdit',
	'core/style/with-block-controls',
	withBlockControls
);
