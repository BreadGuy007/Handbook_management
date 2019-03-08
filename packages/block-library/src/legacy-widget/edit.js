/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import {
	Button,
	IconButton,
	PanelBody,
	Placeholder,
	SelectControl,
	Toolbar,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import {
	BlockControls,
	BlockIcon,
	InspectorControls,
	ServerSideRender,
} from '@wordpress/editor';

import WidgetEditHandler from './WidgetEditHandler';

class LegacyWidgetEdit extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			isPreview: false,
		};
		this.switchToEdit = this.switchToEdit.bind( this );
		this.switchToPreview = this.switchToPreview.bind( this );
		this.changeWidget = this.changeWidget.bind( this );
	}

	render() {
		const {
			attributes,
			availableLegacyWidgets,
			hasPermissionsToManageWidgets,
			setAttributes,
		} = this.props;
		const { isPreview } = this.state;
		const { identifier, isCallbackWidget } = attributes;
		const widgetObject = identifier && availableLegacyWidgets[ identifier ];
		if ( ! widgetObject ) {
			let placeholderContent;

			if ( ! hasPermissionsToManageWidgets ) {
				placeholderContent = __( 'You don\'t have permissions to use widgets on this site.' );
			} else if ( availableLegacyWidgets.length === 0 ) {
				placeholderContent = __( 'There are no widgets available.' );
			} else {
				placeholderContent = (
					<SelectControl
						label={ __( 'Select a legacy widget to display:' ) }
						value={ identifier || 'none' }
						onChange={ ( value ) => setAttributes( {
							instance: {},
							identifier: value,
							isCallbackWidget: availableLegacyWidgets[ value ].isCallbackWidget,
						} ) }
						options={ [ { value: 'none', label: 'Select widget' } ].concat(
							map( availableLegacyWidgets, ( widget, key ) => {
								return {
									value: key,
									label: widget.name,
								};
							} )
						) }
					/>
				);
			}

			return (
				<Placeholder
					icon={ <BlockIcon icon="admin-customizer" /> }
					label={ __( 'Legacy Widget' ) }
				>
					{ placeholderContent }
				</Placeholder>
			);
		}

		const inspectorControls = (
			<InspectorControls>
				<PanelBody title={ widgetObject.name }>
					{ widgetObject.description }
				</PanelBody>
			</InspectorControls>
		);
		if ( ! hasPermissionsToManageWidgets ) {
			return (
				<Fragment>
					{ inspectorControls }
					{ this.renderWidgetPreview() }
				</Fragment>
			);
		}

		return (
			<Fragment>
				<BlockControls>
					<Toolbar>
						<IconButton
							onClick={ this.changeWidget }
							label={ __( 'Change widget' ) }
							icon="update"
						>
						</IconButton>
						{ ! isCallbackWidget && (
							<Fragment>
								<Button
									className={ `components-tab-button ${ ! isPreview ? 'is-active' : '' }` }
									onClick={ this.switchToEdit }
								>
									<span>{ __( 'Edit' ) }</span>
								</Button>
								<Button
									className={ `components-tab-button ${ isPreview ? 'is-active' : '' }` }
									onClick={ this.switchToPreview }
								>
									<span>{ __( 'Preview' ) }</span>
								</Button>
							</Fragment>
						) }
					</Toolbar>
				</BlockControls>
				{ inspectorControls }
				{ ! isCallbackWidget && (
					<WidgetEditHandler
						isVisible={ ! isPreview }
						identifier={ attributes.identifier }
						instance={ attributes.instance }
						onInstanceChange={
							( newInstance ) => {
								this.props.setAttributes( {
									instance: newInstance,
								} );
							}
						}
					/>
				) }
				{ ( isPreview || isCallbackWidget ) && this.renderWidgetPreview() }
			</Fragment>
		);
	}

	changeWidget() {
		this.switchToEdit();
		this.props.setAttributes( {
			instance: {},
			identifier: undefined,
		} );
	}

	switchToEdit() {
		this.setState( { isPreview: false } );
	}

	switchToPreview() {
		this.setState( { isPreview: true } );
	}

	renderWidgetPreview() {
		const { attributes } = this.props;
		return (
			<ServerSideRender
				className="wp-block-legacy-widget__preview"
				block="core/legacy-widget"
				attributes={ attributes }
			/>
		);
	}
}

export default withSelect( ( select ) => {
	const editorSettings = select( 'core/block-editor' ).getSettings();
	const {
		availableLegacyWidgets,
		hasPermissionsToManageWidgets,
	} = editorSettings;
	return {
		hasPermissionsToManageWidgets,
		availableLegacyWidgets,
	};
} )( LegacyWidgetEdit );
