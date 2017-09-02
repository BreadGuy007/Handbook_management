# Block API

Blocks are the fundamental element of the Gutenberg editor. They are the primary way in which plugins and themes can register their own functionality and extend the capabilities of the editor. This document covers the main properties of block registration.

## Register Block Type

Every block starts by registering a new block type definition. The function `registerBlockType` takes two arguments, a block `name` and a block configuration object.

### Block Name

The name for a block is a unique string that identifies a block. Names have to be structured as `namespace/block-name`, where namespace is the name of your plugin or theme.

```js
// Registering my block with a unique name
registerBlockType( 'my-plugin/book', {} );
```

### Block Configuration

A block requires a few properties to be specified before it can be registered successfully. These are defined through a configuration object, which includes the following:

#### Title

This is the display title for your block, which can be translated with our translation functions. The block inserter will show this name.

```js
// Our data object
title: 'Book'
```

#### Category

Blocks are grouped into categories to help users browse and discover them. The core provided categories are `common`, `formatting`, `layout`, `widgets`, and `embeds`.

```js
// Assigning to the 'layout' category
category: 'widgets',
```

#### Icon

An icon property should be specified to make it easier to identify a block. These can be any of [WordPress' Dashicons](https://developer.wordpress.org/resource/dashicons/), or a custom `svg` element.

```js
// Specifying a dashicon for the block
icon: 'book-alt',
```

#### Keywords (optional)

Sometimes a block could have aliases that help users discover it while searching. For example, an `image` block could also want to be discovered by `photo`. You can do so by providing an array of terms (which can be translated). It is only allowed to add as much as three terms per block.

```js
// Make it easier to discover a block with keyword aliases
keywords: [ __( 'read' ) ],
```

#### Attributes

Attributes provide the structured data needs of a block. They can exist in different forms when they are serialized, but they are declared together under a common interface.

```js
// Specifying my block attributes
attributes: {
	cover: {
		type: 'string',
		source: attr( 'img', 'src' ),
	},
	author: {
		type: 'string',
		source: children( '.book-author' ),
	},
	pages: {
		type: 'number',
	},
},
```

Attributes can be quite powerful, if you want to learn more about what's possible, read the specific document.

### Transforms (optional)

Work in progress...

### className (optional)

By default, Gutenberg adds a class with the form `.wp-blocks-your-block-name` to the root element of your saved markup. This helps having a consistent mechanism for styling blocks that themes and plugins can rely on. If for whatever reason a class is not desired on the markup, this functionality can be disabled.

```js
// Do not generate classes for this block
className: false,
```

## Edit and Save

The `edit` and `save` functions define the editor interface with which a user would interact, and the markup to be serialized back when a post is saved. They are the heart of how a block operates, so they are [covered separately](/block-edit-save/).

