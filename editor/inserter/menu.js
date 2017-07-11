/**
 * External dependencies
 */
import { flow, groupBy, sortBy, findIndex, filter } from 'lodash';
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { __ } from 'i18n';
import { Component } from 'element';
import { Dashicon, Popover, withFocusReturn, withInstanceId } from 'components';
import { TAB, ESCAPE, LEFT, UP, RIGHT, DOWN } from 'utils/keycodes';
import { getCategories, getBlockTypes } from 'blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import { showInsertionPoint, hideInsertionPoint } from '../actions';
import { getRecentlyUsedBlocks } from '../selectors';

class InserterMenu extends Component {
	constructor() {
		super( ...arguments );
		this.nodes = {};
		this.state = {
			filterValue: '',
			currentFocus: 'search',
			tab: 'recent',
		};
		this.filter = this.filter.bind( this );
		this.setSearchFocus = this.setSearchFocus.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.searchBlocks = this.searchBlocks.bind( this );
		this.getBlocksForCurrentTab = this.getBlocksForCurrentTab.bind( this );
		this.sortBlocks = this.sortBlocks.bind( this );
		this.addRecentBlocks = this.addRecentBlocks.bind( this );
	}

	componentDidMount() {
		document.addEventListener( 'keydown', this.onKeyDown );
	}

	componentWillUnmount() {
		document.removeEventListener( 'keydown', this.onKeyDown );
	}

	bindReferenceNode( nodeName ) {
		return ( node ) => this.nodes[ nodeName ] = node;
	}

	filter( event ) {
		this.setState( {
			filterValue: event.target.value,
		} );
	}

	selectBlock( name ) {
		return () => {
			this.props.onSelect( name );
			this.setState( {
				filterValue: '',
				currentFocus: null,
			} );
		};
	}

	searchBlocks( blockTypes ) {
		const matchesSearch = ( block ) => block.title.toLowerCase().indexOf( this.state.filterValue.toLowerCase() ) !== -1;
		return filter( blockTypes, matchesSearch );
	}

	getBlocksForCurrentTab() {
		// if we're searching, use everything, otherwise just get the blocks visible in this tab
		if ( this.state.filterValue ) {
			return getBlockTypes();
		}
		switch ( this.state.tab ) {
			case 'recent':
				return this.props.recentlyUsedBlocks;
			case 'blocks':
				return filter( getBlockTypes(), ( block ) => block.category !== 'embed' );
			case 'embeds':
				return filter( getBlockTypes(), ( block ) => block.category === 'embed' );
		}
	}

	sortBlocks( blockTypes ) {
		if ( 'recent' === this.state.tab && ! this.state.filterValue ) {
			return blockTypes;
		}

		const getCategoryIndex = ( item ) => {
			return findIndex( getCategories(), ( category ) => category.slug === item.category );
		};

		return sortBy( blockTypes, getCategoryIndex );
	}

	addRecentBlocks( blocksByCategory ) {
		blocksByCategory.recent = this.props.recentlyUsedBlocks;
		return blocksByCategory;
	}

	groupByCategory( blockTypes ) {
		return groupBy( blockTypes, ( blockType ) => blockType.category );
	}

	getVisibleBlocksByCategory( blockTypes ) {
		return flow(
			this.searchBlocks,
			this.sortBlocks,
			this.groupByCategory,
			this.addRecentBlocks
		)( blockTypes );
	}

	findByIncrement( blockTypes, increment = 1 ) {
		// Prepend a fake search block to the list to cycle through.
		const list = [ { name: 'search' }, ...blockTypes ];

		const currentIndex = findIndex( list, ( blockType ) => this.state.currentFocus === blockType.name );
		const nextIndex = currentIndex + increment;
		const highestIndex = list.length - 1;
		const lowestIndex = 0;

		if ( nextIndex > highestIndex ) {
			return list[ lowestIndex ].name;
		}

		if ( nextIndex < lowestIndex ) {
			return list[ highestIndex ].name;
		}

		// Return the name of the next block type.
		return list[ nextIndex ].name;
	}

