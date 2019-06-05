/**
 * WordPress dependencies
 */
import {
	clickBlockAppender,
	createNewPost,
	pressKeyWithModifier,
} from '@wordpress/e2e-test-utils';

function isCloseButtonFocused() {
	return page.$eval( ':focus', ( focusedElement ) => {
		return focusedElement.getAttribute( 'aria-label' ) === 'Close dialog';
	} );
}

describe( 'a11y', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'tabs header bar', async () => {
		await pressKeyWithModifier( 'ctrl', '~' );

		await page.keyboard.press( 'Tab' );

		const isFocusedToggle = await page.$eval( ':focus', ( focusedElement ) => {
			return focusedElement.classList.contains( 'block-editor-inserter__toggle' );
		} );

		expect( isFocusedToggle ).toBe( true );
	} );

	it( 'checks persistent selection', async () => {
		await clickBlockAppender();

		// adding one Paragraph block which contains a focusable RichText
		await page.keyboard.type( 'Testing editor selection persistence' );

		let isFocusedRichText = await page.$eval( ':focus', ( focusedElement ) => {
			return focusedElement.classList.contains( 'block-editor-rich-text__editable' );
		} );

		expect( isFocusedRichText ).toBe( true );

		// moving focus backwards using keyboard shortcuts
		// twice to get to the inspector tabs
		await pressKeyWithModifier( 'ctrlShift', '`' );
		await pressKeyWithModifier( 'ctrlShift', '`' );

		await page.keyboard.press( 'Tab' );

		const isFocusedInspectorDocumentTab = await page.$eval( ':focus', ( focusedElement ) => {
			return focusedElement.getAttribute( 'data-label' );
		} );

		expect( isFocusedInspectorDocumentTab ).toEqual( 'Document' );

		await page.keyboard.press( 'Space' );

		isFocusedRichText = await page.$eval( ':focus', ( focusedElement ) => {
			return focusedElement.classList.contains( 'block-editor-rich-text__editable' );
		} );

		expect( isFocusedRichText ).toBe( false );

		await page.keyboard.press( 'Tab' );

		const isFocusedInspectorBlockTab = await page.$eval( ':focus', ( focusedElement ) => {
			return focusedElement.getAttribute( 'data-label' );
		} );

		expect( isFocusedInspectorBlockTab ).toEqual( 'Block' );

		await page.keyboard.press( 'Space' );

		isFocusedRichText = await page.$eval( ':focus', ( focusedElement ) => {
			return focusedElement.classList.contains( 'block-editor-rich-text__editable' );
		} );

		expect( isFocusedRichText ).toBe( true );
	} );

	it( 'constrains focus to a modal when tabbing', async () => {
		// Open keyboard help modal.
		await pressKeyWithModifier( 'access', 'h' );

		// The close button should not be focused by default; this is a strange UX
		// experience.
		// See: https://github.com/WordPress/gutenberg/issues/9410
		expect( await isCloseButtonFocused() ).toBe( false );

		await page.keyboard.press( 'Tab' );

		// Ensure the Close button of the modal is focused after tabbing.
		expect( await isCloseButtonFocused() ).toBe( true );
	} );

	it( 'returns focus to the first tabbable in a modal after blurring a tabbable', async () => {
		await pressKeyWithModifier( 'access', 'h' );

		// Click to move focus to an element after the last tabbable within the
		// modal.
		await page.click( '.components-modal__content *:last-child' );

		await page.keyboard.press( 'Tab' );

		expect( await isCloseButtonFocused() ).toBe( true );
	} );

	it( 'returns focus to the last tabbable in a modal after blurring a tabbable and tabbing in reverse direction', async () => {
		await pressKeyWithModifier( 'access', 'h' );

		// Click to move focus to an element before the first tabbable within
		// the modal.
		await page.click( '.components-modal__header-heading' );

		await pressKeyWithModifier( 'shift', 'Tab' );

		expect( await isCloseButtonFocused() ).toBe( true );
	} );
} );
