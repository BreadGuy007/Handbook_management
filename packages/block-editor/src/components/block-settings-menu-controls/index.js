/**
 * External dependencies
 */
import { isEmpty, map } from 'lodash';

/**
 * WordPress dependencies
 */
import { createSlotFill, MenuGroup } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

const { Fill: BlockSettingsMenuControls, Slot } = createSlotFill(
	'BlockSettingsMenuControls'
);

const BlockSettingsMenuControlsSlot = ( { fillProps } ) => {
	const { selectedBlocks } = useSelect( ( select ) => {
		const { getBlocksByClientId, getSelectedBlockClientIds } = select(
			'core/block-editor'
		);
		return {
			selectedBlocks: map(
				getBlocksByClientId( getSelectedBlockClientIds() ),
				( block ) => block.name
			),
		};
	}, [] );

	return (
		<Slot fillProps={ { ...fillProps, selectedBlocks } }>
			{ ( fills ) =>
				! isEmpty( fills ) && <MenuGroup>{ fills }</MenuGroup>
			}
		</Slot>
	);
};

BlockSettingsMenuControls.Slot = BlockSettingsMenuControlsSlot;

/**
 * @see https://github.com/WordPress/gutenberg/blob/master/packages/block-editor/src/components/block-settings-menu-controls/README.md
 */
export default BlockSettingsMenuControls;
