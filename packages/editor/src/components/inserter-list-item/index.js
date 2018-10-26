/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { normalizeIconObject } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import BlockIcon from '../block-icon';

function InserterListItem( {
	icon,
	hasChildBlocksWithInserterSupport,
	onClick,
	isDisabled,
	title,
	className,
	...props
} ) {
	icon = normalizeIconObject( icon );

	const itemIconStyle = icon ? {
		backgroundColor: icon.background,
		color: icon.foreground,
	} : {};
	const itemIconStackStyle = icon && icon.shadowColor ? {
		backgroundColor: icon.shadowColor,
	} : {};

	return (
		<li className="editor-block-types-list__list-item">
			<button
				className={
					classnames(
						'editor-block-types-list__item',
						className,
						{
							'editor-block-types-list__item-has-children':
								hasChildBlocksWithInserterSupport,
						}
					)
				}
				onClick={ ( event ) => {
					event.preventDefault();
					onClick();
				} }
				disabled={ isDisabled }
				aria-label={ title } // Fix for IE11 and JAWS 2018.
				{ ...props }
			>
				<span
					className="editor-block-types-list__item-icon"
					style={ itemIconStyle }
				>
					<BlockIcon icon={ icon && icon.src } showColors />
					{ hasChildBlocksWithInserterSupport &&
						<span
							className="editor-block-types-list__item-icon-stack"
							style={ itemIconStackStyle }
						/>
					}
				</span>
				<span className="editor-block-types-list__item-title">
					{ title }
				</span>
			</button>
		</li>
	);
}

export default InserterListItem;
