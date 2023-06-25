<!--
# Create a Block Tutorial
 -->
# ブロックの作成チュートリアル

<!--
Let's get you started creating your first block for the WordPress Block Editor. We will create a simple block that allows the user to type a message and style it.

The tutorial includes setting up your development environment, tools, and getting comfortable with the new development model. If you are already comfortable, try the quick start below, otherwise step through whatever part of the tutorial you need.
 -->
WordPress ブロックエディター用の、はじめてのブロックを作成します。シンプルなブロックですがユーザーはメッセージを入力し、スタイリングできます。

このチュートリアルには、開発環境とツールのセットアップの他に、新しい開発モデルに親しむという目的も含まれています。すでに経験のある方は以下のクイックスタートを試すか、必要な箇所にジャンプしてください。

<!--
## Prerequisites
 -->
## 前提ソフトウエア

<!--
The first thing you need is a development environment and tools. This includes setting up your WordPress environment, Node, NPM, and your code editor. If you need help, see the [setting up your development environment documentation](/docs/getting-started/devenv/README.md).
 -->
最初に開発環境とツールが必要です。これには WordPress 環境、Node、NPM、コードエディターが含まれます。詳細は [開発環境のセットアップドキュメント](https://ja.wordpress.org/team/handbook/block-editor/getting-started/devenv/) を参照してください。

<!--
## Quick Start
 -->
## クイックスタート
<!--
The `@wordpress/create-block` package exists to create the necessary block scaffolding to get you started. See [create-block package documentation](https://www.npmjs.com/package/@wordpress/create-block) for additional features. This quick start assumes you have a development environment with node installed, and a WordPress site.

From your plugins directory, to create your block run:
 -->
`@wordpress/create-block` パッケージはブロックを作成する際に必要なブロックのひな形を作成します。詳細については [create-block パッケージのドキュメント](https://ja.wordpress.org/team/handbook/block-editor/reference-guides/packages/packages-create-block/)を参照してください。このクイックスタートでは node や WordPress サイトを含む開発環境があることを仮定します。

プラグイン用ディレクトリで次のコマンド実行してブロックを作成します。

```sh
npx @wordpress/create-block gutenpride --template @wordpress/create-block-tutorial-template
```
<!-- 
> Remember that you should use Node.js v14. Other versions may result in an error in the terminal. See [Node Development Tools](https://developer.wordpress.org/block-editor/getting-started/devenv/#node-development-tools) for more info.
 -->
注意: Node.js v14 が必要です。その他のバージョンではターミナルにエラーが出力される場合があります。詳細については [Node 開発ツール](https://developer.wordpress.org/block-editor/getting-started/devenv/#node-development-tools)を参照してください。

<!--
The [npx command](https://docs.npmjs.com/cli/v8/commands/npx) runs a command from a remote package, in this case our create-block package that will create a new directory called `gutenpride`, installs the necessary files, and builds the block plugin. If you want an interactive mode that prompts you for details, run the command without the `gutenpride` name.

You now need to activate the plugin from inside wp-admin plugins page.

After activation, go to the block editor and use the inserter to search and add your new block.
 -->
[npx コマンド](https://docs.npmjs.com/cli/v8/commands/npx)は、リモートパッケージからコマンドを実行します。この場合、create-block パッケージは新しいディレクトリ `gutenpride` を作成し、必要なファイルをインストールし、ブロックプラグインをビルドします。対話モードを使用して詳細を1つずつ指定するには、「`gutenpride`」を指定せずに、コマンドを実行してください。

管理画面のプラグインページでプラグインを有効化します。

有効化後、ブロックエディターを開き、インサーターを使用して新しいブロックを検索し、追加してください。

<!--
## Table of Contents
 -->
## 目次
<!--
The create a block tutorials breaks down to the following sections.

1. [WordPress Plugin](/docs/getting-started/create-block/wp-plugin.md)
2. [Anatomy of a Gutenberg Block ](/docs/getting-started/create-block/block-anatomy.md)
3. [Block Attributes](/docs/getting-started/create-block/attributes.md)
4. [Code Implementation](/docs/getting-started/create-block/block-code.md)
5. [Authoring Experience](/docs/getting-started/create-block/author-experience.md)
6. [Finishing Touches](/docs/getting-started/create-block/finishing.md)
7. [Share your Block with the World](/docs/getting-started/create-block/submitting-to-block-directory.md)
 -->
「ブロックの作成 チュートリアル」は以下のセクションに分かれます。

1. [WordPress プラグイン](https://ja.wordpress.org/team/handbook/block-editor/getting-started/create-block/wp-plugin/)
2. [Gutenberg Block の詳細](https://ja.wordpress.org/team/handbook/block-editor/getting-started/create-block/block-anatomy/)
3. [ブロックの属性](https://ja.wordpress.org/team/handbook/block-editor/getting-started/create-block/attributes/)
4. [コードの実装](https://ja.wordpress.org/team/handbook/block-editor/getting-started/create-block/block-code/)
5. [執筆エクスペリエンス](https://ja.wordpress.org/team/handbook/block-editor/getting-started/create-block/author-experience/)
6. [最後の仕上げ](https://ja.wordpress.org/team/handbook/block-editor/getting-started/create-block/finishing/)
7. [ブロックの共有](https://ja.wordpress.org/team/handbook/block-editor/getting-started/create-block/submitting-to-block-directory/)

[原文](https://github.com/WordPress/gutenberg/blob/trunk/docs/getting-started/create-block/README.md)
