/**
 * Internal dependencies
 */
import HeadingToolbar from './heading-toolbar';
import styles from './editor.scss';

/**
 * External dependencies
 */
import { View } from 'react-native';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { RichText, BlockControls } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { create } from '@wordpress/rich-text';

class HeadingEdit extends Component {
	plainTextContent( html ) {
		const result = create( { html } );
		if ( result ) {
			return result.text;
		}
		return '';
	}

	render() {
		const {
			attributes,
			insertBlocksAfter,
			setAttributes,
			mergeBlocks,
			style,
		} = this.props;

		const {
			level,
			placeholder,
			content,
		} = attributes;

		const tagName = 'h' + level;

		return (
			<View
				accessible={ ! this.props.isSelected }
				accessibilityLabel={
					isEmpty( content ) ?
						sprintf(
							/* translators: accessibility text. %s: heading level. */
							__( 'Heading block. Level %s. Empty.' ),
							level
						) :
						sprintf(
							/* translators: accessibility text. 1: heading level. 2: heading content. */
							__( 'Heading block. Level %1$s. %2$s' ),
							level,
							this.plainTextContent( content )
						)
				}
				onAccessibilityTap={ this.props.onFocus }
			>
				<BlockControls>
					<HeadingToolbar minLevel={ 2 } maxLevel={ 5 } selectedLevel={ level } onChange={ ( newLevel ) => setAttributes( { level: newLevel } ) } />
				</BlockControls>
				<RichText
					identifier="content"
					tagName={ tagName }
					value={ content }
					isSelected={ this.props.isSelected }
					style={ {
						...style,
						minHeight: styles[ 'wp-block-heading' ].minHeight,
					} }
					onFocus={ this.props.onFocus } // always assign onFocus as a props
					onBlur={ this.props.onBlur } // always assign onBlur as a props
					onChange={ ( value ) => setAttributes( { content: value } ) }
					onMerge={ mergeBlocks }
					unstableOnSplit={
						insertBlocksAfter ?
							( before, after, ...blocks ) => {
								setAttributes( { content: before } );
								insertBlocksAfter( [
									...blocks,
									createBlock( 'core/paragraph', { content: after } ),
								] );
							} :
							undefined
					}
					placeholder={ placeholder || __( 'Write heading…' ) }
				/>
			</View>
		);
	}
}
export default HeadingEdit;
