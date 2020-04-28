/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';
import {
	BlockNavigationDropdown,
	ToolSelector,
	Inserter,
	__experimentalPreviewOptions as PreviewOptions,
} from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { PinnedItems } from '@wordpress/interface';

/**
 * Internal dependencies
 */
import { useEditorContext } from '../editor';
import FullscreenModeClose from './fullscreen-mode-close';
import MoreMenu from './more-menu';
import TemplateSwitcher from '../template-switcher';
import SaveButton from '../save-button';

const inserterToggleProps = { isPrimary: true };

export default function Header() {
	const { settings, setSettings } = useEditorContext();
	const setActiveTemplateId = useCallback(
		( newTemplateId ) =>
			setSettings( ( prevSettings ) => ( {
				...prevSettings,
				templateId: newTemplateId,
				templateType: 'wp_template',
			} ) ),
		[]
	);
	const setActiveTemplatePartId = useCallback(
		( newTemplatePartId ) =>
			setSettings( ( prevSettings ) => ( {
				...prevSettings,
				templateId: newTemplatePartId,
				templateType: 'wp_template_part',
			} ) ),
		[]
	);
	const addTemplateId = useCallback(
		( newTemplateId ) =>
			setSettings( ( prevSettings ) => ( {
				...prevSettings,
				templateId: newTemplateId,
				templateIds: [ ...prevSettings.templateIds, newTemplateId ],
			} ) ),
		[]
	);

	const deviceType = useSelect( ( select ) => {
		return select( 'core/edit-site' ).__experimentalGetPreviewDeviceType();
	}, [] );

	const {
		__experimentalSetPreviewDeviceType: setPreviewDeviceType,
	} = useDispatch( 'core/edit-site' );

	return (
		<div className="edit-site-header">
			<FullscreenModeClose />
			<div className="edit-site-header__toolbar">
				<Inserter
					position="bottom right"
					showInserterHelpPanel
					toggleProps={ inserterToggleProps }
				/>
				<TemplateSwitcher
					ids={ settings.templateIds }
					templatePartIds={ settings.templatePartIds }
					activeId={ settings.templateId }
					isTemplatePart={
						settings.templateType === 'wp_template_part'
					}
					onActiveIdChange={ setActiveTemplateId }
					onActiveTemplatePartIdChange={ setActiveTemplatePartId }
					onAddTemplateId={ addTemplateId }
				/>
				<BlockNavigationDropdown />
				<ToolSelector />
			</div>
			<div className="edit-site-header__actions">
				<PreviewOptions
					deviceType={ deviceType }
					setDeviceType={ setPreviewDeviceType }
				/>
				<SaveButton />
				<PinnedItems.Slot scope="core/edit-site" />
				<MoreMenu />
			</div>
		</div>
	);
}
