/**
 * External dependencies
 */
import createSelector from 'rememo';
import { map, find, get, filter } from 'lodash';

/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { REDUCER_KEY } from './name';
import { getQueriedItems } from './queried-data';

/**
 * Returns true if resolution is in progress for the core selector of the given
 * name and arguments.
 *
 * @param {string} selectorName Core data selector name.
 * @param {...*}   args         Arguments passed to selector.
 *
 * @return {boolean} Whether resolution is in progress.
 */
function isResolving( selectorName, ...args ) {
	return select( 'core/data' ).isResolving( REDUCER_KEY, selectorName, args );
}

/**
 * Returns true if a request is in progress for embed preview data, or false
 * otherwise.
 *
 * @param {Object} state Data state.
 * @param {string} url   URL the preview would be for.
 *
 * @return {boolean} Whether a request is in progress for an embed preview.
 */
export function isRequestingEmbedPreview( state, url ) {
	return isResolving( 'getEmbedPreview', url );
}

/**
 * Returns all available authors.
 *
 * @param {Object} state Data state.
 *
 * @return {Array} Authors list.
 */
export function getAuthors( state ) {
	return getUserQueryResults( state, 'authors' );
}

/**
 * Returns all the users returned by a query ID.
 *
 * @param {Object} state   Data state.
 * @param {string} queryID Query ID.
 *
 * @return {Array} Users list.
 */
export const getUserQueryResults = createSelector(
	( state, queryID ) => {
		const queryResults = state.users.queries[ queryID ];

		return map( queryResults, ( id ) => state.users.byId[ id ] );
	},
	( state, queryID ) => [ state.users.queries[ queryID ], state.users.byId ]
);

/**
 * Returns whether the entities for the give kind are loaded.
 *
 * @param {Object} state   Data state.
 * @param {string} kind  Entity kind.
 *
 * @return {boolean} Whether the entities are loaded
 */
export function getEntitiesByKind( state, kind ) {
	return filter( state.entities.config, { kind } );
}

/**
 * Returns the entity object given its kind and name.
 *
 * @param {Object} state   Data state.
 * @param {string} kind  Entity kind.
 * @param {string} name  Entity name.
 *
 * @return {Object} Entity
 */
export function getEntity( state, kind, name ) {
	return find( state.entities.config, { kind, name } );
}

/**
 * Returns the Entity's record object by key.
 *
 * @param {Object} state  State tree
 * @param {string} kind   Entity kind.
 * @param {string} name   Entity name.
 * @param {number} key    Record's key
 *
 * @return {Object?} Record.
 */
export function getEntityRecord( state, kind, name, key ) {
	return get( state.entities.data, [ kind, name, 'items', key ] );
}

/**
 * Returns the Entity's records.
 *
 * @param {Object}  state  State tree
 * @param {string}  kind   Entity kind.
 * @param {string}  name   Entity name.
 * @param {?Object} query  Optional terms query.
 *
 * @return {Array} Records.
 */
export function getEntityRecords( state, kind, name, query ) {
	const queriedState = get( state.entities.data, [ kind, name ] );
	if ( ! queriedState ) {
		return [];
	}
	return getQueriedItems( queriedState, query );
}

/**
 * Return theme supports data in the index.
 *
 * @param {Object} state Data state.
 *
 * @return {*}           Index data.
 */
export function getThemeSupports( state ) {
	return state.themeSupports;
}

/**
 * Returns the embed preview for the given URL.
 *
 * @param {Object} state    Data state.
 * @param {string} url      Embedded URL.
 *
 * @return {*} Undefined if the preview has not been fetched, otherwise, the preview fetched from the embed preview API.
 */
export function getEmbedPreview( state, url ) {
	return state.embedPreviews[ url ];
}

/**
 * Determines if the returned preview is an oEmbed link fallback.
 *
 * WordPress can be configured to return a simple link to a URL if it is not embeddable.
 * We need to be able to determine if a URL is embeddable or not, based on what we
 * get back from the oEmbed preview API.
 *
 * @param {Object} state    Data state.
 * @param {string} url      Embedded URL.
 *
 * @return {booleans} Is the preview for the URL an oEmbed link fallback.
 */
export function isPreviewEmbedFallback( state, url ) {
	const preview = state.embedPreviews[ url ];
	const oEmbedLinkCheck = '<a href="' + url + '">' + url + '</a>';
	if ( ! preview ) {
		return false;
	}
	return preview.html === oEmbedLinkCheck;
}

/**
 * Return Upload Permissions.
 *
 * @param  {Object}  state State tree.
 *
 * @return {boolean} Upload Permissions.
 */
export function hasUploadPermissions( state ) {
	return state.hasUploadPermissions;
}
