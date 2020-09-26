/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	AlignmentToolbar,
	BlockControls,
	RichText,
	__experimentalUseBlockWrapperProps as useBlockWrapperProps,
} from '@wordpress/block-editor';
import { BlockQuotation } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';

export default function QuoteEdit( {
	attributes,
	setAttributes,
	isSelected,
	mergeBlocks,
	onReplace,
	className,
	insertBlocksAfter,
} ) {
	const { align, value, citation } = attributes;
	const blockWrapperProps = useBlockWrapperProps( {
		className: classnames( className, {
			[ `has-text-align-${ align }` ]: align,
		} ),
	} );

	return (
		<>
			<BlockControls>
				<AlignmentToolbar
					value={ align }
					onChange={ ( nextAlign ) => {
						setAttributes( { align: nextAlign } );
					} }
				/>
			</BlockControls>
			<BlockQuotation { ...blockWrapperProps }>
				<RichText
					identifier="value"
					multiline
					value={ value }
					onChange={ ( nextValue ) =>
						setAttributes( {
							value: nextValue,
						} )
					}
					onMerge={ mergeBlocks }
					onRemove={ ( forward ) => {
						const hasEmptyCitation =
							! citation || citation.length === 0;
						if ( ! forward && hasEmptyCitation ) {
							onReplace( [] );
						}
					} }
					placeholder={
						// translators: placeholder text used for the quote
						__( 'Write quote…' )
					}
					onReplace={ onReplace }
					onSplit={ ( piece ) =>
						createBlock( 'core/quote', {
							...attributes,
							value: piece,
						} )
					}
					__unstableOnSplitMiddle={ () =>
						createBlock( 'core/paragraph' )
					}
					textAlign={ align }
				/>
				{ ( ! RichText.isEmpty( citation ) || isSelected ) && (
					<RichText
						identifier="citation"
						value={ citation }
						onChange={ ( nextCitation ) =>
							setAttributes( {
								citation: nextCitation,
							} )
						}
						__unstableMobileNoFocusOnMount
						placeholder={
							// translators: placeholder text used for the citation
							__( 'Write citation…' )
						}
						className="wp-block-quote__citation"
						textAlign={ align }
						__unstableOnSplitAtEnd={ () =>
							insertBlocksAfter( createBlock( 'core/paragraph' ) )
						}
					/>
				) }
			</BlockQuotation>
		</>
	);
}
