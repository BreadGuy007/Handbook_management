/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { getPhrasingContentSchema } from '@wordpress/blocks';
import {
	RichText,
	InspectorControls,
} from '@wordpress/editor';

import {
	PanelBody,
	ToggleControl,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import './theme.scss';
import TableBlock from './table-block';

const tableContentSchema = {
	tr: {
		children: {
			th: {
				children: getPhrasingContentSchema(),
			},
			td: {
				children: getPhrasingContentSchema(),
			},
		},
	},
};

const tableSchema = {
	table: {
		children: {
			thead: {
				children: tableContentSchema,
			},
			tfoot: {
				children: tableContentSchema,
			},
			tbody: {
				children: tableContentSchema,
			},
		},
	},
};

export const name = 'core/table';

export const settings = {
	title: __( 'Table' ),
	description: __( 'Insert a table -- perfect for sharing charts and data.' ),
	icon: 'editor-table',
	category: 'formatting',

	attributes: {
		content: {
			type: 'array',
			source: 'children',
			selector: 'table',
			default: [
				<tbody key="1">
					<tr><td><br /></td><td><br /></td></tr>
					<tr><td><br /></td><td><br /></td></tr>
				</tbody>,
			],
		},
		hasFixedLayout: {
			type: 'boolean',
			default: false,
		},
	},

	supports: {
		align: true,
	},

	transforms: {
		from: [
			{
				type: 'raw',
				selector: 'table',
				schema: tableSchema,
			},
		],
	},

	edit( { attributes, setAttributes, isSelected, className } ) {
		const { content, hasFixedLayout } = attributes;
		const toggleFixedLayout = () => {
			setAttributes( { hasFixedLayout: ! hasFixedLayout } );
		};

		const classes = classnames(
			className,
			{
				'has-fixed-layout': hasFixedLayout,
			},
		);

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Table Settings' ) } className="blocks-table-settings">
						<ToggleControl
							label={ __( 'Fixed width table cells' ) }
							checked={ !! hasFixedLayout }
							onChange={ toggleFixedLayout }
						/>
					</PanelBody>
				</InspectorControls>
				<TableBlock
					onChange={ ( nextContent ) => {
						setAttributes( { content: nextContent } );
					} }
					content={ content }
					className={ classes }
					isSelected={ isSelected }
				/>
			</Fragment>
		);
	},

	save( { attributes } ) {
		const { content, hasFixedLayout } = attributes;
		const classes = classnames(
			{
				'has-fixed-layout': hasFixedLayout,
			},
		);

		return (
			<RichText.Content tagName="table" className={ classes } value={ content } />
		);
	},
};
