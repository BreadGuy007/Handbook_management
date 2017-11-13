/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelRow, Dropdown, withAPIData } from '@wordpress/components';

/**
 * Internal Dependencies
 */
import './style.scss';
import { PostVisibility as PostVisibilityForm, PostVisibilityLabel } from '../../components';

export function PostVisibility( { user } ) {
	const canEdit = user.data && user.data.capabilities.publish_posts;

	return (
		<PanelRow className="editor-post-visibility">
			<span>{ __( 'Visibility' ) }</span>
			{ ! canEdit && <span><PostVisibilityLabel /></span> }
			{ canEdit && (
				<Dropdown
					position="bottom left"
					contentClassName="editor-post-visibility__dialog"
					renderToggle={ ( { isOpen, onToggle } ) => (
						<button
							type="button"
							aria-expanded={ isOpen }
							className="editor-post-visibility__toggle button-link"
							onClick={ onToggle }
						>
							<PostVisibilityLabel />
						</button>
					) }
					renderContent={ () => <PostVisibilityForm /> }
				/>
			) }
		</PanelRow>
	);
}

export default withAPIData( () => {
	return {
		user: '/wp/v2/users/me?context=edit',
	};
} )( PostVisibility );
