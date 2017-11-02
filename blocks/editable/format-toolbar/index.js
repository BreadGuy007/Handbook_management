/**
 * External dependencies
 */
import { Fill } from 'react-slot-fill';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { IconButton, Toolbar, withSpokenMessages } from '@wordpress/components';
import { keycodes } from '@wordpress/utils';

/**
 * Internal dependencies
 */
import './style.scss';
import UrlInput from '../../url-input';
import { filterURLForDisplay } from '../../../editor/utils/url';
import ToggleControl from '../../inspector-controls/toggle-control';

const { ESCAPE } = keycodes;

const FORMATTING_CONTROLS = [
	{
		icon: 'editor-bold',
		title: __( 'Bold' ),
		format: 'bold',
	},
	{
		icon: 'editor-italic',
		title: __( 'Italic' ),
		format: 'italic',
	},
	{
		icon: 'editor-strikethrough',
		title: __( 'Strikethrough' ),
		format: 'strikethrough',
	},
	{
		icon: 'admin-links',
		title: __( 'Link' ),
		format: 'link',
	},
];

// Default controls shown if no `enabledControls` prop provided
const DEFAULT_CONTROLS = [ 'bold', 'italic', 'strikethrough', 'link' ];

class FormatToolbar extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			isAddingLink: false,
			isEditingLink: false,
			settingsVisible: false,
			opensInNewWindow: false,
			newLinkValue: '',
		};

		this.addLink = this.addLink.bind( this );
		this.editLink = this.editLink.bind( this );
		this.dropLink = this.dropLink.bind( this );
		this.submitLink = this.submitLink.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.onChangeLinkValue = this.onChangeLinkValue.bind( this );
		this.toggleLinkSettingsVisibility = this.toggleLinkSettingsVisibility.bind( this );
		this.setLinkTarget = this.setLinkTarget.bind( this );
	}

	componentDidMount() {
		document.addEventListener( 'keydown', this.onKeyDown );
	}

	componentWillUnmount() {
		document.removeEventListener( 'keydown', this.onKeyDown );
	}

	onKeyDown( event ) {
		if ( event.keyCode === ESCAPE ) {
			if ( this.state.isEditingLink ) {
				event.stopPropagation();
				this.dropLink();
			}
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.selectedNodeId !== nextProps.selectedNodeId ) {
			this.setState( {
				isAddingLink: false,
				isEditingLink: false,
				settingsVisible: false,
				opensInNewWindow: !! nextProps.formats.link && !! nextProps.formats.link.target,
				newLinkValue: '',
			} );
		}
	}

	onChangeLinkValue( value ) {
		this.setState( { newLinkValue: value } );
	}

	toggleFormat( format ) {
		return () => {
			this.props.onChange( {
				[ format ]: ! this.props.formats[ format ],
			} );
		};
	}

	toggleLinkSettingsVisibility() {
		this.setState( ( state ) => ( { settingsVisible: ! state.settingsVisible } ) );
	}

	setLinkTarget( event ) {
		const opensInNewWindow = event.target.checked;
		this.setState( { opensInNewWindow } );
		this.props.onChange( { link: { value: this.props.formats.link.value, target: opensInNewWindow ? '_blank' : '' } } );
	}

	addLink() {
		this.setState( { isEditingLink: false, isAddingLink: true, newLinkValue: '' } );
	}

	dropLink() {
		this.props.onChange( { link: undefined } );
		this.setState( { isEditingLink: false, isAddingLink: false, newLinkValue: '' } );
	}

	editLink( event ) {
		event.preventDefault();
		this.setState( { isEditingLink: false, isAddingLink: true, newLinkValue: this.props.formats.link.value } );
	}

	submitLink( event ) {
		event.preventDefault();
		this.props.onChange( { link: { value: this.state.newLinkValue, target: this.state.opensInNewWindow ? '_blank' : '' } } );
		if ( this.state.isAddingLink ) {
			this.props.speak( __( 'Link inserted.' ), 'assertive' );
		}
	}

	isFormatActive( format ) {
		return this.props.formats[ format ] && this.props.formats[ format ].isActive;
	}

	render() {
		const { formats, focusPosition, enabledControls = DEFAULT_CONTROLS, customControls = [] } = this.props;
		const { isAddingLink, isEditingLink, newLinkValue, settingsVisible, opensInNewWindow } = this.state;
		const linkStyle = focusPosition ?
			{ position: 'absolute', ...focusPosition } :
			null;

		const toolbarControls = FORMATTING_CONTROLS.concat( customControls )
			.filter( control => enabledControls.indexOf( control.format ) !== -1 )
			.map( ( control ) => {
				const isLink = control.format === 'link';
				return {
					...control,
					onClick: isLink ? this.addLink : this.toggleFormat( control.format ),
					isActive: this.isFormatActive( control.format ) || ( isLink && isAddingLink ),
				};
			} );

		const linkSettings = settingsVisible && (
			<fieldset className="blocks-format-toolbar__link-settings">
				<ToggleControl
					label={ __( 'Open in new window' ) }
					checked={ opensInNewWindow }
					onChange={ this.setLinkTarget } />
			</fieldset>
		);

		return (
			<div className="blocks-format-toolbar">
				<Toolbar controls={ toolbarControls } />

				{ ( isAddingLink || isEditingLink ) &&
					<Fill name="Editable.Siblings">
						<form
							className="blocks-format-toolbar__link-modal"
							style={ linkStyle }
							onSubmit={ this.submitLink }>
							<UrlInput value={ newLinkValue } onChange={ this.onChangeLinkValue } />
							<IconButton icon="editor-break" label={ __( 'Apply' ) } type="submit" />
							<IconButton icon="editor-unlink" label={ __( 'Remove link' ) } onClick={ this.dropLink } />
							<IconButton
								icon="admin-generic"
								label={ __( 'Link Settings' ) }
								onClick={ this.toggleLinkSettingsVisibility }
								aria-expanded={ settingsVisible } />
							{ linkSettings }
						</form>
					</Fill>
				}

				{ !! formats.link && ! isAddingLink && ! isEditingLink &&
					<Fill name="Editable.Siblings">
						<div className="blocks-format-toolbar__link-modal" style={ linkStyle }>
							<a
								className="blocks-format-toolbar__link-value"
								href={ formats.link.value }
								target="_blank"
							>
								{ formats.link.value && filterURLForDisplay( decodeURI( formats.link.value ) ) }
							</a>
							<IconButton icon="edit" label={ __( 'Edit' ) } onClick={ this.editLink } />
							<IconButton icon="editor-unlink" label={ __( 'Remove link' ) } onClick={ this.dropLink } />
							<IconButton
								icon="admin-generic"
								label={ __( 'Link Settings' ) }
								onClick={ this.toggleLinkSettingsVisibility }
								aria-expanded={ settingsVisible } />
							{ linkSettings }
						</div>
					</Fill>
				}
			</div>
		);
	}
}

export default withSpokenMessages( FormatToolbar );
