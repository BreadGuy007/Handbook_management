
/**
 * Module constants
 */
const HEIGHT_OFFSET = 10; // used by the arrow and a bit of empty space
const isMobileViewport = () => window.innerWidth < 782;

/**
 * Utilitity used to compute the popover position over the xAxis
 *
 * @param {Object} anchorRect       Anchor Rect.
 * @param {Object} contentSize      Content Size.
 * @param {string} xAxis            Desired xAxis.
 * @param {boolean} expandOnMobile  Whether to expand the popover on mobile or not.
 *
 * @return {Object} Popover xAxis position and constraints.
 */
export function computePopoverXAxisPosition( anchorRect, contentSize, xAxis ) {
	const { width } = contentSize;
	const popoverLeft = Math.round( anchorRect.left + ( anchorRect.width / 2 ) );

	// x axis alignment choices
	const centerAlignment = {
		contentWidth: (
			( popoverLeft - ( width / 2 ) > 0 ? ( width / 2 ) : popoverLeft ) +
			( popoverLeft + ( width / 2 ) > window.innerWidth ? window.innerWidth - popoverLeft : ( width / 2 ) )
		),
	};
	const leftAlignment = {
		contentWidth: popoverLeft - width > 0 ? width : popoverLeft,
	};
	const rightAlignment = {
		contentWidth: popoverLeft + width > window.innerWidth ? window.innerWidth - popoverLeft : width,
	};

	// Choosing the x axis
	let chosenXAxis;
	let contentWidth = null;
	if ( xAxis === 'center' && centerAlignment.contentWidth === width ) {
		chosenXAxis = 'center';
	} else if ( xAxis === 'left' && leftAlignment.contentWidth === width ) {
		chosenXAxis = 'left';
	} else if ( xAxis === 'right' && rightAlignment.contentWidth === width ) {
		chosenXAxis = 'right';
	} else {
		chosenXAxis = leftAlignment.contentWidth > rightAlignment.contentWidth ? 'left' : 'right';
		const chosenWidth = chosenXAxis === 'left' ? leftAlignment.contentWidth : rightAlignment.contentWidth;
		contentWidth = chosenWidth !== width ? chosenWidth : null;
	}

	return {
		xAxis: chosenXAxis,
		popoverLeft,
		contentWidth,
	};
}

/**
 * Utilitity used to compute the popover position over the yAxis
 *
 * @param {Object} anchorRect       Anchor Rect.
 * @param {Object} contentSize      Content Size.
 * @param {string} yAxis            Desired yAxis.
 * @param {boolean} expandOnMobile  Whether to expand the popover on mobile or not.
 *
 * @return {Object} Popover xAxis position and constraints.
 */
export function computePopoverYAxisPosition( anchorRect, contentSize, yAxis ) {
	const { height } = contentSize;

	// y axis aligment choices
	const anchorMidPoint = anchorRect.top + ( anchorRect.height / 2 );
	const middleAlignment = {
		popoverTop: anchorMidPoint,
		contentHeight: (
			( anchorMidPoint - ( height / 2 ) > 0 ? ( height / 2 ) : anchorMidPoint ) +
			( anchorMidPoint + ( height / 2 ) > window.innerHeight ? window.innerHeight - anchorMidPoint : ( height / 2 ) )
		),
	};
	const topAlignment = {
		popoverTop: anchorRect.top,
		contentHeight: anchorRect.top - HEIGHT_OFFSET - height > 0 ? height : anchorRect.top - HEIGHT_OFFSET,
	};
	const bottomAlignment = {
		popoverTop: anchorRect.bottom,
		contentHeight: anchorRect.bottom + HEIGHT_OFFSET + height > window.innerHeight ? window.innerHeight - HEIGHT_OFFSET - anchorRect.bottom : height,
	};

	// Choosing the y axis
	let chosenYAxis;
	let contentHeight = null;
	if ( yAxis === 'middle' && middleAlignment.contentHeight === height ) {
		chosenYAxis = 'middle';
	} else if ( yAxis === 'top' && topAlignment.contentHeight === height ) {
		chosenYAxis = 'top';
	} else if ( yAxis === 'bottom' && bottomAlignment.contentHeight === height ) {
		chosenYAxis = 'bottom';
	} else {
		chosenYAxis = topAlignment.contentHeight > bottomAlignment.contentHeight ? 'top' : 'bottom';
		const chosenHeight = chosenYAxis === 'top' ? topAlignment.contentHeight : bottomAlignment.contentHeight;
		contentHeight = chosenHeight !== height ? chosenHeight : null;
	}

	let popoverTop;
	if ( chosenYAxis === 'middle' ) {
		popoverTop = middleAlignment.popoverTop;
	} else if ( chosenYAxis === 'top' ) {
		popoverTop = topAlignment.popoverTop;
	} else {
		popoverTop = bottomAlignment.popoverTop;
	}

	return {
		yAxis: chosenYAxis,
		popoverTop,
		contentHeight,
	};
}

/**
 * Utilitity used to compute the popover position and the content max width/height for a popover
 * given its anchor rect and its content size.
 *
 * @param {Object} anchorRect       Anchor Rect.
 * @param {Object} contentSize      Content Size.
 * @param {string} position         Position.
 * @param {boolean} expandOnMobile  Whether to expand the popover on mobile or not.
 *
 * @return {Object} Popover position and constraints.
 */
export function computePopoverPosition( anchorRect, contentSize, position = 'top', expandOnMobile = false ) {
	const [ yAxis, xAxis = 'center' ] = position.split( ' ' );

	const xAxisPosition = computePopoverXAxisPosition( anchorRect, contentSize, xAxis );
	const yAxisPosition = computePopoverYAxisPosition( anchorRect, contentSize, yAxis );

	return {
		isMobile: isMobileViewport() && expandOnMobile,
		...xAxisPosition,
		...yAxisPosition,
	};
}
