<!--
# How-to Guides
 -->
# 開発ガイド

<!--
The new editor is highly flexible, like most of WordPress. You can build custom blocks, modify the editor's appearance, add special plugins, and much more.
-->
新しいエディターは WordPress と同様に、非常にフレキシブルです。カスタムブロックを作成したり、エディターの外観を変更したり、特別なプラグインを追加することができます。

<!--
## Creating Blocks

The editor is about blocks, and the main extensibility API is the Block API. It allows you to create your own static blocks, [Dynamic Blocks](/docs/how-to-guides/block-tutorial/creating-dynamic-blocks.md) ( rendered on the server ) and also blocks capable of saving data to Post Meta for more structured content.

If you want to learn more about block creation, see the [Create a Block tutorial](/docs/getting-started/create-block/README.md) for the best place to start.
-->
## ブロックの作成

エディターは「ブロック」であり、主な拡張 API は「ブロック API」です。ブロック API を使用してユーザーは静的ブロックやサーバー側でレンダリングされる[ダイナミックブロック](https://ja.wordpress.org/team/handbook/block-editor/how-to-guides/block-tutorial/creating-dynamic-blocks/)を作成できます。またブロックは構造化されたコンテンツのため投稿メタにデータを保存できます。

ブロックの作成について学習するには、まずはじめに [ブロックの作成 チュートリアル](https://ja.wordpress.org/team/handbook/block-editor/getting-started/create-block/) を参照してください。

<!--
## Extending Blocks

It is also possible to modify the behavior of existing blocks or even remove them completely using filters.

Learn more in the [Block Filters](/docs/reference-guides/filters/block-filters.md) section.
-->
## ブロックの拡張

フィルターを使用しても、既存のブロックの振る舞いを変更したり、完全に削除できます。

詳細は [ブロックフィルター](https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/filters/block-filters.md) セクションを参照してください。

<!-- 
Specifically for `Query Loop` block, besides the available filters, there are more ways to extend it and create bespoke versions of it. Learn more in the [Extending the Query Loop block](/docs/how-to-guides/block-tutorial/extending-the-query-loop-block.md) section.
 -->
特に「クエリループ」ブロックについては、利用可能なフィルター以外にも、ブロックの拡張やオーダーメイドのバージョンを作成する方法があります。詳細は、[クエリループブロックの拡張](https://ja.wordpress.org/team/handbook/block-editor/how-to-guides/block-tutorial/extending-the-query-loop-block/) セクションを参照してください。

<!--
## Extending the Editor UI

Extending the editor UI can be accomplished with the `registerPlugin` API, allowing you to define all your plugin's UI elements in one place.

Refer to the [Plugins](/packages/plugins/README.md) and [Edit Post](/packages/edit-post/README.md) section for more information.

You can also filter certain aspects of the editor; this is documented on the [Editor Filters](/docs/reference-guides/filters/editor-filters.md) page.
-->
## エディター UI の拡張

エディター UI の拡張は `registerPlugin` API で可能です。すべてのプラグインの UI 要素を1箇所で定義できます。

詳細については [Plugins](https://github.com/WordPress/gutenberg/blob/trunk/packages/plugins/README.md) および [Edit Post](https://github.com/WordPress/gutenberg/tree/trunk/packages/edit-post) セクションを参照してください。

エディターのいくつかの部分はフィルタリングできます。詳細については [Editor Filters](https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/filters/editor-filters.md) ページを参照してください。

<!--
## Meta Boxes

Porting PHP meta boxes to blocks or sidebar plugins is highly encouraged, learn how in the [meta box](/docs/how-to-guides/metabox.md) and [sidebar plugin](/docs/how-to-guides/plugin-sidebar-0.md) guides.
-->
## メタボックス

PHP メタボックスからブロックやサイドバープラグインへのポーティングは強く奨励されます。詳細については [メタボックス](https://ja.wordpress.org/team/handbook/block-editor/how-to-guides/metabox/) および [プラグイン用サイドバー](https://ja.wordpress.org/team/handbook/block-editor/how-to-guides/plugin-sidebar-0/) を参照してください。

<!--
## Theme Support

By default, blocks provide their styles to enable basic support for blocks in themes without any change. Themes can add/override these styles, or rely on defaults.

There are some advanced block features which require opt-in support in the theme. See [theme support](/docs/how-to-guides/themes/theme-support.md) and [how to filter global styles](/docs/reference-guides/filters/global-styles-filters.md).
-->
## テーマサポート

ブロックにはデフォルトでスタイルが提供され、カスタマイズなしでもテーマ内で適切に表示されます。テーマはこのスタイルを追加したり上書きしたり、あるいはデフォルトのままにしておくことができます。

テーマ内でのオプトインサポートが必要な高度なブロック機能があります。[テーマサポート](https://ja.wordpress.org/team/handbook/block-editor/how-to-guides/themes/theme-support/) と [グローバルスタイルをフィルターする方法](https://developer.wordpress.org/block-editor/reference-guides/filters/global-styles-filters/)を参照してください。

<!--
## Autocomplete

Autocompleters within blocks may be extended and overridden. Learn more about the [autocomplete](/docs/reference-guides/filters/autocomplete-filters.md) filters.
-->
## オートコンプリート

ブロック内のオートコンプリートは拡張したり、上書きできます。詳細については [Autocomplete](https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/filters/autocomplete-filters.md) フィルターを参照してください。

<!--
## Block Parsing and Serialization

Posts in the editor move through a couple of different stages between being stored in `post_content` and appearing in the editor. Since the blocks themselves are data structures that live in memory it takes a parsing and serialization step to transform out from and into the stored format in the database.

Customizing the parser is an advanced topic that you can learn more about in the [Extending the Parser](/docs/reference-guides/filters/parser-filters.md) section.
-->
## ブロックのパースとシリアライゼーション

エディター内のテキストは、`post_content` への保存とエディターでの表示との間でいくつかの異なるステージを経由します。ブロック自体はメモリー内に存在するデータ構造のため、データベース内の保存形式との間でパースやシリアライゼーションが必要です。

パーサーのカスタマイズは高度なトピックになります。詳細については [パーサーの拡張](https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/filters/parser-filters.md) セクションを参照してください。

[原文](https://github.com/WordPress/gutenberg/blob/trunk/docs/how-to-guides/README.md)
