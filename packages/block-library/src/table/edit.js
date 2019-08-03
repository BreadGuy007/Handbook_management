/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import {
	InspectorControls,
	BlockControls,
	RichText,
	PanelColorSettings,
	createCustomColorsHOC,
	BlockIcon,
	AlignmentToolbar,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	ToggleControl,
	TextControl,
	Button,
	Toolbar,
	DropdownMenu,
	Placeholder,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	createTable,
	updateSelectedCell,
	getCellAttribute,
	insertRow,
	deleteRow,
	insertColumn,
	deleteColumn,
	toggleSection,
	isEmptyTableSection,
	isCellSelected,
} from './state';
import icon from './icon';

const BACKGROUND_COLORS = [
	{
		color: '#f3f4f5',
		name: 'Subtle light gray',
		slug: 'subtle-light-gray',
	},
	{
		color: '#e9fbe5',
		name: 'Subtle pale green',
		slug: 'subtle-pale-green',
	},
	{
		color: '#e7f5fe',
		name: 'Subtle pale blue',
		slug: 'subtle-pale-blue',
	},
	{
		color: '#fcf0ef',
		name: 'Subtle pale pink',
		slug: 'subtle-pale-pink',
	},
];

const ALIGNMENT_CONTROLS = [
	{
		icon: 'editor-alignleft',
		title: __( 'Align Column Left' ),
		align: 'left',
	},
	{
		icon: 'editor-aligncenter',
		title: __( 'Align Column Center' ),
		align: 'center',
	},
	{
		icon: 'editor-alignright',
		title: __( 'Align Column Right' ),
		align: 'right',
	},
];

const withCustomBackgroundColors = createCustomColorsHOC( BACKGROUND_COLORS );

export class TableEdit extends Component {
	constructor() {
		super( ...arguments );

		this.onCreateTable = this.onCreateTable.bind( this );
		this.onChangeFixedLayout = this.onChangeFixedLayout.bind( this );
		this.onChange = this.onChange.bind( this );
		this.onChangeInitialColumnCount = this.onChangeInitialColumnCount.bind( this );
		this.onChangeInitialRowCount = this.onChangeInitialRowCount.bind( this );
		this.renderSection = this.renderSection.bind( this );
		this.getTableControls = this.getTableControls.bind( this );
		this.onInsertRow = this.onInsertRow.bind( this );
		this.onInsertRowBefore = this.onInsertRowBefore.bind( this );
		this.onInsertRowAfter = this.onInsertRowAfter.bind( this );
		this.onDeleteRow = this.onDeleteRow.bind( this );
		this.onInsertColumn = this.onInsertColumn.bind( this );
		this.onInsertColumnBefore = this.onInsertColumnBefore.bind( this );
		this.onInsertColumnAfter = this.onInsertColumnAfter.bind( this );
		this.onDeleteColumn = this.onDeleteColumn.bind( this );
		this.onToggleHeaderSection = this.onToggleHeaderSection.bind( this );
		this.onToggleFooterSection = this.onToggleFooterSection.bind( this );
		this.onChangeColumnAlignment = this.onChangeColumnAlignment.bind( this );
		this.getCellAlignment = this.getCellAlignment.bind( this );

		this.state = {
			initialRowCount: 2,
			initialColumnCount: 2,
			selectedCell: null,
		};
	}

	/**
	 * Updates the initial column count used for table creation.
	 *
	 * @param {number} initialColumnCount New initial column count.
	 */
	onChangeInitialColumnCount( initialColumnCount ) {
		this.setState( { initialColumnCount } );
	}

	/**
	 * Updates the initial row count used for table creation.
	 *
	 * @param {number} initialRowCount New initial row count.
	 */
	onChangeInitialRowCount( initialRowCount ) {
		this.setState( { initialRowCount } );
	}

