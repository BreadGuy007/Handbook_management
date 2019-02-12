/**
 * External dependencies
 */
import { TouchableOpacity, Text, View, TextInput, I18nManager } from 'react-native';

/**
 * WordPress dependencies
 */
import { Dashicon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import styles from './styles.scss';

export default function Cell( props ) {
	const {
		onPress,
		label,
		value,
		valuePlaceholder = '',
		drawSeparator = true,
		icon,
		labelStyle = {},
		valueStyle = {},
		onChangeValue,
		children,
		editable = true,
		...valueProps
	} = props;

	const showValue = value !== undefined;
	const isValueEditable = editable && onChangeValue !== undefined;
	const defaultLabelStyle = showValue ? styles.cellLabel : styles.cellLabelCentered;
	const separatorStyle = showValue ? styles.cellSeparator : styles.separator;
	let valueTextInput;

	const onCellPress = () => {
		if ( isValueEditable ) {
			valueTextInput.focus();
		} else if ( onPress !== undefined ) {
			onPress();
		}
	};

	const getValueComponent = () => {
		const styleRTL = I18nManager.isRTL && styles.cellValueRTL;
		const style = { ...styles.cellValue, ...valueStyle, ...styleRTL };

		return isValueEditable ? (
			<TextInput
				ref={ ( c ) => valueTextInput = c }
				numberOfLines={ 1 }
				style={ style }
				value={ value }
				placeholder={ valuePlaceholder }
				placeholderTextColor={ '#87a6bc' }
				onChangeText={ onChangeValue }
				editable={ isValueEditable }
				{ ...valueProps }
			/>
		) : (
			<Text style={ { ...styles.cellValue, ...valueStyle } }>
				{ value }
			</Text>
		);
	};

	return (
		<TouchableOpacity onPress={ onCellPress } >
			<View style={ styles.cellContainer }>
				<View style={ styles.cellRowContainer }>
					{ icon && (
						<View style={ styles.cellRowContainer }>
							<Dashicon icon={ icon } size={ 24 } />
							<View style={ { width: 12 } } />
						</View>
					) }
					<Text numberOfLines={ 1 } style={ { ...defaultLabelStyle, ...labelStyle } }>
						{ label }
					</Text>
				</View>
				{ showValue && getValueComponent() }
				{ children }
			</View>
			{ drawSeparator && (
				<View style={ separatorStyle } />
			) }
		</TouchableOpacity>
	);
}
