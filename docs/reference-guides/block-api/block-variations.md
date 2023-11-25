<!--
# Variations
 -->
# バリエーション

<!-- 
The Block Variations API  allows you to define multiple versions (variations) of a block. A block variation differs from the original block by a set of initial attributes or inner blocks. When you insert the block variation into the Editor, these attributes and/or inner blocks are applied. 
 -->
ブロックバリエーション API を使用すると、ブロックの複数のバージョン (バリエーション) を定義できます。ブロックバリエーションは元のブロックと比べて、初期属性またはインナーブロックのセットが異なります。ブロックバリエーションをエディターに挿入すると、これらの属性やインナーブロックが適用されます。

<!-- 
Variations are an excellent way to create iterations of existing blocks without building entirely new blocks from scratch.
 -->
バリエーションは、既存のブロックに似たブロックを、まったく新規にゼロから作成するのではなく、反復して作成する優れた方法です。

<!-- 
To better understand this API, consider the Embed block. This block contains numerous variations for each type of embeddable content (WordPress, Youtube, etc.). Each Embed block variation shares the same underlying functionality for editing, saving, and so on. Besides the name and descriptive information, the main difference is the `providerNameSlug` attribute. Below is a simplified example of the variations in the Embed block. View the [source code](https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/embed/variations.js) for the complete specification.
 -->
この API の理解のために「埋め込み」ブロックを考えます。このブロックには埋め込み可能なコンテンツの種類 (WordPress、Youtube など) ごとに、多数のバリエーションがあります。それぞれの埋め込みブロックバリエーションは、編集、保存などの基本的な機能を共有します。名前と説明情報の他に、大きな違いが `providerNameSlug` 属性です。以下は、埋め込みブロックバリエーションの簡略化した例です。完全な仕様については[ソースコード](https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/embed/variations.js)を参照してください。

```js
variations: [
	{
		name: 'wordpress',
		title: 'WordPress',
		description: __( 'Embed a WordPress post.' ),
		attributes: { providerNameSlug: 'wordpress' },
	},
	{
		name: 'youtube',
		title: 'YouTube',
		description: __( 'Embed a YouTube video.' ),
		attributes: { providerNameSlug: 'youtube' },
	},
],
```
<!-- 
## Defining a block variation
 -->
## ブロックバリエーションの定義
<!-- 
A block variation is defined by an object that can contain the following fields:
 -->
ブロックバリエーションは、以下のフィールドを含むオブジェクトによって定義されます。

