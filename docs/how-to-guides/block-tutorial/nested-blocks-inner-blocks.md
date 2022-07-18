<!--
# Nested Blocks: Using InnerBlocks
 -->
# ネストしたブロック: InnerBlocks の使用

<!--
You can create a single block that nests other blocks using the [InnerBlocks](https://github.com/WordPress/gutenberg/tree/HEAD/packages/block-editor/src/components/inner-blocks/README.md) component. This is used in the Columns block, Social Links block, or any block you want to contain other blocks.

Note: A single block can only contain one `InnerBlocks` component.

Here is the basic InnerBlocks usage.
 -->
他のブロックをネストするブロックを作成するには [InnerBlocks](https://github.com/WordPress/gutenberg/tree/HEAD/packages/block-editor/src/components/inner-blocks/README.md) コンポーネントを使用します。このコンポーネントは「カラム」ブロックや「ソーシャルリンク」ブロックなど、他のブロックを含むブロックで使用されています。

注意: 単一のブロックは、1つの `InnerBlocks` コンポーネントのみを含むことができます。

基本的な InnerBlocks の使用方法

**JSX**
<!-- 
{% codetabs %}
{% JSX %}
 -->
```js
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

registerBlockType( 'gutenberg-examples/example-06', {
	// ...

	edit: () => {
		const blockProps = useBlockProps();

		return (
			<div { ...blockProps }>
				<InnerBlocks />
			</div>
		);
	},

	save: () => {
		const blockProps = useBlockProps.save();

		return (
			<div { ...blockProps }>
				<InnerBlocks.Content />
			</div>
		);
	},
} );
```

**Plain**
<!-- 
{% Plain %}
 -->
```js
( function ( blocks, element, blockEditor ) {
	var el = element.createElement;
	var InnerBlocks = blockEditor.InnerBlocks;
	var useBlockProps = blockEditor.useBlockProps;

	blocks.registerBlockType( 'gutenberg-examples/example-06', {
		title: 'Example: Inner Blocks',
		category: 'design',

		edit: function () {
			var blockProps = useBlockProps();

			return el( 'div', blockProps, el( InnerBlocks ) );
		},

		save: function () {
			var blockProps = useBlockProps.save();

			return el( 'div', blockProps, el( InnerBlocks.Content ) );
		},
	} );
} )( window.wp.blocks, window.wp.element, window.wp.blockEditor );
```
<!-- 
{% end %}
 -->
<!--
## Allowed Blocks

Using the `ALLOWED_BLOCKS` property, you can define the set of blocks allowed in your InnerBlock. This restricts the blocks that can be included only to those listed, all other blocks will not show in the inserter.
 -->
## 許可されるブロック

`ALLOWED_BLOCKS` プロパティを使用すると、InnerBlock 内で許可されるブロックの集合を定義できます。インサーターに含まれるブロックはリストされたブロックのみに制限され、その他のすべてのブロックは表示されません。

```js
const ALLOWED_BLOCKS = [ 'core/image', 'core/paragraph' ];
//...
<InnerBlocks allowedBlocks={ ALLOWED_BLOCKS } />;
```

<!--
## Orientation

By default, `InnerBlocks` expects its blocks to be shown in a vertical list. A valid use-case is to style inner blocks to appear horizontally, for instance by adding CSS flex or grid properties to the inner blocks wrapper. When blocks are styled in such a way, the `orientation` prop can be set to indicate that a horizontal layout is being used:
-->
## orientation

デフォルトでは、`InnerBlocks` は、縦のリストとしてブロックが表示されることを期待しています。また、内部ブロックのラッパーに CSS flex や grid プロパティを追加して、横に並べて表示するようスタイリングすることもできます。ブロックを横に並べる場合は、horizontal レイアウトが使用されることを示すために `orientation` プロパティを使用してください。

```js
<InnerBlocks orientation="horizontal" />
```
<!--
Specifying this prop does not affect the layout of the inner blocks, but results in the block mover icons in the child blocks being displayed horizontally, and also ensures that drag and drop works correctly.
-->
このプロパティを指定しても、内側のブロックのレイアウトには影響しませんが、子ブロックのブロック移動アイコンが水平に表示され、また、ドラッグアンドドロップが正しく動作するようになります。

<!--
## Template

Use the template property to define a set of blocks that prefill the InnerBlocks component when inserted. You can set attributes on the blocks to define their use. The example below shows a book review template using InnerBlocks component and setting placeholders values to show the block usage.
 -->
## テンプレート

template プロパティを使用して、InnerBlocks コンポーネントが挿入された際にデフォルトで含まれるブロックの集合を定義できます。ブロックの属性を設定して使用例を定義できます。次の例は InnerBlocks コンポーネントを使用した本のレビューのテンプレートです。placeholder 値を設定してブロックの使用例を示しています。

**JSX**
<!-- 
{% codetabs %}
{% JSX %}
 -->
```js
const MY_TEMPLATE = [
	[ 'core/image', {} ],
	[ 'core/heading', { placeholder: 'Book Title' } ],
	[ 'core/paragraph', { placeholder: 'Summary' } ],
];

//...

	edit: () => {
		return (
			<InnerBlocks
				template={ MY_TEMPLATE }
				templateLock="all"
			/>
		);
	},
```

**Plain**
<!-- 
{% Plain %}
 -->
```js
const MY_TEMPLATE = [
	[ 'core/image', {} ],
	[ 'core/heading', { placeholder: 'Book Title' } ],
	[ 'core/paragraph', { placeholder: 'Summary' } ],
];

//...

	edit: function( props ) {
		return el(
			InnerBlocks,
			{
				template: MY_TEMPLATE,
				templateLock: "all",
			}
		);
	},
```
<!-- 
{% end %}
 -->
<!--
Use the `templateLock` property to lock down the template. Using `all` locks the template completely so no changes can be made. Using `insert` prevents additional blocks from being inserted, but existing blocks can be reordered. See [templateLock documentation](https://github.com/WordPress/gutenberg/tree/HEAD/packages/block-editor/src/components/inner-blocks/README.md#templatelock) for additional information.
 -->
`templateLock` プロパティを使用するとテンプレートをロックできます。テンプレートを完全にロックするには `all` を使用します。`insert` は追加ブロックのインサートを禁止しますが、既存のブロックは並べ替えられます。詳細については [templateLock のドキュメント](https://github.com/WordPress/gutenberg/tree/HEAD/packages/block-editor/src/components/inner-blocks/README.md#templatelock)を参照してください。

<!--
### Post Template

Unrelated to `InnerBlocks` but worth mentioning here, you can create a [post template](https://developer.wordpress.org/block-editor/developers/block-api/block-templates/) by post type, that preloads the block editor with a set of blocks.

The `InnerBlocks` template is for the component in the single block that you created, the rest of the post can include any blocks the user likes. Using a post template, can lock the entire post to just the template you define.
 -->
### 投稿テンプレート

`InnerBlocks` とは関連しませんが、ちょうどよいのでここで触れますが、投稿タイプごとに[投稿テンプレート](https://developer.wordpress.org/block-editor/developers/block-api/block-templates/)を作ることができます。ブロックエディターをブロックの集合と共にプリロードします。

`InnerBlocks` テンプレートは、作成する単一ブロック内のコンポーネントのためのものであり、投稿のそれ以外の箇所ではユーザーが好きなブロックを含めることができます。投稿テンプレートを使用すれば投稿全体をロックし、定義したテンプレートのみに制限できます。

```php
add_action( 'init', function() {
	$post_type_object = get_post_type_object( 'post' );
	$post_type_object->template = array(
		array( 'core/image' ),
		array( 'core/heading' )
	);
} );
```

<!--
## Child InnerBlocks: Parent and Ancestors

A common pattern for using InnerBlocks is to create a custom block that will be included only in the InnerBlocks. 

An example of this is the Columns block, that creates a single parent block called `columns` and then creates an child block called `column`. The parent block is defined to only allow the child blocks. See [Column code for reference](https://github.com/WordPress/gutenberg/tree/HEAD/packages/block-library/src/column).

When defining a child block, use the `parent` block setting to define which block is the parent. This prevents the block showing in the inserter outside of the InnerBlock it is defined for.
 -->
## 子の InnerBlocks: 親と先祖

InnerBloks を使用する一般的なパターンは InnerBlocks のみに含まれるカスタムブロックの作成です。

この例として「カラム」ブロックがあります。「カラム」ブロックでは単一の親ブロック `columns` とその子ブロック `column` を作成します。親ブロックは子ブロックのみを許可するとして定義されます。[Column のコード](https://github.com/WordPress/gutenberg/tree/HEAD/packages/block-library/src/column)を参照してください。

子ブロックを定義する際に `parent` ブロック設定を使用して親ブロックを定義します。こうすると定義された InnerBlock の外側ではインサーターに表示されません。

```json
{
	"title": "Column",
	"name": "core/column",
	"parent": [ "core/columns" ],
	// ...
}
```

他の例としては、`ancestors` ブロック設定を使用して、あるブロックが先祖として存在しなければならないが、`parent` のように、直接の親である必要はないブロックを定義できます。これにより、先祖がツリーに存在しない場合、インサーターにブロックは表示されず、一方で、カラムやグループブロックのように、他のブロックを間に追加できます。[コメント作者名のコード](https://github.com/WordPress/gutenberg/tree/HEAD/packages/block-library/src/comment-author-name)を参照してください。


```json
{
	"title": "Comment Author Name",
	"name": "core/comment-author-name",
	"ancestor": [ "core/comment-template" ],
	// ...
}
```

[原文](https://github.com/WordPress/gutenberg/blob/trunk/docs/how-to-guides/block-tutorial/nested-blocks-inner-blocks.md)
