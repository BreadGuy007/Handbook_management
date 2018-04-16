/**
 * WordPress dependencies
 */
import { withDispatch, withSelect } from '@wordpress/data';
import { Component, compose } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Dashicon, ClipboardButton, Button, Tooltip } from '@wordpress/components';

/**
 * Internal Dependencies
 */
import './style.scss';
import PostPermalinkEditor from './editor.js';
import { getWPAdminURL } from '../../utils/url';

class PostPermalink extends Component {
	constructor() {
		super( ...arguments );

		this.addVisibilityCheck = this.addVisibilityCheck.bind( this );
		this.onVisibilityChange = this.onVisibilityChange.bind( this );

		this.state = {
			iconClass: '',
			isEditingPermalink: false,
		};
	}

	addVisibilityCheck() {
		window.addEventListener( 'visibilitychange', this.onVisibilityChange );
	}

	onVisibilityChange() {
		const { isEditable, refreshPost } = this.props;
		// If the user just returned after having clicked the "Change Permalinks" button,
		// fetch a new copy of the post from the server, just in case they enabled permalinks.
		if ( ! isEditable && 'visible' === document.visibilityState ) {
			refreshPost();
		}
	}

	componentDidUpdate( prevProps, prevState ) {
		// If we've just stopped editing the permalink, focus on the new permalink.
		if ( prevState.isEditingPermalink && ! this.state.isEditingPermalink ) {
			this.permalinkButton.focus();
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'visibilitychange', this.addVisibilityCheck );
	}

	render() {
		const { isNew, previewLink, isEditable, samplePermalink } = this.props;
		const { iconClass, isEditingPermalink } = this.state;

		if ( isNew || ! previewLink ) {
			return null;
		}

		return (
			<div className="editor-post-permalink">
				<Tooltip text={ __( 'Copy the permalink to your clipboard' ) }>
					<ClipboardButton
						className="editor-post-permalink__copy"
						text={ samplePermalink }
						onCopy={ () => this.setState( { iconClass: 'is-copied' } ) }
					>
						<Dashicon icon="admin-links" className={ iconClass } />
					</ClipboardButton>
				</Tooltip>

				<span className="editor-post-permalink__label">{ __( 'Permalink:' ) }</span>

				{ ! isEditingPermalink &&
					<Button
						className="editor-post-permalink__link"
						href={ previewLink }
						target="_blank"
						ref={ ( permalinkButton ) => this.permalinkButton = permalinkButton }
					>
						{ decodeURI( samplePermalink ) }
						&lrm;
					</Button>
				}

				{ isEditingPermalink &&
					<PostPermalinkEditor
						onSave={ () => this.setState( { isEditingPermalink: false } ) }
					/>
				}

				{ isEditable && ! isEditingPermalink &&
					<Button
						className="editor-post-permalink__edit"
						isLarge
						onClick={ () => this.setState( { isEditingPermalink: true } ) }
					>
						{ __( 'Edit' ) }
					</Button>
				}

				{ ! isEditable &&
					<Button
						className="editor-post-permalink__change"
						isLarge
						href={ getWPAdminURL( 'options-permalink.php' ) }
						onClick={ this.addVisibilityCheck }
						target="_blank"
					>
						{ __( 'Change Permalinks' ) }
					</Button>
				}
			</div>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const { isEditedPostNew, isPermalinkEditable, getEditedPostPreviewLink, getPermalink } = select( 'core/editor' );
		return {
			isNew: isEditedPostNew(),
			previewLink: getEditedPostPreviewLink(),
			isEditable: isPermalinkEditable(),
			samplePermalink: getPermalink(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { refreshPost } = dispatch( 'core/editor' );
		return { refreshPost };
	} ),
] )( PostPermalink );

