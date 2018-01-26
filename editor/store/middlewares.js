/**
 * External dependencies
 */
import refx from 'refx';
import multi from 'redux-multi';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import effects from './effects';

/**
 * Applies the custom middlewares used specifically in the editor module.
 *
 * @param {Object} store Store Object.
 *
 * @returns {Object} Update Store Object.
 */
function applyMiddlewares( store ) {
	const middlewares = [
		refx( effects ),
		multi,
	];

	let enhancedDispatch = () => {
		throw new Error(
			'Dispatching while constructing your middleware is not allowed. ' +
			'Other middleware would not be applied to this dispatch.'
		);
	};
	let chain = [];

	const middlewareAPI = {
		getState: store.getState,
		dispatch: ( ...args ) => enhancedDispatch( ...args ),
	};
	chain = middlewares.map( middleware => middleware( middlewareAPI ) );
	enhancedDispatch = flowRight( ...chain )( store.dispatch );

	return {
		...store,
		dispatch: enhancedDispatch,
	};
}

export default applyMiddlewares;
