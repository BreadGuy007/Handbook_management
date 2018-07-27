/**
 * External Dependencies
 */
import { castArray } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { DropZone } from '@wordpress/components';
import {
	rawHandler,
	cloneBlock,
	getBlockTransforms,
	findTransform,
} from '@wordpress/blocks';
import { Component } from '@wordpress/element';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';

class BlockDropZone extends Component {
	constructor() {
		super( ...arguments );

		this.onFilesDrop = this.onFilesDrop.bind( this );
		this.onHTMLDrop = this.onHTMLDrop.bind( this );
		this.onDrop = this.onDrop.bind( this );
	}

	getInsertIndex( position ) {
		const { index } = this.props;
		if ( index !== undefined ) {
			return position.y === 'top' ? index : index + 1;
		}
	}

	onFilesDrop( files, position ) {
		const transformation = findTransform(
			getBlockTransforms( 'from' ),
			( transform ) => transform.type === 'files' && transform.isMatch( files )
		);

		if ( transformation ) {
			const insertIndex = this.getInsertIndex( position );
			const blocks = transformation.transform( files, this.props.updateBlockAttributes );
			this.props.insertBlocks( blocks, insertIndex );
		}
	}

	onHTMLDrop( HTML, position ) {
		const blocks = rawHandler( { HTML, mode: 'BLOCKS' } );

		if ( blocks.length ) {
			this.props.insertBlocks( blocks, this.getInsertIndex( position ) );
		}
	}

	onDrop( event, position ) {
		if ( ! event.dataTransfer ) {
			return;
		}

		let clientId, type, rootClientId, fromIndex;

		try {
			( { clientId, type, rootClientId, fromIndex } = JSON.parse( event.dataTransfer.getData( 'text' ) ) );
		} catch ( err ) {
			return;
		}

		if ( type !== 'block' ) {
			return;
		}
		const { index } = this.props;
		const positionIndex = this.getInsertIndex( position );

		// If the block is kept at the same level and moved downwards, subtract
		// to account for blocks shifting upward to occupy its old position.
		const insertIndex = index && fromIndex < index && rootClientId === this.props.rootClientId ? positionIndex - 1 : positionIndex;
		this.props.moveBlockToPosition( clientId, rootClientId, insertIndex );
	}

	render() {
		const { isLocked, index } = this.props;
		if ( isLocked ) {
			return null;
		}
		const isAppender = index === undefined;

		return (
			<DropZone
				className={ classnames( 'editor-block-drop-zone', {
					'is-appender': isAppender,
				} ) }
				onFilesDrop={ this.onFilesDrop }
				onHTMLDrop={ this.onHTMLDrop }
				onDrop={ this.onDrop }
			/>
		);
	}
}

export default compose(
	withDispatch( ( dispatch, ownProps ) => {
		const {
			insertBlocks,
			updateBlockAttributes,
			moveBlockToPosition,
		} = dispatch( 'core/editor' );

		return {
			insertBlocks( blocks, insertIndex ) {
				const { rootClientId, layout } = ownProps;

				if ( layout ) {
					// A block's transform function may return a single
					// transformed block or an array of blocks, so ensure
					// to first coerce to an array before mapping to inject
					// the layout attribute.
					blocks = castArray( blocks ).map( ( block ) => (
						cloneBlock( block, { layout } )
					) );
				}

				insertBlocks( blocks, insertIndex, rootClientId );
			},
			updateBlockAttributes( ...args ) {
				updateBlockAttributes( ...args );
			},
			moveBlockToPosition( clientId, fromRootClientId, index ) {
				const { rootClientId, layout } = ownProps;
				moveBlockToPosition( clientId, fromRootClientId, rootClientId, layout, index );
			},
		};
	} ),
	withSelect( ( select, { rootClientId } ) => {
		const { getTemplateLock } = select( 'core/editor' );
		return {
			isLocked: !! getTemplateLock( rootClientId ),
		};
	} )
)( BlockDropZone );
