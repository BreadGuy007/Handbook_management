/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';

/**
 * Internal Dependencies
 */
import './style.scss';
import PostVisibility from '../post-visibility';
import PostTrash from '../post-trash';
import PostSchedule from '../post-schedule';
import PostSticky from '../post-sticky';
import PostAuthor from '../post-author';
import PostFormat from '../post-format';
import PostPendingStatus from '../post-pending-status';
import { PostSwitchToDraftButton } from '../../../components';
import {
	isEditorSidebarPanelOpened,
} from '../../../store/selectors';
import { toggleSidebarPanel } from '../../../store/actions';

/**
 * Module Constants
 */
const PANEL_NAME = 'post-status';

function PostStatus( { isOpened, onTogglePanel } ) {
	return (
		<PanelBody className="editor-post-status" title={ __( 'Status & Visibility' ) } opened={ isOpened } onToggle={ onTogglePanel }>
			<PostVisibility />
			<PostSchedule />
			<PostFormat />
			<PostSticky />
			<PostPendingStatus />
			<PostAuthor />
			<PostTrash />
			<PostSwitchToDraftButton />
		</PanelBody>
	);
}

export default connect(
	( state ) => ( {
		isOpened: isEditorSidebarPanelOpened( state, PANEL_NAME ),
	} ),
	{
		onTogglePanel() {
			return toggleSidebarPanel( PANEL_NAME );
		},
	}
)( PostStatus );

