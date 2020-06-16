/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { LEFT, RIGHT, UP, DOWN, BACKSPACE, ENTER } from '@wordpress/keycodes';
import { TabPanel, VisuallyHidden } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Tips from './tips';
import InserterSearchForm from './search-form';
import InserterPreviewPanel from './preview-panel';
import InserterBlockList from './block-list';
import BlockPatterns from './block-patterns';
import useInsertionPoint from './hooks/use-insertion-point';

const stopKeyPropagation = ( event ) => event.stopPropagation();

function InserterMenu( {
	rootClientId,
	clientId,
	isAppender,
	__experimentalSelectBlockOnInsert,
	onSelect,
	showInserterHelpPanel,
} ) {
	const [ filterValue, setFilterValue ] = useState( '' );
	const [ hoveredItem, setHoveredItem ] = useState( null );
	const [
		destinationRootClientId,
		onInsertBlocks,
		onToggleInsertionPoint,
	] = useInsertionPoint( {
		rootClientId,
		clientId,
		isAppender,
		selectBlockOnInsert: __experimentalSelectBlockOnInsert,
	} );
	const { hasPatterns } = useSelect(
		( select ) => {
			const { getSettings } = select( 'core/block-editor' );
			return {
				hasPatterns: !! getSettings().__experimentalBlockPatterns
					?.length,
			};
		},
		[ isAppender, clientId, rootClientId ]
	);

	const showPatterns = ! destinationRootClientId && hasPatterns;
	const onKeyDown = ( event ) => {
		if (
			includes(
				[ LEFT, DOWN, RIGHT, UP, BACKSPACE, ENTER ],
				event.keyCode
			)
		) {
			// Stop the key event from propagating up to ObserveTyping.startTypingInTextField.
			event.stopPropagation();
		}
	};

	const onInsert = ( blocks ) => {
		onInsertBlocks( blocks );
		onSelect();
	};

	const onHover = ( item ) => {
		onToggleInsertionPoint( !! item );
		setHoveredItem( item );
	};

	const blocksTab = (
		<>
			<div className="block-editor-inserter__block-list">
				<InserterBlockList
					rootClientId={ destinationRootClientId }
					onInsert={ onInsert }
					onHover={ onHover }
					filterValue={ filterValue }
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
	);

	const patternsTab = (
		<BlockPatterns onInsert={ onInsert } filterValue={ filterValue } />
	);

	// Disable reason (no-autofocus): The inserter menu is a modal display, not one which
	// is always visible, and one which already incurs this behavior of autoFocus via
	// Popover's focusOnMount.
	// Disable reason (no-static-element-interactions): Navigational key-presses within
	// the menu are prevented from triggering WritingFlow and ObserveTyping interactions.
	/* eslint-disable jsx-a11y/no-autofocus, jsx-a11y/no-static-element-interactions */
	return (
		<div
			className="block-editor-inserter__menu"
			onKeyPress={ stopKeyPropagation }
			onKeyDown={ onKeyDown }
		>
			<div className="block-editor-inserter__main-area">
				<InserterSearchForm onChange={ setFilterValue } />
				{ showPatterns && (
					<TabPanel
						className="block-editor-inserter__tabs"
						tabs={ [
							{
								name: 'blocks',
								/* translators: Blocks tab title in the block inserter. */
								title: __( 'Blocks' ),
							},
							{
								name: 'patterns',
								/* translators: Patterns tab title in the block inserter. */
								title: __( 'Patterns' ),
							},
						] }
					>
						{ ( tab ) => {
							if ( tab.name === 'blocks' ) {
								return blocksTab;
							}
							return patternsTab;
						} }
					</TabPanel>
				) }
				{ ! showPatterns && blocksTab }
			</div>
			{ showInserterHelpPanel && hoveredItem && (
				<div className="block-editor-inserter__preview-container">
					<InserterPreviewPanel item={ hoveredItem } />
				</div>
			) }
		</div>
	);
	/* eslint-enable jsx-a11y/no-autofocus, jsx-a11y/no-static-element-interactions */
}

export default InserterMenu;
