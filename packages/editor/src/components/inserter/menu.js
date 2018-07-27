/**
 * External dependencies
 */
import {
	filter,
	find,
	findIndex,
	flow,
	groupBy,
	isEmpty,
	map,
	some,
	sortBy,
	without,
	includes,
} from 'lodash';
import scrollIntoView from 'dom-scroll-into-view';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, findDOMNode, createRef } from '@wordpress/element';
import {
	withSpokenMessages,
	PanelBody,
} from '@wordpress/components';
import { getCategories, isReusableBlock } from '@wordpress/blocks';
import { withDispatch, withSelect } from '@wordpress/data';
import { withInstanceId, compose, withSafeTimeout } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import BlockPreview from '../block-preview';
import BlockTypesList from '../block-types-list';
import ChildBlocks from './child-blocks';
import InserterResultsPortal from './results-portal';

const MAX_SUGGESTED_ITEMS = 9;

/**
 * Filters an item list given a search term.
 *
 * @param {Array} items        Item list
 * @param {string} searchTerm  Search term.
 *
 * @return {Array}             Filtered item list.
 */
export const searchItems = ( items, searchTerm ) => {
	const normalizedSearchTerm = searchTerm.toLowerCase().trim();
	const matchSearch = ( string ) => string.toLowerCase().indexOf( normalizedSearchTerm ) !== -1;

	return items.filter( ( item ) =>
		matchSearch( item.title ) || some( item.keywords, matchSearch )
	);
};

