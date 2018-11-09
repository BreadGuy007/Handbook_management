/**
 * External dependencies
 */
import { find, omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	createBlock,
	getPhrasingContentSchema,
	getBlockAttributes,
} from '@wordpress/blocks';
import {
	BlockControls,
	RichText,
} from '@wordpress/editor';
import { replace, join, split, create, toHTMLString, LINE_SEPARATOR } from '@wordpress/rich-text';
import { G, Path, SVG } from '@wordpress/components';

const listContentSchema = {
	...getPhrasingContentSchema(),
	ul: {},
	ol: { attributes: [ 'type' ] },
};

// Recursion is needed.
// Possible: ul > li > ul.
// Impossible: ul > ul.
[ 'ul', 'ol' ].forEach( ( tag ) => {
	listContentSchema[ tag ].children = {
		li: {
			children: listContentSchema,
		},
	};
} );

const supports = {
	className: false,
};

const schema = {
	ordered: {
		type: 'boolean',
		default: false,
	},
	values: {
		type: 'string',
		source: 'html',
		selector: 'ol,ul',
		multiline: 'li',
		default: '',
	},
};

export const name = 'core/list';

export const settings = {
	title: __( 'List' ),
	description: __( 'Create a bulleted or numbered list.' ),
	icon: <SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><G><Path d="M9 19h12v-2H9v2zm0-6h12v-2H9v2zm0-8v2h12V5H9zm-4-.5c-.828 0-1.5.672-1.5 1.5S4.172 7.5 5 7.5 6.5 6.828 6.5 6 5.828 4.5 5 4.5zm0 6c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5zm0 6c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z" /></G></SVG>,
	category: 'common',
	keywords: [ __( 'bullet list' ), __( 'ordered list' ), __( 'numbered list' ) ],

	attributes: schema,

	supports,

	transforms: {
		from: [
			{
				type: 'block',
				isMultiBlock: true,
				blocks: [ 'core/paragraph' ],
				transform: ( blockAttributes ) => {
					return createBlock( 'core/list', {
						values: toHTMLString( {
							value: join( blockAttributes.map( ( { content } ) =>
								replace( create( { html: content } ), /\n/g, LINE_SEPARATOR )
							), LINE_SEPARATOR ),
							multilineTag: 'li',
						} ),
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/quote' ],
				transform: ( { value } ) => {
					return createBlock( 'core/list', {
						values: toHTMLString( {
							value: create( { html: value, multilineTag: 'p' } ),
							multilineTag: 'li',
						} ),
					} );
				},
			},
			{
				type: 'raw',
				selector: 'ol,ul',
				schema: {
					ol: listContentSchema.ol,
					ul: listContentSchema.ul,
				},
				transform( node ) {
					return createBlock( 'core/list', {
						...getBlockAttributes(
							'core/list',
							node.outerHTML
						),
						ordered: node.nodeName === 'OL',
					} );
				},
			},
			{
				type: 'pattern',
				regExp: /^[*-]\s/,
				transform: ( { content } ) => {
					return createBlock( 'core/list', {
						values: `<li>${ content }</li>`,
					} );
				},
			},
			{
				type: 'pattern',
				regExp: /^1[.)]\s/,
				transform: ( { content } ) => {
					return createBlock( 'core/list', {
						ordered: true,
						values: `<li>${ content }</li>`,
					} );
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( { values } ) =>
					split( create( {
						html: values,
						multilineTag: 'li',
						multilineWrapperTags: [ 'ul', 'ol' ],
					} ), LINE_SEPARATOR )
						.map( ( piece ) =>
							createBlock( 'core/paragraph', {
								content: toHTMLString( { value: piece } ),
							} )
						),
			},
			{
				type: 'block',
				blocks: [ 'core/quote' ],
				transform: ( { values } ) => {
					return createBlock( 'core/quote', {
						value: toHTMLString( {
							value: create( {
								html: values,
								multilineTag: 'li',
								multilineWrapperTags: [ 'ul', 'ol' ],
							} ),
							multilineTag: 'p',
						} ),
					} );
				},
			},
		],
	},

	deprecated: [
		{
			supports,
			attributes: {
				...omit( schema, [ 'ordered' ] ),
				nodeName: {
					type: 'string',
					source: 'property',
					selector: 'ol,ul',
					property: 'nodeName',
					default: 'UL',
				},
			},
			migrate( attributes ) {
				const { nodeName, ...migratedAttributes } = attributes;

				return {
					...migratedAttributes,
					ordered: 'OL' === nodeName,
				};
			},
			save( { attributes } ) {
				const { nodeName, values } = attributes;

				return (
					<RichText.Content
						tagName={ nodeName.toLowerCase() }
						value={ values }
					/>
				);
			},
		},
	],

	merge( attributes, attributesToMerge ) {
		const { values } = attributesToMerge;

		if ( ! values || values === '<li></li>' ) {
			return attributes;
		}

		return {
			...attributes,
			values: attributes.values + values,
		};
	},

	edit: class extends Component {
		constructor() {
			super( ...arguments );

			this.setupEditor = this.setupEditor.bind( this );
			this.getEditorSettings = this.getEditorSettings.bind( this );
			this.setNextValues = this.setNextValues.bind( this );

			this.state = {
				internalListType: null,
			};
		}

		findInternalListType( { parents } ) {
			const list = find( parents, ( node ) => node.nodeName === 'UL' || node.nodeName === 'OL' );
			return list ? list.nodeName : null;
		}

		setupEditor( editor ) {
			editor.on( 'nodeChange', ( nodeInfo ) => {
				this.setState( {
					internalListType: this.findInternalListType( nodeInfo ),
				} );
			} );

			// Check for languages that do not have square brackets on their keyboards.
			const lang = window.navigator.browserLanguage || window.navigator.language;
			const keyboardHasSquareBracket = ! /^(?:fr|nl|sv|ru|de|es|it)/.test( lang );

			if ( keyboardHasSquareBracket ) {
				// `[` is keycode 219; `]` is keycode 221.
				editor.shortcuts.add( 'meta+219', 'Decrease indent', 'Outdent' );
				editor.shortcuts.add( 'meta+221', 'Increase indent', 'Indent' );
			} else {
				editor.shortcuts.add( 'meta+shift+m', 'Decrease indent', 'Outdent' );
				editor.shortcuts.add( 'meta+m', 'Increase indent', 'Indent' );
			}

			this.editor = editor;
		}

		createSetListType( type, command ) {
			return () => {
				const { setAttributes } = this.props;
				const { internalListType } = this.state;
				if ( internalListType ) {
					// Only change list types, don't toggle off internal lists.
					if ( internalListType !== type && this.editor ) {
						this.editor.execCommand( command );
					}
				} else {
					setAttributes( { ordered: type === 'OL' } );
				}
			};
		}

		createExecCommand( command ) {
			return () => {
				if ( this.editor ) {
					this.editor.execCommand( command );
				}
			};
		}

		getEditorSettings( editorSettings ) {
			return {
				...editorSettings,
				plugins: ( editorSettings.plugins || [] ).concat( 'lists' ),
				lists_indent_on_tab: false,
			};
		}

		setNextValues( nextValues ) {
			this.props.setAttributes( { values: nextValues } );
		}

		render() {
			const {
				attributes,
				insertBlocksAfter,
				setAttributes,
				mergeBlocks,
				onReplace,
				className,
			} = this.props;
			const { ordered, values } = attributes;
			const tagName = ordered ? 'ol' : 'ul';

			return (
				<Fragment>
					<BlockControls
						controls={ [
							{
								icon: 'editor-ul',
								title: __( 'Convert to unordered list' ),
								isActive: ! ordered,
								onClick: this.createSetListType( 'UL', 'InsertUnorderedList' ),
							},
							{
								icon: 'editor-ol',
								title: __( 'Convert to ordered list' ),
								isActive: ordered,
								onClick: this.createSetListType( 'OL', 'InsertOrderedList' ),
							},
							{
								icon: 'editor-outdent',
								title: __( 'Outdent list item' ),
								onClick: this.createExecCommand( 'Outdent' ),
							},
							{
								icon: 'editor-indent',
								title: __( 'Indent list item' ),
								onClick: this.createExecCommand( 'Indent' ),
							},
						] }
					/>
					<RichText
						identifier="values"
						multiline="li"
						tagName={ tagName }
						unstableGetSettings={ this.getEditorSettings }
						unstableOnSetup={ this.setupEditor }
						onChange={ this.setNextValues }
						value={ values }
						wrapperClassName="block-library-list"
						className={ className }
						placeholder={ __( 'Write list…' ) }
						onMerge={ mergeBlocks }
						onSplit={
							insertBlocksAfter ?
								( before, after, ...blocks ) => {
									if ( ! blocks.length ) {
										blocks.push( createBlock( 'core/paragraph' ) );
									}

									if ( after !== '<li></li>' ) {
										blocks.push( createBlock( 'core/list', {
											ordered,
											values: after,
										} ) );
									}

									setAttributes( { values: before } );
									insertBlocksAfter( blocks );
								} :
								undefined
						}
						onRemove={ () => onReplace( [] ) }
					/>
				</Fragment>
			);
		}
	},

	save( { attributes } ) {
		const { ordered, values } = attributes;
		const tagName = ordered ? 'ol' : 'ul';

		return (
			<RichText.Content tagName={ tagName } value={ values } multiline="li" />
		);
	},
};
