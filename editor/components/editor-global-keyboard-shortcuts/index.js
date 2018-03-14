/**
 * External dependencies
 */
import { first, last } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, Fragment, compose } from '@wordpress/element';
import { KeyboardShortcuts, withContext } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';

class EditorGlobalKeyboardShortcuts extends Component {
	constructor() {
		super( ...arguments );

		this.selectAll = this.selectAll.bind( this );
		this.undoOrRedo = this.undoOrRedo.bind( this );
		this.save = this.save.bind( this );
		this.deleteSelectedBlocks = this.deleteSelectedBlocks.bind( this );
		this.clearMultiSelection = this.clearMultiSelection.bind( this );
	}

	selectAll( event ) {
		const { uids, onMultiSelect } = this.props;
		event.preventDefault();
		onMultiSelect( first( uids ), last( uids ) );
	}

	undoOrRedo( event ) {
		const { onRedo, onUndo } = this.props;
		if ( event.shiftKey ) {
			onRedo();
		} else {
			onUndo();
		}

		event.preventDefault();
	}

	save( event ) {
		event.preventDefault();
		this.props.onSave();
	}

	deleteSelectedBlocks( event ) {
		const { multiSelectedBlockUids, onRemove, isLocked } = this.props;
		if ( multiSelectedBlockUids.length ) {
			event.preventDefault();
			if ( ! isLocked ) {
				onRemove( multiSelectedBlockUids );
			}
		}
	}

	/**
	 * Clears current multi-selection, if one exists.
	 */
	clearMultiSelection() {
		const { hasMultiSelection, clearSelectedBlock } = this.props;
		if ( hasMultiSelection ) {
			clearSelectedBlock();
		}
	}

	render() {
		return (
			<Fragment>
				<KeyboardShortcuts
					shortcuts={ {
						'mod+a': this.selectAll,
						'mod+z': this.undoOrRedo,
						'mod+shift+z': this.undoOrRedo,
						backspace: this.deleteSelectedBlocks,
						del: this.deleteSelectedBlocks,
						escape: this.clearMultiSelection,
					} }
				/>
				<KeyboardShortcuts
					bindGlobal
					shortcuts={ {
						'mod+s': this.save,
					} }
				/>
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const {
			getBlockOrder,
			getMultiSelectedBlockUids,
			hasMultiSelection,
		} = select( 'core/editor' );

		return {
			uids: getBlockOrder(),
			multiSelectedBlockUids: getMultiSelectedBlockUids(),
			hasMultiSelection: hasMultiSelection(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			clearSelectedBlock,
			multiSelect,
			redo,
			undo,
			removeBlocks,
			autosave,
		} = dispatch( 'core/editor' );

		return {
			clearSelectedBlock,
			onMultiSelect: multiSelect,
			onRedo: redo,
			onUndo: undo,
			onRemove: removeBlocks,
			onSave: autosave,
		};
	} ),
	withContext( 'editor' )( ( settings ) => {
		const { templateLock } = settings;

		return {
			isLocked: !! templateLock,
		};
	} ),
] )( EditorGlobalKeyboardShortcuts );
