/**
 * WordPress dependencies
 */
import { default as triggerApiFetch } from '@wordpress/api-fetch';
import { createRegistryControl } from '@wordpress/data';

/**
 * Trigger an API Fetch request.
 *
 * @param {Object} request API Fetch Request Object.
 * @return {Object} control descriptor.
 */
export function apiFetch( request ) {
	return {
		type: 'API_FETCH',
		request,
	};
}

/**
 * Calls a selector using the current state.
 *
 * @param {string} selectorName Selector name.
 * @param  {Array} args         Selector arguments.
 *
 * @return {Object} control descriptor.
 */
export function select( selectorName, ...args ) {
	return {
		type: 'SELECT',
		selectorName,
		args,
	};
}

/**
 * Dispatches a control action for triggering a registry select that has a
 * resolver.
 *
 * @param {string}  selectorName
 * @param {Array}   args  Arguments for the select.
 *
 * @return {Object} control descriptor.
 */
export function resolveSelect( selectorName, ...args ) {
	return {
		type: 'RESOLVE_SELECT',
		selectorName,
		args,
	};
}

const controls = {
	API_FETCH( { request } ) {
		return triggerApiFetch( request );
	},

	SELECT: createRegistryControl( ( registry ) => ( { selectorName, args } ) => {
		return registry.select( 'core' )[ selectorName ]( ...args );
	} ),

	RESOLVE_SELECT: createRegistryControl(
		( registry ) => ( { selectorName, args } ) => {
			return new Promise( ( resolve ) => {
				const hasFinished = () => registry.select( 'core/data' )
					.hasFinishedResolution( 'core', selectorName, args );
				const getResult = () => registry.select( 'core' )[ selectorName ]
					.apply( null, args );

				// trigger the selector (to trigger the resolver)
				const result = getResult();
				if ( hasFinished() ) {
					return resolve( result );
				}

				const unsubscribe = registry.subscribe( () => {
					if ( hasFinished() ) {
						unsubscribe();
						resolve( getResult() );
					}
				} );
			} );
		}
	),
};

export default controls;