<!-- 
-   `name` (type `string`) – A unique and machine-readable name.
-   `title` (optional, type `string`) – A human-readable variation title.
-   `description` (optional, type `string`) – A human-readable variation description.
-   `category` (optional, type `string`) - A category classification used in search interfaces to arrange block types by category.
-   `keywords` (optional, type `string[]`) - An array of terms (which can be translated) that help users discover the variation while searching.
-   `icon` (optional, type `string` | `Object`) – An icon helping to visualize the variation. It can have the same shape as the block type.
-   `attributes` (optional, type `Object`) – Values that override block attributes.
-   `innerBlocks` (optional, type `Array[]`) – Initial configuration of nested blocks.
-   `example` (optional, type `Object`) – Provides structured data for the block preview. Set to `undefined` to disable the preview. See the [Block Registration API](/docs/reference-guides/block-api/block-registration.md#example-optional) for more details.
-   `scope` (optional, type `WPBlockVariationScope[]`) - Defaults to `block` and `inserter`. The list of scopes where the variation is applicable. Available options include:
	- `block` - Used by blocks to filter specific block variations. `Columns` and `Query` blocks have such variations, which are passed to the [experimental BlockVariationPicker](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-variation-picker/README.md) component. This component handles displaying the variations and allows users to choose one of them.
    -   `inserter` - Block variation is shown on the inserter.
    -   `transform` - Block variation is shown in the component for variation transformations.
-   `isDefault` (optional, type `boolean`) – Defaults to `false`. Indicates whether the current variation is the default one (details below).
-   `isActive` (optional, type `Function|string[]`) - A function or an array of block attributes that is used to determine if the variation is active when the block is selected. The function accepts `blockAttributes` and `variationAttributes` (details below).
 -->
-   `name` (タイプ `string`) – 機械で識別可能な、一意の名前。
-   `title` (オプション、タイプ `string`) – 人間が読める、バリエーションのタイトル。
-   `description` (オプション、タイプ `string`) – 人間が読める、バリエーションの説明。
-   `category` (オプション、タイプ `string`) - カテゴリーの分類。検索インターフェース内で、ブロックタイプのカテゴリーごとの配置に使用される。
-   `keywords` (オプション、タイプ `string[]`) - 翻訳可能なタームの配列。ユーザーがバリエーションを検索しやすくする。
-   `icon` (オプション、タイプ `string` | `Object`) – バリエーションの視覚化を助けるアイコン。ブロックタイプと同じ形でも良い。
-   `attributes` (オプション、タイプ `Object`) – ブロック属性を上書きする値。
-   `innerBlocks` (オプション、タイプ `Array[]`) – ネストしたブロックの初期構成。
-   `example` (オプション、タイプ `Object`) – ブロックプレビューの構造化データを提供する。プレビューを無効化するには、`undefined` を設定する。詳細については [ブロック登録 API](https://ja.wordpress.org/team/handbook/block-editor/reference-guides/block-api/block-registration#example-optional) を参照してください。
-   `scope` (オプション、タイプ `WPBlockVariationScope[]`) - デフォルトは `block` と `inserter` 。バリエーションが適用可能なスコープのリスト。指定可能なオプション:
	- `block` - 特定のブロックバリエーションをフィルタリングするためにブロックで使用される。`Columns` ブロックと `Query` ブロックにそのようなバリエーションがあり、[実験的な BlockVariationPicker](https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-variation-picker/README.md) コンポーネントに渡される。このコンポーネントはバリエーションの表示を処理し、ユーザーはその中から1つを選択できる。
    -   `inserter` - ブロックバリエーションはインサーターに表示される。
    -   `transform` - ブロックバリエーションはブロックバリエーション変換のコンポーネント内で表示される。
-   `isDefault` (オプション、タイプ `boolean`) – デフォルトは `false`。現行のバリエーションがデフォルトかどうかを示す (詳細は後述)。
-   `isActive` (オプション、タイプ `Function|string[]`) - 関数、またはブロック属性の配列。ブロックが選択された際、バリエーションがアクティブかどうかの決定に使用される。関数は `blockAttributes` と `variationAttributes` を取る (詳細は後述)。

<!-- 
<div class="callout callout-info">
	You can technically create a block variation without a unique <code>name</code>, but this is <strong>not</strong> recommended. A unique <code>name</code> allows the Editor to differentiate between your variation and others that may exist. It also allows your variation to be unregistered as needed and has implications for the <code>isDefault</code> settings (details below).
</div>
 -->
メモ: 技術的には一意の <code>name</code> を付けずにブロックバリエーションを作成できますが、これは<strong>推奨されません</strong>。一意な名前をつけることで、エディターはバリエーションを他のバリエーションから区別できます。また、必要に応じてバリエーションを登録解除でき、これは <code>isDefault</code> 設定にも関連します (詳細は後述)。

<!-- 
## Creating a block variation
 -->
## ブロックバリエーションの作成

<!-- 
Block variations can be declared during a block's registration by providing the `variations` key with a proper array of variation objects, as shown in the example above. See the [Block Registration API](/docs/reference-guides/block-api/block-registration.md) for more details.
 -->
ブロックバリエーションはブロックの登録時に宣言できます。上の例のように `variations` キーに適切なバリエーションオブジェクトの配列を指定します。詳細については [ブロック登録 API](https://ja.wordpress.org/team/handbook/block-editor/reference-guides/block-api/block-registration) を参照してください。

<!-- 
To create a variation for an existing block, such as a Core block, use `wp.blocks.registerBlockVariation()`. This function accepts the name of the block and the object defining the variation.
 -->
コアブロックのような既存ブロックにバリエーションを作成するには、`wp.blocks.registerBlockVariation()` を使用します。この関数はブロックの名前と、バリエーションを定義するオブジェクトを取ります。

```js
wp.blocks.registerBlockVariation( 
	'core/embed', 
	{
		name: 'custom-embed',
		attributes: { providerNameSlug: 'custom' },
	}
);
```
<!-- 
## Removing a block variation
 -->
## ブロックバリエーションの削除

<!-- 
Block variations can also be easily removed. To do so, use `wp.blocks.unregisterBlockVariation()`. This function accepts the name of the block and the `name` of the variation that should be unregistered. 
 -->
ブロックバリエーションはまた、簡単に削除できます。それには `wp.blocks.unregisterBlockVariation()` を使用します。この関数はブロックの名前と、登録を解除するバリエーションの `name` を取ります。

```js
wp.blocks.unregisterBlockVariation( 'core/embed', 'youtube' );
```
<!-- 
## Block variations versus block styles
 -->
## ブロックバリエーションとブロックスタイルの比較

<!-- 
The main difference between block styles and block variations is that a block style just applies a CSS class to the block, so it can be styled in an alternative way. See the [Block Styles API](/docs/reference-guides/block-api/block-styles.md) for more details.
 -->
ブロックスタイルとブロックバリエーションの主な違いですが、ブロックスタイルはブロックに CSS クラスを適用するだけです。これはブロックにスタイルを適用する代替の方法です。詳細は[ブロックスタイル API](https://ja.wordpress.org/team/handbook/block-editor/reference-guides/block-api/block-styles/) を参照してください。

<!-- 
If you want to apply initial attributes or inner blocks, this falls into block variation territory. It's also possible to override the default block style using the `className` attribute when defining a block variation.
 -->
一方、初期属性やインナーブロックを適用したければ、ブロックバリエーションの領域になります。また、ブロックバリエーションを定義する際に `className` 属性を使用することで、デフォルトのブロックスタイルを上書きできます。

```js
variations: [
	{
		name: 'blue',
		title: __( 'Blue Quote' ),
		isDefault: true,
		attributes: { 
			color: 'blue', 
			className: 'is-style-blue-quote' 
		},
		icon: 'format-quote',
		isActive: ( blockAttributes, variationAttributes ) =>
			blockAttributes.color === variationAttributes.color
	},
],

```
<!--
It's worth mentioning that setting the `isActive` property can be useful for cases you want to use information from the block variation, after a block's creation. For example, this API is used in `useBlockDisplayInformation` hook to fetch and display proper information on places like the `BlockCard` or `Breadcrumbs` components.
 -->
<!-- 
ヒント: `isActive` プロパティの設定は、ブロック作成後にブロックバリエーションからの情報を使用する場合に有用です。たとえば、`BlockCard` や `Breadcrumbs` コンポーネントのように、この API は `useBlockDisplayInformation` ブック内で使用され、その場で適切な情報を取得し、表示します。
 -->
<!--
Block variations can be declared during a block's registration by providing the `variations` key with a proper array of variations, as defined above. In addition, there are ways to register and unregister a `block variation` for a block, after its registration.
 -->
<!-- 
ブロックバリエーションはブロックの登録の際に、上で見たような `variations` キーと適切なバリエーションの配列を渡すことで宣言できます。また、ブロックの登録後に、`block variation` を登録、登録解除する方法もあります。
 -->
<!--
To add a block variation use `wp.blocks.registerBlockVariation()`.
 -->
<!-- 
ブロックバリエーションを追加するには、`wp.blocks.registerBlockVariation()` を使用してください。
 -->
<!--
_Example:_
 -->
<!-- 
_例:_
 -->

<!-- 
## Using `isDefault`
 -->
## isDefault の使用

<!-- 
By default, all variations will show up in the Inserter in addition to the original block type item. However, setting the `isDefault` flag for any variations listed will override the regular block type in the Inserter. This is a great tool for curating the Editor experience to your specific needs.
 -->
デフォルトでは、すべてのバリエーションは元のブロックタイプのアイテムと共に、インサーターに表示されます。しかし、リストされる任意のバリエーションに `isDefault` フラグを設定すると、インサーターで通常のブロックタイプが上書きされます。これは特定のニーズに合わせてエディター体験を向上する、素晴らしい仕組みです。

<!-- 
For example, if you want Media & Text block to display the image on the right by default, you could create a variation like this: 
 -->
例えば「メディアとテキスト」ブロックで、デフォルトで右側に画像を表示するには、次のようなバリエーションを作成できます。 

```js
 wp.blocks.registerBlockVariation(
	'core/media-text', 
	{
		name: 'media-text-media-right',
		title: __( 'Media & Text' ),
		isDefault: true,
		attributes: { 
			mediaPosition: 'right'
		}
	}
)
```

<!--
To remove a block variation use `wp.blocks.unregisterBlockVariation()`.
 -->
<!-- 
ブロックバリエーションを削除するには、`wp.blocks.unregisterBlockVariation()` を使用してください。
 -->
<!--
_Example:_
 -->
<!-- 
_例:_
 -->

<!-- 
### Caveats to using `isDefault`
 -->
### isDefault を使用する際の注意点

<!-- 
While `isDefault` works great when overriding a block without existing variations, you may run into issues when other variations exist.
 -->
 `isDefault` は、既存のバリエーションが存在しないブロックをオーバーライドする際はうまく機能しますが、他のバリエーションが存在する場合は、問題が発生するかもしれません。

<!-- 
If another variation for the same block uses `isDefault`, your variation will not necessarily become the default. The Editor respects the first registered variation with `isDefault`, which might not be yours.
 -->
同じブロックの別のバリエーションが `isDefault` を使用すると、希望したバリエーションがデフォルトにならないかもしれません。エディターは最初に登録された `isDefault` を持つバリエーションを優先します。

<!-- 
The solution is to unregister the other variation before registering your variation with `isDefault`. This caveat reinforces the recommendation always to provide variations with a unique `name`. Otherwise, the variation cannot be unregistered.
 -->
これを解決するには `isDefault` でバリエーションを登録する前に、他のバリエーションの登録を解除します。この解決策は前述した推奨「バリエーションには常に一意の `name` をつける」を裏付けるものです。一意の名前でなければ、バリエーションを登録解除できません。

<!-- 
## Using `isActive`
 -->
## isActive の使用

<!-- 
While the `isActive` property is optional, you will often want to use it to display information about the block variation after the block has been inserted. For example, this API is used in `useBlockDisplayInformation` hook to fetch and display proper information in places like the `BlockCard` or `Breadcrumbs` components.
 -->
`isActive` プロパティはオプションですが、ブロックが挿入された後にブロックバリエーションに関する情報を表示するために使用したいケースがあります。例えば、`useBlockDisplayInformation` フックはこの API を使用して適切な情報を取得し、`BlockCard` や `Breadcrumbs` コンポーネントなどに、取得した情報を表示します。

<!-- 
If `isActive` is not set, the Editor cannot distinguish between the original block and your variation, so the original block information will be displayed. 
 -->
`isActive` が設定されていなければ、エディターはオリジナルのブロックとバリエーションを区別できず、オリジナルのブロック情報が表示されます。

<!-- 
The property can use either a function or an array of strings (`string[]`). The function accepts `blockAttributes` and `variationAttributes`, which can be used to determine if a variation is active. In the Embed block, the primary differentiator is the `providerNameSlug` attribute, so if you wanted to determine if the YouTube Embed variation was active, you could do something like this: 
 -->
このプロパティには、関数か文字列の配列（`string[]`）を使用できます。関数は `blockAttributes` と `variationAttributes` を取り、バリデーションがアクティブかどうかの決定に使用できます。埋め込みブロックでの主な差別化ポイントは `providerNameSlug` 属性のため、例えば YouTube 埋め込みバリエーションがアクティブかどうかを判断するには、次のようにします。

```
isActive: ( blockAttributes, variationAttributes ) =>
	blockAttributes.providerNameSlug === variationAttributes.providerNameSlug,
```

<!-- 
You can also use a `string[]` to tell which attributes should be compared as a shorthand. Each attribute will be checked and the variation will be active if all of them match. Using the same example of the YouTube Embed variation, the string version would look like this:
 -->
また、`string[]` を使用して、どの属性を比較するかを省略して指定できます。この場合、それぞれの属性がチェックされ、すべての属性が一致した場合にそのバリエーションがアクティブになります。YouTube 埋め込みバリエーションの同じ例を使用すると、文字列バージョンは次のようになります。

```
isActive: [ 'providerNameSlug' ]
```

<!-- 
### Caveats to using `isActive`
 -->
### isActive を使用する際の注意点

<!-- 
The `isActive` property can return false positives if multiple variations exist for a specific block and the `isActive` checks are not specific enough. To demonstrate this, consider the following example:
 -->
`isActive` プロパティは、特定のブロックに複数のバリエーションが存在し、`isActive` チェックが十分にスコープを絞っていないと、偽陽性を返すことがあります。次の例を考えます。

```js
wp.blocks.registerBlockVariation(
	'core/paragraph',
	{
		name: 'paragraph-red',
		title: 'Red Paragraph',
		attributes: {
			textColor: 'vivid-red',
		},
		isActive: [ 'textColor' ],
	}
);

wp.blocks.registerBlockVariation(
	'core/paragraph',
	{
		name: 'paragraph-red-grey',
		title: 'Red/Grey Paragraph',
		attributes: {
			textColor: 'vivid-red',
			backgroundColor: 'cyan-bluish-gray'
		},
		isActive: [ 'textColor', 'backgroundColor' ]
	}
);
```

<!-- 
The `isActive` check on both variations tests the `textColor`, but each variations uses `vivid-red`. Since the `paragraph-red` variation is registered first, once the `paragraph-red-grey` variation is inserted into the Editor, it will have the title `Red Paragraph` instead of `Red/Grey Paragraph`. As soon as the Editor finds a match, it stops checking.
 -->
両方のバリエーションの `isActive` チェックでは `textColor` がテストされますが、それぞれのバリエーションでは `vivid-red` が使用されます。`paragraph-red` バリエーションが最初に登録されるため、`paragraph-red-grey` バリエーションがエディターに挿入されると、タイトルは `Red/Grey Paragraph` ではなく、`Red Paragraph` になります。エディターは一致するものを見つけるとすぐにチェックをやめます。

<!-- 
There have been [discussions](https://github.com/WordPress/gutenberg/issues/41303#issuecomment-1526193087) around how the API can be improved, but as of WordPress 6.3, this remains an issue to watch out for.
 -->
API をどのように改善するかについて[議論](https://github.com/WordPress/gutenberg/issues/41303#issuecomment-1526193087)が行われてきましたが、WordPress 6.3現在、依然として注意すべき問題のままです。

[原文](https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-variations.md)
