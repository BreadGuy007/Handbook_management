/**
 * External dependencies
 */
import { map, filter, includes } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	NavigableMenu,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, plus } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import getClosestAvailableTemplate from '../../../utils/get-closest-available-template';
import { TEMPLATES_DEFAULT_DETAILS } from '../../../utils/get-template-info/constants';

export default function NewTemplateDropdown() {
	const templates = useSelect(
		( select ) =>
			select( 'core' ).getEntityRecords( 'postType', 'wp_template', {
				status: [ 'publish', 'auto-draft' ],
				per_page: -1,
			} ),
		[]
	);
	const { addTemplate } = useDispatch( 'core/edit-site' );

	const createTemplate = ( slug ) => {
		const closestAvailableTemplate = getClosestAvailableTemplate(
			slug,
			templates
		);
		addTemplate( {
			content: closestAvailableTemplate.content.raw,
			slug,
			title: slug,
			status: 'draft',
		} );
	};

	const existingTemplateSlugs = map( templates, 'slug' );

	const missingTemplates = filter(
		TEMPLATES_DEFAULT_DETAILS,
		( template ) => ! includes( existingTemplateSlugs, template.slug )
	);

	return (
		<DropdownMenu
			className="edit-site-navigation-panel__new-template-dropdown"
			icon={ null }
			label={ __( 'Add Template' ) }
			popoverProps={ {
				noArrow: false,
			} }
			toggleProps={ {
				children: <Icon icon={ plus } />,
				isSmall: true,
				isTertiary: true,
			} }
		>
			{ ( { onClose } ) => (
				<NavigableMenu>
					<MenuGroup label={ __( 'Add Template' ) }>
						{ map(
							missingTemplates,
							( { title, description, slug } ) => (
								<MenuItem
									info={ description }
									key={ slug }
									onClick={ () => {
										createTemplate( slug );
										onClose();
									} }
								>
									{ title }
								</MenuItem>
							)
						) }
					</MenuGroup>
				</NavigableMenu>
			) }
		</DropdownMenu>
	);
}
