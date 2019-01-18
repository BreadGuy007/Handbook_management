/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { BlockControls, PlainText, transformStyles } from '@wordpress/editor';
import { Disabled, SandBox } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

class HTMLEdit extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			isPreview: false,
			styles: [],
		};
		this.switchToHTML = this.switchToHTML.bind( this );
		this.switchToPreview = this.switchToPreview.bind( this );
	}

	componentDidMount() {
		const { styles } = this.props;
		this.setState( { styles: transformStyles( styles ) } );
	}

	switchToPreview() {
		this.setState( { isPreview: true } );
	}

	switchToHTML() {
		this.setState( { isPreview: false } );
	}

	render() {
		const { attributes, setAttributes } = this.props;
		const { isPreview, styles } = this.state;

		return (
			<div className="wp-block-html">
				<BlockControls>
					<div className="components-toolbar">
						<button
							className={ `components-tab-button ${ ! isPreview ? 'is-active' : '' }` }
							onClick={ this.switchToHTML }
						>
							<span>HTML</span>
						</button>
						<button
							className={ `components-tab-button ${ isPreview ? 'is-active' : '' }` }
							onClick={ this.switchToPreview }
						>
							<span>{ __( 'Preview' ) }</span>
						</button>
					</div>
				</BlockControls>
				<Disabled.Consumer>
					{ ( isDisabled ) => (
						( isPreview || isDisabled ) ? (
							<SandBox html={ attributes.content } styles={ styles } />
						) : (
							<PlainText
								value={ attributes.content }
								onChange={ ( content ) => setAttributes( { content } ) }
								placeholder={ __( 'Write HTML…' ) }
								aria-label={ __( 'HTML' ) }
							/>
						)
					) }
				</Disabled.Consumer>
			</div>
		);
	}
}
export default withSelect( ( select ) => {
	const { getEditorSettings } = select( 'core/editor' );
	return {
		styles: getEditorSettings().styles,
	};
} )( HTMLEdit );
