/**
 * Internal dependencies
 */
import {
	clickBlockAppender,
	getEditedPostContent,
	createNewPost,
} from '../../support/utils';

describe( 'HTML block', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'can be created by typing "/html"', async () => {
		// Create a Custom HTML block with the slash shortcut.
		await clickBlockAppender();
		await page.keyboard.type( '/html' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( '<p>Pythagorean theorem: ' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( '<var>a</var><sup>2</sup> + <var>b</var><sup>2</sup> = <var>c</var><sup>2</sup> </p>' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
