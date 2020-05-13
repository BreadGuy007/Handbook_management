<!-- 
# Create Block
 -->
# @wordpress/create-block

<!-- 
Create Block is an officially supported way to create blocks for registering a block for a WordPress plugin. It offers a modern build setup with no configuration. It generates PHP, JS, CSS code, and everything else you need to start the project.

It is largely inspired by [create-react-app](https://create-react-app.dev/docs/getting-started). Major kudos to [@gaearon](https://github.com/gaearon), the whole Facebook team, and the React community.
 -->
Create Block は公式がサポートするブロック作成方法で WordPress プラグインを使用してブロックを登録します。モダンなビルド設定を提供し追加の構成は必要ありません。PHP、JS、CSS コード、その他プロジェクトの開始に必要なすべてのファイルを生成します。

Create Block は [create-react-app](https://create-react-app.dev/docs/getting-started) から多大な影響を受けました。称賛を [@gaearon](https://github.com/gaearon)、Facebook チーム全員、そして React コミュニティに。

<!-- 
## Description

Blocks are the fundamental element of the WordPress block editor. They are the primary way in which plugins and themes can register their own functionality and extend the capabilities of the editor.

Visit the [Gutenberg handbook](https://developer.wordpress.org/block-editor/developers/block-api/block-registration/) to learn more about Block API.
 -->
## 説明

WordPress ブロックエディターの基本的な要素は「ブロック」です。ブロックは、プラグインやテーマが自身の機能を登録しエディターの機能を拡張する際に使用されるメインの手段です。

Block API の詳細については [ブロックエディターハンドブック](https://developer.wordpress.org/block-editor/developers/block-api/block-registration/) を参照してください。

<!-- 
## Quick start

![Demo](https://make.wordpress.org/core/files/2020/02/74508276-f0648280-4efe-11ea-9cc0-a607b43d1bcf.gif)

You just need to provide the `slug` which is the target location for scaffolded files and the internal block name.
 -->
## クイックスタート

![デモ](https://make.wordpress.org/core/files/2020/02/74508276-f0648280-4efe-11ea-9cc0-a607b43d1bcf.gif)

ひな形ファイルの保管場所、そして内部のブロック名となる `slug` を指定するだけで十分です。

  ```bash
  $ npm init @wordpress/block todo-list
  $ cd todo-list
  $ npm start
  ```

<!-- 
_(requires `node` version `10.0.0` or above, and `npm` version `6.9.0` or above)_

You don’t need to install or configure tools like [webpack](https://webpack.js.org), [Babel](https://babeljs.io) or [ESLint](https://eslint.org) yourself. They are preconfigured and hidden so that you can focus on the code.
 -->
_(`node` version `10.0.0` 以上、`npm` version `6.9.0` 以上が必要です)_

[webpack](https://webpack.js.org) や [Babel](https://babeljs.io) や [ESLint](https://eslint.org) などのツールをインストールしたり構成する必要はありません。それらは自動的に裏側で構成されるためユーザーはコードに集中できます。

<!-- 
## Usage

The following command generates PHP, JS and CSS code for registering a block.
 -->
## 使用方法

次のコマンドはブロックを登録する PHP、JS、CSS コードを生成します。

```bash
$ npm init @wordpress/block [options] [slug]
```

<!-- 
`[slug]` is optional. When provided it triggers the quick mode where it is used as the block slug used for its identification, the output location for scaffolded files, and the name of the WordPress plugin. The rest of the configuration is set to all default values.
`[slug]` is optional. When provided it triggers the quick mode where it is used as the block slug used for its identification, the output location for scaffolded files, and the name of the WordPress plugin. The rest of the configuration is set to all default values unless overriden with some of the options listed below.

Options:
```
-V, --version                output the version number
-t, --template <name>        block template type name, allowed values: "es5", "esnext" (default: "esnext")
--namespace <value>          internal namespace for the block name
--title <value>              display title for the block
--short-description <value>  short description for the block
--category <name>            category name for the block
-h, --help                   output usage information
```
 -->
`[slug]` はオプションです。指定するとクイックモードとなり、ブロックの slug として識別子、ひな形ファイルの出力先、WordPress プラグインの名前に使用されます。構成の残りは、以下に挙げるオプションで上書きしない限り、すべてデフォルト値が設定されます。

オプション:
```
-V, --version                バージョン番号の出力
-t, --template <name>        テンプレートタイプ名。指定可能な値: "es5", "esnext" (デフォルト: "esnext")
--namespace <value>          ブロック名の内部名前空間
--title <value>              ブロックの表示タイトル
--short-description <value>  ブロックの短い説明
--category <name>            ブロックのカテゴリー名
-h, --help                   使用方法の出力
```

<!-- 
_Please note that `--version` and `--help` options don't work with `npm init`. You have to use `npx` instead, as presented in the examples._

More examples:
 -->
_注意: `--version` と `--help` オプションは `npm init` とは一緒に動作しません。代わりに `npx` を使用する必要があります。例を参照してください。_

サンプル:
<!-- 
1. Interactive mode - it gives a chance to customize a few most important options before the code gets generated.
  ```bash
  $ npm init @wordpress/block
  ```
2. ES5 template – it is also possible to pick ES5 template when you don't want to deal with a build step (`npm start`) which enables ESNext and JSX support.
  ```bash
  $ npm init @wordpress/block --template es5
  ```
3. Help – you need to use `npx` to output usage information.
  ```bash
  $ npx @wordpress/create-block --help
  ```
 -->
1. 対話モード - コードが生成される前に、もっとも重要なオプションのいくつかをカスタマイズする機会が得られます。
  ```bash
  $ npm init @wordpress/block
  ```
2. ES5 テンプレート – ESNext や JSX サポートを有効化するビルド手順 (`npm start`) を実行したくない場合は ES5 テンプレートを選択できます。
  ```bash
  $ npm init @wordpress/block --template es5
  ```
3. ヘルプ – 使用例の情報を出力する場合は `npx` が必要です。
  ```bash
  $ npx @wordpress/create-block --help
  ```
<!-- 
When you scaffold a block, you must provide at least a `slug` name, the `namespace` which usually corresponds to either the `theme` or `plugin` name, and the `category`. In most cases, we recommended pairing blocks with plugins rather than themes, because only using plugin ensures that all blocks still work when your theme changes.
 -->
ブロックのひな形を生成する際、少なくとも `slug` 名、`theme` または `puglin` 名のどちらかと通常は関連する `namespace`、そして `category` を指定する必要があります。多くの場合ブロックは、テーマでなくプラグインとペアにすることを推奨します。プラグインを使用していればテーマを変更されてもすべてのブロックが稼働します。 

<!-- 
## Available Commands

Inside that bootstrapped directory _(it doesn't apply to `es5` template)_, you can run several commands:

```bash
$ npm start
```
Starts the build for development. [Learn more](/packages/scripts#start).

```bash
$ npm run build
```
Builds the code for production. [Learn more](/packages/scripts#build).

```bash
$ npm run format:js
```
Formats JavaScript files. [Learn more](/packages/scripts#format-js).

```bash
$ npm run lint:css
```
Lints CSS files. [Learn more](/packages/scripts#lint-style).

```bash
$ npm run lint:js
```
Lints JavaScript files. [Learn more](/packages/scripts#lint-js).

```bash
$ npm run packages-update
```
Updates WordPress packages to the latest version. [Learn more](/packages/scripts#packages-update).
 -->
## 使用可能なコマンド

作成されたディレクトリの中で _(`es5` テンプレートは除く)_、以下のコマンドを実行できます。
```bash
$ npm start
```
開発用のビルドを開始 [詳細](https://developer.wordpress.org/block-editor/packages/packages-scripts/#start)

```bash
$ npm run build
```
本番用にコアをビルド [詳細](https://developer.wordpress.org/block-editor/packages/packages-scripts/#build)

```bash
$ npm run format:js
```
JavaScript ファイルをフォーマット [詳細](https://developer.wordpress.org/block-editor/packages/scripts#format-js)

```bash
$ npm run lint:css
```
CSS ファイルを lint [詳細](https://developer.wordpress.org/block-editor/packages/scripts#lint-style)

```bash
$ npm run lint:js
```
JavaScript ファイルを lint [詳細](https://developer.wordpress.org/block-editor/packages/scripts#lint-js)

```bash
$ npm run packages-update
```
WordPress パッケージを最新版に更新 [詳細](https://developer.wordpress.org/block-editor/packages/scripts#packages-update)

<!-- 
## WP-CLI

Another way of making a developer’s life easier is to use [WP-CLI](https://wp-cli.org), which provides a command-line interface for many actions you might perform on the WordPress instance. One of the commands `wp scaffold block` was used as the baseline for this tool and ES5 template in particular.
 -->
## WP-CLI

もう1つの開発者をラクにしてくれる方法が [WP-CLI](https://wp-cli.org) です。WP-CLI は WordPress に対する多くの操作をコマンドラインから実行できますが、その中の1つ `wp scaffold block` はこのツール、特に ES5 テンプレートの開始ラインとして使用されました。

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
