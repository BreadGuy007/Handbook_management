/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import InserterMenu from './menu';

function InserterLibrary( {
	rootClientId,
	clientId,
	isAppender,
	showInserterHelpPanel,
	showMostUsedBlocks = false,
	__experimentalSelectBlockOnInsert,
	__experimentalInsertionIndex,
	onSelect = noop,
} ) {
	const destinationRootClientId = useSelect(
		( select ) => {
			const { getBlockRootClientId } = select( 'core/block-editor' );

			return (
				rootClientId || getBlockRootClientId( clientId ) || undefined
			);
		},
		[ clientId, rootClientId ]
	);

	return (
		<InserterMenu
			onSelect={ onSelect }
			rootClientId={ destinationRootClientId }
			clientId={ clientId }
			isAppender={ isAppender }
			showInserterHelpPanel={ showInserterHelpPanel }
			showMostUsedBlocks={ showMostUsedBlocks }
			__experimentalSelectBlockOnInsert={
				__experimentalSelectBlockOnInsert
			}
			__experimentalInsertionIndex={ __experimentalInsertionIndex }
		/>
	);
}

export default InserterLibrary;
