/**
 * External dependencies
 */
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import { PublishButtonLabel } from '../label';

describe( 'PublishButtonLabel', () => {
	const user = {
		data: {
			id: 1,
			capabilities: {
				publish_posts: true,
			},
		},
	};

	const contributor = merge( {}, user, {
		data: {
			capabilities: {
				publish_posts: false,
			},
		},
	} );

	it( 'should show publishing if publishing in progress', () => {
		const label = PublishButtonLabel( { user, isPublishing: true } );
		expect( label ).toBe( 'Publishing…' );
	} );

	it( 'should show updating if saving in progress', () => {
		const label = PublishButtonLabel( { user, isSaving: true } );
		expect( label ).toBe( 'Updating…' );
	} );

	it( 'should show publish if user unknown', () => {
		const label = PublishButtonLabel( { user: {} } );
		expect( label ).toBe( 'Publish' );
	} );

	it( 'should show submit for review for contributor', () => {
		const label = PublishButtonLabel( { user: contributor } );
		expect( label ).toBe( 'Submit for Review' );
	} );

	it( 'should show update for already published', () => {
		const label = PublishButtonLabel( { user, isPublished: true } );
		expect( label ).toBe( 'Update' );
	} );

	it( 'should show schedule for scheduled', () => {
		const label = PublishButtonLabel( { user, isBeingScheduled: true } );
		expect( label ).toBe( 'Schedule' );
	} );

	it( 'should show publish otherwise', () => {
		const label = PublishButtonLabel( { user } );
		expect( label ).toBe( 'Publish' );
	} );
} );
