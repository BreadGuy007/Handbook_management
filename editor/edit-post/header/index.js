/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';
import {
	PostPreviewButton,
	PostSavedState,
	PostPublishPanelToggle,
} from '../../components';
import EllipsisMenu from './ellipsis-menu';
import HeaderToolbar from './header-toolbar';
import { isSidebarOpened } from '../../store/selectors';
import { toggleSidebar } from '../../store/actions';

function Header( {
	onToggleDefaultSidebar,
	onTogglePublishSidebar,
	isDefaultSidebarOpened,
	isPublishSidebarOpened,
} ) {
	return (
		<div
			role="region"
			aria-label={ __( 'Editor toolbar' ) }
			className="editor-header"
			tabIndex="-1"
		>
			<HeaderToolbar />
			{ ! isPublishSidebarOpened && (
				<div className="editor-header__settings">
					<PostSavedState />
					<PostPreviewButton />
					<PostPublishPanelToggle
						isOpen={ isPublishSidebarOpened }
						onToggle={ onTogglePublishSidebar }
					/>
					<IconButton
						icon="admin-generic"
						onClick={ onToggleDefaultSidebar }
						isToggled={ isDefaultSidebarOpened }
						label={ __( 'Settings' ) }
						aria-expanded={ isDefaultSidebarOpened }
					/>
					<EllipsisMenu key="ellipsis-menu" />
				</div>
			) }
		</div>
	);
}

export default connect(
	( state ) => ( {
		isDefaultSidebarOpened: isSidebarOpened( state ),
		isPublishSidebarOpened: isSidebarOpened( state, 'publish' ),
	} ),
	{
		onToggleDefaultSidebar: () => toggleSidebar(),
		onTogglePublishSidebar: () => toggleSidebar( 'publish' ),
	}
)( Header );
