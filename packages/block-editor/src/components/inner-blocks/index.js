/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useViewportMatch } from '@wordpress/compose';
import { forwardRef, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { getBlockType, withBlockContentContext } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import ButtonBlockAppender from './button-block-appender';
import DefaultBlockAppender from './default-block-appender';
import useNestedSettingsUpdate from './use-nested-settings-update';
import useInnerBlockTemplateSync from './use-inner-block-template-sync';
import getBlockContext from './get-block-context';

/**
 * Internal dependencies
 */
import BlockList from '../block-list';
import { BlockContextProvider } from '../block-context';
import { useBlockEditContext } from '../block-edit/context';
import useBlockSync from '../provider/use-block-sync';

/**
 * InnerBlocks is a component which allows a single block to have multiple blocks
 * as children. The UncontrolledInnerBlocks component is used whenever the inner
 * blocks are not controlled by another entity. In other words, it is normally
 * used for inner blocks in the post editor
 *
 * @param {Object} props The component props.
 */
function UncontrolledInnerBlocks( props ) {
	const {
		clientId,
		allowedBlocks,
		template,
		templateLock,
		forwardedRef,
		templateInsertUpdatesSelection,
		__experimentalCaptureToolbars: captureToolbars,
		orientation,
	} = props;

	const isSmallScreen = useViewportMatch( 'medium', '<' );

	const hasOverlay = useSelect(
		( select ) => {
			const {
				getBlockName,
				isBlockSelected,
				hasSelectedInnerBlock,
				isNavigationMode,
			} = select( 'core/block-editor' );
			const enableClickThrough = isNavigationMode() || isSmallScreen;
			return (
				getBlockName( clientId ) !== 'core/template' &&
				! isBlockSelected( clientId ) &&
				! hasSelectedInnerBlock( clientId, true ) &&
				enableClickThrough
			);
		},
		[ clientId, isSmallScreen ]
	);

	const context = useSelect(
		( select ) => {
			const block = select( 'core/block-editor' ).getBlock( clientId );
			const blockType = getBlockType( block.name );

			if ( ! blockType || ! blockType.providesContext ) {
				return;
			}

			return getBlockContext( block.attributes, blockType );
		},
		[ clientId ]
	);

	useNestedSettingsUpdate(
		clientId,
		allowedBlocks,
		templateLock,
		captureToolbars,
		orientation
	);

	useInnerBlockTemplateSync(
		clientId,
		template,
		templateLock,
		templateInsertUpdatesSelection
	);

	const classes = classnames( {
		'has-overlay': hasOverlay,
		'is-capturing-toolbar': captureToolbars,
	} );

	const blockList = (
		<BlockContextProvider value={ context }>
			<BlockList
				{ ...props }
				ref={ forwardedRef }
				rootClientId={ clientId }
				className={ classes }
			/>
		</BlockContextProvider>
	);

	if ( props.__experimentalTagName ) {
		return blockList;
	}

	return <div className="block-editor-inner-blocks">{ blockList }</div>;
}

/**
 * The controlled inner blocks component wraps the uncontrolled inner blocks
 * component with the blockSync hook. This keeps the innerBlocks of the block in
 * the block-editor store in sync with the blocks of the controlling entity. An
 * example of an inner block controller is a template part block, which provides
 * its own blocks from the template part entity data source.
 *
 * @param {Object} props The component props.
 */
function ControlledInnerBlocks( props ) {
	useBlockSync( props );
	return <UncontrolledInnerBlocks { ...props } />;
}

/**
 * Wrapped InnerBlocks component which detects whether to use the controlled or
 * uncontrolled variations of the InnerBlocks component. This is the component
 * which should be used throughout the application.
 */
const ForwardedInnerBlocks = forwardRef( ( props, ref ) => {
	const { clientId } = useBlockEditContext();
	const fallbackRef = useRef();

	const allProps = {
		clientId,
		forwardedRef: ref || fallbackRef,
		...props,
	};

	// Detects if the InnerBlocks should be controlled by an incoming value.
	if ( props.value && props.onChange ) {
		return <ControlledInnerBlocks { ...allProps } />;
	}
	return <UncontrolledInnerBlocks { ...allProps } />;
} );

// Expose default appender placeholders as components.
ForwardedInnerBlocks.DefaultBlockAppender = DefaultBlockAppender;
ForwardedInnerBlocks.ButtonBlockAppender = ButtonBlockAppender;

ForwardedInnerBlocks.Content = withBlockContentContext(
	( { BlockContent } ) => <BlockContent />
);

/**
 * @see https://github.com/WordPress/gutenberg/blob/master/packages/block-editor/src/components/inner-blocks/README.md
 */
export default ForwardedInnerBlocks;
