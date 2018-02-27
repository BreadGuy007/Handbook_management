/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { set, noop } from 'lodash';

/**
 * Internal dependencies
 */
import CodeEditor from '../';

describe( 'CodeEditor', () => {
	it( 'should render without an error', () => {
		set( global, 'wp.codeEditor.initialize', () => ( {
			codemirror: {
				on: noop,
			},
		} ) );

		const wrapper = shallow( <CodeEditor value={ '<b>wowee</b>' } /> );
		expect( wrapper.find( 'textarea' ) ).toHaveLength( 1 );
	} );
} );
