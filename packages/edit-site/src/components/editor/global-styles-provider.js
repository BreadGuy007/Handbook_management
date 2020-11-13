/**
 * External dependencies
 */
import { set, get, mapValues, mergeWith } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from '@wordpress/element';
import { useEntityProp } from '@wordpress/core-data';
import { __EXPERIMENTAL_STYLE_PROPERTY as STYLE_PROPERTY } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { default as getGlobalStyles } from './global-styles-renderer';

const EMPTY_CONTENT = '{}';

const GlobalStylesContext = createContext( {
	/* eslint-disable no-unused-vars */
	getSetting: ( context, path ) => {},
	setSetting: ( context, path, newValue ) => {},
	getStyleProperty: ( context, propertyName, origin ) => {},
	setStyleProperty: ( context, propertyName, newValue ) => {},
	contexts: {},
	/* eslint-enable no-unused-vars */
} );

const mergeTreesCustomizer = ( objValue, srcValue ) => {
	// We only pass as arrays the presets,
	// in which case we want the new array of values
	// to override the old array (no merging).
	if ( Array.isArray( srcValue ) ) {
		return srcValue;
	}
};

export const useGlobalStylesContext = () => useContext( GlobalStylesContext );

const useGlobalStylesEntityContent = () => {
	return useEntityProp( 'postType', 'wp_global_styles', 'content' );
};

export const useGlobalStylesReset = () => {
	const [ content, setContent ] = useGlobalStylesEntityContent();
	const canRestart = !! content && content !== EMPTY_CONTENT;
	return [
		canRestart,
		useCallback( () => setContent( EMPTY_CONTENT ), [ setContent ] ),
	];
};

export default function GlobalStylesProvider( {
	children,
	baseStyles,
	contexts,
} ) {
	const [ content, setContent ] = useGlobalStylesEntityContent();

	const { userStyles, mergedStyles } = useMemo( () => {
		const newUserStyles = content ? JSON.parse( content ) : {};
		const newMergedStyles = mergeWith(
			{},
			baseStyles,
			newUserStyles,
			mergeTreesCustomizer
		);

		return {
			userStyles: newUserStyles,
			mergedStyles: newMergedStyles,
		};
	}, [ content ] );

	const nextValue = useMemo(
		() => ( {
			contexts,
			getSetting: ( context, path ) =>
				get( userStyles?.[ context ]?.settings, path ),
			setSetting: ( context, path, newValue ) => {
				const newContent = { ...userStyles };
				let contextSettings = newContent?.[ context ]?.settings;
				if ( ! contextSettings ) {
					contextSettings = {};
					set( newContent, [ context, 'settings' ], contextSettings );
				}
				set( contextSettings, path, newValue );
				setContent( JSON.stringify( newContent ) );
			},
			getStyleProperty: ( context, propertyName, origin = 'merged' ) => {
				const styles = 'user' === origin ? userStyles : mergedStyles;

				return get(
					styles?.[ context ]?.styles,
					STYLE_PROPERTY[ propertyName ]
				);
			},
			setStyleProperty: ( context, propertyName, newValue ) => {
				const newContent = { ...userStyles };
				let contextStyles = newContent?.[ context ]?.styles;
				if ( ! contextStyles ) {
					contextStyles = {};
					set( newContent, [ context, 'styles' ], contextStyles );
				}
				set( contextStyles, STYLE_PROPERTY[ propertyName ], newValue );
				setContent( JSON.stringify( newContent ) );
			},
		} ),
		[ contexts, content ]
	);

	useEffect( () => {
		if (
			typeof contexts !== 'object' ||
			typeof baseStyles !== 'object' ||
			typeof userStyles !== 'object'
		) {
			return;
		}

		const embeddedStylesheetId = 'global-styles-inline-css';
		let styleNode = document.getElementById( embeddedStylesheetId );

		if ( ! styleNode ) {
			styleNode = document.createElement( 'style' );
			styleNode.id = embeddedStylesheetId;
			document
				.getElementsByTagName( 'head' )[ 0 ]
				.appendChild( styleNode );
		}

		styleNode.innerText = getGlobalStyles( contexts, mergedStyles );
	}, [ contexts, baseStyles, content ] );

	const settings = useSelect( ( select ) =>
		select( 'core/edit-site' ).getSettings()
	);
	const { updateSettings } = useDispatch( 'core/edit-site' );

	useEffect( () => {
		updateSettings( {
			...settings,
			__experimentalFeatures: mapValues(
				mergedStyles,
				( value ) => value?.settings || {}
			),
		} );
	}, [ mergedStyles ] );

	return (
		<GlobalStylesContext.Provider value={ nextValue }>
			{ children }
		</GlobalStylesContext.Provider>
	);
}