	/**
	 * Creates a table based on dimensions in local state.
	 *
	 * @param {Object} event Form submit event.
	 */
	onCreateTable( event ) {
		event.preventDefault();

		const { setAttributes } = this.props;
		let { initialRowCount, initialColumnCount } = this.state;

		initialRowCount = parseInt( initialRowCount, 10 ) || 2;
		initialColumnCount = parseInt( initialColumnCount, 10 ) || 2;

		setAttributes( createTable( {
			rowCount: initialRowCount,
			columnCount: initialColumnCount,
		} ) );
	}

	/**
	 * Toggles whether the table has a fixed layout or not.
	 */
	onChangeFixedLayout() {
		const { attributes, setAttributes } = this.props;
		const { hasFixedLayout } = attributes;

		setAttributes( { hasFixedLayout: ! hasFixedLayout } );
	}

	/**
	 * Changes the content of the currently selected cell.
	 *
	 * @param {Array} content A RichText content value.
	 */
	onChange( content ) {
		const { selectedCell } = this.state;

		if ( ! selectedCell ) {
			return;
		}

		const { attributes, setAttributes } = this.props;

		setAttributes( updateSelectedCell(
			attributes,
			selectedCell,
			( cellAttributes ) => ( { ...cellAttributes, content } ),
		) );
	}

	/**
	 * Align text within the a column.
	 *
	 * @param {string} align The new alignment to apply to the column.
	 */
	onChangeColumnAlignment( align ) {
		const { selectedCell } = this.state;

		if ( ! selectedCell ) {
			return;
		}

		// Convert the cell selection to a column selection so that alignment
		// is applied to the entire column.
		const columnSelection = {
			type: 'column',
			columnIndex: selectedCell.columnIndex,
		};

		const { attributes, setAttributes } = this.props;
		const newAttributes = updateSelectedCell(
			attributes,
			columnSelection,
			( cellAttributes ) => ( { ...cellAttributes, align } ),
		);
		setAttributes( newAttributes );
	}

	/**
	 * Get the alignment of the currently selected cell.
	 *
	 * @return {string} The new alignment to apply to the column.
	 */
	getCellAlignment() {
		const { selectedCell } = this.state;

		if ( ! selectedCell ) {
			return;
		}

		const { attributes } = this.props;

		return getCellAttribute( attributes, selectedCell, 'align' );
	}

	/**
	 * Add or remove a `head` table section.
	 */
	onToggleHeaderSection() {
		const { attributes, setAttributes } = this.props;
		setAttributes( toggleSection( attributes, 'head' ) );
	}

	/**
	 * Add or remove a `foot` table section.
	 */
	onToggleFooterSection() {
		const { attributes, setAttributes } = this.props;
		setAttributes( toggleSection( attributes, 'foot' ) );
	}

	/**
	 * Inserts a row at the currently selected row index, plus `delta`.
	 *
	 * @param {number} delta Offset for selected row index at which to insert.
	 */
	onInsertRow( delta ) {
		const { selectedCell } = this.state;

		if ( ! selectedCell ) {
			return;
		}

		const { attributes, setAttributes } = this.props;
		const { sectionName, rowIndex } = selectedCell;

		this.setState( { selectedCell: null } );
		setAttributes( insertRow( attributes, {
			sectionName,
			rowIndex: rowIndex + delta,
		} ) );
	}

	/**
	 * Inserts a row before the currently selected row.
	 */
	onInsertRowBefore() {
		this.onInsertRow( 0 );
	}

	/**
	 * Inserts a row after the currently selected row.
	 */
	onInsertRowAfter() {
		this.onInsertRow( 1 );
	}

	/**
	 * Deletes the currently selected row.
	 */
	onDeleteRow() {
		const { selectedCell } = this.state;

		if ( ! selectedCell ) {
			return;
		}

		const { attributes, setAttributes } = this.props;
		const { sectionName, rowIndex } = selectedCell;

		this.setState( { selectedCell: null } );
		setAttributes( deleteRow( attributes, { sectionName, rowIndex } ) );
	}

	/**
	 * Inserts a column at the currently selected column index, plus `delta`.
	 *
	 * @param {number} delta Offset for selected column index at which to insert.
	 */
	onInsertColumn( delta = 0 ) {
		const { selectedCell } = this.state;

		if ( ! selectedCell ) {
			return;
		}

		const { attributes, setAttributes } = this.props;
		const { columnIndex } = selectedCell;

		this.setState( { selectedCell: null } );
		setAttributes( insertColumn( attributes, {
			columnIndex: columnIndex + delta,
		} ) );
	}

