/**
 * WordPress dependencies
 */
import { useEffect, useState, useMemo, useCallback } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	SlotFillProvider,
	DropZoneProvider,
	Popover,
	FocusReturnProvider,
	Button,
} from '@wordpress/components';
import { EntityProvider } from '@wordpress/core-data';
import {
	BlockContextProvider,
	BlockSelectionClearer,
	BlockBreadcrumb,
	__unstableEditorStyles as EditorStyles,
	__experimentalUseResizeCanvas as useResizeCanvas,
} from '@wordpress/block-editor';
import {
	FullscreenMode,
	InterfaceSkeleton,
	ComplementaryArea,
} from '@wordpress/interface';
import { EntitiesSavedStates, UnsavedChangesWarning } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { PluginArea } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import Notices from '../notices';
import Header from '../header';
import { SidebarComplementaryAreaFills } from '../sidebar';
import BlockEditor from '../block-editor';
import KeyboardShortcuts from '../keyboard-shortcuts';
import GlobalStylesProvider from './global-styles-provider';
import LeftSidebar from '../left-sidebar';

const interfaceLabels = {
	leftSidebar: __( 'Block Library' ),
};

function Editor() {
	const [ leftSidebarContent, setLeftSidebarContent ] = useState( null );

	const {
		isFullscreenActive,
		deviceType,
		sidebarIsOpened,
		settings,
		entityId,
		templateType,
		page,
		template,
		select,
	} = useSelect( ( _select ) => {
		const {
			isFeatureActive,
			__experimentalGetPreviewDeviceType,
			getSettings,
			getTemplateId,
			getTemplatePartId,
			getTemplateType,
			getPage,
		} = _select( 'core/edit-site' );
		const _templateId = getTemplateId();
		const _templatePartId = getTemplatePartId();
		const _templateType = getTemplateType();

		// The currently selected entity to display. Typically template or template part.
		let _entityId;
		if ( _templateType ) {
			_entityId =
				_templateType === 'wp_template' ? _templateId : _templatePartId;
		}

		return {
			isFullscreenActive: isFeatureActive( 'fullscreenMode' ),
			deviceType: __experimentalGetPreviewDeviceType(),
			sidebarIsOpened: !! _select(
				'core/interface'
			).getActiveComplementaryArea( 'core/edit-site' ),
			settings: getSettings(),
			templateType: _templateType,
			page: getPage(),
			template: _templateType
				? _select( 'core' ).getEntityRecord(
						'postType',
						_templateType,
						_entityId
				  )
				: null,
			select: _select,
			entityId: _entityId,
		};
	}, [] );
	const { editEntityRecord } = useDispatch( 'core' );
	const { setPage } = useDispatch( 'core/edit-site' );

	const inlineStyles = useResizeCanvas( deviceType );

	const [
		isEntitiesSavedStatesOpen,
		setIsEntitiesSavedStatesOpen,
	] = useState( false );
	const openEntitiesSavedStates = useCallback(
		() => setIsEntitiesSavedStatesOpen( true ),
		[]
	);
	const closeEntitiesSavedStates = useCallback(
		( entitiesToSave ) => {
			if ( entitiesToSave ) {
				const { getEditedEntityRecord } = select( 'core' );
				entitiesToSave.forEach( ( { kind, name, key } ) => {
					const record = getEditedEntityRecord( kind, name, key );

					const edits = record.slug
						? { status: 'publish', title: record.slug }
						: { status: 'publish' };

					editEntityRecord( kind, name, key, edits );
				} );
			}
			setIsEntitiesSavedStatesOpen( false );
		},
		[ select ]
	);

	// Set default query for misplaced Query Loop blocks, and
	// provide the root `queryContext` for top-level Query Loop
	// and Query Pagination blocks.
	const blockContext = useMemo(
		() => ( {
			...page?.context,
			query: page?.context.query || { categoryIds: [], tagIds: [] },
			queryContext: [
				page?.context.queryContext || { page: 1 },
				( newQueryContext ) =>
					setPage( {
						...page,
						context: {
							...page?.context,
							queryContext: {
								...page?.context.queryContext,
								...newQueryContext,
							},
						},
					} ),
			],
		} ),
		[ page?.context ]
	);

	const isNavigationOpen = leftSidebarContent === 'navigation';

	useEffect( () => {
		if ( isNavigationOpen ) {
			document.body.classList.add( 'is-navigation-sidebar-open' );
		} else {
			document.body.classList.remove( 'is-navigation-sidebar-open' );
		}
	}, [ isNavigationOpen ] );

	const toggleLeftSidebarContent = ( value ) =>
		setLeftSidebarContent( leftSidebarContent === value ? null : value );

	return (
		<>
			<EditorStyles styles={ settings.styles } />
			<FullscreenMode isActive={ isFullscreenActive } />
			<UnsavedChangesWarning />
			<SlotFillProvider>
				<DropZoneProvider>
					<EntityProvider kind="root" type="site">
						<EntityProvider
							kind="postType"
							type={ templateType }
							id={ entityId }
						>
							<EntityProvider
								kind="postType"
								type="wp_global_styles"
								id={
									settings.__experimentalGlobalStylesUserEntityId
								}
							>
								<BlockContextProvider value={ blockContext }>
									<FocusReturnProvider>
										<GlobalStylesProvider
											baseStyles={
												settings.__experimentalGlobalStylesBaseStyles
											}
											contexts={
												settings.__experimentalGlobalStylesContexts
											}
										>
											<KeyboardShortcuts.Register />
											<SidebarComplementaryAreaFills />
											<InterfaceSkeleton
												labels={ interfaceLabels }
												leftSidebar={
													<LeftSidebar
														content={
															leftSidebarContent
														}
														setContent={
															setLeftSidebarContent
														}
													/>
												}
												sidebar={
													sidebarIsOpened && (
														<ComplementaryArea.Slot scope="core/edit-site" />
													)
												}
												header={
													<Header
														openEntitiesSavedStates={
															openEntitiesSavedStates
														}
														isInserterOpen={
															leftSidebarContent ===
															'inserter'
														}
														onToggleInserter={ () =>
															toggleLeftSidebarContent(
																'inserter'
															)
														}
														isNavigationOpen={
															isNavigationOpen
														}
														onToggleNavigation={ () =>
															toggleLeftSidebarContent(
																'navigation'
															)
														}
													/>
												}
												content={
													<BlockSelectionClearer
														className="edit-site-visual-editor"
														style={ inlineStyles }
													>
														<Notices />
														<Popover.Slot name="block-toolbar" />
														{ template && (
															<BlockEditor
																setIsInserterOpen={ (
																	isInserterOpen
																) =>
																	setLeftSidebarContent(
																		isInserterOpen
																			? 'inserter'
																			: null
																	)
																}
															/>
														) }
														<KeyboardShortcuts />
													</BlockSelectionClearer>
												}
												actions={
													<>
														<EntitiesSavedStates
															isOpen={
																isEntitiesSavedStatesOpen
															}
															close={
																closeEntitiesSavedStates
															}
														/>
														{ ! isEntitiesSavedStatesOpen && (
															<div className="edit-site-editor__toggle-save-panel">
																<Button
																	isSecondary
																	className="edit-site-editor__toggle-save-panel-button"
																	onClick={
																		openEntitiesSavedStates
																	}
																	aria-expanded={
																		false
																	}
																>
																	{ __(
																		'Open save panel'
																	) }
																</Button>
															</div>
														) }
													</>
												}
												footer={ <BlockBreadcrumb /> }
											/>
											<Popover.Slot />
											<PluginArea />
										</GlobalStylesProvider>
									</FocusReturnProvider>
								</BlockContextProvider>
							</EntityProvider>
						</EntityProvider>
					</EntityProvider>
				</DropZoneProvider>
			</SlotFillProvider>
		</>
	);
}
export default Editor;
