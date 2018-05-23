/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { isUnmodifiedDefaultBlock } from '@wordpress/blocks';
import { Component, compose } from '@wordpress/element';
import { ifCondition, IconButton } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';

class BlockInsertionPoint extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			isInserterFocused: false,
		};

		this.onBlurInserter = this.onBlurInserter.bind( this );
		this.onFocusInserter = this.onFocusInserter.bind( this );
		this.onClick = this.onClick.bind( this );
	}

	onFocusInserter() {
		this.setState( {
			isInserterFocused: true,
		} );
	}

	onBlurInserter() {
		this.setState( {
			isInserterFocused: false,
		} );
	}

	onClick() {
		const { layout, rootUID, index, ...props } = this.props;
		props.insertDefaultBlock( { layout }, rootUID, index );
		props.startTyping();
	}

	render() {
		const { isInserterFocused } = this.state;
		const { showInsertionPoint, showInserter } = this.props;

		return (
			<div className="editor-block-list__insertion-point">
				{ showInsertionPoint && <div className="editor-block-list__insertion-point-indicator" /> }
				{ showInserter && (
					<div className={ classnames( 'editor-block-list__insertion-point-inserter', { 'is-visible': isInserterFocused } ) }>
						<IconButton
							icon="insert"
							className="editor-block-list__insertion-point-button"
							onClick={ this.onClick }
							label={ __( 'Insert block' ) }
							onFocus={ this.onFocusInserter }
							onBlur={ this.onBlurInserter }
						/>
					</div>
				) }
			</div>
		);
	}
}
export default compose(
	withSelect( ( select, { uid, rootUID, canShowInserter } ) => {
		const {
			getBlockIndex,
			getBlockInsertionPoint,
			getBlock,
			isBlockInsertionPointVisible,
			isTyping,
			getEditorSettings,
		} = select( 'core/editor' );
		const blockIndex = uid ? getBlockIndex( uid, rootUID ) : -1;
		const insertIndex = blockIndex;
		const insertionPoint = getBlockInsertionPoint();
		const block = uid ? getBlock( uid ) : null;
		const showInsertionPoint = (
			isBlockInsertionPointVisible() &&
			insertionPoint.index === insertIndex &&
			insertionPoint.rootUID === rootUID &&
			( ! block || ! isUnmodifiedDefaultBlock( block ) )
		);

		return {
			templateLock: getEditorSettings().templateLock,
			showInserter: ! isTyping() && canShowInserter,
			index: insertIndex,
			showInsertionPoint,
		};
	} ),
	ifCondition( ( { templateLock } ) => ! templateLock ),
	withDispatch( ( dispatch ) => {
		const { insertDefaultBlock, startTyping } = dispatch( 'core/editor' );
		return {
			insertDefaultBlock,
			startTyping,
		};
	} )
)( BlockInsertionPoint );
