/**
 * WordPress dependencies
 */
import { useState, useCallback, useMemo } from '@wordpress/element';
import { VisuallyHidden } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Tips from './tips';
import InserterSearchForm from './search-form';
import InserterPreviewPanel from './preview-panel';
import BlockTypesTab from './block-types-tab';
import BlockPatternsTabs from './block-patterns-tab';
import ReusableBlocksTab from './reusable-blocks-tab';
import InserterSearchResults from './search-results';
import useInsertionPoint from './hooks/use-insertion-point';
import InserterTabs from './tabs';

function InserterMenu( {
	rootClientId,
	clientId,
	isAppender,
	__experimentalSelectBlockOnInsert,
	__experimentalInsertionIndex,
	onSelect,
	showInserterHelpPanel,
	showMostUsedBlocks,
} ) {
	const [ filterValue, setFilterValue ] = useState( '' );
	const [ hoveredItem, setHoveredItem ] = useState( null );
	const [ selectedPatternCategory, setSelectedPatternCategory ] = useState(
		null
	);

	const [
		destinationRootClientId,
		onInsertBlocks,
		onToggleInsertionPoint,
	] = useInsertionPoint( {
		rootClientId,
		clientId,
		isAppender,
		selectBlockOnInsert: __experimentalSelectBlockOnInsert,
		insertionIndex: __experimentalInsertionIndex,
	} );
	const { hasPatterns, hasReusableBlocks } = useSelect( ( select ) => {
		const {
			__experimentalBlockPatterns,
			__experimentalReusableBlocks,
		} = select( 'core/block-editor' ).getSettings();

		return {
			hasPatterns: !! __experimentalBlockPatterns?.length,
			hasReusableBlocks: !! __experimentalReusableBlocks?.length,
		};
	}, [] );

	const showPatterns = ! destinationRootClientId && hasPatterns;

	const onInsert = useCallback(
		( blocks ) => {
			onInsertBlocks( blocks );
			onSelect();
		},
		[ onInsertBlocks, onSelect ]
	);

	const onInsertPattern = useCallback(
		( blocks, patternName ) => {
			onInsertBlocks( blocks, { patternName } );
			onSelect();
		},
		[ onInsertBlocks, onSelect ]
	);

	const onHover = useCallback(
		( item ) => {
			onToggleInsertionPoint( !! item );
			setHoveredItem( item );
		},
		[ onToggleInsertionPoint, setHoveredItem ]
	);

	const onClickPatternCategory = useCallback(
		( patternCategory ) => {
			setSelectedPatternCategory( patternCategory );
		},
		[ setSelectedPatternCategory ]
	);

	const blocksTab = useMemo(
		() => (
			<>
				<div className="block-editor-inserter__block-list">
					<BlockTypesTab
						rootClientId={ destinationRootClientId }
						onInsert={ onInsert }
						onHover={ onHover }
						showMostUsedBlocks={ showMostUsedBlocks }
					/>
				</div>
				{ showInserterHelpPanel && (
					<div className="block-editor-inserter__tips">
						<VisuallyHidden as="h2">
							{ __( 'A tip for using the block editor' ) }
						</VisuallyHidden>
						<Tips />
					</div>
				) }
			</>
		),
		[
			destinationRootClientId,
			onInsert,
			onHover,
			filterValue,
			showMostUsedBlocks,
			showInserterHelpPanel,
		]
	);

	const patternsTab = useMemo(
		() => (
			<BlockPatternsTabs
				onInsert={ onInsertPattern }
				onClickCategory={ onClickPatternCategory }
				selectedCategory={ selectedPatternCategory }
			/>
		),
		[ onInsertPattern, onClickPatternCategory, selectedPatternCategory ]
	);

	const reusableBlocksTab = useMemo(
		() => (
			<ReusableBlocksTab
				rootClientId={ destinationRootClientId }
				onInsert={ onInsert }
				onHover={ onHover }
			/>
		),
		[ destinationRootClientId, onInsert, onHover ]
	);

	const getCurrentTab = useCallback(
		( tab ) => {
			if ( tab.name === 'blocks' ) {
				return blocksTab;
			} else if ( tab.name === 'patterns' ) {
				return patternsTab;
			}
			return reusableBlocksTab;
		},
		[ blocksTab, patternsTab, reusableBlocksTab ]
	);

	return (
		<div className="block-editor-inserter__menu">
			<div className="block-editor-inserter__main-area">
				{ /* the following div is necessary to fix the sticky position of the search form */ }
				<div className="block-editor-inserter__content">
					<InserterSearchForm
						onChange={ ( value ) => {
							if ( hoveredItem ) setHoveredItem( null );
							setFilterValue( value );
						} }
						value={ filterValue }
						placeholder={ __( 'Search' ) }
					/>
					{ !! filterValue && (
						<InserterSearchResults
							filterValue={ filterValue }
							onSelect={ onSelect }
							onHover={ onHover }
							rootClientId={ rootClientId }
							clientId={ clientId }
							isAppender={ isAppender }
							selectBlockOnInsert={
								__experimentalSelectBlockOnInsert
							}
							showBlockDirectory
						/>
					) }
					{ ! filterValue && ( showPatterns || hasReusableBlocks ) && (
						<InserterTabs
							showPatterns={ showPatterns }
							showReusableBlocks={ hasReusableBlocks }
						>
							{ getCurrentTab }
						</InserterTabs>
					) }
					{ ! filterValue &&
						! showPatterns &&
						! hasReusableBlocks &&
						blocksTab }
				</div>
			</div>
			{ showInserterHelpPanel && hoveredItem && (
				<InserterPreviewPanel item={ hoveredItem } />
			) }
		</div>
	);
}

export default InserterMenu;
