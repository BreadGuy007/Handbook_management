/**
 * External Dependencies
 */
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import PostTaxonomiesForm from '../../post-taxonomies';
import { isEditorSidebarPanelOpened } from '../../selectors';
import { toggleSidebarPanel } from '../../actions';

/**
 * Module Constants
 */
const PANEL_NAME = 'post-taxonomies';

function PostTaxonomies( { isOpened, onTogglePanel } ) {
	return (
		<PanelBody
			title={ __( 'Categories & Tags' ) }
			opened={ isOpened }
			onToggle={ onTogglePanel }
		>
			<PostTaxonomiesForm />
		</PanelBody>
	);
}

export default connect(
	( state ) => {
		return {
			isOpened: isEditorSidebarPanelOpened( state, PANEL_NAME ),
		};
	},
	{
		onTogglePanel() {
			return toggleSidebarPanel( PANEL_NAME );
		},
	}
)( PostTaxonomies );

