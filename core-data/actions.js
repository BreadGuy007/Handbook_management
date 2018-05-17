/**
 * External dependencies
 */
import { castArray } from 'lodash';

/**
 * Returns an action object used in signalling that the request for a given
 * data type has been made.
 *
 * @param {string}  dataType Data type requested.
 * @param {?string} subType  Optional data sub-type.
 *
 * @return {Object} Action object.
 */
export function setRequested( dataType, subType ) {
	return {
		type: 'SET_REQUESTED',
		dataType,
		subType,
	};
}

/**
 * Returns an action object used in signalling that terms have been received
 * for a given taxonomy.
 *
 * @param {string}   taxonomy Taxonomy name.
 * @param {Object[]} terms    Terms received.
 *
 * @return {Object} Action object.
 */
export function receiveTerms( taxonomy, terms ) {
	return {
		type: 'RECEIVE_TERMS',
		taxonomy,
		terms,
	};
}

/**
 * Returns an action object used in signalling that authors have been received.
 *
 * @param {string}       queryID Query ID.
 * @param {Array|Object} users   Users received.
 *
 * @return {Object} Action object.
 */
export function receiveUserQuery( queryID, users ) {
	return {
		type: 'RECEIVE_USER_QUERY',
		users: castArray( users ),
		queryID,
	};
}

/**
 * Returns an action object used in signalling that entity records have been received.
 *
 * @param {string}       kind    Kind of the received entity.
 * @param {string}       name    Name of the received entity.
 * @param {Array|Object} records Recordds received.
 *
 * @return {Object} Action object.
 */
export function receiveEntityRecords( kind, name, records ) {
	return {
		type: 'RECEIVE_ENTITY_RECORDS',
		records: castArray( records ),
		kind,
		name,
	};
}

/**
 * Returns an action object used in signalling that taxonomies have been received.
 *
 * @param {Array} taxonomies Taxonomies received.
 *
 * @return {Object} Action object.
 */
export function receiveTaxonomies( taxonomies ) {
	return {
		type: 'RECEIVE_TAXONOMIES',
		taxonomies,
	};
}

/**
 * Returns an action object used in signalling that the index has been received.
 *
 * @param {Object} index Index received.
 *
 * @return {Object} Action object.
 */
export function receiveThemeSupportsFromIndex( index ) {
	return {
		type: 'RECEIVE_THEME_SUPPORTS',
		themeSupports: index.theme_supports,
	};
}
