/**
 * WordPress dependencies
 */
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import reducer from './reducer';
import applyMiddlewares from './middlewares';
import * as actions from './actions';
import * as selectors from './selectors';

const store = registerStore( 'core/edit-post', {
	reducer,
	actions,
	selectors,
	persist: [ 'preferences' ],
} );

applyMiddlewares( store );
// Do not dispatch INIT for mobile as its effect currently only deals with
// setting up the sidebar and we don't need/support it at the moment for mobile

export default store;
