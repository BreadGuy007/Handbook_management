/**
 * WordPress dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { useState, useMemo, useRef, useEffect } from '@wordpress/element';
import { useInstanceId } from '@wordpress/compose';
import { ENTER, UP, DOWN, ESCAPE } from '@wordpress/keycodes';
import { speak } from '@wordpress/a11y';

/**
 * Internal dependencies
 */
import TokenInput from '../form-token-field/token-input';
import SuggestionsList from '../form-token-field/suggestions-list';
import BaseControl from '../base-control';

function ComboboxControl( {
	value,
	label,
	options,
	onChange,
	onFilterValueChange,
	hideLabelFromVision,
	help,
	messages = {
		selected: __( 'Item selected.' ),
	},
} ) {
	const instanceId = useInstanceId( ComboboxControl );
	const [ selectedSuggestion, setSelectedSuggestion ] = useState( null );
	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ inputValue, setInputValue ] = useState( '' );
	const inputContainer = useRef();
	const currentOption = options.find( ( option ) => option.value === value );
	const currentLabel = currentOption?.label ?? '';

	const matchingSuggestions = useMemo( () => {
		const startsWithMatch = [];
		const containsMatch = [];
		const match = inputValue.toLocaleLowerCase();
		options.forEach( ( option ) => {
			const index = option.label.toLocaleLowerCase().indexOf( match );
			if ( index === 0 ) {
				startsWithMatch.push( option );
			} else if ( index > 0 ) {
				containsMatch.push( option );
			}
		} );

		return startsWithMatch.concat( containsMatch );
	}, [ inputValue, options, value ] );

	const onSuggestionSelected = ( newSelectedSuggestion ) => {
		onChange( newSelectedSuggestion.value );
		speak( messages.selected, 'assertive' );
		setSelectedSuggestion( newSelectedSuggestion );
		setInputValue( '' );
		setIsExpanded( false );
	};

	const handleArrowNavigation = ( offset = 1 ) => {
		const index = matchingSuggestions.indexOf( selectedSuggestion );
		let nextIndex = index + offset;
		if ( nextIndex < 0 ) {
			nextIndex = matchingSuggestions.length - 1;
		} else if ( nextIndex >= matchingSuggestions.length ) {
			nextIndex = 0;
		}
		setSelectedSuggestion( matchingSuggestions[ nextIndex ] );
		setIsExpanded( true );
	};

	const onKeyDown = ( event ) => {
		let preventDefault = false;

		switch ( event.keyCode ) {
			case ENTER:
				if ( selectedSuggestion ) {
					onSuggestionSelected( selectedSuggestion );
					preventDefault = true;
				}
				break;
			case UP:
				handleArrowNavigation( -1 );
				preventDefault = true;
				break;
			case DOWN:
				handleArrowNavigation( 1 );
				preventDefault = true;
				break;
			case ESCAPE:
				setIsExpanded( false );
				setSelectedSuggestion( null );
				preventDefault = true;
				event.stopPropagation();
				break;
			default:
				break;
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	};

	const onFocus = () => {
		// Avoid focus loss when touching the container.
		// TODO: TokenInput should preferably forward ref
		inputContainer.current.input.focus();
		setIsExpanded( true );
		onFilterValueChange( '' );
	};

	const onBlur = () => {
		setIsExpanded( false );
	};

	const onInputChange = ( event ) => {
		const text = event.value;
		setInputValue( text );
		onFilterValueChange( text );
		setIsExpanded( true );
	};

	// Announcements
	useEffect( () => {
		const hasMatchingSuggestions = matchingSuggestions.length > 0;
		if ( isExpanded ) {
			const message = hasMatchingSuggestions
				? sprintf(
						/* translators: %d: number of results. */
						_n(
							'%d result found, use up and down arrow keys to navigate.',
							'%d results found, use up and down arrow keys to navigate.',
							matchingSuggestions.length
						),
						matchingSuggestions.length
				  )
				: __( 'No results.' );

			speak( message, 'assertive' );
		}
	}, [ matchingSuggestions, isExpanded ] );

	// Disable reason: There is no appropriate role which describes the
	// input container intended accessible usability.
	// TODO: Refactor click detection to use blur to stop propagation.
	/* eslint-disable jsx-a11y/no-static-element-interactions */
	return (
		<BaseControl
			className="components-combobox-control"
			tabIndex="-1"
			label={ label }
			id={ `components-form-token-input-${ instanceId }` }
			hideLabelFromVision={ hideLabelFromVision }
			help={ help }
		>
			<div
				className="components-combobox-control__suggestions-container"
				tabIndex="-1"
				onFocus={ onFocus }
				onKeyDown={ onKeyDown }
			>
				<TokenInput
					className="components-combobox-control__input"
					instanceId={ instanceId }
					ref={ inputContainer }
					value={ isExpanded ? inputValue : currentLabel }
					onBlur={ onBlur }
					isExpanded={ isExpanded }
					selectedSuggestionIndex={ matchingSuggestions.indexOf(
						selectedSuggestion
					) }
					onChange={ onInputChange }
				/>
				{ isExpanded && (
					<SuggestionsList
						instanceId={ instanceId }
						match={ { label: inputValue } }
						displayTransform={ ( suggestion ) => suggestion.label }
						suggestions={ matchingSuggestions }
						selectedIndex={ matchingSuggestions.indexOf(
							selectedSuggestion
						) }
						onHover={ setSelectedSuggestion }
						onSelect={ onSuggestionSelected }
						scrollIntoView
					/>
				) }
			</div>
		</BaseControl>
	);
	/* eslint-enable jsx-a11y/no-static-element-interactions */
}

export default ComboboxControl;
