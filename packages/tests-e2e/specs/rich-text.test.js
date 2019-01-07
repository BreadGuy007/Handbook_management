/**
 * Internal dependencies
 */
import {
	createNewPost,
	getEditedPostContent,
	insertBlock,
	clickBlockAppender,
	pressKeyWithModifier,
} from '../support/utils';

describe( 'RichText', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'should handle change in tag name gracefully', async () => {
		// Regression test: The heading block changes the tag name of its
		// RichText element. Historically this has been prone to breakage,
		// specifically in destroying / reinitializing the TinyMCE instance.
		//
		// See: https://github.com/WordPress/gutenberg/issues/3091
		await insertBlock( 'Heading' );
		await page.click( '[aria-label="Heading 3"]' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should apply formatting with access shortcut', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'test' );
		await pressKeyWithModifier( 'primary', 'a' );
		await pressKeyWithModifier( 'access', 'd' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should apply formatting with primary shortcut', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'test' );
		await pressKeyWithModifier( 'primary', 'a' );
		await pressKeyWithModifier( 'primary', 'b' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should apply formatting when selection is collapsed', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'Some ' );
		// All following characters should now be bold.
		await pressKeyWithModifier( 'primary', 'b' );
		await page.keyboard.type( 'bold' );
		// All following characters should no longer be bold.
		await pressKeyWithModifier( 'primary', 'b' );
		await page.keyboard.type( '.' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should transform backtick to code', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'A `backtick`' );

		expect( await getEditedPostContent() ).toMatchSnapshot();

		await pressKeyWithModifier( 'primary', 'z' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should only mutate text data on input', async () => {
		await clickBlockAppender();
		await page.keyboard.type( '1' );
		await pressKeyWithModifier( 'primary', 'b' );
		await page.keyboard.type( '2' );
		await pressKeyWithModifier( 'primary', 'b' );
		await page.keyboard.type( '3' );

		await page.evaluate( () => {
			let called;
			const { body } = document;
			const config = {
				attributes: true,
				childList: true,
				characterData: true,
				subtree: true,
			};

			const mutationObserver = new MutationObserver( ( records ) => {
				if ( called || records.length > 1 ) {
					throw new Error( 'Typing should only mutate once.' );
				}

				records.forEach( ( record ) => {
					if ( record.type !== 'characterData' ) {
						throw new Error(
							`Typing mutated more than character data: ${ record.type }`
						);
					}
				} );

				called = true;
			} );

			mutationObserver.observe( body, config );

			window.unsubscribes = [ () => mutationObserver.disconnect() ];

			document.addEventListener( 'selectionchange', () => {
				function throwMultipleSelectionChange() {
					throw new Error( 'Typing should only emit one selection change event.' );
				}

				document.addEventListener(
					'selectionchange',
					throwMultipleSelectionChange,
					{ once: true }
				);

				window.unsubscribes.push( () => {
					document.removeEventListener( 'selectionchange', throwMultipleSelectionChange );
				} );
			}, { once: true } );
		} );

		await page.keyboard.type( '4' );

		await page.evaluate( () => {
			// The selection change event should be called once. If there's only
			// one item in `window.unsubscribes`, it means that only one
			// function is present to disconnect the `mutationObserver`.
			if ( window.unsubscribes.length === 1 ) {
				throw new Error( 'The selection change event listener was never called.' );
			}

			window.unsubscribes.forEach( ( unsubscribe ) => unsubscribe() );
		} );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
