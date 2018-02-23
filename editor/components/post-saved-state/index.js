/**
 * External dependencies
 */
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Dashicon, Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';
import PostSwitchToDraftButton from '../post-switch-to-draft-button';
import { savePost } from '../../store/actions';
import {
	isEditedPostNew,
	isCurrentPostPublished,
	isEditedPostDirty,
	isSavingPost,
	isEditedPostSaveable,
	getCurrentPost,
} from '../../store/selectors';

/**
 * Component showing whether the post is saved or not and displaying save links.
 *
 * @param   {Object}    Props Component Props.
 * @return {WPElement}       WordPress Element.
 */
export function PostSavedState( { isNew, isPublished, isDirty, isSaving, isSaveable, onSave } ) {
	const className = 'editor-post-saved-state';

	if ( isSaving ) {
		return (
			<span className={ className }>
				{ __( 'Saving' ) }
			</span>
		);
	}

	if ( isPublished ) {
		return <PostSwitchToDraftButton className={ classnames( className, 'button-link' ) } />;
	}

	if ( ! isSaveable ) {
		return null;
	}

	if ( ! isNew && ! isDirty ) {
		return (
			<span className={ className }>
				<Dashicon icon="saved" />
				{ __( 'Saved' ) }
			</span>
		);
	}

	return (
		<Button className={ classnames( className, 'button-link' ) } onClick={ onSave }>
			<span className="editor-post-saved-state__mobile">{ __( 'Save' ) }</span>
			<span className="editor-post-saved-state__desktop">{ __( 'Save Draft' ) }</span>
		</Button>
	);
}

export default connect(
	( state, { forceIsDirty, forceIsSaving } ) => ( {
		post: getCurrentPost( state ),
		isNew: isEditedPostNew( state ),
		isPublished: isCurrentPostPublished( state ),
		isDirty: forceIsDirty || isEditedPostDirty( state ),
		isSaving: forceIsSaving || isSavingPost( state ),
		isSaveable: isEditedPostSaveable( state ),
	} ),
	{
		onSave: savePost,
	}
)( PostSavedState );