export class InserterMenu extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			childItems: [],
			filterValue: '',
			hoveredItem: null,
			suggestedItems: [],
			reusableItems: [],
			itemsPerCategory: {},
			openPanels: [ 'suggested' ],
		};
		this.onChangeSearchInput = this.onChangeSearchInput.bind( this );
		this.onHover = this.onHover.bind( this );
		this.panels = {};
		this.inserterResults = createRef();
	}

	componentDidMount() {
		// This could be replaced by a resolver.
		this.props.fetchReusableBlocks();
		this.filter();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.items !== this.props.items ) {
			this.filter( this.state.filterValue );
		}
	}

	onChangeSearchInput( event ) {
		this.filter( event.target.value );
	}

	onHover( item ) {
		this.setState( {
			hoveredItem: item,
		} );

		if ( item ) {
			this.props.showInsertionPoint();
		} else {
			this.props.hideInsertionPoint();
		}
	}

	bindPanel( name ) {
		return ( ref ) => {
			this.panels[ name ] = ref;
		};
	}

	onTogglePanel( panel ) {
		return () => {
			const isOpened = this.state.openPanels.indexOf( panel ) !== -1;
			if ( isOpened ) {
				this.setState( {
					openPanels: without( this.state.openPanels, panel ),
				} );
			} else {
				this.setState( {
					openPanels: [
						...this.state.openPanels,
						panel,
					],
				} );

				this.props.setTimeout( () => {
					// We need a generic way to access the panel's container
					// eslint-disable-next-line react/no-find-dom-node
					scrollIntoView( findDOMNode( this.panels[ panel ] ), this.inserterResults.current, {
						alignWithTop: true,
					} );
				} );
			}
		};
	}

	filter( filterValue = '' ) {
		const { items, rootChildBlocks } = this.props;
		const filteredItems = searchItems( items, filterValue );

		const childItems = filter( filteredItems, ( { name } ) => includes( rootChildBlocks, name ) );

		let suggestedItems = [];
		if ( ! filterValue ) {
			const maxSuggestedItems = this.props.maxSuggestedItems || MAX_SUGGESTED_ITEMS;
			suggestedItems = filter( items, ( item ) => item.utility > 0 ).slice( 0, maxSuggestedItems );
		}

		const reusableItems = filter( filteredItems, { category: 'reusable' } );

		const getCategoryIndex = ( item ) => {
			return findIndex( getCategories(), ( category ) => category.slug === item.category );
		};
		const itemsPerCategory = flow(
			( itemList ) => filter( itemList, ( item ) => item.category !== 'reusable' ),
			( itemList ) => sortBy( itemList, getCategoryIndex ),
			( itemList ) => groupBy( itemList, 'category' )
		)( filteredItems );

		let openPanels = this.state.openPanels;
		if ( filterValue !== this.state.filterValue ) {
			if ( ! filterValue ) {
				openPanels = [ 'suggested' ];
			} else if ( reusableItems.length ) {
				openPanels = [ 'reusable' ];
			} else if ( filteredItems.length ) {
				const firstCategory = find( getCategories(), ( { slug } ) => itemsPerCategory[ slug ] && itemsPerCategory[ slug ].length );
				openPanels = [ firstCategory.slug ];
			}
		}

		this.setState( {
			hoveredItem: null,
			childItems,
			filterValue,
			suggestedItems,
			reusableItems,
			itemsPerCategory,
			openPanels,
		} );
	}

	render() {
		const { instanceId, onSelect, rootClientId } = this.props;
		const { childItems, filterValue, hoveredItem, suggestedItems, reusableItems, itemsPerCategory, openPanels } = this.state;
		const isPanelOpen = ( panel ) => openPanels.indexOf( panel ) !== -1;
		const isSearching = !! filterValue;

		// Disable reason: The inserter menu is a modal display, not one which
		// is always visible, and one which already incurs this behavior of
		// autoFocus via Popover's focusOnMount.

		/* eslint-disable jsx-a11y/no-autofocus */
		return (
			<div className="editor-inserter__menu">
				<label htmlFor={ `editor-inserter__search-${ instanceId }` } className="screen-reader-text">
					{ __( 'Search for a block' ) }
				</label>
				<input
					id={ `editor-inserter__search-${ instanceId }` }
					type="search"
					placeholder={ __( 'Search for a block' ) }
					className="editor-inserter__search"
					autoFocus
					onChange={ this.onChangeSearchInput }
				/>

				<div
					className="editor-inserter__results"
					ref={ this.inserterResults }
					tabIndex="0"
					role="region"
					aria-label={ __( 'Available block types' ) }
				>
					<InserterResultsPortal.Slot fillProps={ { filterValue } } />

					<ChildBlocks
						rootClientId={ rootClientId }
						items={ childItems }
						onSelect={ onSelect }
						onHover={ this.onHover }
					/>

					{ !! suggestedItems.length &&
						<PanelBody
							title={ __( 'Most Used' ) }
							opened={ isPanelOpen( 'suggested' ) }
							onToggle={ this.onTogglePanel( 'suggested' ) }
							ref={ this.bindPanel( 'suggested' ) }
						>
							<BlockTypesList items={ suggestedItems } onSelect={ onSelect } onHover={ this.onHover } />
						</PanelBody>
					}
					{ map( getCategories(), ( category ) => {
						const categoryItems = itemsPerCategory[ category.slug ];
						if ( ! categoryItems || ! categoryItems.length ) {
							return null;
						}
						return (
							<PanelBody
								key={ category.slug }
								title={ category.title }
								opened={ isSearching || isPanelOpen( category.slug ) }
								onToggle={ this.onTogglePanel( category.slug ) }
								ref={ this.bindPanel( category.slug ) }
							>
								<BlockTypesList items={ categoryItems } onSelect={ onSelect } onHover={ this.onHover } />
							</PanelBody>
						);
					} ) }
					{ !! reusableItems.length && (
						<PanelBody
							title={ __( 'Reusable' ) }
							opened={ isPanelOpen( 'reusable' ) }
							onToggle={ this.onTogglePanel( 'reusable' ) }
							icon="controls-repeat"
							ref={ this.bindPanel( 'reusable' ) }
						>
							<BlockTypesList items={ reusableItems } onSelect={ onSelect } onHover={ this.onHover } />
						</PanelBody>
					) }
					{ isEmpty( suggestedItems ) && isEmpty( reusableItems ) && isEmpty( itemsPerCategory ) && (
						<p className="editor-inserter__no-results">{ __( 'No blocks found.' ) }</p>
					) }
				</div>

				{ hoveredItem && isReusableBlock( hoveredItem ) &&
					<BlockPreview name={ hoveredItem.name } attributes={ hoveredItem.initialAttributes } />
				}
			</div>
		);
		/* eslint-enable jsx-a11y/no-autofocus */
	}
}

export default compose(
	withSelect( ( select, { rootClientId } ) => {
		const {
			getChildBlockNames,
		} = select( 'core/blocks' );
		const {
			getBlockName,
		} = select( 'core/editor' );
		const rootBlockName = getBlockName( rootClientId );
		return {
			rootChildBlocks: getChildBlockNames( rootBlockName ),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		fetchReusableBlocks: dispatch( 'core/editor' ).fetchReusableBlocks,
		showInsertionPoint: dispatch( 'core/editor' ).showInsertionPoint,
		hideInsertionPoint: dispatch( 'core/editor' ).hideInsertionPoint,
	} ) ),
	withSpokenMessages,
	withInstanceId,
	withSafeTimeout
)( InserterMenu );
