/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { ROOT_MENU } from './constants';
import { useNavigationContext } from './context';
import {
	MenuBackButtonUI,
	MenuTitleUI,
	MenuUI,
} from './styles/navigation-styles';

export default function NavigationMenu( {
	backButtonLabel,
	children,
	className,
	menu = ROOT_MENU,
	parentMenu,
	title,
} ) {
	const { activeMenu, setActiveMenu } = useNavigationContext();

	if ( activeMenu !== menu ) {
		return null;
	}

	const classes = classnames( 'components-navigation__menu', className );

	return (
		<MenuUI className={ classes }>
			{ parentMenu && (
				<MenuBackButtonUI
					className="components-navigation__back-button"
					isTertiary
					onClick={ () => setActiveMenu( parentMenu, 'right' ) }
				>
					<Icon icon={ chevronLeft } />
					{ backButtonLabel || __( 'Back' ) }
				</MenuBackButtonUI>
			) }
			{ title && (
				<MenuTitleUI
					as="h2"
					className="components-navigation__menu-title"
					variant="subtitle"
				>
					{ title }
				</MenuTitleUI>
			) }
			<ul>{ children }</ul>
		</MenuUI>
	);
}
