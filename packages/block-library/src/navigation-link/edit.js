/**
 * External dependencies
 */
import classnames from 'classnames';
import { escape, unescape } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { createBlock } from '@wordpress/blocks';
import { withDispatch, withSelect } from '@wordpress/data';
import {
	ExternalLink,
	KeyboardShortcuts,
	PanelBody,
	Popover,
	TextareaControl,
	TextControl,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { rawShortcut, displayShortcut } from '@wordpress/keycodes';
import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	InnerBlocks,
	InspectorControls,
	RichText,
	__experimentalLinkControl as LinkControl,
} from '@wordpress/block-editor';
import { Fragment, useState, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { toolbarSubmenuIcon, itemSubmenuIcon } from './icons';

function NavigationLinkEdit( {
	attributes,
	hasDescendants,
	isSelected,
	isParentOfSelectedBlock,
	setAttributes,
	showSubmenuIcon,
	insertLinkBlock,
} ) {
	const { label, opensInNewTab, title, url, nofollow, description } = attributes;
	const link = {
		title: title ? unescape( title ) : '',
		url,
		opensInNewTab,
	};
	const [ isLinkOpen, setIsLinkOpen ] = useState( false );
	const itemLabelPlaceholder = __( 'Add link…' );

	// Show the LinkControl on mount if the URL is empty
	// ( When adding a new menu item)
	// This can't be done in the useState call because it cconflicts
	// with the autofocus behavior of the BlockListBlock component.
	useEffect( () => {
		if ( ! url ) {
			setIsLinkOpen( true );
		}
	}, [] );

	return (
		<Fragment>
			<BlockControls>
				<ToolbarGroup>
					<KeyboardShortcuts
						bindGlobal
						shortcuts={ {
							[ rawShortcut.primary( 'k' ) ]: () => setIsLinkOpen( true ),
						} }
					/>
					<ToolbarButton
						name="link"
						icon="admin-links"
						title={ __( 'Link' ) }
						shortcut={ displayShortcut.primary( 'k' ) }
						onClick={ () => setIsLinkOpen( true ) }
					/>
					<ToolbarButton
						name="submenu"
						icon={ toolbarSubmenuIcon }
						title={ __( 'Add submenu' ) }
						onClick={ insertLinkBlock }
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'SEO settings' ) }>
					<TextControl
						value={ title || '' }
						onChange={ ( titleValue ) => {
							setAttributes( { title: titleValue } );
						} }
						label={ __( 'Title Attribute' ) }
						help={ __( 'Provide more context about where the link goes.' ) }
					/>
					<ToggleControl
						checked={ nofollow }
						onChange={ ( nofollowValue ) => {
							setAttributes( { nofollow: nofollowValue } );
						} }
						label={ __( 'Add nofollow to link' ) }
						help={
							<Fragment>
								{ __( "Don't let search engines follow this link." ) }
								<ExternalLink
									className="wp-block-navigation-link__nofollow-external-link"
									href={ __( 'https://codex.wordpress.org/Nofollow' ) }
								>
									{ __( "What's this?" ) }
								</ExternalLink>
							</Fragment>
						}
					/>
				</PanelBody>
				<PanelBody title={ __( 'Link settings' ) }>
					<TextareaControl
						value={ description || '' }
						onChange={ ( descriptionValue ) => {
							setAttributes( { description: descriptionValue } );
						} }
						label={ __( 'Description' ) }
						help={ __(
							'The description will be displayed in the menu if the current theme supports it.'
						) }
					/>
				</PanelBody>
			</InspectorControls>
			<div
				className={ classnames( 'wp-block-navigation-link', {
					'is-editing': isSelected || isParentOfSelectedBlock,
					'is-selected': isSelected,
					'has-link': !! url,
				} ) }
			>
				<div className="wp-block-navigation-link__content">
					<RichText
						tagName="span"
						className="wp-block-navigation-link__label"
						value={ label }
						onChange={ ( labelValue ) => setAttributes( { label: labelValue } ) }
						placeholder={ itemLabelPlaceholder }
						withoutInteractiveFormatting
						allowedFormats={ [ 'core/bold', 'core/italic', 'core/image', 'core/strikethrough' ] }
					/>
					{ showSubmenuIcon && (
						<span className="wp-block-navigation-link__submenu-icon">{ itemSubmenuIcon }</span>
					) }
					{ isLinkOpen && (
						<Popover position="bottom center" onClose={ () => setIsLinkOpen( false ) }>
							<LinkControl
								className="wp-block-navigation-link__inline-link-input"
								value={ link }
								showInitialSuggestions={ true }
								onChange={ ( {
									title: newTitle = '',
									url: newURL = '',
									opensInNewTab: newOpensInNewTab,
									id,
								} = {} ) =>
									setAttributes( {
										title: escape( newTitle ),
										url: encodeURI( newURL ),
										label: ( () => {
											const normalizedTitle = newTitle.replace( /http(s?):\/\//gi, '' );
											const normalizedURL = newURL.replace( /http(s?):\/\//gi, '' );
											if (
												newTitle !== '' &&
												normalizedTitle !== normalizedURL &&
												label !== newTitle
											) {
												return escape( newTitle );
											}
											return label;
										} )(),
										opensInNewTab: newOpensInNewTab,
										id,
									} )
								}
							/>
						</Popover>
					) }
				</div>
				<InnerBlocks
					allowedBlocks={ [ 'core/navigation-link' ] }
					renderAppender={
						( hasDescendants && isSelected ) || isParentOfSelectedBlock
							? InnerBlocks.DefaultAppender
							: false
					}
				/>
			</div>
		</Fragment>
	);
}

export default compose( [
	withSelect( ( select, ownProps ) => {
		const {
			getBlockName,
			getBlockAttributes,
			getBlockParents,
			getClientIdsOfDescendants,
			hasSelectedInnerBlock,
		} = select( 'core/block-editor' );
		const { clientId } = ownProps;
		const rootBlock = getBlockParents( clientId )[ 0 ];
		const parentBlock = getBlockParents( clientId, true )[ 0 ];
		const rootBlockAttributes = getBlockAttributes( rootBlock );
		const hasDescendants = !! getClientIdsOfDescendants( [ clientId ] ).length;
		const isLevelZero = getBlockName( parentBlock ) === 'core/navigation';
		const showSubmenuIcon = rootBlockAttributes.showSubmenuIcon && isLevelZero && hasDescendants;
		const isParentOfSelectedBlock = hasSelectedInnerBlock( clientId, true );

		return {
			isParentOfSelectedBlock,
			hasDescendants,
			showSubmenuIcon,
		};
	} ),
	withDispatch( ( dispatch, ownProps, registry ) => {
		return {
			insertLinkBlock() {
				const { clientId } = ownProps;

				const { insertBlock } = dispatch( 'core/block-editor' );

				const { getClientIdsOfDescendants } = registry.select( 'core/block-editor' );
				const navItems = getClientIdsOfDescendants( [ clientId ] );
				const insertionPoint = navItems.length ? navItems.length : 0;

				const blockToInsert = createBlock( 'core/navigation-link' );

				insertBlock( blockToInsert, insertionPoint, clientId );
			},
		};
	} ),
] )( NavigationLinkEdit );
