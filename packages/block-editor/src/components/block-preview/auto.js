/**
 * WordPress dependencies
 */
import { Disabled } from '@wordpress/components';
import { useResizeObserver, pure } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import BlockList from '../block-list';

// This is used to avoid rendering the block list if the sizes change.
const MemoizedBlockList = pure( BlockList );

function AutoBlockPreview( { viewportWidth, __experimentalPadding } ) {
	const [
		containerResizeListener,
		{ width: containerWidth },
	] = useResizeObserver();
	const [
		containtResizeListener,
		{ height: contentHeight },
	] = useResizeObserver();

	const scale =
		( containerWidth - 2 * __experimentalPadding ) / viewportWidth;

	return (
		<div
			className="block-editor-block-preview__container editor-styles-wrapper"
			aria-hidden
			style={ {
				height: contentHeight * scale + 2 * __experimentalPadding,
				padding: __experimentalPadding,
			} }
		>
			{ containerResizeListener }
			<Disabled
				style={ {
					transform: `scale(${ scale })`,
					width: viewportWidth,
					left: __experimentalPadding,
					right: __experimentalPadding,
					top: __experimentalPadding,
				} }
				className="block-editor-block-preview__content"
			>
				{ containtResizeListener }
				<MemoizedBlockList />
			</Disabled>
		</div>
	);
}

export default AutoBlockPreview;
