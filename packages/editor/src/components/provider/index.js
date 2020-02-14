/**
 * External dependencies
 */
import { map, pick, defaultTo } from 'lodash';
import memize from 'memize';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { Component } from '@wordpress/element';
import { withDispatch, withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { EntityProvider } from '@wordpress/core-data';
import { BlockEditorProvider, transformStyles } from '@wordpress/block-editor';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import withRegistryProvider from './with-registry-provider';
import { mediaUpload } from '../../utils';
import ReusableBlocksButtons from '../reusable-blocks-buttons';
import ConvertToGroupButtons from '../convert-to-group-buttons';

const fetchLinkSuggestions = async ( search, { perPage = 20 } = {} ) => {
	const posts = await apiFetch( {
		path: addQueryArgs( '/wp/v2/search', {
			search,
			per_page: perPage,
			type: 'post',
		} ),
	} );

	return map( posts, ( post ) => ( {
		id: post.id,
		url: post.url,
		title: decodeEntities( post.title ) || __( '(no title)' ),
		type: post.subtype || post.type,
	} ) );
};

class EditorProvider extends Component {
	constructor( props ) {
		super( ...arguments );

		this.getBlockEditorSettings = memize( this.getBlockEditorSettings, {
			maxSize: 1,
		} );

		// Assume that we don't need to initialize in the case of an error recovery.
		if ( props.recovery ) {
			return;
		}

		props.updatePostLock( props.settings.postLock );
		props.setupEditor(
			props.post,
			props.initialEdits,
			props.settings.template
		);

		if ( props.settings.autosave ) {
			props.createWarningNotice(
				__(
					'There is an autosave of this post that is more recent than the version below.'
				),
				{
					id: 'autosave-exists',
					actions: [
						{
							label: __( 'View the autosave' ),
							url: props.settings.autosave.editLink,
						},
					],
				}
			);
		}
	}

	getBlockEditorSettings(
		settings,
		reusableBlocks,
		__experimentalFetchReusableBlocks,
		hasUploadPermissions,
		canUserUseUnfilteredHTML,
		undo,
		shouldInsertAtTheTop
	) {
		return {
			...pick( settings, [
				'alignWide',
				'allowedBlockTypes',
				'__experimentalPreferredStyleVariations',
				'availableLegacyWidgets',
				'bodyPlaceholder',
				'codeEditingEnabled',
				'colors',
				'disableCustomColors',
				'disableCustomFontSizes',
				'disableCustomGradients',
				'focusMode',
				'fontSizes',
				'hasFixedToolbar',
				'hasPermissionsToManageWidgets',
				'imageSizes',
				'imageDimensions',
				'isRTL',
				'maxWidth',
				'styles',
				'template',
				'templateLock',
				'titlePlaceholder',
				'onUpdateDefaultBlockStyles',
				'__experimentalEnableLegacyWidgetBlock',
				'__experimentalBlockDirectory',
				'__experimentalEnableFullSiteEditing',
				'__experimentalEnableFullSiteEditingDemo',
				'__mobileEnablePageTemplates',
				'__experimentalGlobalStylesUserEntityId',
				'__experimentalGlobalStylesBase',
				'showInserterHelpPanel',
				'gradients',
			] ),
			mediaUpload: hasUploadPermissions ? mediaUpload : undefined,
			__experimentalReusableBlocks: reusableBlocks,
			__experimentalFetchReusableBlocks,
			__experimentalFetchLinkSuggestions: fetchLinkSuggestions,
			__experimentalCanUserUseUnfilteredHTML: canUserUseUnfilteredHTML,
			__experimentalUndo: undo,
			__experimentalShouldInsertAtTheTop: shouldInsertAtTheTop,
		};
	}

	componentDidMount() {
		this.props.updateEditorSettings( this.props.settings );

		if ( ! this.props.settings.styles ) {
			return;
		}

		const updatedStyles = transformStyles(
			this.props.settings.styles,
			'.editor-styles-wrapper'
		);

		map( updatedStyles, ( updatedCSS ) => {
			if ( updatedCSS ) {
				const node = document.createElement( 'style' );
				node.innerHTML = updatedCSS;
				document.body.appendChild( node );
			}
		} );
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.settings !== prevProps.settings ) {
			this.props.updateEditorSettings( this.props.settings );
		}
	}

	componentWillUnmount() {
		this.props.tearDownEditor();
	}

	render() {
		const {
			canUserUseUnfilteredHTML,
			children,
			post,
			blocks,
			resetEditorBlocks,
			selectionStart,
			selectionEnd,
			isReady,
			settings,
			reusableBlocks,
			resetEditorBlocksWithoutUndoLevel,
			hasUploadPermissions,
			isPostTitleSelected,
			__experimentalFetchReusableBlocks,
			undo,
		} = this.props;

		if ( ! isReady ) {
			return null;
		}

		const editorSettings = this.getBlockEditorSettings(
			settings,
			reusableBlocks,
			__experimentalFetchReusableBlocks,
			hasUploadPermissions,
			canUserUseUnfilteredHTML,
			undo,
			isPostTitleSelected
		);

		return (
			<EntityProvider kind="root" type="site">
				<EntityProvider
					kind="postType"
					type={ post.type }
					id={ post.id }
				>
					<BlockEditorProvider
						value={ blocks }
						onInput={ resetEditorBlocksWithoutUndoLevel }
						onChange={ resetEditorBlocks }
						selectionStart={ selectionStart }
						selectionEnd={ selectionEnd }
						settings={ editorSettings }
						useSubRegistry={ false }
					>
						{ children }
						<ReusableBlocksButtons />
						<ConvertToGroupButtons />
					</BlockEditorProvider>
				</EntityProvider>
			</EntityProvider>
		);
	}
}

export default compose( [
	withRegistryProvider,
	withSelect( ( select ) => {
		const {
			canUserUseUnfilteredHTML,
			__unstableIsEditorReady: isEditorReady,
			getEditorBlocks,
			getEditorSelectionStart,
			getEditorSelectionEnd,
			__experimentalGetReusableBlocks,
			isPostTitleSelected,
		} = select( 'core/editor' );
		const { canUser } = select( 'core' );

		return {
			canUserUseUnfilteredHTML: canUserUseUnfilteredHTML(),
			isReady: isEditorReady(),
			blocks: getEditorBlocks(),
			selectionStart: getEditorSelectionStart(),
			selectionEnd: getEditorSelectionEnd(),
			reusableBlocks: __experimentalGetReusableBlocks(),
			hasUploadPermissions: defaultTo(
				canUser( 'create', 'media' ),
				true
			),
			// This selector is only defined on mobile.
			isPostTitleSelected: isPostTitleSelected && isPostTitleSelected(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			setupEditor,
			updatePostLock,
			resetEditorBlocks,
			updateEditorSettings,
			__experimentalFetchReusableBlocks,
			__experimentalTearDownEditor,
			undo,
		} = dispatch( 'core/editor' );
		const { createWarningNotice } = dispatch( 'core/notices' );

		return {
			setupEditor,
			updatePostLock,
			createWarningNotice,
			resetEditorBlocks,
			updateEditorSettings,
			resetEditorBlocksWithoutUndoLevel( blocks, options ) {
				resetEditorBlocks( blocks, {
					...options,
					__unstableShouldCreateUndoLevel: false,
				} );
			},
			tearDownEditor: __experimentalTearDownEditor,
			__experimentalFetchReusableBlocks,
			undo,
		};
	} ),
] )( EditorProvider );
