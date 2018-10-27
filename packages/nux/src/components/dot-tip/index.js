/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { Popover, Button, IconButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { withSelect, withDispatch } from '@wordpress/data';
import { deprecated } from '@wordpress/deprecated';

function getAnchorRect( anchor ) {
	// The default getAnchorRect() excludes an element's top and bottom padding
	// from its calculation. We want tips to point to the outer margin of an
	// element, so we override getAnchorRect() to include all padding.
	return anchor.parentNode.getBoundingClientRect();
}

function onClick( event ) {
	// Tips are often nested within buttons. We stop propagation so that clicking
	// on a tip doesn't result in the button being clicked.
	event.stopPropagation();
}

export function DotTip( {
	children,
	isVisible,
	hasNextTip,
	onDismiss,
	onDisable,
} ) {
	if ( ! isVisible ) {
		return null;
	}

	return (
		<Popover
			className="nux-dot-tip"
			position="middle right"
			noArrow
			focusOnMount="container"
			getAnchorRect={ getAnchorRect }
			role="dialog"
			aria-label={ __( 'Gutenberg tips' ) }
			onClick={ onClick }
		>
			<p>{ children }</p>
			<p>
				<Button isLink onClick={ onDismiss }>
					{ hasNextTip ? __( 'See next tip' ) : __( 'Got it' ) }
				</Button>
			</p>
			<IconButton
				className="nux-dot-tip__disable"
				icon="no-alt"
				label={ __( 'Disable tips' ) }
				onClick={ onDisable }
			/>
		</Popover>
	);
}

export default compose(
	withSelect( ( select, { tipId, id } ) => {
		if ( id ) {
			tipId = id;
			deprecated( 'The id prop of wp.nux.DotTip', {
				plugin: 'Gutenberg',
				version: '4.4',
				alternative: 'the tipId prop',
			} );
		}
		const { isTipVisible, getAssociatedGuide } = select( 'core/nux' );
		const associatedGuide = getAssociatedGuide( tipId );
		return {
			isVisible: isTipVisible( tipId ),
			hasNextTip: !! ( associatedGuide && associatedGuide.nextTipId ),
		};
	} ),
	withDispatch( ( dispatch, { tipId, id } ) => {
		const { dismissTip, disableTips } = dispatch( 'core/nux' );
		return {
			onDismiss() {
				dismissTip( tipId || id );
			},
			onDisable() {
				disableTips();
			},
		};
	} ),
)( DotTip );
