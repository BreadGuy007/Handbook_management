/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	RichText,
	__experimentalUseBlockWrapperProps as useBlockWrapperProps,
} from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { align, content, level } = attributes;
	const TagName = 'h' + level;

	const className = classnames( {
		[ `has-text-align-${ align }` ]: align,
	} );

	return (
		<TagName { ...useBlockWrapperProps.save( { className } ) }>
			<RichText.Content value={ content } />
		</TagName>
	);
}
