/**
 * External dependencies
 */
import { connect } from 'react-redux';
import Textarea from 'react-textarea-autosize';

/**
 * Internal dependencies
 */
import './style.scss';

function TextEditor( { blocks, onChange } ) {
	return (
		<Textarea
			defaultValue={ wp.blocks.serialize( blocks ) }
			onBlur={ ( event ) => onChange( event.target.value ) }
			className="editor-text-editor"
			useCacheForDOMMeasurements
		/>
	);
}

export default connect(
	( state ) => ( {
		blocks: state.blocks.order.map( ( uid ) => (
			state.blocks.byUid[ uid ]
		) )
	} ),
	( dispatch ) => ( {
		onChange( value ) {
			dispatch( {
				type: 'REPLACE_BLOCKS',
				blockNodes: wp.blocks.parse( value )
			} );
		}
	} )
)( TextEditor );
