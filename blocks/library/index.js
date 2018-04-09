/**
 * Internal dependencies
 */
import {
	registerBlockType,
	setDefaultBlockName,
	setUnknownTypeHandlerName,
} from '../api';
import * as paragraph from './paragraph';
import * as image from './image';
import * as heading from './heading';
import * as quote from './quote';
import * as gallery from './gallery';
import * as audio from './audio';
import * as button from './button';
import * as categories from './categories';
import * as code from './code';
import * as columns from './columns';
import * as coverImage from './cover-image';
import * as embed from './embed';
import * as freeform from './freeform';
import * as html from './html';
import * as latestPosts from './latest-posts';
import * as list from './list';
import * as more from './more';
import * as nextpage from './nextpage';
import * as preformatted from './preformatted';
import * as pullquote from './pullquote';
import * as sharedBlock from './block';
import * as separator from './separator';
import * as shortcode from './shortcode';
import * as subhead from './subhead';
import * as table from './table';
import * as textColumns from './text-columns';
import * as verse from './verse';
import * as video from './video';

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
		audio,
		button,
		categories,
		code,
		columns,
		coverImage,
		embed,
		...embed.common,
		...embed.others,
		freeform,
		html,
		latestPosts,
		more,
		nextpage,
		preformatted,
		pullquote,
		separator,
		sharedBlock,
		subhead,
		table,
		textColumns,
		verse,
		video,
	].forEach( ( { name, settings } ) => {
		registerBlockType( name, settings );
	} );

	setDefaultBlockName( paragraph.name );
	setUnknownTypeHandlerName( freeform.name );
};
