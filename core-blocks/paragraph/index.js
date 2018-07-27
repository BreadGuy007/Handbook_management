/**
 * External dependencies
 */
import classnames from 'classnames';
import { isFinite, omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Component,
	Fragment,
	RawHTML,
} from '@wordpress/element';
import {
	PanelBody,
	ToggleControl,
	withFallbackStyles,
} from '@wordpress/components';
import {
	getColorClass,
	getFontSizeClass,
	withColors,
	AlignmentToolbar,
	BlockControls,
	ContrastChecker,
	FontSizePicker,
	InspectorControls,
	PanelColorSettings,
	RichText,
	withFontSizes,
} from '@wordpress/editor';
import {
	createBlock,
	getPhrasingContentSchema,
	children,
} from '@wordpress/blocks';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import './style.scss';

const { getComputedStyle } = window;

const FallbackStyles = withFallbackStyles( ( node, ownProps ) => {
	const { textColor, backgroundColor, fontSize, customFontSize } = ownProps.attributes;
	const editableNode = node.querySelector( '[contenteditable="true"]' );
	//verify if editableNode is available, before using getComputedStyle.
	const computedStyles = editableNode ? getComputedStyle( editableNode ) : null;
	return {
		fallbackBackgroundColor: backgroundColor || ! computedStyles ? undefined : computedStyles.backgroundColor,
		fallbackTextColor: textColor || ! computedStyles ? undefined : computedStyles.color,
		fallbackFontSize: fontSize || customFontSize || ! computedStyles ? undefined : parseInt( computedStyles.fontSize ) || undefined,
	};
} );

class ParagraphBlock extends Component {
	constructor() {
		super( ...arguments );

		this.onReplace = this.onReplace.bind( this );
		this.toggleDropCap = this.toggleDropCap.bind( this );
		this.splitBlock = this.splitBlock.bind( this );
	}

	onReplace( blocks ) {
		const { attributes, onReplace } = this.props;
		onReplace( blocks.map( ( block, index ) => (
			index === 0 && block.name === name ?
				{ ...block,
					attributes: {
						...attributes,
						...block.attributes,
					},
				} :
				block
		) ) );
	}

	toggleDropCap() {
		const { attributes, setAttributes } = this.props;
		setAttributes( { dropCap: ! attributes.dropCap } );
	}

	getDropCapHelp( checked ) {
		return checked ? __( 'Showing large initial letter.' ) : __( 'Toggle to show a large initial letter.' );
	}

	/**
	 * Split handler for RichText value, namely when content is pasted or the
	 * user presses the Enter key.
	 *
	 * @param {?Array}     before Optional before value, to be used as content
	 *                            in place of what exists currently for the
	 *                            block. If undefined, the block is deleted.
	 * @param {?Array}     after  Optional after value, to be appended in a new
	 *                            paragraph block to the set of blocks passed
	 *                            as spread.
	 * @param {...WPBlock} blocks Optional blocks inserted between the before
	 *                            and after value blocks.
	 */
	splitBlock( before, after, ...blocks ) {
		const {
			attributes,
			insertBlocksAfter,
			setAttributes,
			onReplace,
		} = this.props;

		if ( after ) {
			// Append "After" content as a new paragraph block to the end of
			// any other blocks being inserted after the current paragraph.
			blocks.push( createBlock( name, { content: after } ) );
		}

		if ( blocks.length && insertBlocksAfter ) {
			insertBlocksAfter( blocks );
		}

		const { content } = attributes;
		if ( ! before ) {
			// If before content is omitted, treat as intent to delete block.
			onReplace( [] );
		} else if ( content !== before ) {
			// Only update content if it has in-fact changed. In case that user
			// has created a new paragraph at end of an existing one, the value
			// of before will be strictly equal to the current content.
			setAttributes( { content: before } );
		}
	}

