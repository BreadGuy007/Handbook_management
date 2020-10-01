/**
 * External dependencies
 */
import { View, Text, TouchableWithoutFeedback } from 'react-native';

/**
 * WordPress dependencies
 */
import {
	requestUnsupportedBlockFallback,
	sendActionButtonPressedAction,
	actionButtons,
} from '@wordpress/react-native-bridge';
import { BottomSheet, Icon, withUIStrings } from '@wordpress/components';
import { compose, withPreferredColorScheme } from '@wordpress/compose';
import { coreBlocks } from '@wordpress/block-library';
import { normalizeIconObject } from '@wordpress/blocks';
import { Component } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { help, plugins } from '@wordpress/icons';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import styles from './style.scss';

export class UnsupportedBlockEdit extends Component {
	constructor( props ) {
		super( props );
		this.state = { showHelp: false };
		this.toggleSheet = this.toggleSheet.bind( this );
		this.requestFallback = this.requestFallback.bind( this );
	}

	toggleSheet() {
		this.setState( {
			showHelp: ! this.state.showHelp,
		} );
	}

	componentWillUnmount() {
		if ( this.timeout ) {
			clearTimeout( this.timeout );
		}
	}

	renderHelpIcon() {
		const infoIconStyle = this.props.getStylesFromColorScheme(
			styles.infoIcon,
			styles.infoIconDark
		);

		return (
			<View style={ styles.helpIconContainer }>
				<Icon
					className="unsupported-icon-help"
					label={ __( 'Help icon' ) }
					icon={ help }
					color={ infoIconStyle.color }
				/>
			</View>
		);
	}

	requestFallback() {
		if (
			this.props.canEnableUnsupportedBlockEditor &&
			this.props.isUnsupportedBlockEditorSupported === false
		) {
			this.toggleSheet();
			this.setState( { sendButtonPressMessage: true } );
		} else {
			this.toggleSheet();
			this.setState( { sendFallbackMessage: true } );
		}
	}

	renderSheet( blockTitle, blockName ) {
		const {
			getStylesFromColorScheme,
			attributes,
			clientId,
			isUnsupportedBlockEditorSupported,
			canEnableUnsupportedBlockEditor,
		} = this.props;
		const infoTextStyle = getStylesFromColorScheme(
			styles.infoText,
			styles.infoTextDark
		);
		const infoTitleStyle = getStylesFromColorScheme(
			styles.infoTitle,
			styles.infoTitleDark
		);
		const infoDescriptionStyle = getStylesFromColorScheme(
			styles.infoDescription,
			styles.infoDescriptionDark
		);
		const infoSheetIconStyle = getStylesFromColorScheme(
			styles.infoSheetIcon,
			styles.infoSheetIconDark
		);

		/* translators: Missing block alert title. %s: The localized block name */
		const titleFormat = __( "'%s' is not fully-supported" );
		const infoTitle = sprintf( titleFormat, blockTitle );

		const actionButtonStyle = getStylesFromColorScheme(
			styles.actionButton,
			styles.actionButtonDark
		);

		return (
			<BottomSheet
				isVisible={ this.state.showHelp }
				hideHeader
				onClose={ this.toggleSheet }
				onModalHide={ () => {
					if ( this.state.sendFallbackMessage ) {
						// On iOS, onModalHide is called when the controller is still part of the hierarchy.
						// A small delay will ensure that the controller has already been removed.
						this.timeout = setTimeout( () => {
							// for the Classic block, the content is kept in the `content` attribute
							const content =
								blockName === 'core/freeform'
									? attributes.content
									: attributes.originalContent;
							requestUnsupportedBlockFallback(
								content,
								clientId,
								blockName,
								blockTitle
							);
						}, 100 );
						this.setState( { sendFallbackMessage: false } );
					} else if ( this.state.sendButtonPressMessage ) {
						this.timeout = setTimeout( () => {
							sendActionButtonPressedAction(
								actionButtons.missingBlockAlertActionButton
							);
						}, 100 );
						this.setState( { sendButtonPressMessage: false } );
					}
				} }
			>
				<View style={ styles.infoContainer }>
					<Icon
						icon={ help }
						color={ infoSheetIconStyle.color }
						size={ styles.infoSheetIcon.size }
					/>
					<Text style={ [ infoTextStyle, infoTitleStyle ] }>
						{ infoTitle }
					</Text>
					<Text style={ [ infoTextStyle, infoDescriptionStyle ] }>
						{ this.props.uiStrings[ 'missing-block-detail' ] ??
							__(
								'We are working hard to add more blocks with each release.'
							) }
					</Text>
				</View>
				{ ( isUnsupportedBlockEditorSupported ||
					canEnableUnsupportedBlockEditor ) && (
					<>
						<BottomSheet.Cell
							label={
								this.props.uiStrings[
									'missing-block-action-button'
								] ?? __( 'Edit using web editor' )
							}
							separatorType="topFullWidth"
							onPress={ this.requestFallback }
							labelStyle={ actionButtonStyle }
						/>
						<BottomSheet.Cell
							label={ __( 'Dismiss' ) }
							separatorType="topFullWidth"
							onPress={ this.toggleSheet }
							labelStyle={ actionButtonStyle }
						/>
					</>
				) }
			</BottomSheet>
		);
	}

	render() {
		const { originalName } = this.props.attributes;
		const { getStylesFromColorScheme, preferredColorScheme } = this.props;
		const blockType = coreBlocks[ originalName ];

		const title = blockType ? blockType.settings.title : originalName;
		const titleStyle = getStylesFromColorScheme(
			styles.unsupportedBlockMessage,
			styles.unsupportedBlockMessageDark
		);

		const subTitleStyle = getStylesFromColorScheme(
			styles.unsupportedBlockSubtitle,
			styles.unsupportedBlockSubtitleDark
		);
		const subtitle = (
			<Text style={ subTitleStyle }>{ __( 'Unsupported' ) }</Text>
		);

		const icon = blockType
			? normalizeIconObject( blockType.settings.icon )
			: plugins;
		const iconStyle = getStylesFromColorScheme(
			styles.unsupportedBlockIcon,
			styles.unsupportedBlockIconDark
		);
		const iconClassName = 'unsupported-icon' + '-' + preferredColorScheme;
		return (
			<TouchableWithoutFeedback
				disabled={ ! this.props.isSelected }
				accessibilityLabel={ __( 'Help button' ) }
				accessibilityRole={ 'button' }
				accessibilityHint={ __( 'Tap here to show help' ) }
				onPress={ this.toggleSheet }
			>
				<View
					style={ getStylesFromColorScheme(
						styles.unsupportedBlock,
						styles.unsupportedBlockDark
					) }
				>
					{ this.renderHelpIcon() }
					<Icon
						className={ iconClassName }
						icon={ icon && icon.src ? icon.src : icon }
						color={ iconStyle.color }
					/>
					<Text style={ titleStyle }>{ title }</Text>
					{ subtitle }
					{ this.renderSheet( title, originalName ) }
				</View>
			</TouchableWithoutFeedback>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const { getSettings } = select( 'core/block-editor' );
		return {
			isUnsupportedBlockEditorSupported:
				getSettings( 'capabilities' ).unsupportedBlockEditor === true,
			canEnableUnsupportedBlockEditor:
				getSettings( 'capabilities' )
					.canEnableUnsupportedBlockEditor === true,
		};
	} ),
	withPreferredColorScheme,
	withUIStrings,
] )( UnsupportedBlockEdit );
