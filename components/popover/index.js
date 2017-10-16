/**
 * External dependencies
 */
import classnames from 'classnames';
import { isEqual, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { focus, keycodes } from '@wordpress/utils';

/**
 * Internal dependencies
 */
import './style.scss';
import PopoverDetectOutside from './detect-outside';
import { Slot, Fill } from '../slot-fill';

const { ESCAPE } = keycodes;

/**
 * Offset by which popover should adjust horizontally to account for tail.
 *
 * @type {Number}
 */
const ARROW_OFFSET = 20;

/**
 * Name of slot in which popover should fill.
 *
 * @type {String}
 */
const SLOT_NAME = 'Popover';

class Popover extends Component {
	constructor() {
		super( ...arguments );

		this.focus = this.focus.bind( this );
		this.bindNode = this.bindNode.bind( this );
		this.setOffset = this.setOffset.bind( this );
		this.throttledSetOffset = this.throttledSetOffset.bind( this );
		this.maybeClose = this.maybeClose.bind( this );

		this.nodes = {};

		this.state = {
			forcedYAxis: null,
			forcedXAxis: null,
		};
	}

	componentDidMount() {
		if ( this.props.isOpen ) {
			this.setOffset();
			this.setForcedPositions();
			this.toggleWindowEvents( true );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.position !== nextProps.position ) {
			this.setState( {
				forcedYAxis: null,
				forcedXAxis: null,
			} );
		}
	}

	componentDidUpdate( prevProps, prevState ) {
		const { isOpen, position } = this.props;
		const { isOpen: prevIsOpen, position: prevPosition } = prevProps;
		if ( isOpen !== prevIsOpen ) {
			this.toggleWindowEvents( isOpen );

			if ( isOpen ) {
				this.focus();
			}
		}

		if ( ! isOpen ) {
			return;
		}

		if ( isOpen !== prevIsOpen || position !== prevPosition ) {
			this.setOffset();
			this.setForcedPositions();
		} else if ( ! isEqual( this.state, prevState ) ) {
			// Need to update offset if forced positioning applied
			this.setOffset();
		}
	}

	componentWillUnmount() {
		this.toggleWindowEvents( false );
	}

	toggleWindowEvents( isListening ) {
		const handler = isListening ? 'addEventListener' : 'removeEventListener';

		window.cancelAnimationFrame( this.rafHandle );
		window[ handler ]( 'resize', this.throttledSetOffset );
		window[ handler ]( 'scroll', this.throttledSetOffset, true );
	}

	focus() {
		const { focusOnOpen = true } = this.props;
		if ( ! focusOnOpen ) {
			return;
		}

		const { content, popover } = this.nodes;
		if ( ! content ) {
			return;
		}

		// Find first tabbable node within content and shift focus, falling
		// back to the popover panel itself.
		const firstTabbable = focus.tabbable.find( content )[ 0 ];
		if ( firstTabbable ) {
			firstTabbable.focus();
		} else if ( popover ) {
			popover.focus();
		}
	}

	throttledSetOffset() {
		this.rafHandle = window.requestAnimationFrame( this.setOffset );
	}

	setOffset() {
		const { anchor, popover } = this.nodes;
		if ( ! anchor || ! anchor.parentNode ) {
			return;
		}

		const rect = anchor.parentNode.getBoundingClientRect();
		const [ yAxis, xAxis ] = this.getPositions();
		const isTop = 'top' === yAxis;
		const isLeft = 'left' === xAxis;
		const isRight = 'right' === xAxis;

		// Offset top positioning by padding
		const { paddingTop, paddingBottom } = window.getComputedStyle( anchor.parentNode );
		let topOffset = parseInt( isTop ? paddingTop : paddingBottom, 10 );
		if ( ! isTop ) {
			topOffset *= -1;
		}

		if ( isRight ) {
			popover.style.left = rect.left + ARROW_OFFSET + 'px';
		} else if ( isLeft ) {
			popover.style.left = ( rect.right - ARROW_OFFSET ) + 'px';
		} else {
			// Set popover at parent node center
			popover.style.left = Math.round( rect.left + ( rect.width / 2 ) ) + 'px';
		}

		// Set at top or bottom of parent node based on popover position
		popover.style.top = ( rect[ yAxis ] + topOffset ) + 'px';
	}

	setForcedPositions() {
		const rect = this.nodes.content.getBoundingClientRect();

		// Check exceeding top or bottom of viewport
		if ( rect.top < 0 ) {
			this.setState( { forcedYAxis: 'bottom' } );
		} else if ( rect.bottom > window.innerHeight ) {
			this.setState( { forcedYAxis: 'top' } );
		}

		// Check exceeding left or right of viewport
		if ( rect.left < 0 ) {
			this.setState( { forcedXAxis: 'right' } );
		} else if ( rect.right > window.innerWidth ) {
			this.setState( { forcedXAxis: 'left' } );
		}
	}

	getPositions() {
		const { position = 'top' } = this.props;
		const [ yAxis, xAxis = 'center' ] = position.split( ' ' );
		const { forcedYAxis, forcedXAxis } = this.state;

		return [
			forcedYAxis || yAxis,
			forcedXAxis || xAxis,
		];
	}

	maybeClose( event ) {
		const { onKeyDown, onClose } = this.props;

		// Close on escape
		if ( event.keyCode === ESCAPE && onClose ) {
			event.stopPropagation();
			onClose();
		}

		// Preserve original content prop behavior
		if ( onKeyDown ) {
			onKeyDown( event );
		}
	}

	bindNode( name ) {
		return ( node ) => this.nodes[ name ] = node;
	}

	render() {
		const {
			isOpen,
			onClose,
			children,
			className,
			onClickOutside = onClose,
			// Disable reason: We generate the `...contentProps` rest as remainder
			// of props which aren't explicitly handled by this component.
			/* eslint-disable no-unused-vars */
			position,
			focusOnOpen,
			/* eslint-enable no-unused-vars */
			...contentProps
		} = this.props;
		const [ yAxis, xAxis ] = this.getPositions();

		if ( ! isOpen ) {
			return null;
		}

		const classes = classnames(
			'components-popover',
			className,
			'is-' + yAxis,
			'is-' + xAxis,
		);

		// Disable reason: We care to capture the _bubbled_ events from inputs
		// within popover as inferring close intent.

		/* eslint-disable jsx-a11y/no-static-element-interactions */
		let content = (
			<PopoverDetectOutside onClickOutside={ onClickOutside }>
				<div
					ref={ this.bindNode( 'popover' ) }
					className={ classes }
					tabIndex="0"
					{ ...contentProps }
					onKeyDown={ this.maybeClose }
				>
					<div
						ref={ this.bindNode( 'content' ) }
						className="components-popover__content"
					>
						{ children }
					</div>
				</div>
			</PopoverDetectOutside>
		);
		/* eslint-enable jsx-a11y/no-static-element-interactions */

		// In case there is no slot context in which to render, default to an
		// in-place rendering.
		const { getSlot } = this.context;
		if ( getSlot && getSlot( SLOT_NAME ) ) {
			content = <Fill name={ SLOT_NAME }>{ content }</Fill>;
		}

		return <span ref={ this.bindNode( 'anchor' ) }>{ content }</span>;
	}
}

Popover.contextTypes = {
	getSlot: noop,
};

Popover.Slot = () => <Slot name={ SLOT_NAME } />;

export default Popover;
