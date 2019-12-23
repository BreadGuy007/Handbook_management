/** @typedef {import('./actions').WPShortcutKeyCombination} WPShortcutKeyCombination */

/**
 * Shared reference to an empty array for cases where it is important to avoid
 * returning a new array reference on every invocation.
 *
 * @type {Array}
 */
const EMPTY_ARRAY = [];

/**
 * Returns the main key combination for a given shortcut name.
 *
 * @param {Object} state Global state.
 * @param {string} name  Shortcut name.
 *
 * @return {WPShortcutKeyCombination?} Key combination.
 */
export function getShortcutKeyCombination( state, name ) {
	return state[ name ] ? state[ name ].keyCombination : null;
}

/**
 * Returns the shortcut description given its name.
 *
 * @param {Object} state Global state.
 * @param {string} name  Shortcut name.
 *
 * @return {string?} Shortcut description.
 */
export function getShortcutDescription( state, name ) {
	return state[ name ] ? state[ name ].description : null;
}

/**
 * Returns the aliases for a given shortcut name.
 *
 * @param {Object} state Global state.
 * @param {string} name  Shortcut name.
 *
 * @return {WPShortcutKeyCombination[]} Key combinations.
 */
export function getShortcutAliases( state, name ) {
	return state[ name ] && state[ name ].aliases ?
		state[ name ].aliases :
		EMPTY_ARRAY;
}
