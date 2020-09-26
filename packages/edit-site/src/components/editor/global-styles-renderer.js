/**
 * External dependencies
 */
import { get, kebabCase, reduce } from 'lodash';

/**
 * WordPress dependencies
 */
import { __EXPERIMENTAL_STYLE_PROPERTY as STYLE_PROPERTY } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { PRESET_CATEGORIES, LINK_COLOR_DECLARATION } from './utils';

const mergeTrees = ( baseData, userData ) => {
	// Deep clone from base data.
	//
	// We don't use cloneDeep from lodash here
	// because we know the data is JSON compatible,
	// see https://github.com/lodash/lodash/issues/1984
	const mergedTree = JSON.parse( JSON.stringify( baseData ) );

	const styleKeys = [ 'typography', 'color' ];
	Object.keys( userData ).forEach( ( context ) => {
		styleKeys.forEach( ( key ) => {
			// Normalize object shape: make sure the key exists under styles.
			if ( ! mergedTree[ context ].styles?.[ key ] ) {
				mergedTree[ context ].styles[ key ] = {};
			}

			// Merge data: base + user.
			mergedTree[ context ].styles[ key ] = {
				...mergedTree[ context ].styles[ key ],
				...userData[ context ]?.styles?.[ key ],
			};
		} );
	} );

	return mergedTree;
};

export default ( blockData, baseTree, userTree ) => {
	const styles = [];
	// Can this be converted to a context, as the global context?
	// See comment in the server.
	styles.push( LINK_COLOR_DECLARATION );
	const tree = mergeTrees( baseTree, userTree );

	/**
	 * Transform given style tree into a set of style declarations.
	 *
	 * @param {Object} blockSupports What styles the block supports.
	 * @param {Object} blockStyles Block styles.
	 *
	 * @return {Array} An array of style declarations.
	 */
	const getBlockStylesDeclarations = ( blockSupports, blockStyles ) => {
		const declarations = [];
		Object.keys( STYLE_PROPERTY ).forEach( ( key ) => {
			const cssProperty = key.startsWith( '--' ) ? key : kebabCase( key );
			if (
				blockSupports.includes( key ) &&
				get( blockStyles, STYLE_PROPERTY[ key ], false )
			) {
				declarations.push(
					`${ cssProperty }: ${ get(
						blockStyles,
						STYLE_PROPERTY[ key ]
					) }`
				);
			}
		} );

		return declarations;
	};

	/**
	 * Transform given preset tree into a set of style declarations.
	 *
	 * @param {Object} blockPresets
	 *
	 * @return {Array} An array of style declarations.
	 */
	const getBlockPresetsDeclarations = ( blockPresets ) => {
		return reduce(
			PRESET_CATEGORIES,
			( declarations, { path, key }, category ) => {
				const preset = get( blockPresets, path, [] );
				preset.forEach( ( value ) => {
					declarations.push(
						`--wp--preset--${ kebabCase( category ) }--${
							value.slug
						}: ${ value[ key ] }`
					);
				} );
				return declarations;
			},
			[]
		);
	};

	const flattenTree = ( input, prefix, token ) => {
		let result = [];
		Object.keys( input ).forEach( ( key ) => {
			const newKey = prefix + kebabCase( key.replace( '/', '-' ) );
			const newLeaf = input[ key ];

			if ( newLeaf instanceof Object ) {
				const newPrefix = newKey + token;
				result = [
					...result,
					...flattenTree( newLeaf, newPrefix, token ),
				];
			} else {
				result.push( `${ newKey }: ${ newLeaf }` );
			}
		} );
		return result;
	};

	const getCustomDeclarations = ( blockCustom ) => {
		if ( Object.keys( blockCustom ).length === 0 ) {
			return [];
		}

		return flattenTree( blockCustom, '--wp--custom--', '--' );
	};

	const getBlockSelector = ( selector ) => {
		// Can we hook into the styles generation mechanism
		// so we can avoid having to increase the class specificity here
		// and remap :root?
		if ( ':root' === selector ) {
			selector = '';
		}
		return `.editor-styles-wrapper.editor-styles-wrapper ${ selector }`;
	};

	Object.keys( blockData ).forEach( ( context ) => {
		const blockSelector = getBlockSelector( blockData[ context ].selector );
		const blockDeclarations = [
			...getBlockStylesDeclarations(
				blockData[ context ].supports,
				tree[ context ].styles
			),
			...getBlockPresetsDeclarations( tree[ context ].settings ),
			...getCustomDeclarations( tree[ context ].settings.custom ),
		];
		if ( blockDeclarations.length > 0 ) {
			styles.push(
				`${ blockSelector } { ${ blockDeclarations.join( ';' ) } }`
			);
		}
	} );

	return styles.join( '' );
};