	render() {
		const {
			attributes,
			setAttributes,
			mergeBlocks,
			onReplace,
			className,
			backgroundColor,
			textColor,
			setBackgroundColor,
			setTextColor,
			fallbackBackgroundColor,
			fallbackTextColor,
			fallbackFontSize,
			fontSize,
			setFontSize,
		} = this.props;

		const {
			align,
			content,
			dropCap,
			placeholder,
		} = attributes;

		return (
			<Fragment>
				<BlockControls>
					<AlignmentToolbar
						value={ align }
						onChange={ ( nextAlign ) => {
							setAttributes( { align: nextAlign } );
						} }
					/>
				</BlockControls>
				<InspectorControls>
					<PanelBody title={ __( 'Text Settings' ) } className="blocks-font-size">
						<FontSizePicker
							fallbackFontSize={ fallbackFontSize }
							value={ fontSize.size }
							onChange={ setFontSize }
						/>
						<ToggleControl
							label={ __( 'Drop Cap' ) }
							checked={ !! dropCap }
							onChange={ this.toggleDropCap }
							help={ this.getDropCapHelp }
						/>
					</PanelBody>
					<PanelColorSettings
						title={ __( 'Color Settings' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: backgroundColor.value,
								onChange: setBackgroundColor,
								label: __( 'Background Color' ),
							},
							{
								value: textColor.value,
								onChange: setTextColor,
								label: __( 'Text Color' ),
							},
						] }
					>
						<ContrastChecker
							{ ...{
								textColor: textColor.value,
								backgroundColor: backgroundColor.value,
								fallbackTextColor,
								fallbackBackgroundColor,
							} }
							fontSize={ fontSize.size }
						/>
					</PanelColorSettings>
				</InspectorControls>
				<RichText
					tagName="p"
					className={ classnames( 'wp-block-paragraph', className, {
						'has-background': backgroundColor.value,
						'has-drop-cap': dropCap,
						[ backgroundColor.class ]: backgroundColor.class,
						[ textColor.class ]: textColor.class,
						[ fontSize.class ]: fontSize.class,
					} ) }
					style={ {
						backgroundColor: backgroundColor.value,
						color: textColor.value,
						fontSize: fontSize.size ? fontSize.size + 'px' : undefined,
						textAlign: align,
					} }
					value={ content }
					onChange={ ( nextContent ) => {
						setAttributes( {
							content: nextContent,
						} );
					} }
					onSplit={ this.splitBlock }
					onMerge={ mergeBlocks }
					onReplace={ this.onReplace }
					onRemove={ () => onReplace( [] ) }
					placeholder={ placeholder || __( 'Add text or type / to add content' ) }
				/>
			</Fragment>
		);
	}
}

const supports = {
	className: false,
};

const schema = {
	content: {
		type: 'array',
		source: 'children',
		selector: 'p',
		default: [],
	},
	align: {
		type: 'string',
	},
	dropCap: {
		type: 'boolean',
		default: false,
	},
	placeholder: {
		type: 'string',
	},
	textColor: {
		type: 'string',
	},
	customTextColor: {
		type: 'string',
	},
	backgroundColor: {
		type: 'string',
	},
	customBackgroundColor: {
		type: 'string',
	},
	fontSize: {
		type: 'string',
	},
	customFontSize: {
		type: 'number',
	},
};

export const name = 'core/paragraph';

