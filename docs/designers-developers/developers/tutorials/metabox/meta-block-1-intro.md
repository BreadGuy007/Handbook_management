<!-- 
# Store Post Meta with a Block
 -->
# 投稿メタをブロックで保存

<!-- 
Typically, blocks store their attribute values in the serialised block HTML. However, you can also create a block that saves its attribute values as post meta, which can be accessed programmatically anywhere in your template.

In this short tutorial you will create one of these blocks, which will prompt a user for a single value, and save it as post meta.

For background around the thinking of blocks as the interface, please see the [key concepts section](/docs/architecture/key-concepts.md) of the handbook.

Before starting this tutorial, you will need a plugin to hold your code. Please take a look at the first two steps of [the JavaScript tutorial](/docs/designers-developers/developers/tutorials/javascript/readme.md) for information setting up a plugin.
 -->
一般にブロックは属性の値をシリアライズされたブロック HTML 内に保存します。しかし属性の値を投稿メタとして保存するブロックを作成することもできます。こうすることでテンプレートの任意の場所からプログラム的に値へアクセスできます。

このチュートリアルではユーザーに値の入力を求め投稿メタに保存するブロックを作成します。

ブロックをインターフェースとみなす考え方の背景についてはハンドブックの [プロジェクト概要](https://ja.wordpress.org/team/handbook/block-editor/principles/) を参照してください。

チュートリアルを始める前にコードを囲むプラグインが必要です。プラグインの設定方法の詳細については[JavaScript 入門](https://ja.wordpress.org/team/handbook/block-editor/tutorials/javascript/)の最初の2つのステップを参照してください。

<!-- 
## Table of Contents

1. [Register Meta Field](/docs/designers-developers/developers/tutorials/metabox/meta-block-2-register-meta.md)
2. [Add Meta Block](/docs/designers-developers/developers/tutorials/metabox/meta-block-3-add.md)
3. [Use Post Meta Data](/docs/designers-developers/developers/tutorials/metabox/meta-block-4-use-data.md)
4. [Finishing Touches](/docs/designers-developers/developers/tutorials/metabox/meta-block-5-finishing.md)
 -->
## 目次

1. [データフィールドの登録](https://ja.wordpress.org/team/handbook/block-editor/tutorials/metabox/meta-block-2-register-meta/)
2. [メタブロックの追加](https://ja.wordpress.org/team/handbook/block-editor/tutorials/metabox/meta-block-3-add/)
3. [投稿メタデータの使用 ](https://ja.wordpress.org/team/handbook/block-editor/tutorials/metabox/meta-block-4-use-data/)
4. [最後の仕上げ](https://ja.wordpress.org/team/handbook/block-editor/tutorials/metabox/meta-block-5-finishing/)

[原文](https://github.com/WordPress/gutenberg/blob/master/docs/designers-developers/developers/tutorials/metabox/meta-block-1-intro.md)