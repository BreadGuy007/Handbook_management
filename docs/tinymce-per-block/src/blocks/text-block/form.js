/**
 * External dependencies
 */
import { createElement, Component } from 'wp-elements';

/**
 * Internal dependencies
 */
import EditableFormatToolbar from 'controls/editable-format-toolbar';
import AlignmentToolbar from 'controls/alignment-toolbar';
import BlockArrangement from 'controls/block-arrangement';
import TransformBlockToolbar from 'controls/transform-block-toolbar';
import { EditableComponent } from 'wp-blocks';
import InserterButton from 'inserter/button';

export default class TextBlockForm extends Component {
	bindForm = ( ref ) => {
		this.form = ref;
	};

	bindFormatToolbar = ( ref ) => {
		this.toolbar = ref;
	};

	setToolbarState = ( ...args ) => {
		this.toolbar && this.toolbar.setToolbarState( ...args );
	};

	setAlignment = ( align ) => {
		this.props.api.change( { align } );
	};

	render() {
		const { api, block, isSelected, isHovered, focusConfig, first, last } = this.props;
		const selectedTextAlign = block.align || 'left';
		const style = {
			textAlign: selectedTextAlign
		};
		const splitValue = ( left, right ) => {
			api.change( { content: left } );
			if ( right ) {
				api.appendBlock( {
					...block,
					content: right
				} );
			} else {
				api.appendBlock();
			}
		};

		return (
			<div className="text-block__form" onMouseEnter={ api.hover } onMouseLeave={ api.unhover }>
				{ ( isSelected || isHovered ) && <BlockArrangement first={ first } last={ last }
					moveBlockUp={ api.moveBlockUp } moveBlockDown={ api.moveBlockDown } /> }
				{ isSelected &&
					<div className="block-list__block-controls">
						<div className="block-list__block-controls-group">
							<TransformBlockToolbar blockType="text" onTransform={ api.transform } />
						</div>

						<div className="block-list__block-controls-group">
							<AlignmentToolbar value={ block.align } onChange={ this.setAlignment } />
						</div>

						<div className="block-list__block-controls-group">
							<EditableFormatToolbar editable={ this.form } ref={ this.bindFormatToolbar } />
						</div>
					</div>
				}

				{ ! block.content.trim() && ! isSelected && focusConfig &&
					<InserterButton onAdd={ api.replace } />
				}

				<div style={ style } onClick={ api.select }>
					<EditableComponent
						ref={ this.bindForm }
						content={ block.content }
						moveCursorUp={ api.moveCursorUp }
						moveCursorDown={ api.moveCursorDown }
						splitValue={ splitValue }
						mergeWithPrevious={ api.mergeWithPrevious }
						remove={ api.remove }
						onChange={ ( value ) => api.change( { content: value } ) }
						setToolbarState={ this.setToolbarState }
						focusConfig={ focusConfig }
						onFocusChange={ api.focus }
						onType={ api.unselect }
						inline
					/>
				</div>
			</div>
		);
	}
}
