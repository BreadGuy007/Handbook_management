/**
 * External dependencies
 */
import classnames from 'classnames';
import { clamp, isFinite, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useRef, useState, forwardRef } from '@wordpress/element';
import { compose, withInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import BaseControl from '../base-control';
import Button from '../button';
import Icon from '../icon';
import { color } from '../utils/colors';
import {
	floatClamp,
	useControlledRangeValue,
	useDebouncedHoverInteraction,
} from './utils';
import RangeRail from './rail';
import SimpleTooltip from './tooltip';
import {
	ActionRightWrapper,
	AfterIconWrapper,
	BeforeIconWrapper,
	InputRange,
	InputNumber,
	Root,
	Track,
	ThumbWrapper,
	Thumb,
	Wrapper,
} from './styles/range-control-styles';
import { useRtl } from '../utils/rtl';

const BaseRangeControl = forwardRef(
	(
		{
			afterIcon,
			allowReset = false,
			beforeIcon,
			className,
			currentInput,
			color: colorProp = color( 'blue.wordpress.700' ),
			disabled = false,
			help,
			instanceId,
			initialPosition,
			label,
			marks = false,
			max = 100,
			min = 0,
			onBlur = noop,
			onChange = noop,
			onFocus = noop,
			onMouseMove = noop,
			onMouseLeave = noop,
			renderTooltipContent = ( v ) => v,
			showTooltip: showTooltipProp,
			step = 1,
			value: valueProp = 0,
			withInputField = true,
			...props
		},
		ref
	) => {
		const isRTL = useRtl();

		const sliderValue = valueProp || initialPosition;
		const [ value, setValue ] = useControlledRangeValue( {
			min,
			max,
			value: sliderValue,
		} );
		const [ showTooltip, setShowTooltip ] = useState( showTooltipProp );
		const [ isFocused, setIsFocused ] = useState( false );

		const inputRef = useRef();

		const setRef = ( nodeRef ) => {
			inputRef.current = nodeRef;

			if ( ref ) {
				ref( nodeRef );
			}
		};

		const isCurrentlyFocused = inputRef.current?.matches( ':focus' );
		const isThumbFocused = ! disabled && isFocused;

		const isValueReset = value === null;
		const inputSliderValue = isValueReset ? '' : value;
		const currentInputValue = isValueReset ? '' : value || currentInput;

		const rangeFillValue = isValueReset
			? floatClamp( max / 2, min, max )
			: value;

		const calculatedFillValue = ( ( value - min ) / ( max - min ) ) * 100;
		const fillValue = isValueReset ? 50 : calculatedFillValue;
		const fillValueOffset = `${ clamp( fillValue, 0, 100 ) }%`;

		const classes = classnames( 'components-range-control', className );

		const wrapperClasses = classnames(
			'components-range-control__wrapper',
			!! marks && 'is-marked'
		);

		const id = `inspector-range-control-${ instanceId }`;

		const describedBy = !! help ? `${ id }__help` : undefined;
		const enableTooltip = showTooltipProp !== false && isFinite( value );

		const handleOnChange = ( event ) => {
			if ( ! event.target.checkValidity() ) {
				return;
			}

			const nextValue = parseFloat( event.target.value );

			setValue( nextValue );
			onChange( nextValue );
		};

		const handleOnReset = () => {
			setValue( null );
			onChange( undefined );
		};

		const handleShowTooltip = () => setShowTooltip( true );
		const handleHideTooltip = () => setShowTooltip( false );

		const handleOnBlur = ( event ) => {
			onBlur( event );
			setIsFocused( false );
			handleHideTooltip();
		};

		const handleOnFocus = ( event ) => {
			onFocus( event );
			setIsFocused( true );
			handleShowTooltip();
		};

		const hoverInteractions = useDebouncedHoverInteraction( {
			onShow: handleShowTooltip,
			onHide: handleHideTooltip,
			onMouseMove,
			onMouseLeave,
		} );

		const offsetStyle = {
			[ isRTL ? 'right' : 'left' ]: fillValueOffset,
		};

		return (
			<BaseControl
				className={ classes }
				label={ label }
				id={ id }
				help={ help }
			>
				<Root
					className="components-range-control__root"
					isRTL={ isRTL }
				>
					{ beforeIcon && (
						<BeforeIconWrapper>
							<Icon icon={ beforeIcon } />
						</BeforeIconWrapper>
					) }
					<Wrapper
						className={ wrapperClasses }
						color={ colorProp }
						marks={ !! marks }
					>
						<InputRange
							{ ...props }
							{ ...hoverInteractions }
							aria-describedby={ describedBy }
							aria-label={ label }
							aria-hidden={ false }
							className="components-range-control__slider"
							disabled={ disabled }
							id={ id }
							max={ max }
							min={ min }
							onBlur={ handleOnBlur }
							onChange={ handleOnChange }
							onFocus={ handleOnFocus }
							ref={ setRef }
							step={ step }
							tabIndex={ 0 }
							type="range"
							value={ inputSliderValue }
						/>
						<RangeRail
							aria-hidden={ true }
							disabled={ disabled }
							marks={ marks }
							max={ max }
							min={ min }
							step={ step }
							value={ rangeFillValue }
						/>
						<Track
							aria-hidden={ true }
							className="components-range-control__track"
							disabled={ disabled }
							style={ { width: fillValueOffset } }
						/>
						<ThumbWrapper style={ offsetStyle }>
							<Thumb
								aria-hidden={ true }
								isFocused={ isThumbFocused }
							/>
						</ThumbWrapper>
						{ enableTooltip && (
							<SimpleTooltip
								className="components-range-control__tooltip"
								inputRef={ inputRef }
								renderTooltipContent={ renderTooltipContent }
								show={ isCurrentlyFocused || showTooltip }
								style={ offsetStyle }
								value={ value }
							/>
						) }
					</Wrapper>
					{ afterIcon && (
						<AfterIconWrapper>
							<Icon icon={ afterIcon } />
						</AfterIconWrapper>
					) }
					{ withInputField && (
						<InputNumber
							aria-label={ label }
							className="components-range-control__number"
							disabled={ disabled }
							inputMode="decimal"
							max={ max }
							min={ min }
							onChange={ handleOnChange }
							step={ step }
							type="number"
							value={ currentInputValue }
						/>
					) }
					{ allowReset && (
						<ActionRightWrapper>
							<Button
								className="components-range-control__reset"
								disabled={ disabled || value === undefined }
								isSecondary
								isSmall
								onClick={ handleOnReset }
							>
								{ __( 'Reset' ) }
							</Button>
						</ActionRightWrapper>
					) }
				</Root>
			</BaseControl>
		);
	}
);

export const RangeControlNext = compose( withInstanceId )( BaseRangeControl );

export default RangeControlNext;
