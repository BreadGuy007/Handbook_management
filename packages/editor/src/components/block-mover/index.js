/**
 * External dependencies
 */
import { first, partial, castArray } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { getBlockType } from '@wordpress/blocks';
import { Component } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { withInstanceId, compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { getBlockMoverDescription } from './mover-description';
import { upArrow, downArrow } from './arrows';
import withDeprecatedUniqueId from '../with-deprecated-unique-id';

export class BlockMover extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			isFocused: false,
		};
		this.onFocus = this.onFocus.bind( this );
		this.onBlur = this.onBlur.bind( this );
	}

	onFocus() {
		this.setState( {
			isFocused: true,
		} );
	}

	onBlur() {
		this.setState( {
			isFocused: false,
		} );
	}

	render() {
		const { onMoveUp, onMoveDown, isFirst, isLast, clientIds, blockType, firstIndex, isLocked, instanceId, isHidden } = this.props;
		const { isFocused } = this.state;
		const blocksCount = castArray( clientIds ).length;
		if ( isLocked ) {
			return null;
		}

		// We emulate a disabled state because forcefully applying the `disabled`
		// attribute on the button while it has focus causes the screen to change
		// to an unfocused state (body as active element) without firing blur on,
		// the rendering parent, leaving it unable to react to focus out.
		return (
			<div className={ classnames( 'editor-block-mover', { 'is-visible': isFocused || ! isHidden } ) }>
				<IconButton
					className="editor-block-mover__control"
					onClick={ isFirst ? null : onMoveUp }
					icon={ upArrow }
					label={ __( 'Move up' ) }
					aria-describedby={ `editor-block-mover__up-description-${ instanceId }` }
					aria-disabled={ isFirst }
					onFocus={ this.onFocus }
					onBlur={ this.onBlur }
				/>
				<IconButton
					className="editor-block-mover__control"
					onClick={ isLast ? null : onMoveDown }
					icon={ downArrow }
					label={ __( 'Move down' ) }
					aria-describedby={ `editor-block-mover__down-description-${ instanceId }` }
					aria-disabled={ isLast }
					onFocus={ this.onFocus }
					onBlur={ this.onBlur }
				/>
				<span id={ `editor-block-mover__up-description-${ instanceId }` } className="editor-block-mover__description">
					{
						getBlockMoverDescription(
							blocksCount,
							blockType && blockType.title,
							firstIndex,
							isFirst,
							isLast,
							-1,
						)
					}
				</span>
				<span id={ `editor-block-mover__down-description-${ instanceId }` } className="editor-block-mover__description">
					{
						getBlockMoverDescription(
							blocksCount,
							blockType && blockType.title,
							firstIndex,
							isFirst,
							isLast,
							1,
						)
					}
				</span>
			</div>
		);
	}
}

export default compose(
	withDeprecatedUniqueId,
	withSelect( ( select, { clientIds, rootClientId } ) => {
		const { getBlock, getBlockIndex, getTemplateLock } = select( 'core/editor' );
		const firstClientId = first( castArray( clientIds ) );
		const block = getBlock( firstClientId );

		return {
			firstIndex: getBlockIndex( firstClientId, rootClientId ),
			blockType: block ? getBlockType( block.name ) : null,
			isLocked: getTemplateLock( rootClientId ) === 'all',
		};
	} ),
	withDispatch( ( dispatch, { clientIds, rootClientId } ) => {
		const { moveBlocksDown, moveBlocksUp } = dispatch( 'core/editor' );
		return {
			onMoveDown: partial( moveBlocksDown, clientIds, rootClientId ),
			onMoveUp: partial( moveBlocksUp, clientIds, rootClientId ),
		};
	} ),
	withInstanceId,
)( BlockMover );
