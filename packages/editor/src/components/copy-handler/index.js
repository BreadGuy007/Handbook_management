/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { serialize } from '@wordpress/blocks';
import { documentHasSelection } from '@wordpress/dom';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

class CopyHandler extends Component {
	constructor() {
		super( ...arguments );

		this.onCopy = this.onCopy.bind( this );
		this.onCut = this.onCut.bind( this );
	}

	componentDidMount() {
		document.addEventListener( 'copy', this.onCopy );
		document.addEventListener( 'cut', this.onCut );
	}

	componentWillUnmount() {
		document.removeEventListener( 'copy', this.onCopy );
		document.removeEventListener( 'cut', this.onCut );
	}

	onCopy( event ) {
		const { multiSelectedBlocks, selectedBlock } = this.props;

		if ( ! multiSelectedBlocks.length && ! selectedBlock ) {
			return;
		}

		// Let native copy behaviour take over in input fields.
		if ( selectedBlock && documentHasSelection() ) {
			return;
		}

		const serialized = serialize( selectedBlock || multiSelectedBlocks );

		event.clipboardData.setData( 'text/plain', serialized );
		event.clipboardData.setData( 'text/html', serialized );

		event.preventDefault();
	}

	onCut( event ) {
		const { multiSelectedBlockClientIds } = this.props;

		this.onCopy( event );

		if ( multiSelectedBlockClientIds.length ) {
			this.props.onRemove( multiSelectedBlockClientIds );
		}
	}

	render() {
		return null;
	}
}

export default compose( [
	withSelect( ( select ) => {
		const {
			getMultiSelectedBlocks,
			getMultiSelectedBlockClientIds,
			getSelectedBlock,
		} = select( 'core/editor' );
		return {
			multiSelectedBlocks: getMultiSelectedBlocks(),
			multiSelectedBlockClientIds: getMultiSelectedBlockClientIds(),
			selectedBlock: getSelectedBlock(),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		onRemove: dispatch( 'core/editor' ).removeBlocks,
	} ) ),
] )( CopyHandler );
