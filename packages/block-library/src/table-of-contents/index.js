/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit';
import icon from './icon';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __( 'Table of Contents' ),
	description: __(
		'Summarize your post with a list of headings. Add HTML anchors to Heading blocks to link them here.'
	),
	icon,
	keywords: [ __( 'document outline' ), __( 'summary' ) ],
	edit,
};
