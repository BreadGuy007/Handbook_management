/**
 * External dependencies
 */
import {
	flow,
	reduce,
	first,
	last,
	omit,
	without,
	mapValues,
	keys,
	isEqual,
	isEmpty,
	get,
} from 'lodash';

/**
 * WordPress dependencies
 */
import { combineReducers } from '@wordpress/data';
import { isReusableBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import {
	PREFERENCES_DEFAULTS,
	SETTINGS_DEFAULTS,
} from './defaults';
import { insertAt, moveTo } from './array';

/**
 * Given an array of blocks, returns an object where each key is a nesting
 * context, the value of which is an array of block client IDs existing within
 * that nesting context.
 *
 * @param {Array}   blocks       Blocks to map.
 * @param {?string} rootClientId Assumed root client ID.
 *
 * @return {Object} Block order map object.
 */
function mapBlockOrder( blocks, rootClientId = '' ) {
	const result = { [ rootClientId ]: [] };

	blocks.forEach( ( block ) => {
		const { clientId, innerBlocks } = block;

		result[ rootClientId ].push( clientId );

		Object.assign( result, mapBlockOrder( innerBlocks, clientId ) );
	} );

	return result;
}

/**
 * Helper method to iterate through all blocks, recursing into inner blocks,
 * applying a transformation function to each one.
 * Returns a flattened object with the transformed blocks.
 *
 * @param {Array} blocks Blocks to flatten.
 * @param {Function} transform Transforming function to be applied to each block.
 *
 * @return {Object} Flattened object.
 */
function flattenBlocks( blocks, transform ) {
	const result = {};

	const stack = [ ...blocks ];
	while ( stack.length ) {
		const { innerBlocks, ...block } = stack.shift();
		stack.push( ...innerBlocks );
		result[ block.clientId ] = transform( block );
	}

	return result;
}

/**
 * Given an array of blocks, returns an object containing all blocks, without
 * attributes, recursing into inner blocks. Keys correspond to the block client
 * ID, the value of which is the attributes object.
 *
 * @param {Array} blocks Blocks to flatten.
 *
 * @return {Object} Flattened block attributes object.
 */
function getFlattenedBlocksWithoutAttributes( blocks ) {
	return flattenBlocks( blocks, ( block ) => omit( block, 'attributes' ) );
}

/**
 * Given an array of blocks, returns an object containing all block attributes,
 * recursing into inner blocks. Keys correspond to the block client ID, the
 * value of which is the attributes object.
 *
 * @param {Array} blocks Blocks to flatten.
 *
 * @return {Object} Flattened block attributes object.
 */
function getFlattenedBlockAttributes( blocks ) {
	return flattenBlocks( blocks, ( block ) => block.attributes );
}

/**
 * Given a block order map object, returns *all* of the block client IDs that are
 * a descendant of the given root client ID.
 *
 * Calling this with `rootClientId` set to `''` results in a list of client IDs
 * that are in the post. That is, it excludes blocks like fetched reusable
 * blocks which are stored into state but not visible.
 *
 * @param {Object}  blocksOrder  Object that maps block client IDs to a list of
 *                               nested block client IDs.
 * @param {?string} rootClientId The root client ID to search. Defaults to ''.
 *
 * @return {Array} List of descendant client IDs.
 */
function getNestedBlockClientIds( blocksOrder, rootClientId = '' ) {
	return reduce( blocksOrder[ rootClientId ], ( result, clientId ) => [
		...result,
		clientId,
		...getNestedBlockClientIds( blocksOrder, clientId ),
	], [] );
}

/**
 * Returns an object against which it is safe to perform mutating operations,
 * given the original object and its current working copy.
 *
 * @param {Object} original Original object.
 * @param {Object} working  Working object.
 *
 * @return {Object} Mutation-safe object.
 */
function getMutateSafeObject( original, working ) {
	if ( original === working ) {
		return { ...original };
	}

	return working;
}

/**
 * Returns true if the two object arguments have the same keys, or false
 * otherwise.
 *
 * @param {Object} a First object.
 * @param {Object} b Second object.
 *
 * @return {boolean} Whether the two objects have the same keys.
 */
export function hasSameKeys( a, b ) {
	return isEqual( keys( a ), keys( b ) );
}

/**
 * Returns true if, given the currently dispatching action and the previously
 * dispatched action, the two actions are updating the same block attribute, or
 * false otherwise.
 *
 * @param {Object} action     Currently dispatching action.
 * @param {Object} lastAction Previously dispatched action.
 *
 * @return {boolean} Whether actions are updating the same block attribute.
 */
export function isUpdatingSameBlockAttribute( action, lastAction ) {
	return (
		action.type === 'UPDATE_BLOCK_ATTRIBUTES' &&
		lastAction !== undefined &&
		lastAction.type === 'UPDATE_BLOCK_ATTRIBUTES' &&
		action.clientId === lastAction.clientId &&
		hasSameKeys( action.attributes, lastAction.attributes )
	);
}

/**
 * Higher-order reducer intended to augment the blocks reducer, assigning an
 * `isPersistentChange` property value corresponding to whether a change in
 * state can be considered as persistent. All changes are considered persistent
 * except when updating the same block attribute as in the previous action.
 *
 * @param {Function} reducer Original reducer function.
 *
 * @return {Function} Enhanced reducer function.
 */
function withPersistentBlockChange( reducer ) {
	let lastAction;

	/**
	 * Set of action types for which a blocks state change should be considered
	 * non-persistent.
	 *
	 * @type {Set}
	 */
	const IGNORED_ACTION_TYPES = new Set( [
		'RECEIVE_BLOCKS',
	] );

	return ( state, action ) => {
		let nextState = reducer( state, action );

		const isExplicitPersistentChange = action.type === 'MARK_LAST_CHANGE_AS_PERSISTENT';

		// Defer to previous state value (or default) unless changing or
		// explicitly marking as persistent.
		if ( state === nextState && ! isExplicitPersistentChange ) {
			return {
				...nextState,
				isPersistentChange: get( state, [ 'isPersistentChange' ], true ),
			};
		}

		// Some state changes should not be considered persistent, namely those
		// which are not a direct result of user interaction.
		const isIgnoredActionType = IGNORED_ACTION_TYPES.has( action.type );
		if ( isIgnoredActionType ) {
			return {
				...nextState,
				isPersistentChange: false,
			};
		}

		nextState = {
			...nextState,
			isPersistentChange: (
				isExplicitPersistentChange ||
				! isUpdatingSameBlockAttribute( action, lastAction )
			),
		};

		// In comparing against the previous action, consider only those which
		// would have qualified as one which would have been ignored or not
		// have resulted in a changed state.
		lastAction = action;

		return nextState;
	};
}

/**
 * Higher-order reducer targeting the combined blocks reducer, augmenting
 * block client IDs in remove action to include cascade of inner blocks.
 *
 * @param {Function} reducer Original reducer function.
 *
 * @return {Function} Enhanced reducer function.
 */
const withInnerBlocksRemoveCascade = ( reducer ) => ( state, action ) => {
	if ( state && action.type === 'REMOVE_BLOCKS' ) {
		const clientIds = [ ...action.clientIds ];

		// For each removed client ID, include its inner blocks to remove,
		// recursing into those so long as inner blocks exist.
		for ( let i = 0; i < clientIds.length; i++ ) {
			clientIds.push( ...state.order[ clientIds[ i ] ] );
		}

		action = { ...action, clientIds };
	}

	return reducer( state, action );
};

/**
 * Higher-order reducer which targets the combined blocks reducer and handles
 * the `RESET_BLOCKS` action. When dispatched, this action will replace all
 * blocks that exist in the post, leaving blocks that exist only in state (e.g.
 * reusable blocks) alone.
 *
 * @param {Function} reducer Original reducer function.
 *
 * @return {Function} Enhanced reducer function.
 */
const withBlockReset = ( reducer ) => ( state, action ) => {
	if ( state && action.type === 'RESET_BLOCKS' ) {
		const visibleClientIds = getNestedBlockClientIds( state.order );
		return {
			...state,
			byClientId: {
				...omit( state.byClientId, visibleClientIds ),
				...getFlattenedBlocksWithoutAttributes( action.blocks ),
			},
			attributes: {
				...omit( state.attributes, visibleClientIds ),
				...getFlattenedBlockAttributes( action.blocks ),
			},
			order: {
				...omit( state.order, visibleClientIds ),
				...mapBlockOrder( action.blocks ),
			},
		};
	}

	return reducer( state, action );
};

/**
 * Higher-order reducer which targets the combined blocks reducer and handles
 * the `REPLACE_INNER_BLOCKS` action. When dispatched, this action the state should become equivalent
 * to the execution of a `REMOVE_BLOCKS` action containing all the child's of the root block followed by
 * the execution of `INSERT_BLOCKS` with the new blocks.
 *
 * @param {Function} reducer Original reducer function.
 *
 * @return {Function} Enhanced reducer function.
 */
const withReplaceInnerBlocks = ( reducer ) => ( state, action ) => {
	if ( action.type !== 'REPLACE_INNER_BLOCKS' ) {
		return reducer( state, action );
	}
	let stateAfterBlocksRemoval = state;
	if ( state.order[ action.rootClientId ] ) {
		stateAfterBlocksRemoval = reducer( stateAfterBlocksRemoval, {
			type: 'REMOVE_BLOCKS',
			clientIds: state.order[ action.rootClientId ],
		} );
	}
	let stateAfterInsert = stateAfterBlocksRemoval;
	if ( action.blocks.length ) {
		stateAfterInsert = reducer( stateAfterInsert, {
			...action,
			type: 'INSERT_BLOCKS',
			index: 0,
		} );
	}
	return stateAfterInsert;
};

/**
 * Higher-order reducer which targets the combined blocks reducer and handles
 * the `SAVE_REUSABLE_BLOCK_SUCCESS` action. This action can't be handled by
 * regular reducers and needs a higher-order reducer since it needs access to
 * both `byClientId` and `attributes` simultaneously.
 *
 * @param {Function} reducer Original reducer function.
 *
 * @return {Function} Enhanced reducer function.
 */
const withSaveReusableBlock = ( reducer ) => ( state, action ) => {
	if ( state && action.type === 'SAVE_REUSABLE_BLOCK_SUCCESS' ) {
		const { id, updatedId } = action;

		// If a temporary reusable block is saved, we swap the temporary id with the final one
		if ( id === updatedId ) {
			return state;
		}

		state = { ...state };

		state.attributes = mapValues( state.attributes, ( attributes, clientId ) => {
			const { name } = state.byClientId[ clientId ];
			if ( name === 'core/block' && attributes.ref === id ) {
				return {
					...attributes,
					ref: updatedId,
				};
			}

			return attributes;
		} );
	}

	return reducer( state, action );
};

/**
 * Reducer returning the blocks state.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @returns {Object} Updated state.
 */
export const blocks = flow(
	combineReducers,
	withInnerBlocksRemoveCascade,
	withReplaceInnerBlocks, // needs to be after withInnerBlocksRemoveCascade
	withBlockReset,
	withSaveReusableBlock,
	withPersistentBlockChange,
)( {
	byClientId( state = {}, action ) {
		switch ( action.type ) {
			case 'RESET_BLOCKS':
				return getFlattenedBlocksWithoutAttributes( action.blocks );

			case 'RECEIVE_BLOCKS':
				return {
					...state,
					...getFlattenedBlocksWithoutAttributes( action.blocks ),
				};

			case 'UPDATE_BLOCK':
				// Ignore updates if block isn't known
				if ( ! state[ action.clientId ] ) {
					return state;
				}

				// Do nothing if only attributes change.
				const changes = omit( action.updates, 'attributes' );
				if ( isEmpty( changes ) ) {
					return state;
				}

				return {
					...state,
					[ action.clientId ]: {
						...state[ action.clientId ],
						...changes,
					},
				};

			case 'INSERT_BLOCKS':
				return {
					...state,
					...getFlattenedBlocksWithoutAttributes( action.blocks ),
				};

			case 'REPLACE_BLOCKS':
				if ( ! action.blocks ) {
					return state;
				}

				return {
					...omit( state, action.clientIds ),
					...getFlattenedBlocksWithoutAttributes( action.blocks ),
				};

			case 'REMOVE_BLOCKS':
				return omit( state, action.clientIds );
		}

		return state;
	},

	attributes( state = {}, action ) {
		switch ( action.type ) {
			case 'RESET_BLOCKS':
				return getFlattenedBlockAttributes( action.blocks );

			case 'RECEIVE_BLOCKS':
				return {
					...state,
					...getFlattenedBlockAttributes( action.blocks ),
				};

			case 'UPDATE_BLOCK':
				// Ignore updates if block isn't known or there are no attribute changes.
				if ( ! state[ action.clientId ] || ! action.updates.attributes ) {
					return state;
				}

				return {
					...state,
					[ action.clientId ]: {
						...state[ action.clientId ],
						...action.updates.attributes,
					},
				};

			case 'UPDATE_BLOCK_ATTRIBUTES':
				// Ignore updates if block isn't known
				if ( ! state[ action.clientId ] ) {
					return state;
				}

				// Consider as updates only changed values
				const nextAttributes = reduce( action.attributes, ( result, value, key ) => {
					if ( value !== result[ key ] ) {
						result = getMutateSafeObject( state[ action.clientId ], result );
						result[ key ] = value;
					}

					return result;
				}, state[ action.clientId ] );

				// Skip update if nothing has been changed. The reference will
				// match the original block if `reduce` had no changed values.
				if ( nextAttributes === state[ action.clientId ] ) {
					return state;
				}

				// Otherwise replace attributes in state
				return {
					...state,
					[ action.clientId ]: nextAttributes,
				};

			case 'INSERT_BLOCKS':
				return {
					...state,
					...getFlattenedBlockAttributes( action.blocks ),
				};

			case 'REPLACE_BLOCKS':
				if ( ! action.blocks ) {
					return state;
				}

				return {
					...omit( state, action.clientIds ),
					...getFlattenedBlockAttributes( action.blocks ),
				};

			case 'REMOVE_BLOCKS':
				return omit( state, action.clientIds );
		}

		return state;
	},

	order( state = {}, action ) {
		switch ( action.type ) {
			case 'RESET_BLOCKS':
				return mapBlockOrder( action.blocks );

			case 'RECEIVE_BLOCKS':
				return {
					...state,
					...omit( mapBlockOrder( action.blocks ), '' ),
				};

			case 'INSERT_BLOCKS': {
				const { rootClientId = '' } = action;
				const subState = state[ rootClientId ] || [];
				const mappedBlocks = mapBlockOrder( action.blocks, rootClientId );
				const { index = subState.length } = action;

				return {
					...state,
					...mappedBlocks,
					[ rootClientId ]: insertAt( subState, mappedBlocks[ rootClientId ], index ),
				};
			}

			case 'MOVE_BLOCK_TO_POSITION': {
				const { fromRootClientId = '', toRootClientId = '', clientId } = action;
				const { index = state[ toRootClientId ].length } = action;

				// Moving inside the same parent block
				if ( fromRootClientId === toRootClientId ) {
					const subState = state[ toRootClientId ];
					const fromIndex = subState.indexOf( clientId );
					return {
						...state,
						[ toRootClientId ]: moveTo( state[ toRootClientId ], fromIndex, index ),
					};
				}

				// Moving from a parent block to another
				return {
					...state,
					[ fromRootClientId ]: without( state[ fromRootClientId ], clientId ),
					[ toRootClientId ]: insertAt( state[ toRootClientId ], clientId, index ),
				};
			}

			case 'MOVE_BLOCKS_UP': {
				const { clientIds, rootClientId = '' } = action;
				const firstClientId = first( clientIds );
				const subState = state[ rootClientId ];

				if ( ! subState.length || firstClientId === first( subState ) ) {
					return state;
				}

				const firstIndex = subState.indexOf( firstClientId );

				return {
					...state,
					[ rootClientId ]: moveTo( subState, firstIndex, firstIndex - 1, clientIds.length ),
				};
			}

			case 'MOVE_BLOCKS_DOWN': {
				const { clientIds, rootClientId = '' } = action;
				const firstClientId = first( clientIds );
				const lastClientId = last( clientIds );
				const subState = state[ rootClientId ];

				if ( ! subState.length || lastClientId === last( subState ) ) {
					return state;
				}

				const firstIndex = subState.indexOf( firstClientId );

				return {
					...state,
					[ rootClientId ]: moveTo( subState, firstIndex, firstIndex + 1, clientIds.length ),
				};
			}

			case 'REPLACE_BLOCKS': {
				const { clientIds } = action;
				if ( ! action.blocks ) {
					return state;
				}

				const mappedBlocks = mapBlockOrder( action.blocks );

				return flow( [
					( nextState ) => omit( nextState, clientIds ),
					( nextState ) => ( {
						...nextState,
						...omit( mappedBlocks, '' ),
					} ),
					( nextState ) => mapValues( nextState, ( subState ) => (
						reduce( subState, ( result, clientId ) => {
							if ( clientId === clientIds[ 0 ] ) {
								return [
									...result,
									...mappedBlocks[ '' ],
								];
							}

							if ( clientIds.indexOf( clientId ) === -1 ) {
								result.push( clientId );
							}

							return result;
						}, [] )
					) ),
				] )( state );
			}

			case 'REMOVE_BLOCKS':
				return flow( [
					// Remove inner block ordering for removed blocks
					( nextState ) => omit( nextState, action.clientIds ),

					// Remove deleted blocks from other blocks' orderings
					( nextState ) => mapValues( nextState, ( subState ) => (
						without( subState, ...action.clientIds )
					) ),
				] )( state );
		}

		return state;
	},
} );

/**
 * Reducer returning typing state.
 *
 * @param {boolean} state  Current state.
 * @param {Object}  action Dispatched action.
 *
 * @return {boolean} Updated state.
 */
export function isTyping( state = false, action ) {
	switch ( action.type ) {
		case 'START_TYPING':
			return true;

		case 'STOP_TYPING':
			return false;
	}

	return state;
}

/**
 * Reducer returning whether the caret is within formatted text.
 *
 * @param {boolean} state  Current state.
 * @param {Object}  action Dispatched action.
 *
 * @return {boolean} Updated state.
 */
export function isCaretWithinFormattedText( state = false, action ) {
	switch ( action.type ) {
		case 'ENTER_FORMATTED_TEXT':
			return true;

		case 'EXIT_FORMATTED_TEXT':
			return false;
	}

	return state;
}

/**
 * Reducer returning the block selection's state.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
export function blockSelection( state = {
	start: null,
	end: null,
	isMultiSelecting: false,
	isEnabled: true,
	initialPosition: null,
}, action ) {
	switch ( action.type ) {
		case 'CLEAR_SELECTED_BLOCK':
			if ( state.start === null && state.end === null && ! state.isMultiSelecting ) {
				return state;
			}

			return {
				...state,
				start: null,
				end: null,
				isMultiSelecting: false,
				initialPosition: null,
			};
		case 'START_MULTI_SELECT':
			if ( state.isMultiSelecting ) {
				return state;
			}

			return {
				...state,
				isMultiSelecting: true,
				initialPosition: null,
			};
		case 'STOP_MULTI_SELECT':
			if ( ! state.isMultiSelecting ) {
				return state;
			}

			return {
				...state,
				isMultiSelecting: false,
				initialPosition: null,
			};
		case 'MULTI_SELECT':
			return {
				...state,
				start: action.start,
				end: action.end,
				initialPosition: null,
			};
		case 'SELECT_BLOCK':
			if ( action.clientId === state.start && action.clientId === state.end ) {
				return state;
			}
			return {
				...state,
				start: action.clientId,
				end: action.clientId,
				initialPosition: action.initialPosition,
			};
		case 'REPLACE_INNER_BLOCKS': // REPLACE_INNER_BLOCKS and INSERT_BLOCKS should follow the same logic.
		case 'INSERT_BLOCKS': {
			if ( action.updateSelection ) {
				return {
					...state,
					start: action.blocks[ 0 ].clientId,
					end: action.blocks[ 0 ].clientId,
					initialPosition: null,
					isMultiSelecting: false,
				};
			}
			return state;
		}
		case 'REMOVE_BLOCKS':
			if ( ! action.clientIds || ! action.clientIds.length || action.clientIds.indexOf( state.start ) === -1 ) {
				return state;
			}
			return {
				...state,
				start: null,
				end: null,
				initialPosition: null,
				isMultiSelecting: false,
			};
		case 'REPLACE_BLOCKS':
			if ( action.clientIds.indexOf( state.start ) === -1 ) {
				return state;
			}

			// If there are replacement blocks, assign last block as the next
			// selected block, otherwise set to null.
			const lastBlock = last( action.blocks );
			const nextSelectedBlockClientId = lastBlock ? lastBlock.clientId : null;

			if ( nextSelectedBlockClientId === state.start && nextSelectedBlockClientId === state.end ) {
				return state;
			}

			return {
				...state,
				start: nextSelectedBlockClientId,
				end: nextSelectedBlockClientId,
				initialPosition: null,
				isMultiSelecting: false,
			};
		case 'TOGGLE_SELECTION':
			return {
				...state,
				isEnabled: action.isSelectionEnabled,
			};
	}

	return state;
}

export function blocksMode( state = {}, action ) {
	if ( action.type === 'TOGGLE_BLOCK_MODE' ) {
		const { clientId } = action;
		return {
			...state,
			[ clientId ]: state[ clientId ] && state[ clientId ] === 'html' ? 'visual' : 'html',
		};
	}

	return state;
}

/**
 * Reducer returning the block insertion point visibility, either null if there
 * is not an explicit insertion point assigned, or an object of its `index` and
 * `rootClientId`.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
export function insertionPoint( state = null, action ) {
	switch ( action.type ) {
		case 'SHOW_INSERTION_POINT':
			const { rootClientId, index } = action;
			return { rootClientId, index };

		case 'HIDE_INSERTION_POINT':
			return null;
	}

	return state;
}

/**
 * Reducer returning whether the post blocks match the defined template or not.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {boolean} Updated state.
 */
export function template( state = { isValid: true }, action ) {
	switch ( action.type ) {
		case 'SET_TEMPLATE_VALIDITY':
			return {
				...state,
				isValid: action.isValid,
			};
	}

	return state;
}

/**
 * Reducer returning the editor setting.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
export function settings( state = SETTINGS_DEFAULTS, action ) {
	switch ( action.type ) {
		case 'UPDATE_SETTINGS':
			return {
				...state,
				...action.settings,
			};
	}

	return state;
}

/**
 * Reducer returning the user preferences.
 *
 * @param {Object}  state                 Current state.
 * @param {Object}  action                Dispatched action.
 *
 * @return {string} Updated state.
 */
export function preferences( state = PREFERENCES_DEFAULTS, action ) {
	switch ( action.type ) {
		case 'INSERT_BLOCKS':
		case 'REPLACE_BLOCKS':
			return action.blocks.reduce( ( prevState, block ) => {
				let id = block.name;
				const insert = { name: block.name };
				if ( isReusableBlock( block ) ) {
					insert.ref = block.attributes.ref;
					id += '/' + block.attributes.ref;
				}

				return {
					...prevState,
					insertUsage: {
						...prevState.insertUsage,
						[ id ]: {
							time: action.time,
							count: prevState.insertUsage[ id ] ? prevState.insertUsage[ id ].count + 1 : 1,
							insert,
						},
					},
				};
			}, state );
	}

	return state;
}

/**
 * Reducer returning an object where each key is a block client ID, its value
 * representing the settings for its nested blocks.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
export const blockListSettings = ( state = {}, action ) => {
	switch ( action.type ) {
		// Even if the replaced blocks have the same client ID, our logic
		// should correct the state.
		case 'REPLACE_BLOCKS' :
		case 'REMOVE_BLOCKS': {
			return omit( state, action.clientIds );
		}
		case 'UPDATE_BLOCK_LIST_SETTINGS': {
			const { clientId } = action;
			if ( ! action.settings ) {
				if ( state.hasOwnProperty( clientId ) ) {
					return omit( state, clientId );
				}

				return state;
			}

			if ( isEqual( state[ clientId ], action.settings ) ) {
				return state;
			}

			return {
				...state,
				[ clientId ]: action.settings,
			};
		}
	}
	return state;
};

export default combineReducers( {
	blocks,
	isTyping,
	isCaretWithinFormattedText,
	blockSelection,
	blocksMode,
	blockListSettings,
	insertionPoint,
	template,
	settings,
	preferences,
} );
