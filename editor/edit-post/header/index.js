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
import { PostPreviewButton, PostSavedState, PostPublishWithDropdown } from '../../components';
import EllipsisMenu from './ellipsis-menu';
import HeaderToolbar from './header-toolbar';
import { isEditorSidebarOpened } from '../../store/selectors';
import { toggleSidebar } from '../../store/actions';

function Header( { onToggleSidebar, isSidebarOpened } ) {
	return (
		<div
			role="region"
			aria-label={ __( 'Editor toolbar' ) }
			className="editor-header"
			tabIndex="-1"
		>
			<HeaderToolbar />
			<div className="editor-header__settings">
				<PostSavedState />
				<PostPreviewButton />
				<PostPublishWithDropdown />
				<IconButton
					icon="admin-generic"
					onClick={ onToggleSidebar }
					isToggled={ isSidebarOpened }
					label={ __( 'Settings' ) }
					aria-expanded={ isSidebarOpened }
				/>
				<EllipsisMenu />
			</div>
		</div>
	);
}

export default connect(
	( state ) => ( {
		isSidebarOpened: isEditorSidebarOpened( state ),
	} ),
	( dispatch ) => ( {
		onToggleSidebar: () => dispatch( toggleSidebar() ),
	} )
)( Header );
