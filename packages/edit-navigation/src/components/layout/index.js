/**
 * WordPress dependencies
 */
import {
	DropZoneProvider,
	FocusReturnProvider,
	Popover,
	SlotFillProvider,
	TabPanel,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Notices from '../notices';
import MenusEditor from '../menus-editor';
import MenuLocationsEditor from '../menu-locations-editor';
import ErrorBoundary from '../error-boundary';

export default function Layout( { blockEditorSettings } ) {
	return (
		<>
			<ErrorBoundary>
				<SlotFillProvider>
					<DropZoneProvider>
						<FocusReturnProvider>
							<Notices />
							<TabPanel
								className="edit-navigation-layout__tab-panel"
								tabs={ [
									{
										name: 'menus',
										title: __( 'Edit Navigation' ),
									},
									{
										name: 'menu-locations',
										title: __( 'Manage Locations' ),
									},
								] }
							>
								{ ( tab ) => (
									<ErrorBoundary>
										{ tab.name === 'menus' && (
											<MenusEditor
												blockEditorSettings={
													blockEditorSettings
												}
											/>
										) }
										{ tab.name === 'menu-locations' && (
											<MenuLocationsEditor />
										) }
									</ErrorBoundary>
								) }
							</TabPanel>
							<Popover.Slot />
						</FocusReturnProvider>
					</DropZoneProvider>
				</SlotFillProvider>
			</ErrorBoundary>
		</>
	);
}
