/**
 * External dependencies
 */
import { noop, omit } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { forwardRef, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	inputControlActionTypes,
	composeStateReducers,
} from '../input-control/state';
import { Root, ValueInput } from './styles/unit-control-styles';
import UnitSelectControl from './unit-select-control';
import { CSS_UNITS, getParsedValue, getValidParsedUnit } from './utils';
import { useControlledState } from '../utils/hooks';

function UnitControl(
	{
		__unstableStateReducer: stateReducer = ( state ) => state,
		autoComplete = 'off',
		className,
		disabled = false,
		disableUnits = false,
		isPressEnterToChange = false,
		isResetValueOnUnitChange = false,
		isUnitSelectTabbable = true,
		label,
		onChange = noop,
		onUnitChange = noop,
		size = 'default',
		style,
		unit: unitProp,
		units = CSS_UNITS,
		value: valueProp,
		...props
	},
	ref
) {
	const [ value, initialUnit ] = getParsedValue( valueProp, unitProp, units );
	const [ unit, setUnit ] = useControlledState( unitProp, {
		initial: initialUnit,
	} );

	/*
	 * Storing parsed unit changes to be applied during the onChange callback
	 * cycle.
	 */
	const nextParsedUnitRef = useRef();

	const classes = classnames( 'components-unit-control', className );

	const handleOnChange = ( next, changeProps ) => {
		if ( next === '' ) {
			onChange( '', changeProps );
			return;
		}

		/*
		 * Customizing the onChange callback.
		 * This allows as to broadcast a combined value+unit to onChange.
		 */
		const [ parsedValue, parsedUnit ] = getValidParsedUnit(
			next,
			units,
			value,
			unit
		);
		const nextParsedUnit = nextParsedUnitRef.current;

		/*
		 * If we've noticed a (parsed) unit change, which would have been
		 * stored in nextParsedUnitRef, we'll update our local unit set,
		 * as well as fire the onUnitChange callback.
		 */
		if ( nextParsedUnit ) {
			onUnitChange( nextParsedUnit, changeProps );
			setUnit( nextParsedUnit );
			// We have to reset this ref value to properly track new changes.
			nextParsedUnitRef.current = null;
		}

		const nextUnit = nextParsedUnit || parsedUnit;
		const nextValue = `${ parsedValue }${ nextUnit }`;

		onChange( nextValue, changeProps );
	};

	const handleOnUnitChange = ( next, changeProps ) => {
		const { data } = changeProps;

		let nextValue = `${ value }${ next }`;

		if ( isResetValueOnUnitChange && data?.default !== undefined ) {
			nextValue = `${ data.default }${ next }`;
		}

		onChange( nextValue, changeProps );
		onUnitChange( next, changeProps );

		setUnit( next );
	};

	/**
	 * "Middleware" function that intercepts updates from InputControl.
	 * This allows us to tap into actions to transform the (next) state for
	 * InputControl.
	 *
	 * @param {Object} state State from InputControl
	 * @param {Object} action Action triggering state change
	 * @return {Object} The updated state to apply to InputControl
	 */
	const unitControlStateReducer = ( state, action ) => {
		const { type, payload } = action;
		const event = payload?.event;

		/*
		 * Customizes the commit interaction.
		 *
		 * This occurs when pressing ENTER to fire a change.
		 * By intercepting the state change, we can parse the incoming
		 * value to determine if the unit needs to be updated.
		 */
		if ( type === inputControlActionTypes.COMMIT ) {
			const valueToParse = event?.target?.value;

			const [ parsedValue, parsedUnit ] = getValidParsedUnit(
				valueToParse,
				units,
				value,
				unit
			);

			state.value = parsedValue;

			// Update unit if the incoming parsed unit is different.
			if ( unit !== parsedUnit ) {
				/*
				 * We start by storing the next parsedUnit value in our
				 * nextParsedUnitRef. We can't set the unit during this
				 * stateReducer callback as it cause state update
				 * conflicts within React's render cycle.
				 *
				 * https://github.com/facebook/react/issues/18178
				 */
				nextParsedUnitRef.current = parsedUnit;
			}
		}

		return state;
	};

	const inputSuffix = ! disableUnits ? (
		<UnitSelectControl
			disabled={ disabled }
			isTabbable={ isUnitSelectTabbable }
			options={ units }
			onChange={ handleOnUnitChange }
			size={ size }
			value={ unit }
		/>
	) : null;

	return (
		<Root className="components-unit-control-wrapper" style={ style }>
			<ValueInput
				aria-label={ label }
				type={ isPressEnterToChange ? 'text' : 'number' }
				{ ...omit( props, [ 'children' ] ) }
				autoComplete={ autoComplete }
				className={ classes }
				disabled={ disabled }
				disableUnits={ disableUnits }
				isPressEnterToChange={ isPressEnterToChange }
				label={ label }
				onChange={ handleOnChange }
				ref={ ref }
				size={ size }
				suffix={ inputSuffix }
				value={ value }
				__unstableStateReducer={ composeStateReducers(
					unitControlStateReducer,
					stateReducer
				) }
			/>
		</Root>
	);
}

const ForwardedUnitControl = forwardRef( UnitControl );

export default ForwardedUnitControl;
