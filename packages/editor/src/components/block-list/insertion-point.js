/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { isUnmodifiedDefaultBlock } from '@wordpress/blocks';
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Inserter from '../inserter';

class BlockInsertionPoint extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			isInserterFocused: false,
		};

		this.onBlurInserter = this.onBlurInserter.bind( this );
		this.onFocusInserter = this.onFocusInserter.bind( this );
	}

	onFocusInserter( event ) {
		// Stop propagation of the focus event to avoid selecting the current
		// block while inserting a new block, as it is not relevant to sibling
		// insertion and conflicts with contextual toolbar placement.
		event.stopPropagation();

		this.setState( {
			isInserterFocused: true,
		} );
	}

	onBlurInserter() {
		this.setState( {
			isInserterFocused: false,
		} );
	}

	render() {
		const { isInserterFocused } = this.state;
		const {
			showInsertionPoint,
			canShowInserter,
			rootClientId,
			insertIndex,
		} = this.props;

		return (
			<div className="editor-block-list__insertion-point">
				{ showInsertionPoint && (
					<div className="editor-block-list__insertion-point-indicator" />
				) }
				{ canShowInserter && (
					<div
						onFocus={ this.onFocusInserter }
						onBlur={ this.onBlurInserter }
						className={
							classnames( 'editor-block-list__insertion-point-inserter', {
								'is-visible': isInserterFocused,
							} )
						}
					>
						<Inserter
							rootClientId={ rootClientId }
							index={ insertIndex }
						/>
					</div>
				) }
			</div>
		);
	}
}
export default withSelect( ( select, { clientId, rootClientId } ) => {
	const {
		getBlockIndex,
		getBlockInsertionPoint,
		getBlock,
		isBlockInsertionPointVisible,
	} = select( 'core/editor' );
	const blockIndex = getBlockIndex( clientId, rootClientId );
	const insertIndex = blockIndex;
	const insertionPoint = getBlockInsertionPoint();
	const block = getBlock( clientId );
	const showInsertionPoint = (
		isBlockInsertionPointVisible() &&
		insertionPoint.index === insertIndex &&
		insertionPoint.rootClientId === rootClientId &&
		! isUnmodifiedDefaultBlock( block )
	);

	return { showInsertionPoint, insertIndex };
} )( BlockInsertionPoint );
