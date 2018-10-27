/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Path, Icon, SVG } from '@wordpress/components';

export default function BlockIcon( { icon, showColors = false, className } ) {
	if ( icon === 'block-default' ) {
		return <SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><Path d="M19 7h-1V5h-4v2h-4V5H6v2H5c-1.1 0-2 .9-2 2v10h18V9c0-1.1-.9-2-2-2zm0 10H5V9h14v8z" /></SVG>;
	}

	const renderedIcon = <Icon icon={ icon && icon.src ? icon.src : icon } />;
	const style = showColors ? {
		backgroundColor: icon && icon.background,
		color: icon && icon.foreground,
	} : {};

	return (
		<div
			style={ style }
			className={ classnames(
				'editor-block-icon',
				className,
				{ 'has-colors': showColors }
			) }
		>
			{ renderedIcon }
		</div>
	);
}
