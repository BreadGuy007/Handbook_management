/**
 * Internal dependencies
 */
import { NEW_TAB_REL } from './constants';

export function calculatePreferedImageSize( image, container ) {
	const maxWidth = container.clientWidth;
	const exceedMaxWidth = image.width > maxWidth;
	const ratio = image.height / image.width;
	const width = exceedMaxWidth ? maxWidth : image.width;
	const height = exceedMaxWidth ? maxWidth * ratio : image.height;
	return { width, height };
}

/**
 * Helper to get the link target settings to be stored.
 *
 * @param {boolean} value         The new link target value.
 * @param {Object} attributes     Block attributes.
 * @param {Object} attributes.rel Image block's rel attribute.
 *
 * @return {Object} Updated link target settings.
 */
export function getUpdatedLinkTargetSettings( value, { rel } ) {
	const linkTarget = value ? '_blank' : undefined;

	let updatedRel = rel;
	if ( linkTarget && ! rel ) {
		updatedRel = NEW_TAB_REL;
	} else if ( ! linkTarget && rel === NEW_TAB_REL ) {
		updatedRel = undefined;
	}

	return {
		linkTarget,
		rel: updatedRel,
	};
}
