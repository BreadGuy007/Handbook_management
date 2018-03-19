/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PostTaxonomies } from '../';

describe( 'PostTaxonomies', () => {
	it( 'should render no children if taxonomy data not available', () => {
		const taxonomies = {};

		const wrapper = shallow(
			<PostTaxonomies postType="page" taxonomies={ taxonomies } />
		);

		expect( wrapper.at( 0 ) ).toHaveLength( 0 );
	} );

	it( 'should render taxonomy components for taxonomies assigned to post type', () => {
		const genresTaxonomy = {
			name: 'Genres',
			slug: 'genre',
			types: [ 'book' ],
			hierarchical: true,
			rest_base: 'genres',
		};

		const categoriesTaxonomy = {
			name: 'Categories',
			slug: 'category',
			types: [ 'post', 'page' ],
			hierarchical: true,
			rest_base: 'categories',
		};

		const wrapperOne = shallow(
			<PostTaxonomies postType="book"
				taxonomies={ {
					data: [ genresTaxonomy, categoriesTaxonomy ],
				} }
			/>
		);

		expect( wrapperOne.at( 0 ) ).toHaveLength( 1 );

		const wrapperTwo = shallow(
			<PostTaxonomies postType="book"
				taxonomies={ {
					data: [
						genresTaxonomy,
						{
							...categoriesTaxonomy,
							types: [ 'post', 'page', 'book' ],
						},
					],
				} }
			/>
		);

		expect( wrapperTwo.at( 0 ) ).toHaveLength( 2 );
	} );
} );
