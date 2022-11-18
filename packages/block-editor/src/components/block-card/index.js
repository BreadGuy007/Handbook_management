/**
 * WordPress dependencies
 */
import deprecated from '@wordpress/deprecated';
import { Button } from '@wordpress/components';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { __, isRTL } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import BlockIcon from '../block-icon';

function BlockCard( {
	title,
	icon,
	description,
	blockType,
	parentBlockClientId,
	handleBackButton,
} ) {
	if ( blockType ) {
		deprecated( '`blockType` property in `BlockCard component`', {
			since: '5.7',
			alternative: '`title, icon and description` properties',
		} );
		( { title, icon, description } = blockType );
	}

	const isOffCanvasNavigationEditorEnabled =
		window?.__experimentalEnableOffCanvasNavigationEditor === true;

	return (
		<div className="block-editor-block-card">
			{ isOffCanvasNavigationEditorEnabled && parentBlockClientId && (
				<Button
					onClick={ handleBackButton }
					label={ __( 'Navigate to parent block' ) }
					style={
						// TODO: This style override is also used in ToolsPanelHeader.
						// It should be supported out-of-the-box by Button.
						{ minWidth: 24, padding: 0 }
					}
					icon={ isRTL() ? chevronRight : chevronLeft }
					isSmall
				/>
			) }
			<BlockIcon icon={ icon } showColors />
			<div className="block-editor-block-card__content">
				<h2 className="block-editor-block-card__title">{ title }</h2>
				<span className="block-editor-block-card__description">
					{ description }
				</span>
			</div>
		</div>
	);
}

export default BlockCard;
