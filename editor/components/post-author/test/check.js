/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PostAuthorCheck } from '../check';

describe( 'PostAuthorCheck', () => {
	const users = {
		data: [
			{
				id: 1,
				name: 'admin',
				capabilities: {
					level_1: true,
				},
			},
			{
				id: 2,
				name: 'subscriber',
				capabilities: {
					level_0: true,
				},
			},
			{
				id: 3,
				name: 'andrew',
				capabilities: {
					level_1: true,
				},
			},
		],
	};

	const user = {
		data: {
			capabilities: {
				publish_posts: true,
			},
		},
	};

	it( 'should not render anything if the user doesn\'t have the right capabilities', () => {
		let wrapper = shallow( <PostAuthorCheck users={ users } user={ {} }>authors</PostAuthorCheck> );
		expect( wrapper.type() ).toBe( null );
		wrapper = shallow(
			<PostAuthorCheck users={ users } user={
				{ data: { capabilities: { publish_posts: false } } }
			}>
				authors
			</PostAuthorCheck>
		);
		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should not render anything if users unknown', () => {
		const wrapper = shallow( <PostAuthorCheck users={ {} } user={ user }>authors</PostAuthorCheck> );
		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should not render anything if single user', () => {
		const wrapper = shallow(
			<PostAuthorCheck users={ { data: users.data.slice( 0, 1 ) } } user={ user }>
				authors
			</PostAuthorCheck>
		);
		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should not render anything if single filtered user', () => {
		const wrapper = shallow(
			<PostAuthorCheck users={ { data: users.data.slice( 0, 2 ) } } user={ user }>
				authors
			</PostAuthorCheck>
		);
		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should render  control', () => {
		const wrapper = shallow(
			<PostAuthorCheck users={ users } user={ user }>
				authors
			</PostAuthorCheck>
		);

		expect( wrapper.type() ).not.toBe( null );
	} );
} );
