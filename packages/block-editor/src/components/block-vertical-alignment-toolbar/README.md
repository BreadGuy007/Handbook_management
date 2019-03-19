BlockVerticalAlignmentToolbar
=============================

`BlockVerticalAlignmentToolbar` is a simple `Toolbar` component designed to provide _vertical_ alignment UI controls for use within the editor `BlockControls` toolbar.

This builds upon similar patterns to the [`BlockAlignmentToolbar`](https://github.com/WordPress/gutenberg/tree/master/packages/editor/src/components/block-alignment-toolbar) but is focused on vertical alignment only.

## Usage

In a block's `edit` implementation, render a `<BlockControls />` component. Then inside of this add the `<BlockVerticalAlignmentToolbar />` where required. 


```jsx
import { registerBlockType } from '@wordpress/blocks';
import { Fragment } from '@wordpress/element';
import {
	BlockControls,
	BlockVerticalAlignmentToolbar,
} from '@wordpress/block-editor';

registerBlockType( 'my-plugin/my-block', {
	// ...

	attributes: {
		// other attributes here
		// ...

		verticalAlignment: {
			type: 'string',
		},
	},

	edit( { attributes, setAttributes } ) {
		
		const { verticalAlignment } = attributes;

		// Change handler to set Block `attributes`
		const onChange = ( alignment ) => setAttributes( { verticalAlignment: alignment } );

		return (
			<Fragment>
				<BlockControls>
					<BlockVerticalAlignmentToolbar
						onChange={ onChange }
						value={ verticalAlignment }
					/>
				</BlockControls>
				<div>
					// your Block here
				</div>
			</Fragment>
		);
	}
} );
```

_Note:_ by default if you do not provide an initial `value` prop for the current alignment value, then no value will be selected (ie: there is no default alignment set). 

_Note:_ the user can repeatedly click on the toolbar buttons to toggle the alignment values on/off. This is handled within the component.

## Props

### `value`
* **Type:** `String`
* **Default:** `undefined`
* **Options:**: `top`, `center`, `bottom`

The current value of the alignment setting. You may only choose from the `Options` listed above.


### `onChange`
* **Type:** `Function`

A callback function invoked when the toolbar's alignment value is changed via an interaction with any of the toolbar's buttons. Called with the new alignment value (ie: `top`, `center`, `bottom`, `undefined`) as the only argument.

Note: the value may be `undefined` if the user has toggled the component "off".

```js
const onChange = ( alignment ) => setAttributes( { verticalAlignment: alignment } );
```

## Examples

The [Core Columns](https://github.com/WordPress/gutenberg/tree/master/packages/block-library/src/columns) Block utilises the `BlockVerticalAlignmentToolbar`.