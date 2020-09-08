/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Platform } from '@wordpress/element';
import { hasBlockSupport } from '@wordpress/blocks';
import { __experimentalBoxControl as BoxControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { cleanEmptyObject } from './utils';
import { useCustomUnits } from '../components/unit-control';

export const PADDING_SUPPORT_KEY = '__experimentalPadding';

/**
 * Inspector control panel containing the line height related configuration
 *
 * @param {Object} props
 *
 * @return {WPElement} Line height edit element.
 */
export function PaddingEdit( props ) {
	const {
		name: blockName,
		attributes: { style },
		setAttributes,
	} = props;

	const units = useCustomUnits();

	if ( ! hasBlockSupport( blockName, PADDING_SUPPORT_KEY ) ) {
		return null;
	}

	const onChange = ( next ) => {
		const newStyle = {
			...style,
			spacing: {
				padding: next,
			},
		};

		setAttributes( {
			style: cleanEmptyObject( newStyle ),
		} );
	};

	const onChangeShowVisualizer = ( next ) => {
		const newStyle = {
			...style,
			visualizers: {
				padding: next,
			},
		};

		setAttributes( {
			style: cleanEmptyObject( newStyle ),
		} );
	};

	return Platform.select( {
		web: (
			<>
				<BoxControl
					values={ style?.spacing?.padding }
					onChange={ onChange }
					onChangeShowVisualizer={ onChangeShowVisualizer }
					label={ __( 'Padding' ) }
					units={ units }
				/>
			</>
		),
		native: null,
	} );
}