export const settings = {
	title: __( 'Paragraph' ),

	description: __( 'Add some basic text.' ),

	icon: 'editor-paragraph',

	category: 'common',

	keywords: [ __( 'text' ) ],

	supports,

	attributes: schema,

	transforms: {
		from: [
			{
				type: 'raw',
				// Paragraph is a fallback and should be matched last.
				priority: 20,
				selector: 'p',
				schema: {
					p: {
						children: getPhrasingContentSchema(),
					},
				},
			},
		],
	},

	deprecated: [
		{
			supports,
			attributes: {
				...schema,
				width: {
					type: 'string',
				},
			},
			save( { attributes } ) {
				const {
					width,
					align,
					content,
					dropCap,
					backgroundColor,
					textColor,
					customBackgroundColor,
					customTextColor,
					fontSize,
					customFontSize,
				} = attributes;

				const textClass = getColorClass( 'color', textColor );
				const backgroundClass = getColorClass( 'background-color', backgroundColor );
				const fontSizeClass = fontSize && `is-${ fontSize }-text`;

				const className = classnames( {
					[ `align${ width }` ]: width,
					'has-background': backgroundColor || customBackgroundColor,
					'has-drop-cap': dropCap,
					[ fontSizeClass ]: fontSizeClass,
					[ textClass ]: textClass,
					[ backgroundClass ]: backgroundClass,
				} );

				const styles = {
					backgroundColor: backgroundClass ? undefined : customBackgroundColor,
					color: textClass ? undefined : customTextColor,
					fontSize: fontSizeClass ? undefined : customFontSize,
					textAlign: align,
				};

				return (
					<RichText.Content
						tagName="p"
						style={ styles }
						className={ className ? className : undefined }
						value={ content }
					/>
				);
			},
		},
		{
			supports,
			attributes: omit( {
				...schema,
				fontSize: {
					type: 'number',
				},
			}, 'customFontSize', 'customTextColor', 'customBackgroundColor' ),
			save( { attributes } ) {
				const { width, align, content, dropCap, backgroundColor, textColor, fontSize } = attributes;
				const className = classnames( {
					[ `align${ width }` ]: width,
					'has-background': backgroundColor,
					'has-drop-cap': dropCap,
				} );
				const styles = {
					backgroundColor: backgroundColor,
					color: textColor,
					fontSize: fontSize,
					textAlign: align,
				};

				return <p style={ styles } className={ className ? className : undefined }>{ content }</p>;
			},
			migrate( attributes ) {
				return omit( {
					...attributes,
					customFontSize: isFinite( attributes.fontSize ) ? attributes.fontSize : undefined,
					customTextColor: attributes.textColor && '#' === attributes.textColor[ 0 ] ? attributes.textColor : undefined,
					customBackgroundColor: attributes.backgroundColor && '#' === attributes.backgroundColor[ 0 ] ? attributes.backgroundColor : undefined,
				}, [ 'fontSize', 'textColor', 'backgroundColor' ] );
			},
		},
		{
			supports,
			attributes: {
				...schema,
				content: {
					type: 'string',
					source: 'html',
				},
			},
			save( { attributes } ) {
				return <RawHTML>{ attributes.content }</RawHTML>;
			},
			migrate( attributes ) {
				return {
					...attributes,
					content: [
						<RawHTML key="html">{ attributes.content }</RawHTML>,
					],
				};
			},
		},
	],

	merge( attributes, attributesToMerge ) {
		return {
			content: children.concat(
				attributes.content,
				attributesToMerge.content
			),
		};
	},

	getEditWrapperProps( attributes ) {
		const { width } = attributes;
		if ( [ 'wide', 'full', 'left', 'right' ].indexOf( width ) !== -1 ) {
			return { 'data-align': width };
		}
	},

	edit: compose( [
		withColors( 'backgroundColor', { textColor: 'color' } ),
		withFontSizes( 'fontSize' ),
		FallbackStyles,
	] )( ParagraphBlock ),

	save( { attributes } ) {
		const {
			align,
			content,
			dropCap,
			backgroundColor,
			textColor,
			customBackgroundColor,
			customTextColor,
			fontSize,
			customFontSize,
		} = attributes;

		const textClass = getColorClass( 'color', textColor );
		const backgroundClass = getColorClass( 'background-color', backgroundColor );
		const fontSizeClass = getFontSizeClass( fontSize );

		const className = classnames( {
			'has-background': backgroundColor || customBackgroundColor,
			'has-drop-cap': dropCap,
			[ fontSizeClass ]: fontSizeClass,
			[ textClass ]: textClass,
			[ backgroundClass ]: backgroundClass,
		} );

		const styles = {
			backgroundColor: backgroundClass ? undefined : customBackgroundColor,
			color: textClass ? undefined : customTextColor,
			fontSize: fontSizeClass ? undefined : customFontSize,
			textAlign: align,
		};

		return (
			<RichText.Content
				tagName="p"
				style={ styles }
				className={ className ? className : undefined }
				value={ content }
			/>
		);
	},
};
