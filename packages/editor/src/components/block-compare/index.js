/**
 * External dependencies
 */
import classnames from 'classnames';
import { castArray } from 'lodash';
import { diffChars } from 'diff';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { getBlockType, getSaveContent, getSaveElement } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import BlockView from './block-view';

class BlockCompare extends Component {
	getDifference( originalContent, newContent ) {
		const difference = diffChars( originalContent, newContent );

		return difference.map( ( item, pos ) => {
			const classes = classnames( {
				'editor-block-compare__added': item.added,
				'editor-block-compare__removed': item.removed,
			} );

			return <span key={ pos } className={ classes }>{ item.value }</span>;
		} );
	}

	getOriginalContent( block ) {
		// Get current block details
		const blockType = getBlockType( block.name );

		return {
			rawContent: block.originalContent,
			renderedContent: getSaveElement( blockType, block.attributes ),
		};
	}

	getConvertedContent( block ) {
		// The convertor may return an array of items or a single item
		const newBlocks = castArray( block );

		// Get converted block details
		const newContent = newBlocks.map( ( item ) => getSaveContent( getBlockType( item.name ), item.attributes, item.innerBlocks ) );
		const renderedContent = newBlocks.map( ( item ) => getSaveElement( getBlockType( item.name ), item.attributes, item.innerBlocks ) );

		return {
			rawContent: newContent.join( '' ),
			renderedContent,
		};
	}

	render() {
		const { block, onKeep, onConvert, convertor, convertButtonText } = this.props;
		const original = this.getOriginalContent( block );
		const converted = this.getConvertedContent( convertor( block ) );
		const difference = this.getDifference( original.rawContent, converted.rawContent );

		return (
			<div className="editor-block-compare__wrapper">
				<BlockView
					title={ __( 'Current' ) }
					className="editor-block-compare__current"
					action={ onKeep }
					actionText={ __( 'Convert to HTML' ) }
					rawContent={ original.rawContent }
					renderedContent={ original.renderedContent }
				/>

				<BlockView
					title={ __( 'After Conversion' ) }
					className="editor-block-compare__converted"
					action={ onConvert }
					actionText={ convertButtonText }
					rawContent={ difference }
					renderedContent={ converted.renderedContent }
				/>
			</div>
		);
	}
}

export default BlockCompare;
