# Navigation

Render a navigation list with optional groupings and hierarchy.

## Usage

```jsx
import {
	__experimentalNavigation as Navigation,
	__experimentalNavigationGroup as NavigationGroup,
	__experimentalNavigationItem as NavigationItem,
	__experimentalNavigationMenu as NavigationMenu,
} from '@wordpress/components';

const MyNavigation = () => (
	<Navigation>
		<NavigationMenu title="Home">
			<NavigationGroup title="Group 1">
				<NavigationItem item="item-1" title="Item 1" />
				<NavigationItem item="item-2" title="Item 2" />
			</NavigationGroup>
			<NavigationGroup title="Group 2">
				<NavigationItem
					item="item-3"
					navigateToMenu="category"
					title="Category"
				/>
			</NavigationGroup>
		</NavigationMenu>

		<NavigationMenu
			backButtonLabel="Home"
			menu="category"
			parentMenu="root"
			title="Category"
		>
			<NavigationItem badge="1" item="child-1" title="Child 1" />
			<NavigationItem item="child-2" title="Child 2" />
		</NavigationMenu>
	</Navigation>
);
```

## Navigation Props

`Navigation` supports the following props.

### `activeItem`

-   Type: `string`
-   Required: No

The active item slug.

### `activeMenu`

-   Type: `string`
-   Required: No
-   Default: "root"

The active menu slug.

### className

-   Type: `string`
-   Required: No

Optional className for the `Navigation` component.

### `onActivateMenu`

-   Type: `function`
-   Required: No

Sync the active menu between the external state and the Navigation's internal state.

## Navigation Menu Props

`NavigationMenu` supports the following props.

### `backButtonLabel`

-   Type: `string`
-   Required: No
-   Default: parent menu's title or "Back"

The back button label used in nested menus. If not provided, the label will be inferred from the parent menu's title.
If for some reason the parent menu's title is not available then it will default to "Back".

### className

-   Type: `string`
-   Required: No

Optional className for the `NavigationMenu` component.

### `menu`

-   Type: `string`
-   Required: No
-   Default: "root"

The unique identifier of the menu. The root menu can omit this, and it will default to "root"; all other menus need to specify it.

### `parentMenu`

-   Type: `string`
-   Required: No

The parent menu slug; used by nested menus to indicate their parent menu.

### `title`

-   Type: `string`
-   Required: No

The menu title.

## Navigation Group Props

`NavigationGroup` supports the following props.

### className

-   Type: `string`
-   Required: No

Optional className for the `NavigationGroup` component.

### `title`

-   Type: `string`
-   Required: No

The group title.

## Navigation Item Props

`NavigationItem` supports the following props.

### `badge`

-   Type: `string|Number`
-   Required: No

The item badge content.

### className

-   Type: `string`
-   Required: No

Optional className for the `NavigationItem` component.

### `href`

-   Type: `string`
-   Required: No

If provided, renders `a` instead of `button`.

### `item`

-   Type: `string`
-   Required: Yes

The unique identifier of the item.

### `navigateToMenu`

-   Type: `string`
-   Required: No

The child menu slug. If provided, clicking on the item will navigate to the target menu.

### `onClick`

-   Type: `function`
-   Required: No

A callback to handle clicking on a menu item.

### `title`

-   Type: `string`
-   Required: No

The item title.
