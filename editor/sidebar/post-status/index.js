/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { PanelBody, PanelRow, FormToggle, withInstanceId } from '@wordpress/components';

/**
 * Internal Dependencies
 */
import PostVisibility from '../post-visibility';
import PostTrash from '../post-trash';
import PostSchedule from '../post-schedule';
import PostSticky from '../post-sticky';
import PostAuthor from '../post-author';
import {
	getEditedPostAttribute,
	getSuggestedPostFormat,
	isCurrentPostPublished,
} from '../../selectors';
import { editPost } from '../../actions';

class PostStatus extends Component {
	constructor() {
		super( ...arguments );
		this.togglePendingStatus = this.togglePendingStatus.bind( this );
	}

	togglePendingStatus() {
		const { status, onUpdateStatus } = this.props;
		const updatedStatus = status === 'pending' ? 'draft' : 'pending';
		onUpdateStatus( updatedStatus );
	}

	render() {
		const { status, suggestedFormat, isPublished, instanceId } = this.props;

		// Use the suggested post format based on the blocks content of the post
		// or the default post format setting for the site.
		const format = suggestedFormat || __( 'Standard' );
		const pendingId = 'pending-toggle-' + instanceId;

		return (
			<PanelBody title={ __( 'Status & Visibility' ) }>
				{ ! isPublished &&
					<PanelRow>
						<label htmlFor={ pendingId }>{ __( 'Pending review' ) }</label>
						<FormToggle
							id={ pendingId }
							checked={ status === 'pending' }
							onChange={ this.togglePendingStatus }
							showHint={ false }
						/>
					</PanelRow>
				}
				<PostVisibility />
				<PostSchedule />
				<PanelRow>
					<span>{ __( 'Post Format' ) }</span>
					<span>{ format }</span>
				</PanelRow>
				<PostSticky />
				<PostAuthor />
				<PostTrash />
			</PanelBody>
		);
	}
}

export default connect(
	( state ) => ( {
		status: getEditedPostAttribute( state, 'status' ),
		suggestedFormat: getSuggestedPostFormat( state ),
		isPublished: isCurrentPostPublished( state ),
	} ),
	( dispatch ) => {
		return {
			onUpdateStatus( status ) {
				dispatch( editPost( { status } ) );
			},
		};
	}
)( withInstanceId( PostStatus ) );

