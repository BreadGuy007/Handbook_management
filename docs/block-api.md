<!--
# Block API

Blocks are the fundamental element of the Gutenberg editor. They are the primary way in which plugins and themes can register their own functionality and extend the capabilities of the editor. This document covers the main properties of block registration.
-->
# ブロック API

ブロックは Gutenberg の基本要素で、プラグインとテーマが独自の機能を登録し、エディタの機能を拡張する主な手段となります。このドキュメントでは、ブロック登録の主な特性について説明します。

<!--
## Register Block Type

* **Type:** `Function`

Every block starts by registering a new block type definition. The function `registerBlockType` takes two arguments, a block `name` and a block configuration object.
-->

## Block タイプの登録

* **タイプ:** `Function`

すべてのブロックは、新しいブロックタイプ定義を登録することから始まります。関数 `registerBlockType` では、ブロック名 (`name`) とブロック構成オブジェクトという2つの引数が使えます。

<!--
### Block Name

* **Type:** `String`

The name for a block is a unique string that identifies a block. Names have to be structured as `namespace/block-name`, where namespace is the name of your plugin or theme.
-->

### ブロック名

* ** タイプ:** `String`

ブロックの名前は、ブロックを識別する固有の文字列です。名前は `namespace/block-name` (名前空間/ブロック名) として構造化する必要があります。ここでの名前空間はプラグイン名またはテーマ名前になります。

<!--
```js
// Registering my block with a unique name
registerBlockType( 'my-plugin/book', {} );
```
-->

```js
// ブロックに一意の名前を登録する
registerBlockType( 'my-plugin/book', {} );
```

<!--
*Note:* A block name can only contain lowercase alphanumeric characters and dashes, and must begin with a letter.
-->

*注:* ブロック名には小文字の英数字とハイフンのみを含めることができ、最初は文字にする必要があります。

<!--
*Note:* This name is used on the comment delimiters as `
-->
<!-- wp:my-plugin/book -->
<!--
`. Those blocks provided by core don't include a namespace when serialized.
-->

*注:* この名前は `<!-- wp:my-plugin/book -->` のようにコメント区切り文字内で使用されます。コアによって提供されるブロックがシリアライズされる際には、名前空間は含まれません。

<!--
### Block Configuration

* **Type:** `{ key: value }`

A block requires a few properties to be specified before it can be registered successfully. These are defined through a configuration object, which includes the following:
-->
### ブロック構成

* **タイプ:** `{ key: value }`

ブロックを正しく登録するには、いくつかのプロパティを指定する必要があります。これらは、次のような構成オブジェクトによって定義されます。

<!--
#### Title

* **Type:** `String`

This is the display title for your block, which can be translated with our translation functions. The block inserter will show this name.

```js
// Our data object
title: 'Book'
```
-->
#### タイトル

* **タイプ:** `String`

これはブロックの表示タイトルであり、翻訳機能で翻訳できます。ブロックインサーターにこの名前が表示されます。

```js
// データオブジェクト
title: 'Book'
```
<!--
#### Description (optional)

* **Type:** `String`

This is a short description for your block, which can be translated with our translation functions. This will be shown in the block inspector.

```js
description: 'Block showing a Book card.'
```
-->

#### 説明 (オプション)

* **タイプ:** `String`

これはブロックの簡単な説明であり、翻訳機能で翻訳できます。ブロックインスペクターに表示されます。

```js
description: 'Block showing a Book card.'
```

<!--
#### Category

* **Type:** `String [ common | formatting | layout | widgets | embed ]`

Blocks are grouped into categories to help users browse and discover them. The core provided categories are `common`, `formatting`, `layout`, `widgets`, and `embed`.

```js
// Assigning to the 'layout' category
category: 'widgets',
```
-->
#### カテゴリー

* **タイプ:** `String [ common | formatting | layout | widgets | embed ]`

ブロックは、ユーザーが拾い読みして発見できるよう、カテゴリーにグループ化されています。コアが提供するカテゴリーは `common`、`formatting`、`layout`、`widgets`、`embed` です。

```js
// 'layout' カテゴリーを割り当て
category: 'widgets',
```

<!--
#### Icon (optional)

