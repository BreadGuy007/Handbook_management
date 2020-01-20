/**
 * External dependencies
 */
import classnames from 'classnames';
import { noop, startsWith } from 'lodash';

/**
 * WordPress dependencies
 */
import { Button, ExternalLink, VisuallyHidden } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useState, Fragment } from '@wordpress/element';
import {
	safeDecodeURI,
	filterURLForDisplay,
	isURL,
	prependHTTP,
	getProtocol,
} from '@wordpress/url';
import { useInstanceId } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import LinkControlSettingsDrawer from './settings-drawer';
import LinkControlSearchItem from './search-item';
import LinkControlSearchInput from './search-input';

function LinkControl( {
	value,
	settings,
	onChange = noop,
	showInitialSuggestions,
} ) {
	const instanceId = useInstanceId( LinkControl );
	const [ inputValue, setInputValue ] = useState( ( value && value.url ) || '' );
	const [ isEditingLink, setIsEditingLink ] = useState( ! value || ! value.url );
	const { fetchSearchSuggestions } = useSelect( ( select ) => {
		const { getSettings } = select( 'core/block-editor' );
		return {
			fetchSearchSuggestions: getSettings().__experimentalFetchLinkSuggestions,
		};
	}, [] );
	const displayURL = ( value && filterURLForDisplay( safeDecodeURI( value.url ) ) ) || '';

	/**
	 * onChange LinkControlSearchInput event handler
	 *
	 * @param {string} val Current value returned by the search.
	 */
	const onInputChange = ( val = '' ) => {
		setInputValue( val );
	};

	const resetInput = () => {
		setInputValue( '' );
	};

	const handleDirectEntry = ( val ) => {
		let type = 'URL';

		const protocol = getProtocol( val ) || '';

		if ( protocol.includes( 'mailto' ) ) {
			type = 'mailto';
		}

		if ( protocol.includes( 'tel' ) ) {
			type = 'tel';
		}

		if ( startsWith( val, '#' ) ) {
			type = 'internal';
		}

		return Promise.resolve(
			[ {
				id: '-1',
				title: val,
				url: type === 'URL' ? prependHTTP( val ) : val,
				type,
			} ]
		);
	};

	const handleEntitySearch = async ( val, args ) => {
		const results = await Promise.all( [
			fetchSearchSuggestions( val, {
				...( args.isInitialSuggestions ? { perPage: 3 } : {} ),
			} ),
			handleDirectEntry( val ),
		] );

		const couldBeURL = ! val.includes( ' ' );

		// If it's potentially a URL search then concat on a URL search suggestion
		// just for good measure. That way once the actual results run out we always
		// have a URL option to fallback on.
		return couldBeURL && ! args.isInitialSuggestions ? results[ 0 ].concat( results[ 1 ] ) : results[ 0 ];
	};

	// Effects
	const getSearchHandler = useCallback( ( val, args ) => {
		const protocol = getProtocol( val ) || '';
		const isMailto = protocol.includes( 'mailto' );
		const isInternal = startsWith( val, '#' );
		const isTel = protocol.includes( 'tel' );

		const handleManualEntry = isInternal || isMailto || isTel || isURL( val ) || ( val && val.includes( 'www.' ) );

		return ( handleManualEntry ) ? handleDirectEntry( val, args ) : handleEntitySearch( val, args );
	}, [ handleDirectEntry, fetchSearchSuggestions ] );

	// Render Components
	const renderSearchResults = ( { suggestionsListProps, buildSuggestionItemProps, suggestions, selectedSuggestion, isLoading, isInitialSuggestions } ) => {
		const resultsListClasses = classnames( 'block-editor-link-control__search-results', {
			'is-loading': isLoading,
		} );

		const manualLinkEntryTypes = [ 'url', 'mailto', 'tel', 'internal' ];
		const searchResultsLabelId = isInitialSuggestions ? `block-editor-link-control-search-results-label-${ instanceId }` : undefined;
		const labelText = isInitialSuggestions ? __( 'Recently updated' ) : sprintf( __( 'Search results for %s' ), inputValue );
		// According to guidelines aria-label should be added if the label
		// itself is not visible.
		// See: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
		const ariaLabel = isInitialSuggestions ? undefined : labelText;
		const SearchResultsLabel = (
			<span className="block-editor-link-control__search-results-label" id={ searchResultsLabelId } aria-label={ ariaLabel } >
				{ labelText }
			</span>
		);

		return (
			<div className="block-editor-link-control__search-results-wrapper">
				{ isInitialSuggestions ? SearchResultsLabel : <VisuallyHidden>{ SearchResultsLabel }</VisuallyHidden> }

				<div { ...suggestionsListProps } className={ resultsListClasses } aria-labelledby={ searchResultsLabelId }>
					{ suggestions.map( ( suggestion, index ) => (
						<LinkControlSearchItem
							key={ `${ suggestion.id }-${ suggestion.type }` }
							itemProps={ buildSuggestionItemProps( suggestion, index ) }
							suggestion={ suggestion }
							onClick={ () => {
								setIsEditingLink( false );
								onChange( { ...value, ...suggestion } );
							} }
							isSelected={ index === selectedSuggestion }
							isURL={ manualLinkEntryTypes.includes( suggestion.type.toLowerCase() ) }
							searchTerm={ inputValue }
						/>
					) ) }
				</div>
			</div>
		);
	};

	return (
		<div className="block-editor-link-control">
			{ ( ! isEditingLink ) && (
				<Fragment>
					<p className="screen-reader-text" id={ `current-link-label-${ instanceId }` }>
						{ __( 'Currently selected' ) }:
					</p>
					<div
						aria-labelledby={ `current-link-label-${ instanceId }` }
						aria-selected="true"
						className={ classnames( 'block-editor-link-control__search-item', {
							'is-current': true,
						} ) }
					>
						<span className="block-editor-link-control__search-item-header">
							<ExternalLink
								className="block-editor-link-control__search-item-title"
								href={ value.url }
							>
								{ ( value && value.title ) || displayURL }
							</ExternalLink>
							{ value && value.title && (
								<span className="block-editor-link-control__search-item-info">
									{ displayURL }
								</span>
							) }
						</span>

						<Button
							isSecondary
							onClick={ () => setIsEditingLink( true ) }
							className="block-editor-link-control__search-item-action block-editor-link-control__search-item-action--edit"
						>
							{ __( 'Edit' ) }
						</Button>
					</div>
				</Fragment>
			) }

			{ isEditingLink && (
				<LinkControlSearchInput
					value={ inputValue }
					onChange={ onInputChange }
					onSelect={ ( suggestion ) => {
						setIsEditingLink( false );
						onChange( { ...value, ...suggestion } );
					} }
					renderSuggestions={ renderSearchResults }
					fetchSuggestions={ getSearchHandler }
					onReset={ resetInput }
					showInitialSuggestions={ showInitialSuggestions }
				/>
			) }

			{ ! isEditingLink && (
				<LinkControlSettingsDrawer value={ value } settings={ settings } onChange={ onChange } />
			) }
		</div>
	);
}

export default LinkControl;
