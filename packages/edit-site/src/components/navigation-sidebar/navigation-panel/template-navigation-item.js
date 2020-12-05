/**
 * WordPress dependencies
 */
import {
	Button,
	__experimentalNavigationItem as NavigationItem,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import TemplatePreview from './template-preview';
import { NavigationPanelPreviewFill } from '../index';

export default function TemplateNavigationItem( { item } ) {
	const { title, description } = useSelect(
		( select ) =>
			'wp_template' === item.type
				? select( 'core/editor' ).__experimentalGetTemplateInfo( item )
				: { title: item?.slug, description: '' },
		[]
	);
	const { setTemplate, setTemplatePart } = useDispatch( 'core/edit-site' );
	const [ isPreviewVisible, setIsPreviewVisible ] = useState( false );

	if ( ! item ) {
		return null;
	}

	const onActivateItem = () =>
		'wp_template' === item.type
			? setTemplate( item.id )
			: setTemplatePart( item.id );

	return (
		<NavigationItem
			className="edit-site-navigation-panel__template-item"
			item={ `${ item.type }-${ item.id }` }
			title={ title }
		>
			<Button
				onClick={ onActivateItem }
				onMouseEnter={ () => setIsPreviewVisible( true ) }
				onMouseLeave={ () => setIsPreviewVisible( false ) }
			>
				<div className="edit-site-navigation-panel__template-item-title">
					{ 'draft' === item.status && <em>{ __( '[Draft]' ) }</em> }
					{ title }
				</div>
				{ description && (
					<div className="edit-site-navigation-panel__template-item-description">
						{ description }
					</div>
				) }
			</Button>

			{ isPreviewVisible && (
				<NavigationPanelPreviewFill>
					<TemplatePreview rawContent={ item.content.raw } />
				</NavigationPanelPreviewFill>
			) }
		</NavigationItem>
	);
}
