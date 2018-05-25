/**
 * WordPress dependencies
 */
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import reducer from './reducer';
import * as selectors from './selectors';
import * as actions from './actions';
import * as resolvers from './resolvers';
import { default as entities, getMethodName } from './entities';

/**
 * The reducer key used by core data in store registration.
 *
 * @type {string}
 */
export const REDUCER_KEY = 'core';

const createEntityRecordGetter = ( source ) => entities.reduce( ( result, entity ) => {
	const { kind, name } = entity;
	result[ getMethodName( kind, name ) ] = ( state, key ) => source.getEntityRecord( state, kind, name, key );
	result[ getMethodName( kind, name, 'get', true ) ] = ( state ) => source.getEntityRecords( state, kind, name );
	return result;
}, {} );

const entityResolvers = createEntityRecordGetter( resolvers );
const entitySelectors = createEntityRecordGetter( selectors );

const store = registerStore( REDUCER_KEY, {
	reducer,
	actions,
	selectors: { ...selectors, ...entitySelectors },
	resolvers: { ...resolvers, ...entityResolvers },
} );

export default store;