	findNext( blockTypes ) {
		/**
		 * null is the initial state value and triggers start at beginning.
		 */
		if ( null === this.state.currentFocus ) {
			return blockTypes[ 0 ].name;
		}

		return this.findByIncrement( blockTypes, 1 );
	}

	findPrevious( blockTypes ) {
		/**
		 * null is the initial state value and triggers start at beginning.
		 */
		if ( null === this.state.currentFocus ) {
			return blockTypes[ 0 ].name;
		}

		return this.findByIncrement( blockTypes, -1 );
	}

	focusNext() {
		const sortedByCategory = flow(
			this.searchBlocks,
			this.sortBlocks,
		)( this.getBlocksForCurrentTab() );

		// If the block list is empty return early.
		if ( ! sortedByCategory.length ) {
			return;
		}

		const nextBlock = this.findNext( sortedByCategory );
		this.changeMenuSelection( nextBlock );
	}

	focusPrevious() {
		const sortedByCategory = flow(
			this.searchBlocks,
			this.sortBlocks,
		)( this.getBlocksForCurrentTab() );

		// If the block list is empty return early.
		if ( ! sortedByCategory.length ) {
			return;
		}

		const nextBlock = this.findPrevious( sortedByCategory );
		this.changeMenuSelection( nextBlock );
	}

	onKeyDown( keydown ) {
		switch ( keydown.keyCode ) {
			case TAB:
				if ( keydown.shiftKey ) {
					// Previous.
					keydown.preventDefault();
					this.focusPrevious( this );
					break;
				}
				// Next.
				keydown.preventDefault();
				this.focusNext( this );
				break;
			case ESCAPE:
				keydown.preventDefault();
				this.props.onSelect( null );

				break;
			case LEFT:
				if ( this.state.currentFocus === 'search' ) {
					return;
				}
				this.focusPrevious( this );

				break;
			case UP:
				keydown.preventDefault();
				this.focusPrevious( this );

				break;
			case RIGHT:
				if ( this.state.currentFocus === 'search' ) {
					return;
				}
				this.focusNext( this );

				break;
			case DOWN:
				keydown.preventDefault();
				this.focusNext( this );

				break;
			default :
				break;
		}
	}

	changeMenuSelection( refName ) {
		this.setState( {
			currentFocus: refName,
		} );

		// Focus the DOM node.
		this.nodes[ refName ].focus();
	}

	setSearchFocus() {
		this.changeMenuSelection( 'search' );
	}

	getBlockItem( block ) {
		return (
			<button
				role="menuitem"
				key={ block.name }
				className="editor-inserter__block"
				onClick={ this.selectBlock( block.name ) }
				ref={ this.bindReferenceNode( block.name ) }
				tabIndex="-1"
				onMouseEnter={ this.props.showInsertionPoint }
				onMouseLeave={ this.props.hideInsertionPoint }
			>
				<Dashicon icon={ block.icon } />
				{ block.title }
			</button>
		);
	}

	switchTab( tab ) {
		this.setState( { tab: tab } );
	}

