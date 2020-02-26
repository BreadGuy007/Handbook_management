/**
 * External dependencies
 */
import classnames from 'classnames';
import { first, last, omit } from 'lodash';
import { animated } from 'react-spring/web.cjs';

/**
 * WordPress dependencies
 */
import {
	useRef,
	useEffect,
	useLayoutEffect,
	useContext,
	forwardRef,
} from '@wordpress/element';
import { focus, isTextField, placeCaretAtHorizontalEdge } from '@wordpress/dom';
import { BACKSPACE, DELETE, ENTER } from '@wordpress/keycodes';
import { __, sprintf } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { isInsideRootBlock } from '../../utils/dom';
import useMovingAnimation from './moving-animation';
import { Context, BlockNodes } from './root-container';
import { BlockContext } from './block';

const BlockComponent = forwardRef(
	( { children, tagName = 'div', __unstableIsHtml, ...props }, wrapper ) => {
		const onSelectionStart = useContext( Context );
		const [ , setBlockNodes ] = useContext( BlockNodes );
		const {
			clientId,
			rootClientId,
			isSelected,
			isFirstMultiSelected,
			isLastMultiSelected,
			isMultiSelecting,
			isNavigationMode,
			isPartOfMultiSelection,
			enableAnimation,
			index,
			className,
			isLocked,
			name,
			mode,
			blockTitle,
		} = useContext( BlockContext );
		const { initialPosition } = useSelect(
			( select ) => {
				if ( ! isSelected ) {
					return {};
				}

				return {
					initialPosition: select(
						'core/block-editor'
					).getSelectedBlocksInitialCaretPosition(),
				};
			},
			[ isSelected ]
		);
		const { removeBlock, insertDefaultBlock } = useDispatch(
			'core/block-editor'
		);
		const fallbackRef = useRef();

		wrapper = wrapper || fallbackRef;

		// Provide the selected node, or the first and last nodes of a multi-
		// selection, so it can be used to position the contextual block toolbar.
		// We only provide what is necessary, and remove the nodes again when they
		// are no longer selected.
		useLayoutEffect( () => {
			if ( isSelected || isFirstMultiSelected || isLastMultiSelected ) {
				const node = wrapper.current;
				setBlockNodes( ( nodes ) => ( {
					...nodes,
					[ clientId ]: node,
				} ) );
				return () => {
					setBlockNodes( ( nodes ) => omit( nodes, clientId ) );
				};
			}
		}, [ isSelected, isFirstMultiSelected, isLastMultiSelected ] );

		// translators: %s: Type of block (i.e. Text, Image etc)
		const blockLabel = sprintf( __( 'Block: %s' ), blockTitle );

		// Handing the focus of the block on creation and update

		/**
		 * When a block becomes selected, transition focus to an inner tabbable.
		 *
		 * @param {boolean} ignoreInnerBlocks Should not focus inner blocks.
		 */
		const focusTabbable = ( ignoreInnerBlocks ) => {
			// Focus is captured by the wrapper node, so while focus transition
			// should only consider tabbables within editable display, since it
			// may be the wrapper itself or a side control which triggered the
			// focus event, don't unnecessary transition to an inner tabbable.
			if ( wrapper.current.contains( document.activeElement ) ) {
				return;
			}

			// Find all tabbables within node.
			const textInputs = focus.tabbable
				.find( wrapper.current )
				.filter( isTextField )
				// Exclude inner blocks
				.filter(
					( node ) =>
						! ignoreInnerBlocks ||
						isInsideRootBlock( wrapper.current, node )
				);

			// If reversed (e.g. merge via backspace), use the last in the set of
			// tabbables.
			const isReverse = -1 === initialPosition;
			const target =
				( isReverse ? last : first )( textInputs ) || wrapper.current;

			placeCaretAtHorizontalEdge( target, isReverse );
		};

		// Focus the selected block's wrapper or inner input on mount and update
		const isMounting = useRef( true );

		useEffect( () => {
			if ( ! isMultiSelecting && ! isNavigationMode && isSelected ) {
				focusTabbable( ! isMounting.current );
			}

			isMounting.current = false;
		}, [ isSelected, isMultiSelecting, isNavigationMode ] );

		// Block Reordering animation
		const animationStyle = useMovingAnimation(
			wrapper,
			isSelected || isPartOfMultiSelection,
			isSelected || isFirstMultiSelected,
			enableAnimation,
			index
		);

		/**
		 * Interprets keydown event intent to remove or insert after block if key
		 * event occurs on wrapper node. This can occur when the block has no text
		 * fields of its own, particularly after initial insertion, to allow for
		 * easy deletion and continuous writing flow to add additional content.
		 *
		 * @param {KeyboardEvent} event Keydown event.
		 */
		const onKeyDown = ( event ) => {
			const { keyCode, target } = event;

			if ( props.onKeyDown ) {
				props.onKeyDown( event );
			}

			if (
				keyCode !== ENTER &&
				keyCode !== BACKSPACE &&
				keyCode !== DELETE
			) {
				return;
			}

			if ( target !== wrapper.current || isTextField( target ) ) {
				return;
			}

			event.preventDefault();

			if ( keyCode === ENTER ) {
				insertDefaultBlock( {}, rootClientId, index + 1 );
			} else {
				removeBlock( clientId );
			}
		};

		const onMouseLeave = ( { which, buttons } ) => {
			// The primary button must be pressed to initiate selection. Fall back
			// to `which` if the standard `buttons` property is falsy. There are
			// cases where Firefox might always set `buttons` to `0`.
			// See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
			// See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/which
			if ( ( buttons || which ) === 1 ) {
				onSelectionStart( clientId );
			}
		};

		const htmlSuffix =
			mode === 'html' && ! __unstableIsHtml ? '-visual' : '';
		const blockElementId = `block-${ clientId }${ htmlSuffix }`;
		const Animated = animated[ tagName ];

		return (
			<Animated
				// Overrideable props.
				aria-label={ blockLabel }
				role="group"
				{ ...props }
				id={ blockElementId }
				ref={ wrapper }
				className={ classnames( className, props.className ) }
				data-block={ clientId }
				data-type={ name }
				data-title={ blockTitle }
				// Only allow shortcuts when a blocks is selected and not locked.
				onKeyDown={ isSelected && ! isLocked ? onKeyDown : undefined }
				// Only allow selection to be started from a selected block.
				onMouseLeave={ isSelected ? onMouseLeave : undefined }
				tabIndex="0"
				style={ {
					...( props.style || {} ),
					...animationStyle,
				} }
			>
				{ children }
			</Animated>
		);
	}
);

const elements = [ 'p', 'div' ];

const ExtendedBlockComponent = elements.reduce( ( acc, element ) => {
	acc[ element ] = forwardRef( ( props, ref ) => {
		return <BlockComponent { ...props } ref={ ref } tagName={ element } />;
	} );
	return acc;
}, BlockComponent );

export const Block = ExtendedBlockComponent;
