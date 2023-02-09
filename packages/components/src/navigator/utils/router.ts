/**
 * External dependencies
 */
import { match } from 'path-to-regexp';

/**
 * Internal dependencies
 */
import type { Screen, MatchParams } from '../types';

export function patternMatch( path: string, screens: Screen[] ) {
	for ( const screen of screens ) {
		const matchingFunction = match< MatchParams >( screen.path, {
			decode: decodeURIComponent,
		} );
		const matched = matchingFunction( path );
		if ( matched ) {
			return { params: matched.params, id: screen.id };
		}
	}

	return undefined;
}