	render() {
		const { position, instanceId } = this.props;
		const isSearching = this.state.filterValue;
		const visibleBlocksByCategory = this.getVisibleBlocksByCategory( this.getBlocksForCurrentTab() );

		/* eslint-disable jsx-a11y/no-autofocus */
		return (
			<Popover position={ position } className="editor-inserter__menu">
				<label htmlFor={ `editor-inserter__search-${ instanceId }` } className="screen-reader-text">
					{ __( 'Search blocks' ) }
				</label>
				<input
					autoFocus
					id={ `editor-inserter__search-${ instanceId }` }
					type="search"
					placeholder={ __( 'Search…' ) }
					className="editor-inserter__search"
					onChange={ this.filter }
					onClick={ this.setSearchFocus }
					ref={ this.bindReferenceNode( 'search' ) }
					tabIndex="-1"
				/>
				<div role="menu" className="editor-inserter__content">
					{ this.state.tab === 'recent' && ! isSearching &&
						<div className="editor-inserter__recent">
							<div
								className="editor-inserter__category-blocks"
								role="menu"
								tabIndex="0"
								aria-labelledby={ `editor-inserter__separator-${ 'recent' }-${ instanceId }` }
								key={ 'recent' }
							>
								{ visibleBlocksByCategory.recent.map( ( block ) => this.getBlockItem( block ) ) }
							</div>
						</div>
					}
					{ this.state.tab === 'blocks' && ! isSearching &&
						getCategories()
							.map( ( category ) => category.slug !== 'embed' && !! visibleBlocksByCategory[ category.slug ] && (
								<div key={ category.slug }>
									<div
										className="editor-inserter__separator"
										id={ `editor-inserter__separator-${ category.slug }-${ instanceId }` }
										aria-hidden="true"
									>
										{ category.title }
									</div>
									<div
										className="editor-inserter__category-blocks"
										role="menu"
										tabIndex="0"
										aria-labelledby={ `editor-inserter__separator-${ category.slug }-${ instanceId }` }
									>
										{ visibleBlocksByCategory[ category.slug ].map( ( block ) => this.getBlockItem( block ) ) }
									</div>
								</div>
							) )
					}
					{ this.state.tab === 'embeds' && ! isSearching &&
						getCategories()
							.map( ( category ) => category.slug === 'embed' && !! visibleBlocksByCategory[ category.slug ] && (
								<div
									className="editor-inserter__category-blocks"
									role="menu"
									tabIndex="0"
									aria-labelledby={ `editor-inserter__separator-${ category.slug }-${ instanceId }` }
									key={ category.slug }
								>
									{ visibleBlocksByCategory[ category.slug ].map( ( block ) => this.getBlockItem( block ) ) }
								</div>
							) )
					}
					{ isSearching &&
						getCategories()
							.map( ( category ) => !! visibleBlocksByCategory[ category.slug ] && (
								<div key={ category.slug }>
									<div
										className="editor-inserter__separator"
										id={ `editor-inserter__separator-${ category.slug }-${ instanceId }` }
										aria-hidden="true"
									>
										{ category.title }
									</div>
									<div
										className="editor-inserter__category-blocks"
										role="menu"
										tabIndex="0"
										aria-labelledby={ `editor-inserter__separator-${ category.slug }-${ instanceId }` }
									>
										{ visibleBlocksByCategory[ category.slug ].map( ( block ) => this.getBlockItem( block ) ) }
									</div>
								</div>
							) )
					}
				</div>
				{ ! isSearching &&
					<div className="editor-inserter__tabs is-recent">
						<button
							className={ `editor-inserter__tab ${ this.state.tab === 'recent' ? 'is-active' : '' }` }
							onClick={ () => this.switchTab( 'recent' ) }
						>
							{ __( 'Recent' ) }
						</button>
						<button
							className={ `editor-inserter__tab ${ this.state.tab === 'blocks' ? 'is-active' : '' }` }
							onClick={ () => this.switchTab( 'blocks' ) }
						>
							{ __( 'Blocks' ) }
						</button>
						<button
							className={ `editor-inserter__tab ${ this.state.tab === 'embeds' ? 'is-active' : '' }` }
							onClick={ () => this.switchTab( 'embeds' ) }
						>
							{ __( 'Embeds' ) }
						</button>
					</div>
				}
			</Popover>
		);
		/* eslint-enable jsx-a11y/no-autofocus */
	}
}

const connectComponent = connect(
	( state ) => {
		return {
			recentlyUsedBlocks: getRecentlyUsedBlocks( state ),
		};
	},
	{ showInsertionPoint, hideInsertionPoint }
);

export default flow(
	withInstanceId,
	withFocusReturn,
	connectComponent
)( InserterMenu );
