/**
 * External dependencies
 */
import { View } from 'react-native';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { RichText } from '@wordpress/block-editor';
import { decodeEntities } from '@wordpress/html-entities';
import { withDispatch } from '@wordpress/data';
import { withFocusOutside } from '@wordpress/components';
import { withInstanceId, compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import styles from './style.scss';

class PostTitle extends Component {
	constructor() {
		super( ...arguments );

		this.onSelect = this.onSelect.bind( this );
		this.onUnselect = this.onUnselect.bind( this );
		this.titleViewRef = null;

		this.state = {
			isSelected: false,
		};
	}

	componentDidMount() {
		if ( this.props.innerRef ) {
			this.props.innerRef( this );
		}
	}

	handleFocusOutside() {
		this.onUnselect();
	}

	focus() {
		if ( this.titleViewRef ) {
			this.titleViewRef.focus();
			this.setState( { isSelected: true } );
		}
	}

	onSelect() {
		this.setState( { isSelected: true } );
		this.props.clearSelectedBlock();
	}

	onUnselect() {
		this.setState( { isSelected: false } );
	}

	render() {
		const {
			placeholder,
			style,
			title,
			focusedBorderColor,
			borderStyle,
		} = this.props;

		const decodedPlaceholder = decodeEntities( placeholder );
		const borderColor = this.state.isSelected ? focusedBorderColor : 'transparent';

		return (
			<View style={ [ styles.titleContainer, borderStyle, { borderColor } ] }>
				<RichText
					tagName={ 'p' }
					rootTagsToEliminate={ [ 'strong' ] }
					onFocus={ this.onSelect }
					onBlur={ this.props.onBlur } // always assign onBlur as a props
					multiline={ false }
					style={ style }
					fontSize={ 24 }
					fontWeight={ 'bold' }
					onChange={ ( value ) => {
						this.props.onUpdate( value );
					} }
					placeholder={ decodedPlaceholder }
					value={ title }
					onSplit={ this.props.onEnterPress }
					disableEditingMenu={ true }
					setRef={ ( ref ) => {
						this.titleViewRef = ref;
					} }
				>
				</RichText>
			</View>
		);
	}
}

const applyWithDispatch = withDispatch( ( dispatch ) => {
	const {
		undo,
		redo,
	} = dispatch( 'core/editor' );

	const {
		insertDefaultBlock,
		clearSelectedBlock,
	} = dispatch( 'core/block-editor' );

	return {
		onEnterPress() {
			insertDefaultBlock( undefined, undefined, 0 );
		},
		onUndo: undo,
		onRedo: redo,
		clearSelectedBlock,
	};
} );

export default compose(
	applyWithDispatch,
	withInstanceId,
	withFocusOutside
)( PostTitle );
