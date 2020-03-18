/**
 * External dependencies
 */
import { upperFirst, camelCase, map, find, get, startCase } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { addEntities } from './actions';
import { apiFetch, select } from './controls';

export const DEFAULT_ENTITY_KEY = 'id';

export const defaultEntities = [
	{
		label: __( 'Site' ),
		name: 'site',
		kind: 'root',
		baseURL: '/wp/v2/settings',
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
		name: 'widgetArea',
		kind: 'root',
		baseURL: '/__experimental/widget-areas',
		plural: 'widgetAreas',
		transientEdits: { blocks: true },
		label: __( 'Widget area' ),
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
];

export const kinds = [
	{ name: 'postType', loadEntities: loadPostTypeEntities },
	{ name: 'taxonomy', loadEntities: loadTaxonomyEntities },
];

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
			getTitle( record ) {
				if ( name === 'wp_template_part' || name === 'wp_template' ) {
					return startCase( record.slug );
				}
				return get( record, [ 'title', 'rendered' ], record.id );
			},
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
	let entities = yield select( 'getEntitiesByKind', kind );
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
