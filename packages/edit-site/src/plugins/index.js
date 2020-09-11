/**
 * External dependencies
 */
import downloadjs from 'downloadjs';

/**
 * WordPress dependencies
 */
import { MenuItem, VisuallyHidden } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { addQueryArgs } from '@wordpress/url';
import apiFetch from '@wordpress/api-fetch';
import { download, external } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import ToolsMoreMenuGroup from '../components/header/tools-more-menu-group';

registerPlugin( 'edit-site', {
	render() {
		return (
			<>
				<ToolsMoreMenuGroup>
					<MenuItem
						role="menuitem"
						icon={ download }
						onClick={ () =>
							apiFetch( {
								path: '/__experimental/edit-site/v1/export',
								parse: false,
							} )
								.then( ( res ) => res.blob() )
								.then( ( blob ) =>
									downloadjs(
										blob,
										'edit-site-export.zip',
										'application/zip'
									)
								)
						}
						info={ __(
							'Download your templates and template parts.'
						) }
					>
						{ __( 'Export' ) }
					</MenuItem>
					<MenuItem
						role="menuitem"
						href={ addQueryArgs( 'edit.php', {
							post_type: 'wp_block',
						} ) }
					>
						{ __( 'Manage all reusable blocks' ) }
					</MenuItem>
					<MenuItem
						role="menuitem"
						icon={ external }
						href={ __(
							'https://wordpress.org/support/article/wordpress-editor/'
						) }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ __( 'Help' ) }
						<VisuallyHidden as="span">
							{
								/* translators: accessibility text */
								__( '(opens in a new tab)' )
							}
						</VisuallyHidden>
					</MenuItem>
				</ToolsMoreMenuGroup>
			</>
		);
	},
} );
