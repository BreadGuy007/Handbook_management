/**
 * WordPress Dependencies
 */
import { registerReducer, registerSelectors, withRehydratation, loadAndPersist } from '@wordpress/data';

/**
 * Internal dependencies
 */
import reducer from './reducer';
import applyMiddlewares from './middlewares';
import {
	getEditedPostContent,
	getEditedPostTitle,
	getSelectedBlockCount,
} from './selectors';

/**
 * Module Constants
 */
const STORAGE_KEY = `GUTENBERG_PREFERENCES_${ window.userSettings.uid }`;
const MODULE_KEY = 'core/editor';

const store = applyMiddlewares(
	registerReducer( MODULE_KEY, withRehydratation( reducer, 'preferences' ) )
);
loadAndPersist( store, reducer, 'preferences', STORAGE_KEY );

registerSelectors( MODULE_KEY, {
	getEditedPostContent,
	getEditedPostTitle,
	getSelectedBlockCount,
} );

export default store;