	/**
	 * Inserts a column before the currently selected column.
	 */
	onInsertColumnBefore() {
		this.onInsertColumn( 0 );
	}

	/**
	 * Inserts a column after the currently selected column.
	 */
	onInsertColumnAfter() {
		this.onInsertColumn( 1 );
	}

	/**
	 * Deletes the currently selected column.
	 */
	onDeleteColumn() {
		const { selectedCell } = this.state;

		if ( ! selectedCell ) {
			return;
		}

		const { attributes, setAttributes } = this.props;
		const { sectionName, columnIndex } = selectedCell;

		this.setState( { selectedCell: null } );
		setAttributes( deleteColumn( attributes, { sectionName, columnIndex } ) );
	}

	/**
	 * Creates an onFocus handler for a specified cell.
	 *
	 * @param {Object} cellLocation Object with `section`, `rowIndex`, and
	 *                              `columnIndex` properties.
	 *
	 * @return {Function} Function to call on focus.
	 */
	createOnFocus( cellLocation ) {
		return () => {
			this.setState( {
				selectedCell: {
					...cellLocation,
					type: 'cell',
				},
			} );
		};
	}

	/**
	 * Gets the table controls to display in the block toolbar.
	 *
	 * @return {Array} Table controls.
	 */
	getTableControls() {
		const { selectedCell } = this.state;

		return [
			{
				icon: 'table-row-before',
				title: __( 'Add Row Before' ),
				isDisabled: ! selectedCell,
				onClick: this.onInsertRowBefore,
			},
			{
				icon: 'table-row-after',
				title: __( 'Add Row After' ),
				isDisabled: ! selectedCell,
				onClick: this.onInsertRowAfter,
			},
			{
				icon: 'table-row-delete',
				title: __( 'Delete Row' ),
				isDisabled: ! selectedCell,
				onClick: this.onDeleteRow,
			},
			{
				icon: 'table-col-before',
				title: __( 'Add Column Before' ),
				isDisabled: ! selectedCell,
				onClick: this.onInsertColumnBefore,
			},
			{
				icon: 'table-col-after',
				title: __( 'Add Column After' ),
				isDisabled: ! selectedCell,
				onClick: this.onInsertColumnAfter,
			},
			{
				icon: 'table-col-delete',
				title: __( 'Delete Column' ),
				isDisabled: ! selectedCell,
				onClick: this.onDeleteColumn,
			},
		];
	}

	/**
	 * Renders a table section.
	 *
	 * @param {Object} options
	 * @param {string} options.type Section type: head, body, or foot.
	 * @param {Array}  options.rows The rows to render.
	 *
	 * @return {Object} React element for the section.
	 */
	renderSection( { name, rows } ) {
		if ( isEmptyTableSection( rows ) ) {
			return null;
		}

		const Tag = `t${ name }`;
		const { selectedCell } = this.state;

		return (
			<Tag>
				{ rows.map( ( { cells }, rowIndex ) => (
					<tr key={ rowIndex }>
						{ cells.map( ( { content, tag: CellTag, scope, align }, columnIndex ) => {
							const cellLocation = {
								sectionName: name,
								rowIndex,
								columnIndex,
							};
							const isSelected = isCellSelected( cellLocation, selectedCell );

							const cellClasses = classnames(	{
								'is-selected': isSelected,
								[ `has-text-align-${ align }` ]: align,
							} );
							const richTextClassName = 'wp-block-table__cell-content';

							return (
								<CellTag
									key={ columnIndex }
									className={ cellClasses }
									scope={ CellTag === 'th' ? scope : undefined }
									onClick={ ( event ) => {
										// When a cell is selected, forward focus to the child RichText. This solves an issue where the
										// user may click inside a cell, but outside of the RichText, resulting in nothing happening.
										const richTextElement = event && event.target && event.target.querySelector( `.${ richTextClassName }` );
										if ( richTextElement ) {
											richTextElement.focus();
										}
									} }
								>
									<RichText
										className={ richTextClassName }
										value={ content }
										onChange={ this.onChange }
										unstableOnFocus={ this.createOnFocus( cellLocation ) }
									/>
								</CellTag>
							);
						} ) }
					</tr>
				) ) }
			</Tag>
		);
	}

