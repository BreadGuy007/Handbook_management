/**
 * WordPress dependencies
 */
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { __, _x } from '@wordpress/i18n';
import {
	BlockToolbar,
	NavigableToolbar,
	BlockNavigationDropdown,
	ToolSelector,
} from '@wordpress/block-editor';
import {
	TableOfContents,
	EditorHistoryRedo,
	EditorHistoryUndo,
} from '@wordpress/editor';
import {
	Button,
	DropdownMenu,
	ToolbarItem,
	MenuItemsChoice,
	MenuGroup,
} from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useRef } from '@wordpress/element';

function HeaderToolbar() {
	const inserterButton = useRef();
	const { setIsInserterOpened } = useDispatch( 'core/edit-post' );
	const {
		hasReducedUI,
		hasFixedToolbar,
		isInserterEnabled,
		isInserterOpened,
		isTextModeEnabled,
		previewDeviceType,
		showIconLabels,
		isNavigationTool,
	} = useSelect( ( select ) => {
		const {
			hasInserterItems,
			getBlockRootClientId,
			getBlockSelectionEnd,
		} = select( 'core/block-editor' );
		return {
			hasFixedToolbar: select( 'core/edit-post' ).isFeatureActive(
				'fixedToolbar'
			),
			// This setting (richEditingEnabled) should not live in the block editor's setting.
			isInserterEnabled:
				select( 'core/edit-post' ).getEditorMode() === 'visual' &&
				select( 'core/editor' ).getEditorSettings()
					.richEditingEnabled &&
				hasInserterItems(
					getBlockRootClientId( getBlockSelectionEnd() )
				),
			isInserterOpened: select( 'core/edit-post' ).isInserterOpened(),
			isTextModeEnabled:
				select( 'core/edit-post' ).getEditorMode() === 'text',
			previewDeviceType: select(
				'core/edit-post'
			).__experimentalGetPreviewDeviceType(),
			showIconLabels: select( 'core/edit-post' ).isFeatureActive(
				'showIconLabels'
			),
			isNavigationTool: select( 'core/block-editor' ).isNavigationMode(),
			hasReducedUI: select( 'core/edit-post' ).isFeatureActive(
				'reducedUI'
			),
		};
	}, [] );
	const isLargeViewport = useViewportMatch( 'medium' );
	const isWideViewport = useViewportMatch( 'wide' );
	const isSmallViewport = useViewportMatch( 'small', '<' );
	const { setNavigationMode } = useDispatch( 'core/block-editor' );

	const displayBlockToolbar =
		! isLargeViewport || previewDeviceType !== 'Desktop' || hasFixedToolbar;

	const toolbarAriaLabel = displayBlockToolbar
		? /* translators: accessibility text for the editor toolbar when Top Toolbar is on */
		  __( 'Document and block tools' )
		: /* translators: accessibility text for the editor toolbar when Top Toolbar is off */
		  __( 'Document tools' );

	const onSwitchMode = ( mode ) => {
		setNavigationMode( mode === 'edit' ? false : true );
	};

	const overflowItems = (
		<>
			<ToolbarItem
				as={ TableOfContents }
				hasOutlineItemsDisabled={ isTextModeEnabled }
				repositionDropdown={ showIconLabels && ! isWideViewport }
				showTooltip={ ! showIconLabels }
				isTertiary={ showIconLabels }
			/>
			<ToolbarItem
				as={ BlockNavigationDropdown }
				isDisabled={ isTextModeEnabled }
				showTooltip={ ! showIconLabels }
				isTertiary={ showIconLabels }
			/>
		</>
	);

	return (
		<NavigableToolbar
			className="edit-post-header-toolbar"
			aria-label={ toolbarAriaLabel }
		>
			<div className="edit-post-header-toolbar__left">
				<ToolbarItem
					ref={ inserterButton }
					as={ Button }
					className="edit-post-header-toolbar__inserter-toggle"
					isPrimary
					isPressed={ isInserterOpened }
					onMouseDown={ ( event ) => {
						event.preventDefault();
					} }
					onClick={ () => {
						if ( isInserterOpened ) {
							// Focusing the inserter button closes the inserter popover
							inserterButton.current.focus();
						} else {
							setIsInserterOpened( true );
						}
					} }
					disabled={ ! isInserterEnabled }
					icon={ plus }
					/* translators: button label text should, if possible, be under 16
			characters. */
					label={ _x(
						'Add block',
						'Generic label for block inserter button'
					) }
					showTooltip={ ! showIconLabels }
				>
					{ showIconLabels && __( 'Add' ) }
				</ToolbarItem>
				{ ! hasReducedUI && ( isWideViewport || ! showIconLabels ) && (
					<>
						{ isLargeViewport && (
							<ToolbarItem
								as={ ToolSelector }
								showTooltip={ ! showIconLabels }
								isTertiary={ showIconLabels }
								disabled={ isTextModeEnabled }
							/>
						) }
						<ToolbarItem
							as={ EditorHistoryUndo }
							showTooltip={ ! showIconLabels }
							isTertiary={ showIconLabels }
						/>
						<ToolbarItem
							as={ EditorHistoryRedo }
							showTooltip={ ! showIconLabels }
							isTertiary={ showIconLabels }
						/>
						{ overflowItems }
					</>
				) }
				{ ! hasReducedUI &&
					! isWideViewport &&
					! isSmallViewport &&
					showIconLabels && (
						<DropdownMenu
							position="bottom right"
							label={
								/* translators: button label text should, if possible, be under 16
	characters. */
								__( 'Tools' )
							}
						>
							{ () => (
								<div className="edit-post-header__dropdown">
									<MenuGroup label={ __( 'Modes' ) }>
										<MenuItemsChoice
											value={
												isNavigationTool
													? 'select'
													: 'edit'
											}
											onSelect={ onSwitchMode }
											choices={ [
												{
													value: 'edit',
													label: __( 'Edit' ),
												},
												{
													value: 'select',
													label: __( 'Select' ),
												},
											] }
										/>
									</MenuGroup>
									<MenuGroup label={ __( 'Edit' ) }>
										<EditorHistoryUndo
											showTooltip={ ! showIconLabels }
											isTertiary={ showIconLabels }
										/>
										<EditorHistoryRedo
											showTooltip={ ! showIconLabels }
											isTertiary={ showIconLabels }
										/>
									</MenuGroup>
									<MenuGroup>{ overflowItems }</MenuGroup>
								</div>
							) }
						</DropdownMenu>
					) }
			</div>

			{ displayBlockToolbar && (
				<div className="edit-post-header-toolbar__block-toolbar">
					<BlockToolbar hideDragHandle />
				</div>
			) }
		</NavigableToolbar>
	);
}

export default HeaderToolbar;
