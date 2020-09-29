/**
 * External dependencies
 */
import { invert, keyBy } from 'lodash';

/**
 * WordPress dependencies
 */
import { createRegistrySelector } from '@wordpress/data';

/**
 * Internal dependencies
 */
import {
	buildWidgetAreasQuery,
	buildWidgetAreaPostId,
	KIND,
	POST_TYPE,
	WIDGET_AREA_ENTITY_TYPE,
} from './utils';

export const getWidgets = createRegistrySelector( ( select ) => () => {
	const initialWidgetAreas = select( 'core/edit-widgets' ).getWidgetAreas();

	return keyBy(
		initialWidgetAreas.flatMap( ( area ) => area.widgets ),
		( widget ) => widget.id
	);
} );

/**
 * Returns API widget data for a particular widget ID.
 *
 * @param  {number} id  Widget ID
 * @return {Object}     API widget data for a particular widget ID.
 */
export const getWidget = createRegistrySelector(
	( select ) => ( state, id ) => {
		const widgets = select( 'core/edit-widgets' ).getWidgets();
		return widgets[ id ];
	}
);

export const getWidgetAreas = createRegistrySelector( ( select ) => () => {
	if ( ! hasResolvedWidgetAreas( query ) ) {
		return null;
	}

	const query = buildWidgetAreasQuery();
	return select( 'core' ).getEntityRecords(
		KIND,
		WIDGET_AREA_ENTITY_TYPE,
		query
	);
} );

export const getWidgetIdForClientId = ( state, clientId ) => {
	const widgetIdToClientId = state.mapping;
	const clientIdToWidgetId = invert( widgetIdToClientId );
	return clientIdToWidgetId[ clientId ];
};

/**
 * Returns widgetArea containing a block identify by given clientId
 *
 * @param {string} clientId The ID of the block.
 * @return {Object} Containing widget area.
 */
export const getWidgetAreaForClientId = createRegistrySelector(
	( select ) => ( state, clientId ) => {
		const widgetAreas = select( 'core/edit-widgets' ).getWidgetAreas();
		for ( const widgetArea of widgetAreas ) {
			const post = select( 'core' ).getEditedEntityRecord(
				KIND,
				POST_TYPE,
				buildWidgetAreaPostId( widgetArea.id )
			);
			const clientIds = post.blocks.map( ( block ) => block.clientId );
			if ( clientIds.includes( clientId ) ) {
				return widgetArea;
			}
		}
	}
);

export const getEditedWidgetAreas = createRegistrySelector(
	( select ) => ( state, ids ) => {
		let widgetAreas = select( 'core/edit-widgets' ).getWidgetAreas();
		if ( ! widgetAreas ) {
			return [];
		}
		if ( ids ) {
			widgetAreas = widgetAreas.filter( ( { id } ) =>
				ids.includes( id )
			);
		}
		return widgetAreas
			.filter( ( { id } ) =>
				select( 'core' ).hasEditsForEntityRecord(
					KIND,
					POST_TYPE,
					buildWidgetAreaPostId( id )
				)
			)
			.map( ( { id } ) =>
				select( 'core' ).getEditedEntityRecord(
					KIND,
					WIDGET_AREA_ENTITY_TYPE,
					id
				)
			);
	}
);

export const isSavingWidgetAreas = createRegistrySelector(
	( select ) => ( state, ids ) => {
		if ( ! ids ) {
			ids = select( 'core/edit-widgets' )
				.getWidgetAreas()
				?.map( ( { id } ) => id );
		}
		if ( ! ids ) {
			return false;
		}
		for ( const id of ids ) {
			const isSaving = select( 'core' ).isSavingEntityRecord(
				KIND,
				WIDGET_AREA_ENTITY_TYPE,
				id
			);
			if ( isSaving ) {
				return true;
			}
		}
		return false;
	}
);

/**
 * Returns true if the navigation post related to menuId was already resolved.
 *
 * @param {number} menuId The id of menu.
 * @return {boolean} True if the navigation post related to menuId was already resolved, false otherwise.
 */
export const hasResolvedWidgetAreas = createRegistrySelector(
	( select, query = buildWidgetAreasQuery() ) => () => {
		const areas = select( 'core' ).getEntityRecords(
			KIND,
			WIDGET_AREA_ENTITY_TYPE,
			query
		);
		if ( ! areas?.length ) {
			return select( 'core' ).hasFinishedResolution( 'getEntityRecords', [
				KIND,
				WIDGET_AREA_ENTITY_TYPE,
				query,
			] );
		}

		return true;
	}
);

/**
 * Gets whether the widget area is opened.
 *
 * @param {Array}  state    The open state of the widget areas.
 * @param {string} clientId The clientId of the widget area.
 * @return {boolean}        True if the widget area is open.
 */
export const getIsWidgetAreaOpen = ( state, clientId ) => {
	const { widgetAreasOpenState } = state;
	return !! widgetAreasOpenState[ clientId ];
};

/**
 * Returns true if the inserter is opened.
 *
 * @param  {Object}  state Global application state.
 *
 * @return {boolean} Whether the inserter is opened.
 */
export function isInserterOpened( state ) {
	return state.isInserterOpened;
}
