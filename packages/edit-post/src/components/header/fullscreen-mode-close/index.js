/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';
import { Button, Toolbar } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { chevronLeft } from '@wordpress/icons';

function FullscreenModeClose( { isActive, postType } ) {
	if ( ! isActive || ! postType ) {
		return null;
	}

	return (
		<Toolbar className="edit-post-fullscreen-mode-close__toolbar">
			<Button
				icon={ chevronLeft }
				href={ addQueryArgs( 'edit.php', {
					post_type: postType.slug,
				} ) }
				label={ get(
					postType,
					[ 'labels', 'view_items' ],
					__( 'Back' )
				) }
			/>
		</Toolbar>
	);
}

export default withSelect( ( select ) => {
	const { getCurrentPostType } = select( 'core/editor' );
	const { isFeatureActive } = select( 'core/edit-post' );
	const { getPostType } = select( 'core' );

	return {
		isActive: isFeatureActive( 'fullscreenMode' ),
		postType: getPostType( getCurrentPostType() ),
	};
} )( FullscreenModeClose );
