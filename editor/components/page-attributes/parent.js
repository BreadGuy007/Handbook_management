/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { get } from 'lodash';
import { stringify } from 'querystringify';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { withInstanceId, withAPIData } from '@wordpress/components';
import { compose } from '@wordpress/element';
import { buildTermsTree } from '@wordpress/utils';
import { TermTreeSelect } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { getCurrentPostId, getEditedPostAttribute, getCurrentPostType } from '../../store/selectors';
import { editPost } from '../../store/actions';

export function PageAttributesParent( { parent, postId, postType, items, onUpdateParent } ) {
	const isHierarchical = get( postType, 'data.hierarchical', false );
	const parentPageLabel = get( postType, 'data.labels.parent_item_colon' );
	const pageItems = get( items, 'data', [] );
	if ( ! isHierarchical || ! parentPageLabel || ! pageItems.length ) {
		return null;
	}

	const pagesTree = buildTermsTree( pageItems.filter( item => item.id !== postId ).map( ( item ) => ( {
		id: item.id,
		parent: item.parent,
		name: item.title.raw ? item.title.raw : `#${ item.id } (${ __( 'no title' ) })`,
	} ) ) );
	return (
		<TermTreeSelect
			label={ parentPageLabel }
			noOptionLabel={ `(${ __( 'no parent' ) })` }
			termsTree={ pagesTree }
			selectedTerm={ parent }
			onChange={ onUpdateParent }
		/>
	);
}

const applyConnect = connect(
	( state ) => {
		return {
			postId: getCurrentPostId( state ),
			parent: getEditedPostAttribute( state, 'parent' ),
			postTypeSlug: getCurrentPostType( state ),
		};
	},
	{
		onUpdateParent( parent ) {
			return editPost( { parent: parent || 0 } );
		},
	}
);

const applyWithAPIDataPostType = withAPIData( ( props ) => {
	const { postTypeSlug } = props;
	return {
		postType: `/wp/v2/types/${ postTypeSlug }?context=edit`,
	};
} );

const applyWithAPIDataItems = withAPIData( ( props ) => {
	const restBase = get( props, 'postType.data.rest_base' );
	const isHierarchical = get( props, 'postType.data.hierarchical', false );
	const queryString = stringify( {
		context: 'edit',
		per_page: 100,
		_fields: [ 'id', 'parent', 'title' ],
	} );
	return isHierarchical && restBase ? { items: `/wp/v2/${ restBase }?${ queryString }` } : {};
} );

export default compose( [
	applyConnect,
	applyWithAPIDataPostType,
	applyWithAPIDataItems,
	withInstanceId,
] )( PageAttributesParent );
