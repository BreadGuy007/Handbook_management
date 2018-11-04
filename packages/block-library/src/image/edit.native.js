/**
 * External dependencies
 */
import { View, Image, TextInput } from 'react-native';

/**
 * Internal dependencies
 */
import { MediaPlaceholder } from '@wordpress/editor';

export default function ImageEdit( props ) {
	const { attributes, isSelected, setAttributes } = props;
	const { url, caption } = attributes;

	const onUploadPress = () => {
		// This method should present an image picker from
		// the device.
		//TODO: Implement upload image method.
	};

	const onMediaLibraryPress = () => {
		// This method should present an image picker from
		// the WordPress media library.
		//TODO: Implement media library method.
	};

	if ( ! url ) {
		return (
			<MediaPlaceholder
				onUploadPress={ onUploadPress }
				onMediaLibraryPress={ onMediaLibraryPress }
			/>
		);
	}

	return (
		<View style={ { flex: 1 } }>
			<Image
				style={ { width: '100%', height: 200 } }
				resizeMethod="scale"
				source={ { uri: url } }
			/>
			{ ( caption.length > 0 || isSelected ) && (
				<View style={ { padding: 12, flex: 1 } }>
					<TextInput
						style={ { textAlign: 'center' } }
						underlineColorAndroid="transparent"
						value={ caption }
						placeholder={ 'Write caption…' }
						onChangeText={ ( newCaption ) => setAttributes( { caption: newCaption } ) }
					/>
				</View>
			) }
		</View>
	);
}
