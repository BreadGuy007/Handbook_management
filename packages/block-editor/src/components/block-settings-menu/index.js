/**
 * External dependencies
 */
import { castArray, flow } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, _n } from '@wordpress/i18n';
import {
	Toolbar,
	DropdownMenu,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { shortcuts } from '../block-editor-keyboard-shortcuts';
import BlockActions from '../block-actions';
import BlockModeToggle from './block-mode-toggle';
import BlockHTMLConvertButton from './block-html-convert-button';
import BlockUnknownConvertButton from './block-unknown-convert-button';
import __experimentalBlockSettingsMenuFirstItem from './block-settings-menu-first-item';
import __experimentalBlockSettingsMenuPluginsExtension from './block-settings-menu-plugins-extension';

const POPOVER_PROPS = {
	className: 'block-editor-block-settings-menu__popover editor-block-settings-menu__popover',
	position: 'bottom right',
};

export function BlockSettingsMenu( { clientIds } ) {
	const blockClientIds = castArray( clientIds );
	const count = blockClientIds.length;
	const firstBlockClientId = blockClientIds[ 0 ];

	return (
		<BlockActions clientIds={ clientIds }>
			{ ( {
				canDuplicate,
				canInsertDefaultBlock,
				isLocked,
				onDuplicate,
				onInsertAfter,
				onInsertBefore,
				onRemove,
			} ) => (
				<Toolbar>
					<DropdownMenu
						icon="ellipsis"
						label={ __( 'More options' ) }
						className="block-editor-block-settings-menu"
						popoverProps={ POPOVER_PROPS }
					>
						{ ( { onClose } ) => (
							<>
								<MenuGroup>
									<__experimentalBlockSettingsMenuFirstItem.Slot
										fillProps={ { onClose } }
									/>
									{ count === 1 && (
										<BlockUnknownConvertButton
											clientId={ firstBlockClientId }
										/>
									) }
									{ count === 1 && (
										<BlockHTMLConvertButton
											clientId={ firstBlockClientId }
										/>
									) }
									{ canDuplicate && (
										<MenuItem
											className="editor-block-settings-menu__control block-editor-block-settings-menu__control"
											onClick={ flow( onClose, onDuplicate ) }
											icon="admin-page"
											shortcut={ shortcuts.duplicate.display }
										>
											{ __( 'Duplicate' ) }
										</MenuItem>
									) }
									{ canInsertDefaultBlock && (
										<>
											<MenuItem
												className="editor-block-settings-menu__control block-editor-block-settings-menu__control"
												onClick={ flow( onClose, onInsertBefore ) }
												icon="insert-before"
												shortcut={ shortcuts.insertBefore.display }
											>
												{ __( 'Insert Before' ) }
											</MenuItem>
											<MenuItem
												className="editor-block-settings-menu__control block-editor-block-settings-menu__control"
												onClick={ flow( onClose, onInsertAfter ) }
												icon="insert-after"
												shortcut={ shortcuts.insertAfter.display }
											>
												{ __( 'Insert After' ) }
											</MenuItem>
										</>
									) }
									{ count === 1 && (
										<BlockModeToggle
											clientId={ firstBlockClientId }
											onToggle={ onClose }
										/>
									) }
									<__experimentalBlockSettingsMenuPluginsExtension.Slot
										fillProps={ { clientIds, onClose } }
									/>
								</MenuGroup>
								<MenuGroup>
									{ ! isLocked && (
										<MenuItem
											className="editor-block-settings-menu__control block-editor-block-settings-menu__control"
											onClick={ flow( onClose, onRemove ) }
											icon="trash"
											shortcut={ shortcuts.removeBlock.display }
										>
											{ _n( 'Remove Block', 'Remove Blocks', count ) }
										</MenuItem>
									) }
								</MenuGroup>
							</>
						) }
					</DropdownMenu>
				</Toolbar>
			) }
		</BlockActions>
	);
}

export default BlockSettingsMenu;
