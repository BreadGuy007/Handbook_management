/**
 * External dependencies
 */
import classnames from 'classnames';
import { noop, uniqueId } from 'lodash';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import Button from '../../button';
import { useNavigationContext } from '../context';
import { useNavigationTreeItem } from './use-navigation-tree-item';
import { ItemBadgeUI, ItemTitleUI, ItemUI } from '../styles/navigation-styles';
import { useRTL } from '../../utils/rtl';

export default function NavigationItem( props ) {
	const {
		badge,
		children,
		className,
		href,
		item,
		navigateToMenu,
		onClick = noop,
		title,
		hideIfTargetMenuEmpty,
		...restProps
	} = props;

	const [ itemId ] = useState( uniqueId( 'item-' ) );

	useNavigationTreeItem( itemId, props );
	const {
		activeItem,
		navigationTree,
		setActiveMenu,
	} = useNavigationContext();
	const isRTL = useRTL();

	if ( ! navigationTree.getItem( itemId )?._isVisible ) {
		return null;
	}

	// If hideIfTargetMenuEmpty prop is true
	// And the menu we are supposed to navigate to
	// Is marked as empty, then we skip rendering the item
	if (
		hideIfTargetMenuEmpty &&
		navigateToMenu &&
		navigationTree.isMenuEmpty( navigateToMenu )
	) {
		return null;
	}

	const classes = classnames( 'components-navigation__item', className, {
		'is-active': item && activeItem === item,
	} );

	const onItemClick = ( event ) => {
		if ( navigateToMenu ) {
			setActiveMenu( navigateToMenu );
		}

		onClick( event );
	};
	const icon = isRTL ? chevronLeft : chevronRight;

	return (
		<ItemUI className={ classes }>
			{ children || (
				<Button href={ href } onClick={ onItemClick } { ...restProps }>
					{ title && (
						<ItemTitleUI
							className="components-navigation__item-title"
							variant="body.small"
							isRTL={ isRTL }
							as="span"
						>
							{ title }
						</ItemTitleUI>
					) }

					{ badge && (
						<ItemBadgeUI
							className="components-navigation__item-badge"
							isRTL={ isRTL }
						>
							{ badge }
						</ItemBadgeUI>
					) }

					{ navigateToMenu && <Icon icon={ icon } /> }
				</Button>
			) }
		</ItemUI>
	);
}
