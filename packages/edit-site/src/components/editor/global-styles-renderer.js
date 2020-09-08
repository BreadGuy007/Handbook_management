/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	STYLE_PROPS,
	PRESET_CATEGORIES,
	LINK_COLOR_DECLARATION,
} from './utils';

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
		Object.keys( STYLE_PROPS ).forEach( ( key ) => {
			if (
				blockSupports.includes( key ) &&
				get( blockStyles, STYLE_PROPS[ key ], false )
			) {
				declarations.push(
					`${ key }: ${ get( blockStyles, STYLE_PROPS[ key ] ) }`
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
		const declarations = [];
		PRESET_CATEGORIES.forEach( ( category ) => {
			if ( blockPresets?.[ category ] ) {
				blockPresets[ category ].forEach( ( { slug, value } ) =>
					declarations.push(
						`--wp--preset--${ category }--${ slug }: ${ value }`
					)
				);
			}
		} );
		return declarations;
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
			...getBlockPresetsDeclarations( tree[ context ].presets ),
		];
		if ( blockDeclarations.length > 0 ) {
			styles.push(
				`${ blockSelector } { ${ blockDeclarations.join( ';' ) } }`
			);
		}
	} );

	return styles.join( '' );
};
