/**
 * External dependencies
 */
import {
	filter,
	groupBy,
	map,
	some,
	flow,
	sortBy,
	findIndex,
	find,
	without,
} from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, compose } from '@wordpress/element';
import {
	withInstanceId,
	withSpokenMessages,
	PanelBody,
} from '@wordpress/components';
import { getCategories, isSharedBlock } from '@wordpress/blocks';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';
import BlockPreview from '../block-preview';
import ItemList from './item-list';

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
			filterValue: '',
			hoveredItem: null,
			sharedItems: [],
			itemsPerCategory: {},
			openPanels: [ 'frecent' ],
		};
		this.onChangeSearchInput = this.onChangeSearchInput.bind( this );
		this.onHover = this.onHover.bind( this );
	}

	componentDidMount() {
		// This could be replaced by a resolver.
		this.props.fetchSharedBlocks();
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
			}
		};
	}

	filter( filterValue = '' ) {
		const { items } = this.props;
		const filteredItems = searchItems( items, filterValue );
		const sharedItems = filter( filteredItems, { category: 'shared' } );
		const getCategoryIndex = ( item ) => {
			return findIndex( getCategories(), ( category ) => category.slug === item.category );
		};
		const itemsPerCategory = flow(
			( itemList ) => filter( itemList, ( item ) => item.category !== 'shared' ),
			( itemList ) => sortBy( itemList, getCategoryIndex ),
			( itemList ) => groupBy( itemList, 'category' )
		)( filteredItems );
		let openPanels = this.state.openPanels;
		if ( filterValue !== this.state.filterValue ) {
			if ( ! filterValue ) {
				openPanels = [ 'frecent' ];
			} else if ( sharedItems.length ) {
				openPanels = [ 'shared' ];
			} else if ( filteredItems.length ) {
				const firstCategory = find( getCategories(), ( { slug } ) => itemsPerCategory[ slug ] && itemsPerCategory[ slug ].length );
				openPanels = [ firstCategory.slug ];
			}
		}

		this.setState( {
			hoveredItem: null,
			filterValue,
			sharedItems,
			itemsPerCategory,
			openPanels,
		} );
	}

	render() {
		const { instanceId, frecentItems, onSelect } = this.props;
		const { hoveredItem, filterValue, sharedItems, itemsPerCategory, openPanels } = this.state;
		const isSearching = !! filterValue;
		const isPanelOpen = ( panel ) => openPanels.indexOf( panel ) !== -1;

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

				<div className="editor-inserter__results">
					{ ! isSearching &&
						<PanelBody
							title={ __( 'Most Used' ) }
							opened={ isPanelOpen( 'frecent' ) }
							onToggle={ this.onTogglePanel( 'frecent' ) }
						>
							<ItemList items={ frecentItems } onSelect={ onSelect } onHover={ this.onHover } />
						</PanelBody>
					}

					{ !! sharedItems.length && (
						<PanelBody
							title={ __( 'Shared' ) }
							opened={ isPanelOpen( 'shared' ) }
							onToggle={ this.onTogglePanel( 'shared' ) }
						>
							<ItemList items={ sharedItems } onSelect={ onSelect } onHover={ this.onHover } />
						</PanelBody>
					) }

					{ map( getCategories(), ( category ) => {
						const categoryItems = itemsPerCategory[ category.slug ];
						if ( ! categoryItems || ! categoryItems.length ) {
							return null;
						}
						return (
							<PanelBody
								key={ category.slug }
								title={ category.title }
								opened={ isPanelOpen( category.slug ) }
								onToggle={ this.onTogglePanel( category.slug ) }
							>
								<ItemList items={ categoryItems } onSelect={ onSelect } onHover={ this.onHover } />
							</PanelBody>
						);
					} ) }

					{ hoveredItem && isSharedBlock( hoveredItem ) &&
						<BlockPreview name={ hoveredItem.name } attributes={ hoveredItem.initialAttributes } />
					}
				</div>
			</div>
		);
		/* eslint-enable jsx-a11y/no-autofocus */
	}
}

export default compose(
	withSelect( ( select ) => {
		const {
			getBlockInsertionPoint,
			getInserterItems,
			getFrecentInserterItems,
			getSupportedBlocks,
			getEditorSettings,
		} = select( 'core/editor' );
		const { allowedBlockTypes } = getEditorSettings();
		const { rootUID } = getBlockInsertionPoint();
		const supportedBlocks = getSupportedBlocks( rootUID, allowedBlockTypes );
		return {
			items: getInserterItems( supportedBlocks ),
			frecentItems: getFrecentInserterItems( supportedBlocks ),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		fetchSharedBlocks: dispatch( 'core/editor' ).fetchSharedBlocks,
	} ) ),
	withSpokenMessages,
	withInstanceId
)( InserterMenu );
