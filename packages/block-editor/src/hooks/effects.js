/**
 * WordPress dependencies
 */
import { hasBlockSupport } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
/**
 * Internal dependencies
 */
import StylesEffectsPanel, {
	useHasEffectsPanel,
} from '../components/global-styles/effects-panel';
import { InspectorControls } from '../components';
import { store as blockEditorStore } from '../store';

export const SHADOW_SUPPORT_KEY = 'shadow';
export const EFFECTS_SUPPORT_KEYS = [ SHADOW_SUPPORT_KEY ];

export function hasEffectsSupport( blockName ) {
	return EFFECTS_SUPPORT_KEYS.some( ( key ) =>
		hasBlockSupport( blockName, key )
	);
}

function EffectsInspectorControl( { children, resetAllFilter } ) {
	return (
		<InspectorControls group="effects" resetAllFilter={ resetAllFilter }>
			{ children }
		</InspectorControls>
	);
}
export function EffectsPanel( { clientId, setAttributes, settings } ) {
	const isEnabled = useHasEffectsPanel( settings );
	const blockAttributes = useSelect(
		( select ) => select( blockEditorStore ).getBlockAttributes( clientId ),
		[ clientId ]
	);
	const shadow = blockAttributes?.style?.shadow;
	const value = { shadow };

	const onChange = ( newValue ) => {
		setAttributes( {
			style: { ...blockAttributes.style, shadow: newValue.shadow },
		} );
	};

	if ( ! isEnabled ) {
		return null;
	}

	return (
		<StylesEffectsPanel
			as={ EffectsInspectorControl }
			panelId={ clientId }
			settings={ settings }
			value={ value }
			onChange={ onChange }
		/>
	);
}
