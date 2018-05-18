Gutenberg's deprecation policy is intended to support backwards-compatibility for two minor releases, when possible. The current deprecations are listed below and are grouped by _the version at which they will be removed completely_. If your plugin depends on these behaviors, you must update to the recommended alternative before the noted version.

## 3.1.0

 - All components in `wp.blocks.*` are removed. Please use `wp.editor.*` instead.
 - `wp.blocks.withEditorSettings` is removed. Please use the data module to access the editor settings `wp.data.select( "core/editor" ).getEditorSettings()`.
 - All DOM utils in `wp.utils.*` are removed. Please use `wp.dom.*` instead.
 - `isPrivate: true` has been removed from the Block API. Please use `supports.inserter: false` instead.
 - `wp.utils.isExtraSmall` function removed. Please use `wp.viewport.*` instead.

## 3.0.0

- `wp.blocks.registerCoreBlocks` function removed. Please use `wp.coreBlocks.registerCoreBlocks` instead.
- Raw TinyMCE event handlers for `RichText` have been deprecated. Please use [documented props](https://wordpress.org/gutenberg/handbook/block-api/rich-text-api/), ancestor event handler, or onSetup access to the internal editor instance event hub instead.

## 2.8.0

- `Original autocompleter interface in wp.components.Autocomplete` updated. Please use `latest autocompleter interface` instead. See: https://github.com/WordPress/gutenberg/blob/master/components/autocomplete/README.md.
- `getInserterItems`: the `allowedBlockTypes` argument is now mandatory.
- `getFrecentInserterItems`: the `allowedBlockTypes` argument is now mandatory.

## 2.7.0

- `wp.element.getWrapperDisplayName` function removed. Please use `wp.element.createHigherOrderComponent` instead.

## 2.6.0

 - `wp.blocks.getBlockDefaultClassname` function removed. Please use `wp.blocks.getBlockDefaultClassName` instead.
 - `wp.blocks.Editable` component removed. Please use the `wp.blocks.RichText` component instead.

## 2.5.0

 - Returning raw HTML from block `save` is unsupported. Please use the `wp.element.RawHTML` component instead.
 - `wp.data.query` higher-order component removed. Please use `wp.data.withSelect` instead.

## 2.4.0

 - `wp.blocks.BlockDescription` component removed. Please use the `description` block property instead.
 - `wp.blocks.InspectorControls.*` components removed. Please use `wp.components.*` components instead.
 - `wp.blocks.source.*` matchers removed. Please use the declarative attributes instead. See: https://wordpress.org/gutenberg/handbook/block-api/attributes/.
 - `wp.data.select( 'selector', ...args )` removed. Please use `wp.data.select( reducerKey' ).*` instead.
 - `wp.blocks.MediaUploadButton` component removed. Please use `wp.blocks.MediaUpload` component instead.
