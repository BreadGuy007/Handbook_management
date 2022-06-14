/**
 * External dependencies
 */
import { render } from 'enzyme';

/**
 * Internal dependencies
 */
import withSpokenMessages from '../';

describe( 'withSpokenMessages', () => {
	it( 'should generate speak and debouncedSpeak props', () => {
		const testSpeak = jest.fn();
		const testDebouncedSpeak = jest.fn();
		const isFunction = ( maybeFunc ) => typeof maybeFunc === 'function';
		const DumpComponent = withSpokenMessages(
			( { speak, debouncedSpeak } ) => {
				testSpeak( isFunction( speak ) );
				testDebouncedSpeak( isFunction( debouncedSpeak ) );
				return <div />;
			}
		);
		render( <DumpComponent /> );

		// Unrendered element.
		expect( testSpeak ).toHaveBeenCalledWith( true );
		expect( testDebouncedSpeak ).toHaveBeenCalledWith( true );
	} );
} );
