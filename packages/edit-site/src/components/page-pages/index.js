/**
 * WordPress dependencies
 */
import {
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEntityRecords } from '@wordpress/core-data';
import { decodeEntities } from '@wordpress/html-entities';
import { useState, useMemo, useCallback } from '@wordpress/element';
import { dateI18n, getDate, getSettings } from '@wordpress/date';

/**
 * Internal dependencies
 */
import Page from '../page';
import Link from '../routes/link';
import { DataViews } from '../dataviews';
import useTrashPostAction from '../actions/trash-post';
import Media from '../media';

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};
const defaultConfigPerViewType = {
	list: {},
	grid: {
		mediaField: 'featured-image',
	},
};

export default function PagePages() {
	const [ view, setView ] = useState( {
		type: 'list',
		search: '',
		page: 1,
		perPage: 5,
		sort: {
			field: 'date',
			direction: 'desc',
		},
		// All fields are visible by default, so it's
		// better to keep track of the hidden ones.
		hiddenFields: [ 'date', 'featured-image' ],
		layout: {},
	} );
	// Request post statuses to get the proper labels.
	const { records: statuses } = useEntityRecords( 'root', 'status' );
	const postStatuses = useMemo(
		() =>
			statuses === null
				? EMPTY_OBJECT
				: Object.fromEntries(
						statuses.map( ( { slug, name } ) => [ slug, name ] )
				  ),
		[ statuses ]
	);

	const queryArgs = useMemo(
		() => ( {
			per_page: view.perPage,
			page: view.page,
			_embed: 'author',
			order: view.sort?.direction,
			orderby: view.sort?.field,
			search: view.search,
			status: [ 'publish', 'draft' ],
		} ),
		[ view ]
	);
	const {
		records: pages,
		isResolving: isLoadingPages,
		totalItems,
		totalPages,
	} = useEntityRecords( 'postType', 'page', queryArgs );

	const paginationInfo = useMemo(
		() => ( {
			totalItems,
			totalPages,
		} ),
		[ totalItems, totalPages ]
	);

	const fields = useMemo(
		() => [
			{
				id: 'featured-image',
				header: __( 'Featured Image' ),
				accessorFn: ( page ) => page.featured_media,
				render: ( { item, view: currentView } ) =>
					!! item.featured_media ? (
						<Media
							className="edit-site-page-pages__featured-image"
							id={ item.featured_media }
							size={
								currentView.type === 'list'
									? [ 'thumbnail', 'medium', 'large', 'full' ]
									: [ 'large', 'full', 'medium', 'thumbnail' ]
							}
						/>
					) : null,
				enableSorting: false,
			},
			{
				header: __( 'Title' ),
				id: 'title',
				accessorFn: ( page ) => page.title?.rendered || page.slug,
				render: ( { item: page } ) => {
					return (
						<VStack spacing={ 1 }>
							<Heading as="h3" level={ 5 }>
								<Link
									params={ {
										postId: page.id,
										postType: page.type,
										canvas: 'edit',
									} }
								>
									{ decodeEntities(
										page.title?.rendered || page.slug
									) || __( '(no title)' ) }
								</Link>
							</Heading>
						</VStack>
					);
				},
				maxWidth: 400,
				sortingFn: 'alphanumeric',
				enableHiding: false,
			},
			{
				header: __( 'Author' ),
				id: 'author',
				accessorFn: ( page ) => page._embedded?.author[ 0 ]?.name,
				render: ( { item } ) => {
					const author = item._embedded?.author[ 0 ];
					return (
						<a href={ `user-edit.php?user_id=${ author.id }` }>
							{ author.name }
						</a>
					);
				},
			},
			{
				header: __( 'Status' ),
				id: 'status',
				accessorFn: ( page ) =>
					postStatuses[ page.status ] ?? page.status,
				enableSorting: false,
			},
			{
				header: 'Date',
				id: 'date',
				render: ( { item } ) => {
					const formattedDate = dateI18n(
						getSettings().formats.datetimeAbbreviated,
						getDate( item.date )
					);
					return <time>{ formattedDate }</time>;
				},
				enableSorting: false,
			},
		],
		[ postStatuses ]
	);

	const trashPostAction = useTrashPostAction();
	const actions = useMemo( () => [ trashPostAction ], [ trashPostAction ] );
	const onChangeView = useCallback(
		( viewUpdater ) => {
			let updatedView =
				typeof viewUpdater === 'function'
					? viewUpdater( view )
					: viewUpdater;
			if ( updatedView.type !== view.type ) {
				updatedView = {
					...updatedView,
					layout: {
						...defaultConfigPerViewType[ updatedView.type ],
					},
				};
			}

			setView( updatedView );
		},
		[ view ]
	);

	// TODO: we need to handle properly `data={ data || EMPTY_ARRAY }` for when `isLoading`.
	return (
		<Page title={ __( 'Pages' ) }>
			<DataViews
				paginationInfo={ paginationInfo }
				fields={ fields }
				actions={ actions }
				data={ pages || EMPTY_ARRAY }
				isLoading={ isLoadingPages }
				view={ view }
				onChangeView={ onChangeView }
			/>
		</Page>
	);
}
