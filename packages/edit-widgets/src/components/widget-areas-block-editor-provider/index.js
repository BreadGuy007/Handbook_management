/**
 * External dependencies
 */
import { defaultTo } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	DropZoneProvider,
	SlotFillProvider,
	FocusReturnProvider,
} from '@wordpress/components';
import { uploadMedia } from '@wordpress/media-utils';
import { useDispatch, useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import {
	BlockEditorProvider,
	BlockEditorKeyboardShortcuts,
} from '@wordpress/block-editor';
import { ReusableBlocksMenuItems } from '@wordpress/reusable-blocks';

/**
 * Internal dependencies
 */
import KeyboardShortcuts from '../keyboard-shortcuts';
import { useEntityBlockEditor } from '@wordpress/core-data';
import { buildWidgetAreasPostId, KIND, POST_TYPE } from '../../store/utils';
import useLastSelectedWidgetArea from '../../hooks/use-last-selected-widget-area';

export default function WidgetAreasBlockEditorProvider( {
	blockEditorSettings,
	children,
	...props
} ) {
	const { hasUploadPermissions, reusableBlocks } = useSelect(
		( select ) => ( {
			hasUploadPermissions: defaultTo(
				select( 'core' ).canUser( 'create', 'media' ),
				true
			),
			widgetAreas: select( 'core/edit-widgets' ).getWidgetAreas(),
			widgets: select( 'core/edit-widgets' ).getWidgets(),
			reusableBlocks: select( 'core' ).getEntityRecords(
				'postType',
				'wp_block'
			),
		} ),
		[]
	);
	const { setIsInserterOpened } = useDispatch( 'core/edit-widgets' );

	const settings = useMemo( () => {
		let mediaUploadBlockEditor;
		if ( hasUploadPermissions ) {
			mediaUploadBlockEditor = ( { onError, ...argumentsObject } ) => {
				uploadMedia( {
					wpAllowedMimeTypes: blockEditorSettings.allowedMimeTypes,
					onError: ( { message } ) => onError( message ),
					...argumentsObject,
				} );
			};
		}
		return {
			...blockEditorSettings,
			__experimentalReusableBlocks: reusableBlocks,
			mediaUpload: mediaUploadBlockEditor,
			templateLock: 'all',
			__experimentalSetIsInserterOpened: setIsInserterOpened,
		};
	}, [
		blockEditorSettings,
		hasUploadPermissions,
		reusableBlocks,
		setIsInserterOpened,
	] );

	const widgetAreaId = useLastSelectedWidgetArea();

	const [ blocks, onInput, onChange ] = useEntityBlockEditor(
		KIND,
		POST_TYPE,
		{ id: buildWidgetAreasPostId() }
	);

	return (
		<>
			<BlockEditorKeyboardShortcuts.Register />
			<KeyboardShortcuts.Register />
			<SlotFillProvider>
				<DropZoneProvider>
					<FocusReturnProvider>
						<BlockEditorProvider
							value={ blocks }
							onInput={ onInput }
							onChange={ onChange }
							settings={ settings }
							useSubRegistry={ false }
							{ ...props }
						>
							{ children }
							<ReusableBlocksMenuItems
								rootClientId={ widgetAreaId }
							/>
						</BlockEditorProvider>
					</FocusReturnProvider>
				</DropZoneProvider>
			</SlotFillProvider>
		</>
	);
}
