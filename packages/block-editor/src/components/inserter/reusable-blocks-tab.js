/**
 * WordPress dependencies
 */
import { withSpokenMessages } from '@wordpress/components';
import { useMemo, useEffect } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import BlockTypesList from '../block-types-list';
import { searchBlockItems } from './search-items';
import InserterPanel from './panel';
import InserterNoResults from './no-results';
import useBlockTypesState from './hooks/use-block-types-state';

function ReusableBlocksList( {
	debouncedSpeak,
	filterValue,
	onHover,
	onInsert,
	rootClientId,
} ) {
	const [ items, categories, collections, onSelectItem ] = useBlockTypesState(
		rootClientId,
		onInsert
	);

	const filteredItems = useMemo( () => {
		const reusableItems = items.filter(
			( { category } ) => category === 'reusable'
		);

		if ( ! filterValue ) {
			return reusableItems;
		}
		return searchBlockItems(
			reusableItems,
			categories,
			collections,
			filterValue
		);
	}, [ filterValue, items, categories, collections ] );

	// Announce search results on change.
	useEffect( () => {
		const resultsFoundMessage = sprintf(
			/* translators: %d: number of results. */
			_n( '%d result found.', '%d results found.', filteredItems.length ),
			filteredItems.length
		);
		debouncedSpeak( resultsFoundMessage );
	}, [ filterValue, debouncedSpeak ] );

	if ( filteredItems.length === 0 ) {
		return <InserterNoResults />;
	}

	return (
		<InserterPanel
			title={
				filterValue ? __( 'Search Results' ) : __( 'Reusable blocks' )
			}
		>
			<BlockTypesList
				items={ filteredItems }
				onSelect={ onSelectItem }
				onHover={ onHover }
			/>
		</InserterPanel>
	);
}

// The unwrapped component is only exported for use by unit tests.
/**
 * List of reusable blocks shown in the "Reusable" tab of the inserter.
 *
 * @param {Object}   props                Component props.
 * @param {?string}  props.rootClientId   Client id of block to insert into.
 * @param {Function} props.onInsert       Callback to run when item is inserted.
 * @param {Function} props.onHover        Callback to run when item is hovered.
 * @param {?string}  props.filterValue    Search term.
 * @param {Function} props.debouncedSpeak Debounced speak function.
 *
 * @return {WPComponent} The component.
 */
export function ReusableBlocksTab( {
	rootClientId,
	onInsert,
	onHover,
	filterValue,
	debouncedSpeak,
} ) {
	return (
		<>
			<ReusableBlocksList
				debouncedSpeak={ debouncedSpeak }
				filterValue={ filterValue }
				onHover={ onHover }
				onInsert={ onInsert }
				rootClientId={ rootClientId }
			/>
			<div className="block-editor-inserter__manage-reusable-blocks-container">
				<a
					className="block-editor-inserter__manage-reusable-blocks"
					href={ addQueryArgs( 'edit.php', {
						post_type: 'wp_block',
					} ) }
				>
					{ __( 'Manage all reusable blocks' ) }
				</a>
			</div>
		</>
	);
}

export default withSpokenMessages( ReusableBlocksTab );
