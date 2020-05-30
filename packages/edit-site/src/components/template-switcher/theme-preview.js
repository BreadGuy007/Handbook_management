/**
 * External dependencies
 */
import { truncate } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

function ThemePreview( {
	theme: { author_name: authorName, description, name, screenshot, version },
} ) {
	return (
		<div className="edit-site-template-switcher__theme-preview">
			<span className="edit-site-template-switcher__theme-preview-name">
				{ name }
			</span>{ ' ' }
			<span className="edit-site-template-switcher__theme-preview-version">
				{ 'v' + version }
			</span>
			<div className="edit-site-template-switcher__theme-preview-byline">
				{
					// translators: %s: theme author name.
					sprintf( __( 'By %s' ), [ authorName ] )
				}
			</div>
			<img
				className="edit-site-template-switcher__theme-preview-screenshot"
				src={ screenshot }
				alt={ 'Theme Preview' }
			/>
			<div className="edit-site-template-switcher__theme-preview-description">
				{ truncate( description, {
					length: 120,
					separator: /\. +/,
				} ) }
			</div>
		</div>
	);
}

export default ThemePreview;
