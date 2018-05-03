/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Dropdown, IconButton } from '@wordpress/components';
import { createBlock, isUnmodifiedDefaultBlock, withEditorSettings } from '@wordpress/blocks';
import { Component, compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import InserterMenu from './menu';

class Inserter extends Component {
	constructor() {
		super( ...arguments );

		this.onToggle = this.onToggle.bind( this );
	}

	onToggle( isOpen ) {
		const { onToggle } = this.props;

		if ( isOpen ) {
			this.props.showInsertionPoint();
		} else {
			this.props.hideInsertionPoint();
		}

		// Surface toggle callback to parent component
		if ( onToggle ) {
			onToggle( isOpen );
		}
	}

	render() {
		const {
			position,
			title,
			children,
			onInsertBlock,
			hasSupportedBlocks,
			isLocked,
		} = this.props;

		if ( ! hasSupportedBlocks || isLocked ) {
			return null;
		}

		return (
			<Dropdown
				className="editor-inserter"
				position={ position }
				onToggle={ this.onToggle }
				expandOnMobile
				headerTitle={ title }
				renderToggle={ ( { onToggle, isOpen } ) => (
					<IconButton
						icon="insert"
						label={ __( 'Add block' ) }
						onClick={ onToggle }
						className="editor-inserter__toggle"
						aria-haspopup="true"
						aria-expanded={ isOpen }
					>
						{ children }
					</IconButton>
				) }
				renderContent={ ( { onClose } ) => {
					const onSelect = ( item ) => {
						onInsertBlock( item );

						onClose();
					};

					return <InserterMenu onSelect={ onSelect } />;
				} }
			/>
		);
	}
}

export default compose( [
	withEditorSettings( ( settings ) => {
		const { allowedBlockTypes, templateLock } = settings;

		return {
			allowedBlockTypes,
			isLocked: !! templateLock,
		};
	} ),
	withSelect( ( select, { allowedBlockTypes } ) => {
		const {
			getEditedPostAttribute,
			getBlockInsertionPoint,
			getSelectedBlock,
			getSupportedBlocks,
		} = select( 'core/editor' );

		const insertionPoint = getBlockInsertionPoint();
		const { rootUID } = insertionPoint;
		const supportedBlocks = getSupportedBlocks( rootUID, allowedBlockTypes );
		return {
			title: getEditedPostAttribute( 'title' ),
			insertionPoint,
			selectedBlock: getSelectedBlock(),
			hasSupportedBlocks: true === supportedBlocks || ! isEmpty( supportedBlocks ),
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => ( {
		showInsertionPoint: dispatch( 'core/editor' ).showInsertionPoint,
		hideInsertionPoint: dispatch( 'core/editor' ).hideInsertionPoint,
		onInsertBlock: ( item ) => {
			const { insertionPoint, selectedBlock } = ownProps;
			const { index, rootUID, layout } = insertionPoint;
			const { name, initialAttributes } = item;
			const insertedBlock = createBlock( name, { ...initialAttributes, layout } );
			if ( selectedBlock && isUnmodifiedDefaultBlock( selectedBlock ) ) {
				return dispatch( 'core/editor' ).replaceBlocks( selectedBlock.uid, insertedBlock );
			}
			return dispatch( 'core/editor' ).insertBlock( insertedBlock, index, rootUID );
		},
	} ) ),
] )( Inserter );
