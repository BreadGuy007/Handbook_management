/**
 * WordPress dependencies
 */
import '@wordpress/core-data';
import '@wordpress/block-editor';
import {
	registerBlockType,
	setDefaultBlockName,
	setFreeformContentHandlerName,
	setUnregisteredTypeHandlerName,
	setGroupingBlockName,
	unstable__bootstrapServerSideBlockDefinitions, // eslint-disable-line camelcase
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import * as paragraph from './paragraph';
import * as image from './image';
import * as heading from './heading';
import * as quote from './quote';
import * as gallery from './gallery';
import * as archives from './archives';
import * as audio from './audio';
import * as buttons from './buttons';
import * as button from './button';
import * as calendar from './calendar';
import * as categories from './categories';
import * as code from './code';
import * as columns from './columns';
import * as column from './column';
import * as cover from './cover';
import * as embed from './embed';
import * as file from './file';
import * as html from './html';
import * as mediaText from './media-text';
import * as navigation from './navigation';
import * as navigationLink from './navigation-link';
import * as latestComments from './latest-comments';
import * as latestPosts from './latest-posts';
import * as legacyWidget from './legacy-widget';
import * as list from './list';
import * as missing from './missing';
import * as more from './more';
import * as nextpage from './nextpage';
import * as preformatted from './preformatted';
import * as pullquote from './pullquote';
import * as reusableBlock from './block';
import * as rss from './rss';
import * as search from './search';
import * as group from './group';
import * as separator from './separator';
import * as shortcode from './shortcode';
import * as spacer from './spacer';
import * as subhead from './subhead';
import * as table from './table';
import * as textColumns from './text-columns';
import * as verse from './verse';
import * as video from './video';
import * as tagCloud from './tag-cloud';
import * as classic from './classic';
import * as socialLinks from './social-links';
import * as socialLink from './social-link';

// Full Site Editing Blocks
import * as siteTitle from './site-title';
import * as templatePart from './template-part';
import * as postTitle from './post-title';
import * as postContent from './post-content';
import * as postAuthor from './post-author';
import * as postComments from './post-comments';
import * as postCommentsCount from './post-comments-count';
import * as postCommentsForm from './post-comments-form';
import * as postDate from './post-date';
import * as postExcerpt from './post-excerpt';
import * as postFeaturedImage from './post-featured-image';
import * as postTags from './post-tags';

/**
 * Function to register an individual block.
 *
 * @param {Object} block The block to be registered.
 *
 */
const registerBlock = ( block ) => {
	if ( ! block ) {
		return;
	}
	const { metadata, settings, name } = block;
	if ( metadata ) {
		unstable__bootstrapServerSideBlockDefinitions( { [ name ]: metadata } );
	}
	registerBlockType( name, settings );
};

/**
 * Function to register core blocks provided by the block editor.
 *
 * @example
 * ```js
 * import { registerCoreBlocks } from '@wordpress/block-library';
 *
 * registerCoreBlocks();
 * ```
 */
export const registerCoreBlocks = () => {
	[
		// Common blocks are grouped at the top to prioritize their display
		// in various contexts — like the inserter and auto-complete components.
		paragraph,
		image,
		heading,
		gallery,
		list,
		quote,

		// Register all remaining core blocks.
		shortcode,
		archives,
		audio,
		button,
		buttons,
		calendar,
		categories,
		code,
		columns,
		column,
		cover,
		embed,
		...embed.common,
		...embed.others,
		file,
		group,
		window.wp && window.wp.oldEditor ? classic : null, // Only add the classic block in WP Context
		html,
		mediaText,
		latestComments,
		latestPosts,
		missing,
		more,
		nextpage,
		preformatted,
		pullquote,
		rss,
		search,
		separator,
		reusableBlock,
		socialLinks,
		socialLink,
		spacer,
		subhead,
		table,
		tagCloud,
		textColumns,
		verse,
		video,
	].forEach( registerBlock );

	setDefaultBlockName( paragraph.name );
	if ( window.wp && window.wp.oldEditor ) {
		setFreeformContentHandlerName( classic.name );
	}
	setUnregisteredTypeHandlerName( missing.name );

	if ( group ) {
		setGroupingBlockName( group.name );
	}
};

/**
 * Function to register experimental core blocks depending on editor settings.
 *
 * @param {Object} settings Editor settings.
 *
 * @example
 * ```js
 * import { __experimentalRegisterExperimentalCoreBlocks } from '@wordpress/block-library';
 *
 * __experimentalRegisterExperimentalCoreBlocks( settings );
 * ```
 */
export const __experimentalRegisterExperimentalCoreBlocks =
	process.env.GUTENBERG_PHASE === 2
		? ( settings ) => {
				const {
					__experimentalEnableLegacyWidgetBlock,
					__experimentalEnableFullSiteEditing,
				} = settings;

				[
					__experimentalEnableLegacyWidgetBlock ? legacyWidget : null,
					navigation,
					navigationLink,

					// Register Full Site Editing Blocks.
					...( __experimentalEnableFullSiteEditing
						? [
								siteTitle,
								templatePart,
								postTitle,
								postContent,
								postAuthor,
								postComments,
								postCommentsCount,
								postCommentsForm,
								postDate,
								postExcerpt,
								postFeaturedImage,
								postTags,
						  ]
						: [] ),
				].forEach( registerBlock );
		  }
		: undefined;
