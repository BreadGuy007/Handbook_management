/**
 * WordPress dependencies
 */
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import { usePreferredColorSchemeStyle } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';

/**
 * External dependencies
 */
import { View } from 'react-native';

/**
 * Internal dependencies
 */
import styles from './styles.scss';

// We are replicating this here because the one in @wordpress/block-editor always
// tries to scale the preview and we would need a lot of cross platform code to handle
// sizes, when we actually want to show the preview at full width.
//
// We can make it work here first, then figure out the right way to consolidate
// both implementations
const BlockPreview = ( { blocks } ) => {
	const currentSettings = useSelect( ( select ) => {
		return select( 'core/block-editor' ).getSettings();
	} );
	const settings = {
		...currentSettings,
		readOnly: true,
	};

	const header = <View style={ styles.previewHeader } />;

	return (
		<BlockEditorProvider value={ blocks } settings={ settings }>
			<View style={ { flex: 1 } }>
				<BlockList header={ header } />
			</View>
		</BlockEditorProvider>
	);
};
BlockPreview.displayName = 'BlockPreview';

const Preview = ( props ) => {
	const { blocks } = props;
	const previewContentStyle = usePreferredColorSchemeStyle(
		styles.previewContent,
		styles.previewContentDark
	);

	if ( blocks === undefined ) {
		return null;
	}
	return (
		<View style={ previewContentStyle }>
			<BlockPreview blocks={ blocks } />
		</View>
	);
};

export default Preview;
