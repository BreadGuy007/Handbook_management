/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Adds the rehydratation behavior to redux reducers.
 *
 * @param {Function} reducer    The reducer to enhance.
 * @param {string}   reducerKey The reducer key to persist.
 *
 * @returns {Function} Enhanced reducer.
 */
export function withRehydratation( reducer, reducerKey ) {
	// EnhancedReducer with auto-rehydration
	const enhancedReducer = ( state, action ) => {
		const nextState = reducer( state, action );

		if ( action.type === 'REDUX_REHYDRATE' ) {
			return {
				...nextState,
				[ reducerKey ]: action.payload,
			};
		}

		return nextState;
	};

	return enhancedReducer;
}

/**
 * Loads the initial state and persist on changes.
 *
 * This should be executed after the reducer's registration.
 *
 * @param {Object}   store      Store to enhance.
 * @param {Function} reducer    The reducer function. Used to get default values and to allow custom serialization by the reducers.
 * @param {string}   reducerKey The reducer key to persist (example: reducerKey.subReducerKey).
 * @param {string}   storageKey The storage key to use.
 */
export function loadAndPersist( store, reducer, reducerKey, storageKey ) {
	// Load initially persisted value
	const persistedString = window.localStorage.getItem( storageKey );
	if ( persistedString ) {
		const persistedState = {
			...get( reducer( undefined, { type: 'DEFAULTS' } ), reducerKey ),
			...JSON.parse( persistedString ),
		};

		store.dispatch( {
			type: 'REDUX_REHYDRATE',
			payload: persistedState,
		} );
	}

	// Persist updated preferences
	let currentStateValue = get( store.getState(), reducerKey );
	store.subscribe( () => {
		const newStateValue = get( store.getState(), reducerKey );
		if ( newStateValue !== currentStateValue ) {
			currentStateValue = newStateValue;
			const stateToSave = get( reducer( store.getState(), { type: 'REDUX_SERIALIZE' } ), reducerKey );
			window.localStorage.setItem( storageKey, JSON.stringify( stateToSave ) );
		}
	} );
}
