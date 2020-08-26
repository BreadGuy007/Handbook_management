/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useEntityProp } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';
import {
	RichText,
	AlignmentToolbar,
	BlockControls,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import LevelToolbar from './level-toolbar';

export default function SiteTitleEdit( { attributes, setAttributes } ) {
	const { level, textAlign } = attributes;
	const [ title, setTitle ] = useEntityProp( 'root', 'site', 'title' );
	const tagName = level === 0 ? 'p' : `h${ level }`;

	return (
		<>
			<BlockControls>
				<AlignmentToolbar
					value={ textAlign }
					onChange={ ( nextAlign ) => {
						setAttributes( { textAlign: nextAlign } );
					} }
				/>

				<LevelToolbar
					level={ level }
					onChange={ ( newLevel ) =>
						setAttributes( { level: newLevel } )
					}
				/>
			</BlockControls>

			<RichText
				tagName={ Block[ tagName ] }
				placeholder={ __( 'Site Title' ) }
				value={ title }
				onChange={ setTitle }
				className={ classnames( {
					[ `has-text-align-${ textAlign }` ]: textAlign,
				} ) }
				allowedFormats={ [] }
				disableLineBreaks
			/>
		</>
	);
}
