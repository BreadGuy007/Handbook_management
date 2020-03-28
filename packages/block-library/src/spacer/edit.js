/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ResizableBox, RangeControl } from '@wordpress/components';
import { compose, withInstanceId } from '@wordpress/compose';
import { withDispatch } from '@wordpress/data';

const MIN_SPACER_HEIGHT = 20;
const MAX_SPACER_HEIGHT = 500;

const SpacerEdit = ( {
	attributes,
	isSelected,
	setAttributes,
	onResizeStart,
	onResizeStop,
} ) => {
	const { height } = attributes;
	const updateHeight = ( value ) => {
		setAttributes( {
			height: value,
		} );
	};

	return (
		<>
			<ResizableBox
				className={ classnames(
					'block-library-spacer__resize-container',
					{
						'is-selected': isSelected,
					}
				) }
				size={ {
					height,
				} }
				minHeight={ MIN_SPACER_HEIGHT }
				enable={ {
					top: false,
					right: false,
					bottom: true,
					left: false,
					topRight: false,
					bottomRight: false,
					bottomLeft: false,
					topLeft: false,
				} }
				isSelected={ isSelected }
				onResizeStart={ onResizeStart }
				onResizeStop={ ( event, direction, elt, delta ) => {
					onResizeStop();
					const spacerHeight = Math.min(
						parseInt( height + delta.height, 10 ),
						MAX_SPACER_HEIGHT
					);
					updateHeight( spacerHeight );
				} }
			/>
			<InspectorControls>
				<PanelBody title={ __( 'Spacer settings' ) }>
					<RangeControl
						label={ __( 'Height in pixels' ) }
						min={ MIN_SPACER_HEIGHT }
						max={ Math.max( MAX_SPACER_HEIGHT, height ) }
						separatorType={ 'none' }
						value={ height }
						onChange={ updateHeight }
						step={ 10 }
					/>
				</PanelBody>
			</InspectorControls>
		</>
	);
};

export default compose( [
	withDispatch( ( dispatch ) => {
		const { toggleSelection } = dispatch( 'core/block-editor' );

		return {
			onResizeStart: () => toggleSelection( false ),
			onResizeStop: () => toggleSelection( true ),
		};
	} ),
	withInstanceId,
] )( SpacerEdit );
