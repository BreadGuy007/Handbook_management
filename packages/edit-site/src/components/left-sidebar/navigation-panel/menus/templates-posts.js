/**
 * WordPress dependencies
 */
import {
	__experimentalNavigationGroup as NavigationGroup,
	__experimentalNavigationMenu as NavigationMenu,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import TemplateNavigationItems from '../template-navigation-items';
import { TEMPLATES_POSTS } from '../constants';

export default function TemplatePostsMenu( { templates, onActivateItem } ) {
	const generalTemplates = templates?.find( ( { slug } ) =>
		TEMPLATES_POSTS.includes( slug )
	);
	const specificTemplates = templates?.filter( ( { slug } ) =>
		slug.startsWith( 'post-' )
	);

	return (
		<NavigationMenu
			menu="templates-posts"
			title="Posts"
			parentMenu="templates"
		>
			<NavigationGroup title="Specific">
				<TemplateNavigationItems
					templates={ specificTemplates }
					onActivateItem={ onActivateItem }
				/>
			</NavigationGroup>

			<NavigationGroup title="General">
				<TemplateNavigationItems
					templates={ generalTemplates }
					onActivateItem={ onActivateItem }
				/>
			</NavigationGroup>
		</NavigationMenu>
	);
}
