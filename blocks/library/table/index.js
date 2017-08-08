/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';
import './block.scss';
import { registerBlockType, query as hpq } from '../../api';
import TableBlock from './table-block';
import BlockControls from '../../block-controls';
import BlockAlignmentToolbar from '../../block-alignment-toolbar';

const { children } = hpq;

registerBlockType( 'core/table', {
	title: __( 'Table' ),
	icon: 'editor-table',
	category: 'formatting',

	attributes: {
		content: children( 'table' ),
	},

	defaultAttributes: {
		content: [
			<tbody key="1">
				<tr><td><br /></td><td><br /></td></tr>
				<tr><td><br /></td><td><br /></td></tr>
			</tbody>,
		],
	},

	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( 'left' === align || 'right' === align || 'wide' === align || 'full' === align ) {
			return { 'data-align': align };
		}
	},

	edit( { attributes, setAttributes, focus, setFocus, className } ) {
		const { content } = attributes;
		const updateAlignment = ( nextAlign ) => setAttributes( { align: nextAlign } );
		return [
			focus && (
				<BlockControls key="toolbar">
					<BlockAlignmentToolbar
						value={ attributes.align }
						onChange={ updateAlignment }
					/>
				</BlockControls>
			),
			<TableBlock
				key="editor"
				onChange={ ( nextContent ) => {
					setAttributes( { content: nextContent } );
				} }
				content={ content }
				focus={ focus }
				onFocus={ setFocus }
				className={ className }
			/>,
		];
	},

	save( { attributes } ) {
		const { content, align } = attributes;
		return (
			<table className={ align && `align${ align }` }>
				{ content }
			</table>
		);
	},
} );
