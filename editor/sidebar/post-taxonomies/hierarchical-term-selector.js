/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { unescape as unescapeString, without, groupBy, map, repeat, find } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from 'i18n';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { getEditedPostAttribute } from '../../selectors';
import { editPost } from '../../actions';

const DEFAULT_QUERY = {
	per_page: 100,
	orderby: 'count',
	order: 'desc',
};

class HierarchicalTermSelector extends Component {
	constructor() {
		super( ...arguments );
		this.onChange = this.onChange.bind( this );
		this.onChangeFormName = this.onChangeFormName.bind( this );
		this.onChangeFormParent = this.onChangeFormParent.bind( this );
		this.onAddTerm = this.onAddTerm.bind( this );
		this.onToggleForm = this.onToggleForm.bind( this );
		this.state = {
			loading: true,
			availableTermsTree: [],
			availableTerms: [],
			adding: false,
			formName: '',
			formParent: '',
			showForm: false,
		};
	}

	buildTermsTree( flatTerms ) {
		const termsByParent = groupBy( flatTerms, 'parent' );
		const fillWithChildren = ( terms ) => {
			return terms.map( ( term ) => {
				const children = termsByParent[ term.id ];
				return {
					...term,
					children: children && children.length
						? fillWithChildren( children )
						: [],
				};
			} );
		};

		return fillWithChildren( termsByParent[ 0 ] || [] );
	}

	onChange( event ) {
		const { onUpdateTerms, terms = [], restBase } = this.props;
		const termId = parseInt( event.target.value, 10 );
		const hasTerm = terms.indexOf( termId ) !== -1;
		const newTerms = hasTerm
			? without( terms, termId )
			: [ ...terms, termId ];
		onUpdateTerms( newTerms, restBase );
	}

	onChangeFormName( event ) {
		this.setState( { formName: event.target.value } );
	}

	onChangeFormParent( event ) {
		this.setState( { formParent: event.target.value } );
	}

	onToggleForm() {
		this.setState( ( state ) => ( {
			showForm: ! state.showForm,
		} ) );
	}

	onAddTerm( event ) {
		event.preventDefault();
		const { formName, formParent } = this.state;
		const findOrCreatePromise = new Promise( ( resolve, reject ) => {
			this.setState( {
				adding: true,
			} );
			// Tries to create a term or fetch it if it already exists
			const Model = wp.api.getTaxonomyModel( this.props.slug );
			this.addRequest = new Model( {
				name: formName,
				parent: formParent ? formParent : undefined,
			} ).save();
			this.addRequest
				.then( resolve, ( xhr ) => {
					const errorCode = xhr.responseJSON && xhr.responseJSON.code;
					if ( errorCode === 'term_exists' ) {
						this.addRequest = new Model( { id: xhr.responseJSON.data } ).fetch();
						return this.addRequest.then( resolve, reject );
					}
					reject( xhr );
				} );
		} );
		findOrCreatePromise
			.then( ( term ) => {
				const hasTerm = !! find( this.state.availableTerms, ( availableTerm ) => availableTerm.id !== term.id );
				const newAvailableTerms = hasTerm ? this.state.availableTerms : [ ...this.state.availableTerms, term ];
				const { onUpdateTerms, restBase, terms } = this.props;
				this.setState( {
					adding: false,
					formName: '',
					formParent: '',
					showForm: false,
					availableTerms: newAvailableTerms,
					availableTermsTree: this.buildTermsTree( newAvailableTerms ),
				} );
				onUpdateTerms( [ ...terms, term.id ], restBase );
			}, ( xhr ) => {
				if ( xhr.statusText === 'abort' ) {
					return;
				}
				this.setState( {
					adding: false,
				} );
			} );
	}

	componentDidMount() {
		const Collection = wp.api.getTaxonomyCollection( this.props.slug );
		this.fetchRequest = new Collection()
			.fetch( { data: DEFAULT_QUERY } )
			.done( ( terms ) => {
				const availableTermsTree = this.buildTermsTree( terms );

				this.setState( {
					loading: false,
					availableTermsTree,
					availableTerms: terms,
				} );
			} )
			.fail( ( xhr ) => {
				if ( xhr.statusText === 'abort' ) {
					return;
				}
				this.setState( {
					loading: false,
				} );
			} );
	}

	componentWillUnmount() {
		this.fetchRequest.abort();
		this.addRequest.abort();
	}

	renderTerms( renderedTerms ) {
		const { terms = [] } = this.props;
		return renderedTerms.map( ( term ) => {
			const id = `editor-post-taxonomies-hierarchical-term-${ term.id }`;
			return (
				<div key={ term.id } className="editor-post-taxonomies__hierarchical-terms-choice">
					<input
						id={ id }
						className="editor-post-taxonomies__hierarchical-terms-input"
						type="checkbox"
						checked={ terms.indexOf( term.id ) !== -1 }
						value={ term.id }
						onChange={ this.onChange }
					/>
					<label htmlFor={ id }>{ unescapeString( term.name ) }</label>
					{ !! term.children.length && (
						<div className="editor-post-taxonomies__hierarchical-terms-subchoices">
							{ this.renderTerms( term.children ) }
						</div>
					) }
				</div>
			);
		} );
	}

	renderParentSelectorOptions( terms, level = 0 ) {
		return map( terms, ( term ) => ( [
			<option key={ term.id } value={ term.id }>
				{ repeat( '\u00A0', level * 3 ) + unescapeString( term.name ) }
			</option>,
			...this.renderParentSelectorOptions( term.children, level + 1 ),
		] ) );
	}

	render() {
		const { availableTermsTree, availableTerms, formName, formParent, loading, adding, showForm } = this.state;
		const { label, slug } = this.props;

		const newTermLinkLabel = slug === 'category' ? __( '+ Add New Category' ) : __( '+ Add New Term' );
		const newTermLabel = slug === 'category' ? __( 'Add New Category' ) : __( 'Add New Term' );
		const defaultParentLabel = slug === 'category' ? __( '-- Parent Category --' ) : __( '-- Parent Term --' );

		/* eslint-disable jsx-a11y/no-onchange */
		return (
			<div className="editor-post-taxonomies__hierarchical-terms-selector">
				<h4 className="editor-post-taxonomies__hierarchical-terms-selector-title">{ label }</h4>
				{ this.renderTerms( availableTermsTree ) }
				{ ! loading &&
					<button onClick={ this.onToggleForm } className="button-link">
						{ newTermLinkLabel }
					</button>
				}
				{ showForm &&
					<form onSubmit={ this.onAddTerm }>
						<input
							className="editor-post-taxonomies__hierarchical-terms-input"
							placeholder={ newTermLabel }
							value={ formName }
							onChange={ this.onChangeFormName }
						/>
						{ !! availableTerms.length &&
							<select
								className="editor-post-taxonomies__hierarchical-terms-input"
								value={ formParent }
								onChange={ this.onChangeFormParent }
							>
								<option value="">{ defaultParentLabel }</option>
								{ this.renderParentSelectorOptions( availableTermsTree ) }
							</select>
						}
						<button
							type="submit"
							className="editor-post-taxonomies__hierarchical-terms-submit"
							disabled={ adding }
						>
							{ newTermLabel }
						</button>
					</form>
				}
			</div>
		);
		/* eslint-enable jsx-a11y/no-onchange */
	}
}

export default connect(
	( state, onwProps ) => {
		return {
			terms: getEditedPostAttribute( state, onwProps.restBase ),
		};
	},
	{
		onUpdateTerms( terms, restBase ) {
			return editPost( { [ restBase ]: terms } );
		},
	}
)( HierarchicalTermSelector );

