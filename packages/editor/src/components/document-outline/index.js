/**
 * External dependencies
 */
import { countBy, flatMap, get } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { create, getTextContent } from '@wordpress/rich-text';

/**
 * Internal dependencies
 */
import DocumentOutlineItem from './item';

/**
 * Module constants
 */
const emptyHeadingContent = <em>{ __( '(Empty heading)' ) }</em>;
const incorrectLevelContent = [
	<br key="incorrect-break" />,
	<em key="incorrect-message">{ __( '(Incorrect heading level)' ) }</em>,
];
const singleH1Headings = [
	<br key="incorrect-break-h1" />,
	<em key="incorrect-message-h1">
		{ __( '(Your theme may already use a H1 for the post title)' ) }
	</em>,
];
const multipleH1Headings = [
	<br key="incorrect-break-multiple-h1" />,
	<em key="incorrect-message-multiple-h1">
		{ __( '(Multiple H1 headings are not recommended)' ) }
	</em>,
];

/**
 * Returns an array of heading blocks enhanced with the following properties:
 * path    - An array of blocks that are ancestors of the heading starting from a top-level node.
 *           Can be an empty array if the heading is a top-level node (is not nested inside another block).
 * level   - An integer with the heading level.
 * isEmpty - Flag indicating if the heading has no content.
 *
 * @param {?Array} blocks An array of blocks.
 * @param {?Array} path   An array of blocks that are ancestors of the blocks passed as blocks.
 *
 * @return {Array} An array of heading blocks enhanced with the properties described above.
 */
const computeOutlineHeadings = ( blocks = [], path = [] ) => {
	return flatMap( blocks, ( block = {} ) => {
		if ( block.name === 'core/heading' ) {
			return {
				...block,
				path,
				level: block.attributes.level,
				isEmpty: isEmptyHeading( block ),
			};
		}
		return computeOutlineHeadings( block.innerBlocks, [ ...path, block ] );
	} );
};

const isEmptyHeading = ( heading ) =>
	! heading.attributes.content || heading.attributes.content.length === 0;

export const DocumentOutline = ( {
	blocks = [],
	title,
	onSelect,
	isTitleSupported,
	hasOutlineItemsDisabled,
} ) => {
	const headings = computeOutlineHeadings( blocks );

	if ( headings.length < 1 ) {
		return null;
	}

	let prevHeadingLevel = 1;

	// Not great but it's the simplest way to locate the title right now.
	const titleNode = document.querySelector( '.editor-post-title__input' );
	const hasTitle = isTitleSupported && title && titleNode;
	const countByLevel = countBy( headings, 'level' );
	const hasMultipleH1 = countByLevel[ 1 ] > 1;

	return (
		<div className="document-outline">
			<ul>
				{ hasTitle && (
					<DocumentOutlineItem
						level={ __( 'Title' ) }
						isValid
						onSelect={ onSelect }
						href={ `#${ titleNode.id }` }
						isDisabled={ hasOutlineItemsDisabled }
					>
						{ title }
					</DocumentOutlineItem>
				) }
				{ headings.map( ( item, index ) => {
					// Headings remain the same, go up by one, or down by any amount.
					// Otherwise there are missing levels.
					const isIncorrectLevel = item.level > prevHeadingLevel + 1;

					const isValid =
						! item.isEmpty &&
						! isIncorrectLevel &&
						!! item.level &&
						( item.level !== 1 ||
							( ! hasMultipleH1 && ! hasTitle ) );
					prevHeadingLevel = item.level;

					return (
						<DocumentOutlineItem
							key={ index }
							level={ `H${ item.level }` }
							isValid={ isValid }
							path={ item.path }
							isDisabled={ hasOutlineItemsDisabled }
							href={ `#block-${ item.clientId }` }
							onSelect={ onSelect }
						>
							{ item.isEmpty
								? emptyHeadingContent
								: getTextContent(
										create( {
											html: item.attributes.content,
										} )
								  ) }
							{ isIncorrectLevel && incorrectLevelContent }
							{ item.level === 1 &&
								hasMultipleH1 &&
								multipleH1Headings }
							{ hasTitle &&
								item.level === 1 &&
								! hasMultipleH1 &&
								singleH1Headings }
						</DocumentOutlineItem>
					);
				} ) }
			</ul>
		</div>
	);
};

export default compose(
	withSelect( ( select ) => {
		const { getBlocks } = select( 'core/block-editor' );
		const { getEditedPostAttribute } = select( 'core/editor' );
		const { getPostType } = select( 'core' );
		const postType = getPostType( getEditedPostAttribute( 'type' ) );

		return {
			title: getEditedPostAttribute( 'title' ),
			blocks: getBlocks(),
			isTitleSupported: get( postType, [ 'supports', 'title' ], false ),
		};
	} )
)( DocumentOutline );
