/**
 * External dependencies
 */
import ShallowRenderer from 'react-test-renderer/shallow';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { ReusableBlockDeleteButton } from '../reusable-block-delete-button';

describe( 'ReusableBlockDeleteButton', () => {
	function getShallowRenderOutput( element ) {
		const renderer = new ShallowRenderer();
		renderer.render( element );
		return renderer.getRenderOutput();
	}

	it( 'matches the snapshot', () => {
		const wrapper = getShallowRenderOutput(
			<ReusableBlockDeleteButton
				role="menuitem"
				reusableBlock={ { id: 123 } }
				onDelete={ noop }
			/>
		);

		expect( wrapper ).toMatchSnapshot();
	} );

	it( 'should allow deleting a reusable block', () => {
		const onDelete = jest.fn();
		const wrapper = getShallowRenderOutput(
			<ReusableBlockDeleteButton
				reusableBlock={ { id: 123 } }
				onDelete={ onDelete }
			/>
		);

		wrapper.props.onClick();
		expect( onDelete ).toHaveBeenCalledWith( 123 );
	} );
} );
