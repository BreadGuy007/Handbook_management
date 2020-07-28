/**
 * External dependencies
 */
import { uniqueId } from 'lodash';

/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useEffect, useRef } from '@wordpress/element';
import {
	Button,
	Card,
	CardBody,
	Spinner,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
const { DOMParser } = window;

/**
 * Internal dependencies
 */
import CreateMenuArea from './create-menu-area';
import NavigationEditor from '../navigation-editor';

export default function MenusEditor( { blockEditorSettings } ) {
	const [ menuId, setMenuId ] = useState();
	const [ showCreateMenuPanel, setShowCreateMenuPanel ] = useState( false );
	const [ hasCompletedFirstLoad, setHasCompletedFirstLoad ] = useState(
		false
	);

	const noticeId = useRef();

	const { menus, hasLoadedMenus, menuDeleteError } = useSelect(
		( select ) => {
			const {
				getMenus,
				hasFinishedResolution,
				getLastEntityDeleteError,
			} = select( 'core' );
			const query = { per_page: -1 };
			return {
				menus: getMenus( query ),
				hasLoadedMenus: hasFinishedResolution( 'getMenus', [ query ] ),
				menuDeleteError: getLastEntityDeleteError(
					'root',
					'menu',
					menuId
				),
			};
		},
		[ menuId ]
	);

	const { deleteMenu } = useDispatch( 'core' );
	const { createErrorNotice, removeNotice } = useDispatch( 'core/notices' );

	useEffect( () => {
		if ( ! hasCompletedFirstLoad && hasLoadedMenus ) {
			setHasCompletedFirstLoad( true );
		}
	}, [ hasLoadedMenus ] );

	// Handle REST API Error messages.
	useEffect( () => {
		if ( menuDeleteError ) {
			// Error messages from the REST API often contain HTML.
			// createErrorNotice does not support HTML in error text, so first
			// strip HTML out using DOMParser.
			const document = new DOMParser().parseFromString(
				menuDeleteError.message,
				'text/html'
			);
			const errorText = document.body.textContent || '';
			noticeId.current = uniqueId(
				'navigation-editor/menu-editor/edit-navigation-delete-menu-error'
			);
			createErrorNotice( errorText, { id: noticeId.current } );
		}
	}, [ menuDeleteError ] );

	useEffect( () => {
		if ( menus?.length ) {
			// Only set menuId if it's currently unset.
			if ( ! menuId ) {
				setMenuId( menus[ 0 ].id );
			}
		}
	}, [ menus, menuId ] );

	if ( ! hasCompletedFirstLoad ) {
		return <Spinner />;
	}

	const hasMenus = !! menus?.length;
	const isCreateMenuPanelVisible =
		hasCompletedFirstLoad && ( ! hasMenus || showCreateMenuPanel );

	return (
		<>
			<Card className="edit-navigation-menus-editor__menu-selection-card">
				<CardBody className="edit-navigation-menus-editor__menu-selection-card-body">
					{ hasCompletedFirstLoad && ! hasMenus && (
						<p className="edit-navigation-menus-editor__menu-selection-card-instructional-text">
							{ __( 'Create your first menu below.' ) }
						</p>
					) }
					{ hasMenus && (
						<>
							<SelectControl
								className="edit-navigation-menus-editor__menu-select-control"
								label={ __( 'Select navigation to edit:' ) }
								options={ menus?.map( ( menu ) => ( {
									value: menu.id,
									label: menu.name,
								} ) ) }
								onChange={ ( selectedMenuId ) =>
									setMenuId( Number( selectedMenuId ) )
								}
								value={ menuId }
							/>
							<Button
								isLink
								onClick={ () => setShowCreateMenuPanel( true ) }
							>
								{ __( 'Create a new menu' ) }
							</Button>
						</>
					) }
				</CardBody>
			</Card>
			{ isCreateMenuPanelVisible && (
				<CreateMenuArea
					menus={ menus }
					onCancel={
						// User can only cancel out of menu creation if there
						// are other menus to fall back to showing.
						hasMenus
							? () => setShowCreateMenuPanel( false )
							: undefined
					}
					onCreateMenu={ ( newMenuId ) => {
						setMenuId( newMenuId );
						setShowCreateMenuPanel( false );
					} }
				/>
			) }
			{ hasMenus && (
				<NavigationEditor
					menuId={ menuId }
					blockEditorSettings={ blockEditorSettings }
					onDeleteMenu={ async () => {
						removeNotice( noticeId.current );
						const deletedMenu = await deleteMenu( menuId, {
							force: 'true',
						} );
						if ( deletedMenu ) {
							setMenuId( false );
						}
					} }
				/>
			) }
		</>
	);
}