	componentDidUpdate() {
		const { isSelected } = this.props;
		const { selectedCell } = this.state;

		if ( ! isSelected && selectedCell ) {
			this.setState( { selectedCell: null } );
		}
	}

	render() {
		const {
			attributes,
			className,
			backgroundColor,
			setBackgroundColor,
		} = this.props;
		const { initialRowCount, initialColumnCount } = this.state;
		const { hasFixedLayout, head, body, foot } = attributes;
		const isEmpty = isEmptyTableSection( head ) && isEmptyTableSection( body ) && isEmptyTableSection( foot );
		const Section = this.renderSection;

		if ( isEmpty ) {
			return (
				<Placeholder
					label={ __( 'Table' ) }
					icon={ <BlockIcon icon={ icon } showColors /> }
					instructions={ __( 'Insert a table for sharing data.' ) }
					isColumnLayout
				>
					<form className="wp-block-table__placeholder-form" onSubmit={ this.onCreateTable }>
						<TextControl
							type="number"
							label={ __( 'Column Count' ) }
							value={ initialColumnCount }
							onChange={ this.onChangeInitialColumnCount }
							min="1"
							className="wp-block-table__placeholder-input"
						/>
						<TextControl
							type="number"
							label={ __( 'Row Count' ) }
							value={ initialRowCount }
							onChange={ this.onChangeInitialRowCount }
							min="1"
							className="wp-block-table__placeholder-input"
						/>
						<Button className="wp-block-table__placeholder-button" isDefault type="submit">{ __( 'Create Table' ) }</Button>
					</form>
				</Placeholder>
			);
		}

		const tableClasses = classnames( backgroundColor.class, {
			'has-fixed-layout': hasFixedLayout,
			'has-background': !! backgroundColor.color,
		} );

		return (
			<>
				<BlockControls>
					<Toolbar>
						<DropdownMenu
							hasArrowIndicator
							icon="editor-table"
							label={ __( 'Edit table' ) }
							controls={ this.getTableControls() }
						/>
					</Toolbar>
					<AlignmentToolbar
						label={ __( 'Change column alignment' ) }
						alignmentControls={ ALIGNMENT_CONTROLS }
						value={ this.getCellAlignment() }
						onChange={ ( nextAlign ) => this.onChangeColumnAlignment( nextAlign ) }
						onHover={ this.onHoverAlignment }
					/>
				</BlockControls>
				<InspectorControls>
					<PanelBody title={ __( 'Table Settings' ) } className="blocks-table-settings">
						<ToggleControl
							label={ __( 'Fixed width table cells' ) }
							checked={ !! hasFixedLayout }
							onChange={ this.onChangeFixedLayout }
						/>
						<ToggleControl
							label={ __( 'Header section' ) }
							checked={ !! ( head && head.length ) }
							onChange={ this.onToggleHeaderSection }
						/>
						<ToggleControl
							label={ __( 'Footer section' ) }
							checked={ !! ( foot && foot.length ) }
							onChange={ this.onToggleFooterSection }
						/>
					</PanelBody>
					<PanelColorSettings
						title={ __( 'Color Settings' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: backgroundColor.color,
								onChange: setBackgroundColor,
								label: __( 'Background Color' ),
								disableCustomColors: true,
								colors: BACKGROUND_COLORS,
							},
						] }
					/>
				</InspectorControls>
				<figure className={ className }>
					<table className={ tableClasses }>
						<Section name="head" rows={ head } />
						<Section name="body" rows={ body } />
						<Section name="foot" rows={ foot } />
					</table>
				</figure>
			</>
		);
	}
}

export default withCustomBackgroundColors( 'backgroundColor' )( TableEdit );
