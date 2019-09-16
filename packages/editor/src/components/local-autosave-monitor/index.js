/**
 * External dependencies
 */
import { once, uniqueId, omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { ifCondition } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { parse } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import AutosaveMonitor from '../autosave-monitor';

const requestIdleCallback = window.requestIdleCallback ? window.requestIdleCallback : window.requestAnimationFrame;

/**
 * Function which returns true if the current environment supports browser
 * sessionStorage, or false otherwise. The result of this function is cached and
 * reused in subsequent invocations.
 */
const hasSessionStorageSupport = once( () => {
	try {
		// Private Browsing in Safari 10 and earlier will throw an error when
		// attempting to set into sessionStorage. The test here is intentional in
		// causing a thrown error as condition bailing from local autosave.
		window.sessionStorage.setItem( '__wpEditorTestSessionStorage', '' );
		window.sessionStorage.removeItem( '__wpEditorTestSessionStorage' );
		return true;
	} catch ( error ) {
		return false;
	}
} );

/**
 * Function returning a sessionStorage key to set or retrieve a given post's
 * automatic session backup.
 *
 * Keys are crucially prefixed with 'wp-autosave-' so that wp-login.php's
 * `loggedout` handler can clear sessionStorage of any user-private content.
 *
 * @see https://github.com/WordPress/wordpress-develop/blob/6dad32d2aed47e6c0cf2aee8410645f6d7aba6bd/src/wp-login.php#L103
 *
 * @param {string} postId  Post ID.
 * @return {string}        sessionStorage key
 */
function postKey( postId ) {
	return `wp-autosave-block-editor-post-${ postId }`;
}

/**
 * Custom hook which returns a callback function to be invoked when a local
 * autosave should occur.
 *
 * @return {Function} Callback function.
 */
function useAutosaveCallback() {
	const {
		postId,
		getEditedPostAttribute,
	} = useSelect( ( select ) => ( {
		postId: select( 'core/editor' ).getCurrentPostId(),
		getEditedPostAttribute: select( 'core/editor' ).getEditedPostAttribute,
	} ) );

	return useCallback( () => {
		const saveToSessionStorage = () => {
			window.sessionStorage.setItem( postKey( postId ), JSON.stringify( {
				post_title: getEditedPostAttribute( 'title' ),
				content: getEditedPostAttribute( 'content' ),
				excerpt: getEditedPostAttribute( 'excerpt' ),
			} ) );
		};
		requestIdleCallback( saveToSessionStorage );
	}, [ postId ] );
}

/**
 * Custom hook which manages the creation of a notice prompting the user to
 * restore a local autosave, if one exists.
 */
function useAutosaveNotice() {
	const {
		postId,
		getEditedPostAttribute,
	} = useSelect( ( select ) => ( {
		postId: select( 'core/editor' ).getCurrentPostId(),
		getEditedPostAttribute: select( 'core/editor' ).getEditedPostAttribute,
	} ) );

	const { createWarningNotice, removeNotice } = useDispatch( 'core/notices' );
	const { editPost, resetEditorBlocks } = useDispatch( 'core/editor' );

	useEffect( () => {
		let autosave = window.sessionStorage.getItem( postKey( postId ) );
		if ( ! autosave ) {
			return;
		}

		try {
			autosave = JSON.parse( autosave );
		} catch ( error ) {
			// Not usable if it can't be parsed.
			return;
		}

		const { post_title: title, content, excerpt } = autosave;
		const edits = { title, content, excerpt };

		// Only display a notice if there is a difference between what has been
		// saved and that which is stored in sessionStorage.
		const hasDifference = Object.keys( edits ).some( ( key ) => {
			return edits[ key ] !== getEditedPostAttribute( key );
		} );

		if ( ! hasDifference ) {
			// If there is no difference, it can be safely ejected from storage.
			window.sessionStorage.removeItem( postKey( postId ) );

			return;
		}

		const noticeId = uniqueId( 'wpEditorAutosaveRestore' );

		createWarningNotice( __( 'The backup of this post in your browser is different from the version below.' ), {
			id: noticeId,
			actions: [
				{
					label: __( 'Restore the backup' ),
					onClick() {
						editPost( omit( edits, [ 'content' ] ) );
						resetEditorBlocks( parse( edits.content ) );
						removeNotice( noticeId );
					},
				},
			],
		} );
	}, [ postId ] );
}

/**
 * Custom hook which ejects a local autosave after a successful save occurs.
 */
function useAutosavePurge() {
	const {
		postId,
		isDirty,
	} = useSelect( ( select ) => ( {
		postId: select( 'core/editor' ).getCurrentPostId(),
		isDirty: select( 'core/editor' ).isEditedPostDirty(),
	} ) );

	const lastIsDirty = useRef( isDirty );

	useEffect( () => {
		if ( lastIsDirty.current && ! isDirty ) {
			window.sessionStorage.removeItem( postKey( postId ) );
		}

		lastIsDirty.current = isDirty;
	}, [ isDirty ] );
}

function LocalAutosaveMonitor() {
	const autosave = useAutosaveCallback();
	useAutosaveNotice();
	useAutosavePurge();

	const { localAutosaveInterval } = useSelect( ( select ) => ( {
		localAutosaveInterval: select( 'core/editor' )
			.getEditorSettings().__experimentalLocalAutosaveInterval,
	} ) );

	return (
		<AutosaveMonitor
			interval={ localAutosaveInterval }
			autosave={ autosave }
			shouldThrottle
		/>
	);
}

export default ifCondition( hasSessionStorageSupport )( LocalAutosaveMonitor );
