/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import DownloadableBlockHeader from '../index';
import { pluginWithIcon } from './fixtures';

const getContainer = (
	{ icon, title, rating, ratingCount },
	onClick = jest.fn(),
	isLoading = false,
	isInstallable = true
) => {
	return shallow(
		<DownloadableBlockHeader
			icon={ icon }
			onClick={ onClick }
			title={ title }
			rating={ rating }
			ratingCount={ ratingCount }
			isLoading={ isLoading }
			isInstallable={ isInstallable }
		/>
	);
};

describe( 'DownloadableBlockHeader', () => {
	describe( 'user interaction', () => {
		test( 'should trigger the onClick function', () => {
			const onClickMock = jest.fn();
			const wrapper = getContainer( pluginWithIcon, onClickMock );
			const event = {
				preventDefault: jest.fn(),
			};
			wrapper.find( Button ).simulate( 'click', event );
			expect( onClickMock ).toHaveBeenCalledTimes( 1 );
			expect( event.preventDefault ).toHaveBeenCalled();
		} );

		test( 'should not trigger the onClick function if loading', () => {
			const onClickMock = jest.fn();
			const wrapper = getContainer( pluginWithIcon, onClickMock, true );
			const event = {
				preventDefault: jest.fn(),
			};
			wrapper.find( Button ).simulate( 'click', event );
			expect( event.preventDefault ).toHaveBeenCalled();
			expect( onClickMock ).toHaveBeenCalledTimes( 0 );
		} );

		test( 'should not trigger the onClick function if not installable', () => {
			const onClickMock = jest.fn();
			const wrapper = getContainer(
				pluginWithIcon,
				onClickMock,
				false,
				false
			);
			const event = {
				preventDefault: jest.fn(),
			};
			wrapper.find( Button ).simulate( 'click', event );
			expect( onClickMock ).toHaveBeenCalledTimes( 0 );
			expect( event.preventDefault ).toHaveBeenCalled();
		} );
	} );
} );