An icon property should be specified to make it easier to identify a block. These can be any of [WordPress' Dashicons](https://developer.wordpress.org/resource/dashicons/), or a custom `svg` element.

```js
// Specifying a dashicon for the block
icon: 'book-alt',
```
-->
#### アイコン (オプション)

ブロックを簡単に識別できるように、アイコンプロパティを指定することが推奨されています。[WordPress の Dashicon](https://developer.wordpress.org/resource/dashicons/)、またはカスタム `svg` 要素のいずれかになります。

```js
// ブロックに dashicon を指定
icon: 'book-alt',
```

<!--
#### Keywords (optional)

Sometimes a block could have aliases that help users discover it while searching. For example, an `image` block could also want to be discovered by `photo`. You can do so by providing an array of terms (which can be translated). It is only allowed to add as much as three terms per block.

```js
// Make it easier to discover a block with keyword aliases
keywords: [ __( 'read' ) ],
```
-->
#### キーワード (オプション)

ユーザーが検索中にブロックを発見するのを助けるエイリアスがブロックに存在することがあります。例えば、`image` ブロックは `photo` でも発見できるかもしれません。これを実現するには、(翻訳可能な) 用語の配列を提供します。ブロックごとに用語を3つまで追加することのみが許可されています。

```js
// キーワードエイリアスでブロックを簡単に発見できるようにする
keywords: [ __( 'read' ) ],
```

<!--
#### Attributes (optional)

* **Type:** `{ attr: {} }`

Attributes provide the structured data needs of a block. They can exist in different forms when they are serialized, but they are declared together under a common interface.
-->
#### 属性 (オプション)

* **タイプ:** `{ attr: {} }`

属性はブロックの構造化データのニーズを提供します。シリアライズされた際には異なる形式で存在できますが、共通インタフェースの下では一緒に宣言されます。

<!--
```js
// Specifying my block attributes
attributes: {
	cover: {
		type: 'string',
		source: 'attribute',
		selector: 'img',
		attribute: 'src',
	},
	author: {
		type: 'string',
		source: 'children',
		selector: '.book-author',
	},
	pages: {
		type: 'number',
	},
},
```
-->
```js
// ブロック属性を指定
attributes: {
	cover: {
		type: 'string',
		source: 'attribute',
		selector: 'img',
		attribute: 'src',
	},
	author: {
		type: 'string',
		source: 'children',
		selector: '.book-author',
	},
	pages: {
		type: 'number',
	},
},
```

<!--
* **See: [Attributes](https://wordpress.org/gutenberg/handbook/block-api/attributes/).**
-->
* **参照: [属性](https://wordpress.org/gutenberg/handbook/block-api/attributes/)**

<!--
#### Transforms (optional)

Work in progress...
-->
#### Transforms (オプション)

作業中…

<!--
#### useOnce (optional)

* **Type:** `Bool`
* **Default:** `false`

A once-only block can be inserted into each post, one time only. For example, the built-in 'More' block cannot be inserted again if it already exists in the post being edited. A once-only block's icon is automatically dimmed (unclickable) to prevent multiple instances.

```js
// Use the block just once per post
useOnce: true,
```
-->
#### useOnce (オプション)

* **タイプ:** `Bool`
* **デフォルト:** `false`

1回限りのブロックは各投稿に1回のみ挿入できます。たとえば、編集中の投稿にビルトイン「More (続きを読む)」ブロックがすでに存在する場合、再度挿入することはできません。1回限りのブロックのアイコンは、複数のインスタンスを防ぐために自動的に淡色表示 (クリック不可) されます。

```js
// ブロックを投稿ごとに1回だけ使う
useOnce: true,
```
<!--
#### supports (optional)

* **Type:** `Object`

Optional block extended support features. The following options are supported, and should be specified as a boolean `true` or `false` value:
-->
#### supports (オプション)

* **タイプ:** `Object`

オプションのブロック拡張サポート機能。次のオプションがサポートされており、`true` または `false` のブール値として指定する必要があります。

<!--
- `anchor` (default `false`): Anchors let you link directly to a specific block on a page. This property adds a field to define an id for the block and a button to copy the direct link.

```js
// Add the support for an anchor link.
anchor: true,
```
-->
- `anchor` (デフォルト `false`): アンカーを使用すると、ページ上の特定のブロックに直接リンクできます。このプロパティは、ブロックの ID と直リンクをコピーするボタンを定義するフィールドを追加します。

```js
// アンカーリンクのサポートを追加。
anchor: true,
```

<!--
- `customClassName` (default `true`): This property adds a field to define a custom className for the block's wrapper.

```js
// Remove the support for a the custom className .
customClassName: false,
```
-->
- `customClassName` (デフォルト `true`): このプロパティは、ブロックのラッパーにカスタム className を定義するフィールドを追加します。

```js
// カスタム className のサポートを削除。
customClassName: false,
```

<!--
- `className` (default `true`): By default, Gutenberg adds a class with the form `.wp-block-your-block-name` to the root element of your saved markup. This helps having a consistent mechanism for styling blocks that themes and plugins can rely on. If for whatever reason a class is not desired on the markup, this functionality can be disabled.

```js
// Remove the support for a the generated className .
className: false,
```
-->
- `className` (デフォルト `true`): デフォルトでは、Gutenberg は保存したマークアップのルート要素に `.wp-block-your-block-name` という形式のクラスを追加します。これは、ブロックにスタイルを付けるためにテーマとプラグインが頼りにできる一貫したメカニズムを持たせるのに役立ちます。何らかの理由でマークアップ内のクラスが望ましくない場合、この機能は無効にできます。

```js
// 生成 className のサポートを削除。
className: false,
```

<!--
- `html` (default `true`): By default, Gutenberg will allow a block's markup to be edited individually. To disable this behavior, set `html` to `false`.

```js
// Remove support for an HTML mode.
html: false,
```
-->
- `html` (デフォルト `true`): デフォルトでは、Gutenberg はブロックのマークアップの個別編集を許可しています。この動作を無効にするには、`html` を `false` に設定します。

```js
// HTML モードのサポートを削除。
html: false,
```

<!--
## Edit and Save

The `edit` and `save` functions define the editor interface with which a user would interact, and the markup to be serialized back when a post is saved. They are the heart of how a block operates, so they are [covered separately](https://wordpress.org/gutenberg/handbook/block-edit-save/).
-->
## 編集と保存

`edit` と `save` 機能は、ユーザーがやりとりするエディターのインタフェースと、投稿の保存時にシリアライズされるマークアップを定義します。ブロックがどのように動作するかの核心部分であるため、[別途ドキュメンテーションを用意](https://wordpress.org/gutenberg/handbook/block-edit-save/)しています。
