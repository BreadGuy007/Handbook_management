/**
 * External dependencies
 */
import { mount } from 'enzyme';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { InserterMenu, searchItems } from '../menu';

const textItem = {
	id: 'core/text-block',
	name: 'core/text-block',
	initialAttributes: {},
	title: 'Text',
	category: 'common',
	isDisabled: false,
};

const advancedTextItem = {
	id: 'core/advanced-text-block',
	name: 'core/advanced-text-block',
	initialAttributes: {},
	title: 'Advanced Text',
	category: 'common',
	isDisabled: false,
};

const someOtherItem = {
	id: 'core/some-other-block',
	name: 'core/some-other-block',
	initialAttributes: {},
	title: 'Some Other Block',
	category: 'common',
	isDisabled: false,
};

const moreItem = {
	id: 'core/more-block',
	name: 'core/more-block',
	initialAttributes: {},
	title: 'More',
	category: 'layout',
	isDisabled: true,
};

const youtubeItem = {
	id: 'core-embed/youtube',
	name: 'core-embed/youtube',
	initialAttributes: {},
	title: 'YouTube',
	category: 'embed',
	keywords: [ 'google' ],
	isDisabled: false,
};

const textEmbedItem = {
	id: 'core-embed/a-text-embed',
	name: 'core-embed/a-text-embed',
	initialAttributes: {},
	title: 'A Text Embed',
	category: 'embed',
	isDisabled: false,
};

const sharedItem = {
	id: 'core/block/123',
	name: 'core/block',
	initialAttributes: { ref: 123 },
	title: 'My shared block',
	category: 'shared',
	isDisabled: false,
};

const items = [
	textItem,
	advancedTextItem,
	someOtherItem,
	moreItem,
	youtubeItem,
	textEmbedItem,
	sharedItem,
];

