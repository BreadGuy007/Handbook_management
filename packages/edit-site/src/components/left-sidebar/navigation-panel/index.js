/**
 * WordPress dependencies
 */
import { useEffect, useRef, useState } from '@wordpress/element';
import {
	__experimentalNavigation as Navigation,
	__experimentalNavigationBackButton as NavigationBackButton,
	__experimentalNavigationGroup as NavigationGroup,
	__experimentalNavigationItem as NavigationItem,
	__experimentalNavigationMenu as NavigationMenu,
} from '@wordpress/components';
import { getBlockType, getBlockFromExample } from '@wordpress/blocks';
import { BlockPreview } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

const NavigationPanel = () => {
	const [ showPreview, setShowPreview ] = useState( false );
	const ref = useRef();

	useEffect( () => {
		ref.current.focus();
	}, [ ref ] );

	return (
		<div className="edit-site-navigation-panel">
			<Navigation>
				<NavigationBackButton
					backButtonLabel={ __( 'Dashboard' ) }
					className="edit-site-navigation-panel__back-to-dashboard"
					href="index.php"
					ref={ ref }
				/>
				<NavigationMenu title="Home">
					<NavigationGroup title="Example group">
						<NavigationItem
							item="item-preview"
							title="Hover to show preview"
							onMouseEnter={ () => setShowPreview( true ) }
							onMouseLeave={ () => setShowPreview( false ) }
						/>
					</NavigationGroup>
				</NavigationMenu>
			</Navigation>

			{ showPreview && (
				<div className="edit-site-navigation-panel__preview">
					<BlockPreview
						blocks={ [
							getBlockFromExample(
								'core/paragraph',
								getBlockType( 'core/paragraph' ).example
							),
						] }
						viewportWidth={ 1200 }
					/>
				</div>
			) }
		</div>
	);
};

export default NavigationPanel;
