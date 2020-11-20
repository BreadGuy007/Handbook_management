/**
 * External dependencies
 */
import {
	Text,
	View,
	TouchableWithoutFeedback,
	Platform,
	findNodeHandle,
} from 'react-native';

/**
 * Internal dependencies
 */
import RangeCell from '../mobile/bottom-sheet/range-cell';
import StepperCell from '../mobile/bottom-sheet/stepper-cell';
import Picker from '../mobile/picker';
import styles from './style.scss';
import { CSS_UNITS } from './utils';
/**
 * WordPress dependencies
 */
import { useRef } from '@wordpress/element';
import { withPreferredColorScheme } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';

function UnitControl( {
	currentInput,
	label,
	value,
	onChange,
	onUnitChange,
	initialPosition,
	min,
	max,
	separatorType,
	units = CSS_UNITS,
	unit,
	getStylesFromColorScheme,
	decimalNum,
	...props
} ) {
	const pickerRef = useRef();
	const anchorNodeRef = useRef();

	function onPickerPresent() {
		if ( pickerRef?.current ) {
			pickerRef.current.presentPicker();
		}
	}

	const currentInputValue = currentInput === null ? value : currentInput;
	const initialControlValue = isFinite( currentInputValue )
		? currentInputValue
		: initialPosition;

	const unitButtonTextStyle = getStylesFromColorScheme(
		styles.unitButtonText,
		styles.unitButtonTextDark
	);

	const renderUnitButton = () => {
		const accessibilityHint =
			Platform.OS === 'ios'
				? __( 'Double tap to open Action Sheet with available options' )
				: __(
						'Double tap to open Bottom Sheet with available options'
				  );

		/* translators: accessibility text. Inform about current unit value. %s: Current unit value. */
		const accessibilityLabel = sprintf( __( 'Current unit is %s' ), unit );

		return (
			<TouchableWithoutFeedback
				onPress={ onPickerPresent }
				accessibilityLabel={ accessibilityLabel }
				accessibilityRole="button"
				accessibilityHint={ accessibilityHint }
			>
				<View style={ styles.unitButton }>
					<Text style={ unitButtonTextStyle }>{ unit }</Text>
				</View>
			</TouchableWithoutFeedback>
		);
	};

	const getAnchor = () =>
		anchorNodeRef?.current
			? findNodeHandle( anchorNodeRef?.current )
			: undefined;

	const renderUnitPicker = () => {
		return (
			<View style={ styles.unitMenu } ref={ anchorNodeRef }>
				{ renderUnitButton() }
				<Picker
					ref={ pickerRef }
					options={ units }
					onChange={ onUnitChange }
					hideCancelButton
					leftAlign
					getAnchor={ getAnchor }
				/>
			</View>
		);
	};

	return (
		<>
			{ unit !== '%' ? (
				<StepperCell
					label={ label }
					max={ max }
					min={ min }
					onChange={ onChange }
					separatorType={ separatorType }
					value={ value }
					defaultValue={ initialControlValue }
					shouldDisplayTextInput
					decimalNum={ unit === 'px' ? 0 : decimalNum }
					{ ...props }
				>
					{ renderUnitPicker() }
				</StepperCell>
			) : (
				<RangeCell
					label={ label }
					onChange={ onChange }
					minimumValue={ min }
					maximumValue={ max }
					value={ value }
					defaultValue={ initialControlValue }
					separatorType={ separatorType }
					decimalNum={ decimalNum }
					{ ...props }
				>
					{ renderUnitPicker() }
				</RangeCell>
			) }
		</>
	);
}

export default withPreferredColorScheme( UnitControl );