describe( 'InserterMenu', () => {
	// NOTE: Due to https://github.com/airbnb/enzyme/issues/1174, some of the selectors passed through to
	// wrapper.find have had to be strengthened (and the filterWhere strengthened also), otherwise two
	// results would be returned even though only one was in the DOM.

	it( 'should show the suggested tab by default', () => {
		const wrapper = mount(
			<InserterMenu
				position={ 'top center' }
				instanceId={ 1 }
				items={ [] }
				frecentItems={ [] }
				debouncedSpeak={ noop }
				fetchSharedBlocks={ noop }
				blockTypes
			/>
		);

		const activeCategory = wrapper.find( '.components-panel__body.is-opened > .components-panel__body-title' );
		expect( activeCategory.text() ).toBe( 'Most Used' );

		const visibleBlocks = wrapper.find( '.editor-inserter__item' );
		expect( visibleBlocks ).toHaveLength( 0 );
	} );

	it( 'should show nothing if there are no items', () => {
		const wrapper = mount(
			<InserterMenu
				position={ 'top center' }
				instanceId={ 1 }
				items={ [] }
				frecentItems={ [] }
				debouncedSpeak={ noop }
				fetchSharedBlocks={ noop }
			/>
		);

		const visibleBlocks = wrapper.find( '.editor-inserter__item' );
		expect( visibleBlocks ).toHaveLength( 0 );
	} );

	it( 'should show frecently used items in the suggested tab', () => {
		const wrapper = mount(
			<InserterMenu
				position={ 'top center' }
				instanceId={ 1 }
				items={ items }
				frecentItems={ [ advancedTextItem, textItem, someOtherItem ] }
				debouncedSpeak={ noop }
				fetchSharedBlocks={ noop }
			/>
		);

		const visibleBlocks = wrapper.find( '.editor-inserter__item' );
		expect( visibleBlocks ).toHaveLength( 3 );
		expect( visibleBlocks.at( 0 ).text() ).toBe( 'Advanced Text' );
		expect( visibleBlocks.at( 1 ).text() ).toBe( 'Text' );
		expect( visibleBlocks.at( 2 ).text() ).toBe( 'Some Other Block' );
	} );

	it( 'should show items from the embed category in the embed tab', () => {
		const wrapper = mount(
			<InserterMenu
				position={ 'top center' }
				instanceId={ 1 }
				items={ items }
				frecentItems={ [] }
				debouncedSpeak={ noop }
				fetchSharedBlocks={ noop }
			/>
		);
		const activeTabs = wrapper.find( '.components-panel__body.is-opened button.components-panel__body-toggle' );
		activeTabs.forEach( ( tab ) => tab.simulate( 'click' ) );

		const embedTab = wrapper.find( '.components-panel__body button.components-panel__body-toggle' )
			.filterWhere( ( node ) => node.text() === 'Embeds' );
		embedTab.simulate( 'click' );

		const activeCategory = wrapper.find( '.components-panel__body.is-opened > .components-panel__body-title' );
		expect( activeCategory.text() ).toBe( 'Embeds' );

		const visibleBlocks = wrapper.find( '.editor-inserter__item' );
		expect( visibleBlocks ).toHaveLength( 2 );
		expect( visibleBlocks.at( 0 ).text() ).toBe( 'YouTube' );
		expect( visibleBlocks.at( 1 ).text() ).toBe( 'A Text Embed' );
	} );

	it( 'should show shared items in the shared tab', () => {
		const wrapper = mount(
			<InserterMenu
				position={ 'top center' }
				instanceId={ 1 }
				items={ items }
				frecentItems={ [] }
				debouncedSpeak={ noop }
				fetchSharedBlocks={ noop }
			/>
		);
		const activeTabs = wrapper.find( '.components-panel__body.is-opened button.components-panel__body-toggle' );
		activeTabs.forEach( ( tab ) => tab.simulate( 'click' ) );

		const embedTab = wrapper.find( '.components-panel__body button.components-panel__body-toggle' )
			.filterWhere( ( node ) => node.text() === 'Shared' );
		embedTab.simulate( 'click' );

		const activeCategory = wrapper.find( '.components-panel__body.is-opened > .components-panel__body-title' );
		expect( activeCategory.text() ).toBe( 'Shared' );

		const visibleBlocks = wrapper.find( '.editor-inserter__item' );
		expect( visibleBlocks ).toHaveLength( 1 );
		expect( visibleBlocks.at( 0 ).text() ).toBe( 'My shared block' );
	} );

	it( 'should show the common category blocks', () => {
		const wrapper = mount(
			<InserterMenu
				position={ 'top center' }
				instanceId={ 1 }
				items={ items }
				frecentItems={ [] }
				debouncedSpeak={ noop }
				fetchSharedBlocks={ noop }
			/>
		);
		const activeTabs = wrapper.find( '.components-panel__body.is-opened button.components-panel__body-toggle' );
		activeTabs.forEach( ( tab ) => tab.simulate( 'click' ) );

		const blocksTab = wrapper.find( '.components-panel__body button.components-panel__body-toggle' )
			.filterWhere( ( node ) => node.text() === 'Common Blocks' );
		blocksTab.simulate( 'click' );

		const activeCategory = wrapper.find( '.components-panel__body.is-opened > .components-panel__body-title' );
		expect( activeCategory.text() ).toBe( 'Common Blocks' );

		const visibleBlocks = wrapper.find( '.editor-inserter__item' );
		expect( visibleBlocks ).toHaveLength( 3 );
		expect( visibleBlocks.at( 0 ).text() ).toBe( 'Text' );
		expect( visibleBlocks.at( 1 ).text() ).toBe( 'Advanced Text' );
		expect( visibleBlocks.at( 2 ).text() ).toBe( 'Some Other Block' );
	} );

	it( 'should disable items with `isDisabled`', () => {
		const wrapper = mount(
			<InserterMenu
				position={ 'top center' }
				instanceId={ 1 }
				items={ items }
				frecentItems={ items }
				debouncedSpeak={ noop }
				fetchSharedBlocks={ noop }
			/>
		);

		const disabledBlocks = wrapper.find( '.editor-inserter__item[disabled=true]' );
		expect( disabledBlocks ).toHaveLength( 1 );
		expect( disabledBlocks.at( 0 ).text() ).toBe( 'More' );
	} );

	it( 'should allow searching for items', () => {
		const wrapper = mount(
			<InserterMenu
				position={ 'top center' }
				instanceId={ 1 }
				items={ items }
				frecentItems={ [] }
				debouncedSpeak={ noop }
				fetchSharedBlocks={ noop }
			/>
		);
		wrapper.find( '.editor-inserter__search' ).simulate( 'change', { target: { value: 'text' } } );

		// Two tabs
		const tabs = wrapper.find( '.editor-inserter__results .components-panel__body' );
		expect( tabs ).toHaveLength( 2 );

		// The tab one is active
		const activeCategory = wrapper.find( '.components-panel__body.is-opened > .components-panel__body-title' );
		expect( activeCategory.text() ).toBe( 'Common Blocks' );

		const visibleBlocks = wrapper.find( '.editor-inserter__item' );
		expect( visibleBlocks ).toHaveLength( 2 );
		expect( visibleBlocks.at( 0 ).text() ).toBe( 'Text' );
		expect( visibleBlocks.at( 1 ).text() ).toBe( 'Advanced Text' );
	} );

	it( 'should trim whitespace of search terms', () => {
		const wrapper = mount(
			<InserterMenu
				position={ 'top center' }
				instanceId={ 1 }
				items={ items }
				frecentItems={ [] }
				debouncedSpeak={ noop }
				fetchSharedBlocks={ noop }
			/>
		);
		wrapper.find( '.editor-inserter__search' ).simulate( 'change', { target: { value: ' text' } } );

		// Two tabs
		const tabs = wrapper.find( '.editor-inserter__results .components-panel__body' );
		expect( tabs ).toHaveLength( 2 );

		// The tab one is active
		const activeCategory = wrapper.find( '.components-panel__body.is-opened > .components-panel__body-title' );
		expect( activeCategory.text() ).toBe( 'Common Blocks' );

		const visibleBlocks = wrapper.find( '.editor-inserter__item' );
		expect( visibleBlocks ).toHaveLength( 2 );
		expect( visibleBlocks.at( 0 ).text() ).toBe( 'Text' );
		expect( visibleBlocks.at( 1 ).text() ).toBe( 'Advanced Text' );
	} );
} );

describe( 'searchItems', () => {
	it( 'should search items using the title ignoring case', () => {
		expect( searchItems( items, 'TEXT' ) ).toEqual(
			[ textItem, advancedTextItem, textEmbedItem ]
		);
	} );

	it( 'should search items using the keywords', () => {
		expect( searchItems( items, 'GOOGL' ) ).toEqual(
			[ youtubeItem ]
		);
	} );
} );
