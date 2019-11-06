/**
 * External dependencies
 */
import classnames from 'classnames';
import { isFunction, noop, startsWith } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	Button,
	ExternalLink,
	Popover,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import {
	useCallback,
	useState,
	useEffect,
	Fragment,
} from '@wordpress/element';

import {
	safeDecodeURI,
	filterURLForDisplay,
	isURL,
	prependHTTP,
	getProtocol,
} from '@wordpress/url';

import { withInstanceId, compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import LinkControlSettingsDrawer from './settings-drawer';
import LinkControlSearchItem from './search-item';
import LinkControlSearchInput from './search-input';

const MODE_EDIT = 'edit';
// const MODE_SHOW = 'show';

function LinkControl( {
	className,
	currentLink,
	currentSettings,
	fetchSearchSuggestions,
	instanceId,
	onClose = noop,
	onChangeMode = noop,
	onKeyDown = noop,
	onKeyPress = noop,
	onLinkChange = noop,
	onSettingsChange = noop,
} ) {
	// State
	const [ inputValue, setInputValue ] = useState( '' );
	const [ isEditingLink, setIsEditingLink ] = useState( false );

	// Effects
	useEffect( () => {
		// If we have a link then stop editing mode
		if ( currentLink ) {
			setIsEditingLink( false );
		} else {
			setIsEditingLink( true );
		}
	}, [ currentLink ] );

	// Handlers

	/**
	 * onChange LinkControlSearchInput event handler
	 *
	 * @param {string} value Current value returned by the search.
	 */
	const onInputChange = ( value = '' ) => {
		setInputValue( value );
	};

	// Utils

	/**
	 * Handler function which switches the mode of the component,
	 * between `edit` and `show` mode.
	 * Also, it calls `onChangeMode` callback function.
	 *
	 * @param {string} mode Component mode: `show` or `edit`.
	 */
	const setMode = ( mode = 'show' ) => () => {
		setIsEditingLink( MODE_EDIT === mode );

		// Populate input searcher whether
		// the current link has a title.
		if ( currentLink && currentLink.title ) {
			setInputValue( currentLink.title );
		}

		if ( isFunction( onChangeMode ) ) {
			onChangeMode( mode );
		}
	};

	const closeLinkUI = () => {
		resetInput();
		onClose();
	};

	const resetInput = () => {
		setInputValue( '' );
	};

	const handleDirectEntry = ( value ) => {
		let type = 'URL';

		const protocol = getProtocol( value ) || '';

		if ( protocol.includes( 'mailto' ) ) {
			type = 'mailto';
		}

		if ( protocol.includes( 'tel' ) ) {
			type = 'tel';
		}

		if ( startsWith( value, '#' ) ) {
			type = 'internal';
		}

		return Promise.resolve(
			[ {
				id: '-1',
				title: value,
				url: type === 'URL' ? prependHTTP( value ) : value,
				type,
			} ]
		);
	};

	const handleEntitySearch = async ( value ) => {
		const results = await Promise.all( [
			fetchSearchSuggestions( value ),
			handleDirectEntry( value ),
		] );

		const couldBeURL = ! value.includes( ' ' );

		// If it's potentially a URL search then concat on a URL search suggestion
		// just for good measure. That way once the actual results run out we always
		// have a URL option to fallback on.
		return couldBeURL ? results[ 0 ].concat( results[ 1 ] ) : results[ 0 ];
	};

	// Effects
	const getSearchHandler = useCallback( ( value ) => {
		const protocol = getProtocol( value ) || '';
		const isMailto = protocol.includes( 'mailto' );
		const isInternal = startsWith( value, '#' );
		const isTel = protocol.includes( 'tel' );

		const handleManualEntry = isInternal || isMailto || isTel || isURL( value ) || ( value && value.includes( 'www.' ) );

		return ( handleManualEntry ) ? handleDirectEntry( value ) : handleEntitySearch( value );
	}, [ handleDirectEntry, fetchSearchSuggestions ] );

	// Render Components
	const renderSearchResults = ( { suggestionsListProps, buildSuggestionItemProps, suggestions, selectedSuggestion, isLoading } ) => {
		const resultsListClasses = classnames( 'block-editor-link-control__search-results', {
			'is-loading': isLoading,
		} );

		const manualLinkEntryTypes = [ 'url', 'mailto', 'tel', 'internal' ];

		return (
			<div className="block-editor-link-control__search-results-wrapper">
				<div { ...suggestionsListProps } className={ resultsListClasses }>
					{ suggestions.map( ( suggestion, index ) => (
						<LinkControlSearchItem
							key={ `${ suggestion.id }-${ suggestion.type }` }
							itemProps={ buildSuggestionItemProps( suggestion, index ) }
							suggestion={ suggestion }
							onClick={ () => onLinkChange( suggestion ) }
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
		<Popover
			className={ classnames( 'block-editor-link-control', className ) }
			onClose={ closeLinkUI }
			position="bottom center"
			focusOnMount="firstElement"
		>
			<div className="block-editor-link-control__popover-inner">
				<div className="block-editor-link-control__search">

					{ ( ! isEditingLink && currentLink ) && (
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
										href={ currentLink.url }
									>
										{ currentLink.title }
									</ExternalLink>
									<span className="block-editor-link-control__search-item-info">{ filterURLForDisplay( safeDecodeURI( currentLink.url ) ) || '' }</span>
								</span>

								<Button isDefault onClick={ setMode( MODE_EDIT ) } className="block-editor-link-control__search-item-action block-editor-link-control__search-item-action--edit">
									{ __( 'Change' ) }
								</Button>
							</div>
						</Fragment>
					) }

					{ isEditingLink && (
						<LinkControlSearchInput
							value={ inputValue }
							onChange={ onInputChange }
							onSelect={ onLinkChange }
							renderSuggestions={ renderSearchResults }
							fetchSuggestions={ getSearchHandler }
							onReset={ resetInput }
							onKeyDown={ onKeyDown }
							onKeyPress={ onKeyPress }
						/>
					) }

					{ ! isEditingLink && (
						<LinkControlSettingsDrawer settings={ currentSettings } onSettingChange={ onSettingsChange } />
					) }
				</div>
			</div>
		</Popover>
	);
}

export default compose(
	withInstanceId,
	withSelect( ( select, ownProps ) => {
		if ( ownProps.fetchSearchSuggestions && isFunction( ownProps.fetchSearchSuggestions ) ) {
			return;
		}

		const { getSettings } = select( 'core/block-editor' );
		return {
			fetchSearchSuggestions: getSettings().__experimentalFetchLinkSuggestions,
		};
	} )
)( LinkControl );
