/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { MenuGroup } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { cloneBlock, getBlockFromExample } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import BlockStyles from '../block-styles';
import PreviewBlockPopover from './preview-block-popover';

export default function BlockStylesMenu( {
	hoveredBlock: { name, clientId },
	onSwitch,
} ) {
	const [ hoveredClassName, setHoveredClassName ] = useState();
	const blockType = useSelect(
		( select ) => select( 'core/blocks' ).getBlockType( name ),
		[ name ]
	);

	return (
		<MenuGroup
			label={ __( 'Styles' ) }
			className="block-editor-block-switcher__styles__menugroup"
		>
			{ hoveredClassName && (
				<PreviewBlockPopover
					blocks={
						blockType.example
							? getBlockFromExample( blockType.name, {
									attributes: {
										...blockType.example.attributes,
										className: hoveredClassName,
									},
									innerBlocks: blockType.example.innerBlocks,
							  } )
							: cloneBlock( blockType, {
									className: hoveredClassName,
							  } )
					}
				/>
			) }
			<BlockStyles
				clientId={ clientId }
				onSwitch={ onSwitch }
				onHoverClassName={ setHoveredClassName }
				itemRole="menuitem"
			/>
		</MenuGroup>
	);
}
