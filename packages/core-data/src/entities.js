/**
 * External dependencies
 */
import { upperFirst, camelCase, map, find, get, startCase } from 'lodash';

/**
 * WordPress dependencies
 */
import { controls } from '@wordpress/data';
import { apiFetch } from '@wordpress/data-controls';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { addEntities } from './actions';

export const DEFAULT_ENTITY_KEY = 'id';

export const defaultEntities = [
	{
		label: __( 'Base' ),
		name: '__unstableBase',
		kind: 'root',
		baseURL: '',
	},
	{
		label: __( 'Site' ),
		name: 'site',
		kind: 'root',
		baseURL: '/wp/v2/settings',
		getTitle: ( record ) => {
			return get( record, [ 'title' ], __( 'Site Title' ) );
		},
	},
	{
		label: __( 'Post Type' ),
		name: 'postType',
		kind: 'root',
		key: 'slug',
		baseURL: '/wp/v2/types',
	},
	{
		name: 'media',
		kind: 'root',
		baseURL: '/wp/v2/media',
		plural: 'mediaItems',
		label: __( 'Media' ),
	},
	{
		name: 'taxonomy',
		kind: 'root',
		key: 'slug',
		baseURL: '/wp/v2/taxonomies',
		plural: 'taxonomies',
		label: __( 'Taxonomy' ),
	},
	{
		name: 'sidebar',
		kind: 'root',
		baseURL: '/wp/v2/sidebars',
		plural: 'sidebars',
		transientEdits: { blocks: true },
		label: __( 'Widget areas' ),
	},
	{
		name: 'widget',
		kind: 'root',
		baseURL: '/wp/v2/widgets',
		plural: 'widgets',
		transientEdits: { blocks: true },
		label: __( 'Widgets' ),
	},
	{
		label: __( 'User' ),
		name: 'user',
		kind: 'root',
		baseURL: '/wp/v2/users',
		plural: 'users',
	},
	{
		name: 'comment',
		kind: 'root',
		baseURL: '/wp/v2/comments',
		plural: 'comments',
		label: __( 'Comment' ),
	},
	{
		name: 'menu',
		kind: 'root',
		baseURL: '/__experimental/menus',
		plural: 'menus',
		label: __( 'Menu' ),
	},
	{
		name: 'menuItem',
		kind: 'root',
		baseURL: '/__experimental/menu-items',
		plural: 'menuItems',
		label: __( 'Menu Item' ),
	},
	{
		name: 'menuLocation',
		kind: 'root',
		baseURL: '/__experimental/menu-locations',
		plural: 'menuLocations',
		label: __( 'Menu Location' ),
		key: 'name',
	},
];

export const kinds = [
	{ name: 'postType', loadEntities: loadPostTypeEntities },
	{ name: 'taxonomy', loadEntities: loadTaxonomyEntities },
];

/**
 * Returns a function to be used to retrieve the title of a given post type record.
 *
 * @param {string} postTypeName PostType name.
 * @return {Function} getTitle.
 */
export const getPostTypeTitle = ( postTypeName ) => ( record ) => {
	if ( [ 'wp_template_part', 'wp_template' ].includes( postTypeName ) ) {
		return (
			record?.title?.rendered || record?.title || startCase( record.slug )
		);
	}
	return record?.title?.rendered || record?.title || String( record.id );
};

/**
 * Returns a function to be used to retrieve extra edits to apply before persisting a post type.
 *
 * @param {string} postTypeName PostType name.
 * @return {Function} prePersistHandler.
 */
export const getPostTypePrePersistHandler = ( postTypeName ) => (
	persistedRecord,
	edits
) => {
	const newEdits = {};

	// Fix template titles.
	if (
		[ 'wp_template', 'wp_template_part' ].includes( postTypeName ) &&
		! edits.title &&
		! persistedRecord.title
	) {
		newEdits.title = persistedRecord
			? getPostTypeTitle( postTypeName )( persistedRecord )
			: edits.slug;
	}

	// Templates and template parts can only be published.
	if ( [ 'wp_template', 'wp_template_part' ].includes( postTypeName ) ) {
		newEdits.status = 'publish';
	}

	if ( persistedRecord?.status === 'auto-draft' ) {
		// Saving an auto-draft should create a draft by default.
		if ( ! edits.status && ! newEdits.status ) {
			newEdits.status = 'draft';
		}

		// Fix the auto-draft default title.
		if (
			( ! edits.title || edits.title === 'Auto Draft' ) &&
			! newEdits.title &&
			( ! persistedRecord?.title ||
				persistedRecord?.title === 'Auto Draft' )
		) {
			newEdits.title = '';
		}
	}

	return newEdits;
};

/**
 * Returns the list of post type entities.
 *
 * @return {Promise} Entities promise
 */
function* loadPostTypeEntities() {
	const postTypes = yield apiFetch( { path: '/wp/v2/types?context=edit' } );
	return map( postTypes, ( postType, name ) => {
		return {
			kind: 'postType',
			baseURL: '/wp/v2/' + postType.rest_base,
			name,
			label: postType.labels.singular_name,
			transientEdits: {
				blocks: true,
				selectionStart: true,
				selectionEnd: true,
			},
			mergedEdits: { meta: true },
			getTitle: getPostTypeTitle( name ),
			__unstablePrePersist: getPostTypePrePersistHandler( name ),
		};
	} );
}

/**
 * Returns the list of the taxonomies entities.
 *
 * @return {Promise} Entities promise
 */
function* loadTaxonomyEntities() {
	const taxonomies = yield apiFetch( {
		path: '/wp/v2/taxonomies?context=edit',
	} );
	return map( taxonomies, ( taxonomy, name ) => {
		return {
			kind: 'taxonomy',
			baseURL: '/wp/v2/' + taxonomy.rest_base,
			name,
			label: taxonomy.labels.singular_name,
		};
	} );
}

/**
 * Returns the entity's getter method name given its kind and name.
 *
 * @param {string}  kind      Entity kind.
 * @param {string}  name      Entity name.
 * @param {string}  prefix    Function prefix.
 * @param {boolean} usePlural Whether to use the plural form or not.
 *
 * @return {string} Method name
 */
export const getMethodName = (
	kind,
	name,
	prefix = 'get',
	usePlural = false
) => {
	const entity = find( defaultEntities, { kind, name } );
	const kindPrefix = kind === 'root' ? '' : upperFirst( camelCase( kind ) );
	const nameSuffix =
		upperFirst( camelCase( name ) ) + ( usePlural ? 's' : '' );
	const suffix =
		usePlural && entity.plural
			? upperFirst( camelCase( entity.plural ) )
			: nameSuffix;
	return `${ prefix }${ kindPrefix }${ suffix }`;
};

/**
 * Loads the kind entities into the store.
 *
 * @param {string} kind  Kind
 *
 * @return {Array} Entities
 */
export function* getKindEntities( kind ) {
	let entities = yield controls.select( 'core', 'getEntitiesByKind', kind );
	if ( entities && entities.length !== 0 ) {
		return entities;
	}

	const kindConfig = find( kinds, { name: kind } );
	if ( ! kindConfig ) {
		return [];
	}

	entities = yield kindConfig.loadEntities();
	yield addEntities( entities );

	return entities;
}
