/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Button from '../button';
import Dropdown from '../dropdown';
import Tooltip from '../tooltip';
import Dashicon from '../dashicon';

function Option( {
	className,
	isSelected,
	tooltipText,
	...additionalProps
} ) {
	const optionButton = (
		<button
			type="button"
			aria-pressed={ isSelected }
			className={ classnames(
				className,
				'components-circular-option-picker__option',
				{ 'is-active': isSelected }
			) }
			{ ...additionalProps }
		/>
	);
	return (
		<div className="components-circular-option-picker__option-wrapper">
			{ tooltipText ?
				( <Tooltip text={ tooltipText }>{ optionButton }</Tooltip> ) :
				optionButton
			}
			{ isSelected && <Dashicon icon="saved" /> }
		</div>
	);
}

function DropdownLinkAction( {
	buttonProps,
	className,
	dropdownProps,
	linkText,
} ) {
	return (
		<Dropdown
			className={ classnames(
				'components-circular-option-picker__dropdown-link-action',
				className
			) }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					aria-expanded={ isOpen }
					onClick={ onToggle }
					isLink
					{ ...buttonProps }
				>
					{ linkText }
				</Button>
			) }
			{ ...dropdownProps }
		/>
	);
}

function ButtonAction( {
	className,
	children,
	...additionalProps
} ) {
	return (
		<Button
			className={ classnames(
				'components-circular-option-picker__clear',
				className
			) }
			type="button"
			isSmall
			isDefault
			{ ...additionalProps }
		>
			{ children }
		</Button>
	);
}

export default function CircularOptionPicker( {
	actions,
	className,
	options,
} ) {
	return (
		<div className={ classnames( 'components-circular-option-picker', className ) }>
			{ options }
			{ actions && (
				<div className="components-circular-option-picker__custom-clear-wrapper">
					{ actions }
				</div>
			) }
		</div>
	);
}

CircularOptionPicker.Option = Option;
CircularOptionPicker.ButtonAction = ButtonAction;
CircularOptionPicker.DropdownLinkAction = DropdownLinkAction;
