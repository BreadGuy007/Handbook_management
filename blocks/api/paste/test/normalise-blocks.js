/**
 * External dependencies
 */
import { equal } from 'assert';

/**
 * Internal dependencies
 */
import normaliseBlocks from '../normalise-blocks';

describe( 'normaliseBlocks', () => {
	it( 'should convert double line breaks to paragraphs', () => {
		equal( normaliseBlocks( 'test<br><br>test' ), '<p>test</p><p>test</p>' );
	} );

	it( 'should not convert single line break to paragraphs', () => {
		equal( normaliseBlocks( 'test<br>test' ), '<p>test<br>test</p>' );
	} );

	it( 'should not add extra line at the start', () => {
		equal( normaliseBlocks( 'test<br><br><br>test' ), '<p>test</p><p>test</p>' );
		equal( normaliseBlocks( '<br>test<br><br>test' ), '<p>test</p><p>test</p>' );
	} );

	it( 'should preserve non-inline content', () => {
		const HTML = '<p>test</p><div>test<br>test</div>';
		equal( normaliseBlocks( HTML ), HTML );
	} );

	it( 'should remove empty paragraphs', () => {
		equal( normaliseBlocks( '<p>&nbsp;</p>' ), '' );
	} );

	it( 'should wrap lose inline elements', () => {
		equal( normaliseBlocks( '<a href="#">test</a>' ), '<p><a href="#">test</a></p>' );
	} );
} );
