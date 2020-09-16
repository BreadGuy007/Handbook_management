/**
 * External dependencies
 */
import { fromPairs } from 'lodash';

/**
 * WordPress dependencies
 */
import { useMemo, useCallback, useEffect } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';
import { useAsyncList } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import InserterPanel from './panel';
import PatternInserterPanel from './pattern-panel';
import { searchItems } from './search-items';
import InserterNoResults from './no-results';
import usePatternsState from './hooks/use-patterns-state';
import BlockPatternList from '../block-patterns-list';

function BlockPatternsSearchResults( { filterValue, onInsert } ) {
	const [ allPatterns, , onClick ] = usePatternsState( onInsert );

	const filteredPatterns = useMemo(
		() => searchItems( allPatterns, filterValue ),
		[ filterValue, allPatterns ]
	);

	const currentShownPatterns = useAsyncList( filteredPatterns );

	if ( filterValue ) {
		return !! filteredPatterns.length ? (
			<InserterPanel title={ __( 'Search Results' ) }>
				<BlockPatternList
					shownPatterns={ currentShownPatterns }
					blockPatterns={ filteredPatterns }
					onClickPattern={ onClick }
				/>
			</InserterPanel>
		) : (
			<InserterNoResults />
		);
	}
}

function BlockPatternsCategory( {
	onInsert,
	selectedCategory,
	onClickCategory,
} ) {
	const [ allPatterns, allCategories, onClick ] = usePatternsState(
		onInsert
	);

	// Remove any empty categories
	const populatedCategories = useMemo(
		() =>
			allCategories.filter( ( category ) =>
				allPatterns.some( ( pattern ) =>
					pattern.categories.includes( category.name )
				)
			),
		[ allPatterns, allCategories ]
	);

	const patternCategory = selectedCategory
		? selectedCategory
		: populatedCategories[ 0 ];

	useEffect( () => {
		if (
			allPatterns.some(
				( pattern ) => getPatternIndex( pattern ) === Infinity
			) &&
			! populatedCategories.find(
				( category ) => category.name === 'uncategorized'
			)
		) {
			populatedCategories.push( {
				name: 'uncategorized',
				label: _x( 'Uncategorized' ),
			} );
		}
	}, [ populatedCategories, allPatterns ] );

	const getPatternIndex = useCallback(
		( pattern ) => {
			if ( ! pattern.categories || ! pattern.categories.length ) {
				return Infinity;
			}
			const indexedCategories = fromPairs(
				populatedCategories.map( ( { name }, index ) => [
					name,
					index,
				] )
			);
			return Math.min(
				...pattern.categories.map( ( cat ) =>
					indexedCategories[ cat ] !== undefined
						? indexedCategories[ cat ]
						: Infinity
				)
			);
		},
		[ populatedCategories ]
	);

	const currentCategoryPatterns = useMemo(
		() =>
			allPatterns.filter( ( pattern ) =>
				patternCategory.name === 'uncategorized'
					? getPatternIndex( pattern ) === Infinity
					: pattern.categories &&
					  pattern.categories.includes( patternCategory.name )
			),
		[ allPatterns, patternCategory ]
	);

	// Ordering the patterns is important for the async rendering.
	const orderedPatterns = useMemo( () => {
		return currentCategoryPatterns.sort( ( a, b ) => {
			return getPatternIndex( a ) - getPatternIndex( b );
		} );
	}, [ currentCategoryPatterns, getPatternIndex ] );

	const currentShownPatterns = useAsyncList( orderedPatterns );

	return (
		<>
			{ !! currentCategoryPatterns.length && (
				<PatternInserterPanel
					key={ patternCategory.name }
					title={ patternCategory.title }
					selectedCategory={ patternCategory }
					patternCategories={ populatedCategories }
					onClickCategory={ onClickCategory }
				>
					<BlockPatternList
						shownPatterns={ currentShownPatterns }
						blockPatterns={ currentCategoryPatterns }
						onClickPattern={ onClick }
					/>
				</PatternInserterPanel>
			) }
		</>
	);
}

function BlockPatternsTabs( {
	onInsert,
	onClickCategory,
	filterValue,
	selectedCategory,
} ) {
	return filterValue ? (
		<BlockPatternsSearchResults
			onInsert={ onInsert }
			filterValue={ filterValue }
		/>
	) : (
		<BlockPatternsCategory
			selectedCategory={ selectedCategory }
			onInsert={ onInsert }
			onClickCategory={ onClickCategory }
		/>
	);
}

export default BlockPatternsTabs;
