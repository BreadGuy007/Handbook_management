/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import ContrastChecker from '../';

describe( 'ContrastChecker', () => {
	const backgroundColor = '#ffffff';
	const textColor = '#000000';
	const isLargeText = true;
	const fallbackBackgroundColor = '#fff';
	const fallbackTextColor = '#000';
	const sameShade = '#666';
	const colorWithTransparency = 'rgba(102,102,102,0.5)';

	const wrapper = mount(
		<ContrastChecker
			backgroundColor={ backgroundColor }
			textColor={ textColor }
			isLargeText={ isLargeText }
			fallbackBackgroundColor={ fallbackBackgroundColor }
			fallbackTextColor={ fallbackTextColor } />
	);

	test( 'should render null when no colors are provided', () => {
		expect( mount( <ContrastChecker /> ).html() ).toBeNull();
	} );

	test( 'should render null when the colors meet AA WCAG guidelines.', () => {
		expect( wrapper.html() ).toBeNull();
	} );

	test( 'should render component when the colors do not meet AA WCAG guidelines.', () => {
		const componentWrapper = mount(
			<ContrastChecker
				backgroundColor={ sameShade }
				textColor={ sameShade }
				isLargeText={ isLargeText }
				fallbackBackgroundColor={ fallbackBackgroundColor }
				fallbackTextColor={ fallbackTextColor } />
		);

		expect( componentWrapper ).toMatchSnapshot();
	} );

	test( 'should render render null if background color contains a transparency', () => {
		const componentWrapper = mount(
			<ContrastChecker
				backgroundColor={ colorWithTransparency }
				textColor={ sameShade }
				isLargeText={ isLargeText }
				fallbackBackgroundColor={ fallbackBackgroundColor }
				fallbackTextColor={ fallbackTextColor } />
		);

		expect( componentWrapper.html() ).toBeNull();
	} );

	test( 'should render render null if text color contains a transparency', () => {
		const componentWrapper = mount(
			<ContrastChecker
				backgroundColor={ sameShade }
				textColor={ colorWithTransparency }
				isLargeText={ isLargeText }
				fallbackBackgroundColor={ fallbackBackgroundColor }
				fallbackTextColor={ fallbackTextColor } />
		);

		expect( componentWrapper.html() ).toBeNull();
	} );

	test( 'should render different message matching snapshot when background color has less brightness than text color.', () => {
		const darkerShade = '#555';

		const componentWrapper = mount(
			<ContrastChecker
				backgroundColor={ darkerShade }
				textColor={ sameShade }
				isLargeText={ ! isLargeText }
				fallbackBackgroundColor={ fallbackBackgroundColor }
				fallbackTextColor={ fallbackTextColor } />
		);

		expect( componentWrapper ).toMatchSnapshot();
	} );

	test( 'should take into consideration wherever text is large or not', () => {
		const componentWrapperSmallText = mount(
			<ContrastChecker
				backgroundColor="#C44B4B"
				textColor="#000000"
				isLargeText={ false }
			/>
		);

		expect( componentWrapperSmallText ).toMatchSnapshot();

		const componentWrapperLargeText = mount(
			<ContrastChecker
				backgroundColor="#C44B4B"
				textColor="#000000"
				isLargeText={ true }
			/>
		);

		expect( componentWrapperLargeText.html() ).toBeNull();
	} );

	test( 'should take into consideration the font size passed', () => {
		const componentWrapperSmallFontSize = mount(
			<ContrastChecker
				backgroundColor="#C44B4B"
				textColor="#000000"
				fontSize={ 17 }
			/>
		);

		expect( componentWrapperSmallFontSize ).toMatchSnapshot();

		const componentWrapperLargeText = mount(
			<ContrastChecker
				backgroundColor="#C44B4B"
				textColor="#000000"
				fontSize={ 18 }
			/>
		);

		expect( componentWrapperLargeText.html() ).toBeNull();
	} );

	test( 'should use isLargeText to make decisions if both isLargeText and fontSize props are passed', () => {
		const componentWrapper = mount(
			<ContrastChecker
				backgroundColor="#C44B4B"
				textColor="#000000"
				fontSize={ 17 }
				isLargeText={ true }
			/>
		);

		expect( componentWrapper.html() ).toBeNull();

		const componentWrapperNoLargeText = mount(
			<ContrastChecker
				backgroundColor="#C44B4B"
				textColor="#000000"
				fontSize={ 18 }
				isLargeText={ false }
			/>
		);

		expect( componentWrapperNoLargeText ).toMatchSnapshot();
	} );

	test( 'should render null when the colors meet AA WCAG guidelines, with only fallback colors.', () => {
		const componentWrapper = mount(
			<ContrastChecker
				isLargeText={ isLargeText }
				fallbackBackgroundColor={ fallbackBackgroundColor }
				fallbackTextColor={ fallbackTextColor } />
		);

		expect( componentWrapper.html() ).toBeNull();
	} );

	test( 'should render messages when the textColor is valid, but the fallback backgroundColor conflicts.', () => {
		const componentWrapper = mount(
			<ContrastChecker
				textColor={ textColor }
				fallbackBackgroundColor={ textColor } />
		);

		expect( componentWrapper ).toMatchSnapshot();
	} );
} );
