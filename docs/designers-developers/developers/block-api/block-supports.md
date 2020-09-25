# Block Supports

Block Supports is the API that allows a block to declare features used in the editor.

Some block supports — for example, `anchor` or `className` — apply their attributes by adding additional props on the element returned by `save`. This will work automatically for default HTML tag elements (`div`, etc). However, if the return value of your `save` is a custom component element, you will need to ensure that your custom component handles these props in order for the attributes to be persisted.

## anchor

- Type: `boolean`
- Default value: `false`

Anchors let you link directly to a specific block on a page. This property adds a field to define an id for the block and a button to copy the direct link.

```js
// Declare support for anchor links.
supports: {
    anchor: true
}
```

## align

- Type: `boolean` or `array`
- Default value: `false`

This property adds block controls which allow to change block's alignment. _Important: It doesn't work with dynamic blocks yet._

```js
supports: {
    // Declare support for block's alignment.
    // This adds support for all the options:
    // left, center, right, wide, and full.
    align: true
}
```

```js
supports: {
    // Declare support for specific alignment options.
    align: [ 'left', 'right', 'full' ]
}
```

When the block declares support for `align`, the attributes definition is extended to include an align attribute with a `string` type. By default, no alignment is assigned. The block can apply a default alignment by specifying its own `align` attribute with a default e.g.:

```js
attributes: {
    align: {
        type: 'string',
        default: 'right'
    }
}
```

## alignWide

- Type: `boolean`
- Default value: `true`

This property allows to enable [wide alignment](/docs/designers-developers/developers/themes/theme-support.md#wide-alignment) for your theme. To disable this behavior for a single block, set this flag to `false`.

```js
supports: {
    // Remove the support for wide alignment.
    alignWide: false
}
```

## className

- Type: `boolean`
- Default value: `true`

By default, the class `.wp-block-your-block-name` is added to the root element of your saved markup. This helps having a consistent mechanism for styling blocks that themes and plugins can rely on. If, for whatever reason, a class is not desired on the markup, this functionality can be disabled.

```js
supports: {
    // Remove the support for the generated className.
    className: false
}
```

## customClassName

- Type: `boolean`
- Default value: `true`

This property adds a field to define a custom className for the block's wrapper.

```js
supports: {
    // Remove the support for the custom className.
    customClassName: false
}
```

## defaultStylePicker

- Type: `boolean`
- Default value: `true`

When the style picker is shown, a dropdown is displayed so the user can select a default style for this block type. If you prefer not to show the dropdown, set this property to `false`.

```js
supports: {
    // Remove the Default Style picker.
    defaultStylePicker: false
}
```

## html

- Type: `boolean`
- Default value: `true`

By default, a block's markup can be edited individually. To disable this behavior, set `html` to `false`.

```js
supports: {
    // Remove support for an HTML mode.
    html: false
}
```

## inserter

- Type: `boolean`
- Default value: `true`

By default, all blocks will appear in the inserter. To hide a block so that it can only be inserted programmatically, set `inserter` to `false`.

```js
supports: {
    // Hide this block from the inserter.
    inserter: false
}
```

## multiple

- Type: `boolean`
- Default value: `true`

A non-multiple block can be inserted into each post, one time only. For example, the built-in 'More' block cannot be inserted again if it already exists in the post being edited. A non-multiple block's icon is automatically dimmed (unclickable) to prevent multiple instances.

```js
supports: {
    // Use the block just once per post
    multiple: false
}
```

## reusable

- Type: `boolean`
- Default value: `true`

A block may want to disable the ability of being converted into a reusable block. By default all blocks can be converted to a reusable block. If supports reusable is set to false, the option to convert the block into a reusable block will not appear.

```js
supports: {
    // Don't allow the block to be converted into a reusable block.
    reusable: false
}
```
