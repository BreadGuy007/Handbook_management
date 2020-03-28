/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	Button,
	Dropdown,
	Icon,
	MenuGroup,
	MenuItem,
	Path,
	SVG,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { PostPreviewButton } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { external, check } from '@wordpress/icons';

const downArrow = (
	<SVG
		width="24"
		height="24"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
	>
		<Path d="M12.3 16.1l-5.8-5.6 1-1 4.7 4.4 4.3-4.4 1 1z" />
	</SVG>
);

export default function PreviewOptions( {
	forceIsAutosaveable,
	forcePreviewLink,
} ) {
	const {
		__experimentalSetPreviewDeviceType: setPreviewDeviceType,
	} = useDispatch( 'core/edit-post' );

	const deviceType = useSelect( ( select ) => {
		return select( 'core/edit-post' ).__experimentalGetPreviewDeviceType();
	}, [] );

	const isSaveable = useSelect( ( select ) => {
		return select( 'core/editor' ).isEditedPostSaveable();
	}, [] );

	const isViewable = useSelect( ( select ) => {
		const { getEditedPostAttribute } = select( 'core/editor' );
		const { getPostType } = select( 'core' );
		const postType = getPostType( getEditedPostAttribute( 'type' ) );
		return get( postType, [ 'viewable' ], false );
	}, [] );

	return (
		<Dropdown
			className="editor-post-preview__dropdown"
			contentClassName="editor-post-preview__dropdown-content"
			popoverProps={ { role: 'menu' } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					onClick={ onToggle }
					className="editor-post-preview__button-toggle"
					aria-expanded={ isOpen }
					disabled={ ! isSaveable }
				>
					{ __( 'Preview' ) }
					{ downArrow }
				</Button>
			) }
			renderContent={ () => (
				<>
					<MenuGroup>
						<MenuItem
							className="editor-post-preview__button-resize"
							onClick={ () => setPreviewDeviceType( 'Desktop' ) }
							icon={ deviceType === 'Desktop' && check }
						>
							{ __( 'Desktop' ) }
						</MenuItem>
						<MenuItem
							className="editor-post-preview__button-resize"
							onClick={ () => setPreviewDeviceType( 'Tablet' ) }
							icon={ deviceType === 'Tablet' && check }
						>
							{ __( 'Tablet' ) }
						</MenuItem>
						<MenuItem
							className="editor-post-preview__button-resize"
							onClick={ () => setPreviewDeviceType( 'Mobile' ) }
							icon={ deviceType === 'Mobile' && check }
						>
							{ __( 'Mobile' ) }
						</MenuItem>
					</MenuGroup>
					{ isViewable && (
						<MenuGroup>
							<div className="editor-post-preview__grouping-external">
								<PostPreviewButton
									className={
										'editor-post-preview__button-external'
									}
									forceIsAutosaveable={ forceIsAutosaveable }
									forcePreviewLink={ forcePreviewLink }
									textContent={
										<>
											<Icon icon={ external } />
											{ __( 'Preview in new tab' ) }
										</>
									}
								/>
							</div>
						</MenuGroup>
					) }
				</>
			) }
		/>
	);
}
