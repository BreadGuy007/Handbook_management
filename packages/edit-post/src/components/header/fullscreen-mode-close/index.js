/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { Path, SVG } from '@wordpress/primitives';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

const wordPressLogo = (
	<SVG width="28" height="28" viewBox="0 0 128 128" version="1.1">
		<Path d="M100 61.3c0-6.6-2.4-11.2-4.4-14.7-2.7-4.4-5.2-8.1-5.2-12.5 0-4.9 3.7-9.5 9-9.5h.7c-9.5-8.7-22.1-14-36-14-18.6 0-35 9.6-44.6 24 1.3 0 2.4.1 3.4.1 5.6 0 14.2-.7 14.2-.7 2.9-.2 3.2 4.1.3 4.4 0 0-2.9.3-6.1.5l19.4 57.8 11.7-35L54.1 39c-2.9-.2-5.6-.5-5.6-.5-2.9-.2-2.5-4.6.3-4.4 0 0 8.8.7 14 .7 5.6 0 14.2-.7 14.2-.7 2.9-.2 3.2 4.1.3 4.4 0 0-2.9.3-6.1.5l19.3 57.3L96 78.9c2.6-7.6 4-13 4-17.6zM10.7 64c0 21.1 12.3 39.4 30.1 48L15.3 42.3c-3 6.6-4.6 14-4.6 21.7zm54.2 4.7l-16 46.5c4.8 1.4 9.8 2.2 15.1 2.2 6.2 0 12.2-1.1 17.7-3-.1-.2-.3-.5-.4-.7l-16.4-45zM64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm49.9 97.6c-2.2 3.2-4.6 6.2-7.3 8.9s-5.7 5.2-8.9 7.3c-3.2 2.2-6.7 4-10.2 5.5-7.4 3.1-15.3 4.7-23.4 4.7s-16-1.6-23.4-4.7c-3.6-1.5-7-3.4-10.2-5.5-3.2-2.2-6.2-4.6-8.9-7.3s-5.2-5.7-7.3-8.9c-2.2-3.2-4-6.7-5.5-10.2-3.4-7.4-5-15.3-5-23.4s1.6-16 4.7-23.4c1.5-3.6 3.4-7 5.5-10.2 2.2-3.2 4.6-6.2 7.3-8.9s5.7-5.2 8.9-7.3c3.2-2.2 6.7-4 10.2-5.5C48 5.4 55.9 3.8 64 3.8s16 1.6 23.4 4.7c3.6 1.5 7 3.4 10.2 5.5 3.2 2.2 6.2 4.6 8.9 7.3s5.2 5.7 7.3 8.9c2.2 3.2 4 6.7 5.5 10.2 3.1 7.4 4.7 15.3 4.7 23.4s-1.6 16-4.7 23.4c-1.4 3.8-3.2 7.2-5.4 10.4zm-2.7-53.7c0 5.4-1 11.5-4.1 19.1l-16.3 47.1c15.9-9.2 26.5-26.4 26.5-46.1 0-9.3-2.4-18-6.5-25.6.2 1.7.4 3.5.4 5.5z" />
	</SVG>
);

function FullscreenModeClose() {
	const { isActive, postType } = useSelect( ( select ) => {
		const { getCurrentPostType } = select( 'core/editor' );
		const { isFeatureActive } = select( 'core/edit-post' );
		const { getPostType } = select( 'core' );

		return {
			isActive: isFeatureActive( 'fullscreenMode' ),
			postType: getPostType( getCurrentPostType() ),
		};
	}, [] );

	if ( ! isActive || ! postType ) {
		return null;
	}

	return (
		<Button
			className="edit-post-fullscreen-mode-close"
			icon={ wordPressLogo }
			iconSize={ 36 }
			href={ addQueryArgs( 'edit.php', {
				post_type: postType.slug,
			} ) }
			label={ get( postType, [ 'labels', 'view_items' ], __( 'Back' ) ) }
		/>
	);
}

export default FullscreenModeClose;
