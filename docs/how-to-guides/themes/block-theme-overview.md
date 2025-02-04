<!--
# Block-based Themes (Experimental)
-->
<!--
# ブロックベーステーマ (実験レベル)
 -->
<!--
> This is the documentation for the current implementation of block-based themes, also known as Full Site Editing or Block Content Areas. These features are still experimental in the plugin. “Experimental” means this is just an early implementation that is subject to potential drastic and breaking changes in iterations based on feedback from users, contributors and theme authors.
 -->
<!--
> これは現段階での「ブロックベーステーマ」(block-based theme) 実装に関する文書です。「ブロックベーステーマ」は、「フルサイト編集」(Full Site Editing)、または「ブロックコンテントエリア」(Block Content Area) とも呼ばれ、これらの機能はまだプラグインの実験レベルの機能です。ここで「実験レベル」とは早い段階での実装を意味し、ユーザー、コントリビューター、テーマ作成者のフィードバックに基づくイテレーションによっては、大きく互換性を失う形で変更される可能性があります。
 -->
<!--
> Documentation has been shared early to surface what’s being worked on and invite feedback from those experimenting with the APIs. You can provide feedback in the weekly #core-editor chats where the latest progress of this effort will be shared and discussed, or async via Github issues.

**Note:** To use these features, activate a theme that includes a `block-templates/index.html` file. This will signal to the block editor that the theme should use full-site editing features.
 -->
<!--
> 早い段階で文書を共有する理由は、作業の様子を明らかにし、API を利用した実験からフィードバックを得るためです。フィードバックは、最新の進捗を共有、議論している #core-editor 週次ミーティングで行うか、または Github の issue を通して非同期に行えます。

**注意:** この機能を使用するには、`block-templates/index.html` ファイルを含むテーマを有効化してください。テーマはフルサイト編集機能を使用することをブロックエディターに通知します。
 -->
<!--
## What is a block-based theme?
 -->
<!--
## ブロックベーステーマとは何か ?
 -->
<!--
A block-based theme is a WordPress theme with templates entirely composed of blocks so that in addition to the post content of the different post types (pages, posts, ...), the block editor can also be used to edit all areas of the site: headers, footers, sidebars, etc.
 -->
<!--
「ブロックベーステーマ」は、完全にブロックで構成されたテンプレートを持つ WordPress テーマです。「page」「post」など異なる投稿タイプのコンテンツに加え、サイトのすべてのエリア、ヘッダー、フッター、サイドバー等をブロックエディターで編集できます。
 -->
<!--
## What is the structure of a block-based theme?
 -->
<!--
## ブロックベーステーマの構造は ?
 -->
<!--
A very simple block-based theme is structured like so:
 -->
<!--
シンプルなブロックベーステーマは次のような構造になります。
 -->
<!--
# Block Theme
 -->
# ブロックテーマ

<!--
<div class="callout callout-alert">
 -->
<!--
These features are still experimental in the plugin. “Experimental” means this is just an early implementation that is subject to potential drastic and breaking changes in iterations based on feedback from users, contributors and theme authors.
 -->
<!--  
> これらの機能はまだプラグインの実験レベルの機能です。ここで「実験レベル」とは早い段階での実装を意味し、ユーザー、コントリビューター、テーマ作成者のフィードバックに基づくイテレーションによっては、大きく互換性を失う形で変更される可能性があります。
 -->
<!--
Documentation is shared early to surface what’s being worked on and invite feedback from those experimenting with the APIs. You can provide feedback in the weekly #core-editor chats, or #fse-outreach-experiment channels, or async via Github issues.
 -->
<!--  
> 早い段階で文書を共有する理由は、作業の様子を明らかにし、API を利用した実験からフィードバックを得るためです。フィードバックは、#core-editor チャット、#fse-outreach-experiment チャンネル、または Github の issue を通して非同期に行えます。
 -->
<!-- 
These features are part of the full site editing project releasing in WordPress 5.9. You can provide feedback in the weekly #core-editor chats, or #fse-outreach-experiment channels, or async using GitHub issues.
 -->
<!--  
> これらの機能は、WordPress 5.9でリリースされるフルサイト編集プロジェクトの一部です。フィードバックは、毎週開催される #core-editor チャットや #fse-outreach-experiment チャンネル、または GitHub issues を使って非同期的に行うことができます。
 -->
<!--
</div>
 -->
<!--  
These features are experimental and part of the Gutenberg plugin.
For block theme features supported by WordPress 5.9 see the [Theme Developer Handbook](https://developer.wordpress.org/themes/block-themes/).
 -->

*(2022/5/2) 訳注: この文書の大部分は、[Theme Developer Handbook](https://developer.wordpress.org/themes/block-themes/) に移動されました。便宜上、しばらく掲載しますが、最新の情報については、[Theme Developer Handbook](https://developer.wordpress.org/themes/block-themes/) を参照してください。*


これらの機能は実験的なものであり、Gutenberg プラグインの一部です。
WordPress 5.9でサポートされるブロックテーマの機能については、[Theme Developer Handbook](https://developer.wordpress.org/themes/block-themes/) を参照してください。

<!-- 
You can provide feedback in the weekly #core-editor chats, or #fse-outreach-experiment channels, or async using GitHub issues.
 -->
フィードバックは、毎週開催される #core-editor チャットや #fse-outreach-experiment チャンネル、または GitHub issues を使って非同期的に行うことができます。

<!--
## What is a block theme?
 -->
## ブロックテーマとは何か ?

<!--
A block theme is a WordPress theme with templates entirely composed of blocks so that in addition to the post content of the different post types (pages, posts, ...), the block editor can also be used to edit all areas of the site: headers, footers, sidebars, etc.
 -->
「ブロックテーマ」は WordPress テーマの一種で、完全にブロックで構成されたテンプレートを持ちます。「page」や「post」などの異なる投稿タイプのコンテンツに加え、サイトのすべてのエリア、ヘッダー、フッター、サイドバー等をブロックエディターで編集できます。

<!-- 
## Global styles presets
 -->
## グローバルスタイルプリセット

<!-- 
In addition to the default theme.json file, Block Themes can define multiple global styles presets for users to pick from. For example, a theme author might provide multiple theme color variations for the theme.
 -->
ブロックテーマは、デフォルトの theme.json ファイルに加えて、複数のグローバルスタイルプリセットを定義でき、ユーザーはここから選択できます。たとえば、テーマ作成者は、テーマのカラーバリエーションを複数提供できます。

<!-- 
To provide a global styles preset, themes can add multiple JSON files inside their `/styles` folder. Each one of these JSON file is a mini theme.json file containing `styles` and/or `settings` that overrides any of the default `theme.json` file settings or styles.
 -->
グローバルスタイルプリセットを提供するには、テーマは `/styles` フォルダに複数の JSON ファイルを追加します。各 JSON ファイルは、小さな theme.json ファイルで、`styles` や `settings` を含み、デフォルトの `theme.json` ファイルの設定やスタイルをオーバーライドします。

<!-- 
**Example**
 -->
**例**

```json
// styles/red.json
{
	styles: {
		colors: {
			text: 'red',
			background: 'white'
		}
	}
}
```

```json
// styles/dark.json
{
	styles: {
		colors: {
			text: 'white',
			background: 'black'
		}
	}
}
```

<hr />

## 2022/5/2 以前の情報

*(2022/5/2) 訳注: これ以降の文書は、[Theme Developer Handbook](https://developer.wordpress.org/themes/block-themes/) に移動されました。便宜上、しばらく掲載しますが、最新の情報については、[Theme Developer Handbook](https://developer.wordpress.org/themes/block-themes/) を参照してください。*

<!--
## What is the structure of a block theme?
 -->
## ブロックテーマの構造は ?

<!--
A very simple block theme is structured like so:
 -->
非常にシンプルなブロックテーマは次のような構造です。

```
theme
|__ style.css
|__ theme.json
|__ functions.php
|__ templates
    |__ index.html
    |__ single.html
    |__ archive.html
    |__ ...
|__ parts
    |__ header.html
    |__ footer.html
    |__ sidebar.html
    |__ ...
|__ styles
    |__ red.json
    |__ blue.json
    |__ ...
```

<!--
The difference with existing WordPress themes is that the different templates in the template hierarchy, and template parts, are block templates instead of php files. In addition, this example includes a [`theme.json`](/docs/how-to-guides/themes/theme-json.md) file for some styles.
 -->
既存の WordPress テーマと異なり、テンプレート階層内の異なるテンプレート、およびテンプレートパーツは、これまでの PHP ファイルでなく、「ブロックテンプレート」です。更にこの例では、いくつかのスタイル設定に [`theme.json`](https://ja.wordpress.org/team/handbook/block-editor/how-to-guides/themes/theme-json/) ファイルを含みます。

<!--
## What is a block template?
 -->
## ブロックテンプレートとは何か ?

<!--
A block template is made up of a list of blocks. Any WordPress block can be used in a template. Templates can also reuse parts of their content using "Template Parts". For example, all the block templates can have the same header included from a separate `header.html` template part.

Here's an example of a block template:
 -->
「ブロックテンプレート」は、一連のブロックから構成されます。ブロックテンプレート内では、あらゆる WordPress ブロックを使用できます。また、テンプレートは、「テンプレートパーツ」を使用してコンテンツの一部を再利用できます。たとえば、すべてのブロックテンプレートに、個別のテンプレートパート `header.html` から同じヘッダーを含めることができます。

以下はブロックテンプレートの例です:

```html
<!-- wp:site-title /-->

<!-- wp:image {"sizeSlug":"large"} -->
<figure class="wp-block-image size-large">
	<img src="https://cldup.com/0BNcqkoMdq.jpg" alt="" />
</figure>
<!-- /wp:image -->

<!-- wp:group -->
<div class="wp-block-group">
	<!-- wp:post-title /-->
	<!-- wp:post-content /-->
</div>
<!-- /wp:group -->

<!-- wp:group -->
<div class="wp-block-group">
	<!-- wp:heading -->
	<h2>Footer</h2>
	<!-- /wp:heading -->
</div>
<!-- /wp:group -->
```
<!--
## How to write and edit these templates?
 -->
## テンプレートの書き方と編集方法は ?

<!--
Ultimately, any WordPress user with the correct capabilities (example: `administrator` WordPress role) will be able to access these templates in the WordPress admin, edit them in dedicated views and potentially export them as a theme.
 -->
最終的には、適切な権限、例えば管理者権限を持つすべての WordPress ユーザーが管理画面からテンプレートにアクセスし、専用のビューで編集し、テーマとしてエクスポートできるようになります。

<!--
As of Gutenberg 8.5, there are two ways to create and edit templates within Gutenberg.
 -->
Gutenberg 8.5 では Gutenberg 内でテンプレートを作成し編集する方法が2つあります。

<!--
この文書を書いている段階の現在のイテレーションでは、「外観」下の一時的な管理メニュー「Templates」 wp-admin/edit.php?post_type=wp_template に移動してテンプレートを編集できます。

編集を終えたら、「コードエディター」モードに切り替え、テンプレートの HTML をコピーして、テーマディレクトリ内の正しいファイルに貼り付けます。
 -->

<!--
### Edit templates within The "Appearance" section of WP-Admin
-->
### 管理画面の「外観」セクションでのテンプレートの編集

<!--
You can navigate to the temporary "Templates" admin menu under "Appearance" `wp-admin/edit.php?post_type=wp_template` and use this as a playground to edit your templates. Add blocks here and switch to the code editor mode to grab the HTML of the template when you are done. Afterwards, you can paste that markup into a file in your theme directory.

Please note that the "Templates" admin menu under "Appearance" will _not_ list templates that are bundled with your theme. It only lists new templates created by the specific WordPress site you're working on.
 -->
「外観」の下の一時的な管理メニュー「テンプレート」`wp-admin/edit.php?post_type=wp_template` ではテンプレートの編集を試すことができます。ここにブロックを追加していき、最後にコードエディターモードに切り替えてテンプレートの HTML を取得します。テーマディレクトリ内のファイルにこのマークアップを貼り付けることができます。

注意: 管理画面の「外観」->「テンプレート」メニューは、テーマに同梱されたテンプレートを **表示しません**。動作中の WordPress サイトで作成された新しいテンプレートを表示するだけです。

<!--
### Edit Templates within the Full-site Editor
 -->
### フルサイトエディター内でのテンプレートの編集

<!--
To begin, create a blank template file within your theme. For example: `mytheme/templates/index.html`. Afterwards, open the Full-site editor. Your new template should appear as the active template, and should be blank. Add blocks as you normally would using Gutenberg. You can add and create template parts directly using the "Template Parts" block.

Repeat for any additional templates you'd like to bundle with your theme.
 -->
まずテーマ内にブランクのテンプレートファイルを作成してください。たとえば `mytheme/templates/index.html` です。次にフルサイトエディターを開きます。新しいテンプレートがアクティブテンプレートとして表示されますが、ブランクのはずです。そこに Gutenberg を普通使うようにしてブロックを追加します。「テンプレートパーツ」ブロックを使用して直接テンプレートパーツを追加、作成できます。

これをテーマにバンドルする追加テンプレートの分、繰り返します。

<!--
When you're done, click the "Export Theme" option in the "Tools" (ellipsis) menu of the site editor. This will provide you with a ZIP download of all the templates and template parts you've created in the site editor. These new HTML files can be placed directly into your theme.

Note that when you export template parts this way, the template part block markup will include a `postID` attribute that can be safely removed when distributing your theme.
 -->
完了後はサイトエディター右サイドバーの「ツール」メニューの「テーマのエクスポート」オプションをクリックしてください。サイトエディターで作成したすべてのテンプレートとテンプレートパーツが ZIP でダウンロードされます。これらの新しい HTML ファイルは直接テーマ内に置くことができます。

注意: この方法でテンプレートパーツをエクスポートするとテンプレートパーツブロックマークアップには `postID` 属性が含まれますが、これはテーマを配布する際に安全に削除できます。

<!--
## Templates CPT
 -->
## テンプレートカスタム投稿タイプ
<!--
If you save the templates directly from the temporary Templates admin menu, you'll be able to override your theme's templates.

Example: By using **single** as the title for your template and saving it, this saved template will take precedence over your theme's `single.html` file.
 -->
管理画面の一時的なメニュー「テンプレート」から直接テンプレートを保存すると、テーマのテンプレートを上書きできます。

例: テンプレートのタイトルに「single」を使用して保存すると、保存されたテンプレートはテーマの `single.html` ファイルよりも優先されます。

<!--
Note that it won't take precedence over any of your theme's templates with higher specificity in the template hierarchy. Resolution goes from most to least specific, looking first for a CPT post and then for a theme template, at each level.
 -->
注意: テンプレート階層で高位にあるテーマのテンプレートには優先しません。テンプレート解決は、詳細なテンプレートから簡単なテンプレートへ、各レベルで、まずカスタム投稿タイプの投稿、次にテーマテンプレートを探します。

<!--
## Theme Blocks
 -->
## テーマブロック

<!--
Some blocks have been made specifically for block themes. For example, you'll most likely use the **Site Title** block in your site's header while your **single** block template will most likely include a **Post Title** and a **Post Content** block.

As we're still early in the process, the number of blocks specifically dedicated to these block templates is relatively small but more will be added as we move forward with the project. As of Gutenberg 8.5, the following blocks are currently available:
-->
ブロックテーマ専用のブロックがいくつかあります。たとえばサイトのヘッダーでは「サイトタイトル」ブロックを使用できます。「単一」ブロックテンプレートでは「投稿タイトル」ブロックや「投稿コンテンツ」ブロックを含めることができます。

まだプロジェクトの初期段階のため、ブロックテンプレートに特化したブロックの数は少なめですが、プロジェクトが進むに連れ、ブロックの数は増えていくはずです。Gutenberg 8.5 では以下のブロックが利用可能です。

-   Site Title
-   Template Part
-   Query
-   Query Loop
-   Query Pagination
-   Pattern
-   Post Title
-   Post Content
-   Post Author
-   Post Comment
-   Post Comment Author
-   Post Comment Date
-   Post Comments
-   Post Comments Count
-   Post Comments Form
-   Post Date
-   Post Excerpt
-   Post Featured Image
-   Post Hierarchical Terms
-   Post Tags

<!--
## Styling
 -->
## スタイリング

<!--
One of the most important aspects of themes (if not the most important) is the styling. While initially you'll be able to provide styles and enqueue them using the same hooks themes have always used, the [Global Styles](/docs/how-to-guides/themes/theme-json.md) effort will provide a scaffolding for adding many theme styles in the future.
 -->
テーマのもっとも重要な要素の1つ、あるいはテーマのもっとも重要な要素は、スタイリングです。当分の間は、準備したスタイルを、テーマが通常行うのと同じフックを使用してエンキューできますが、将来的には開発中の「[グローバルスタイル](https://ja.wordpress.org/team/handbook/block-editor/how-to-guides/themes/theme-json/)」で多くのテーマスタイルを追加するひな形が提供される予定です。

<!-- 
## Internationalization (i18n)
 -->
## 国際化 (i18n)

<!-- 
A pattern block can be used to insert translatable content inside a block template. Since those files are php-based, there is a mechanism to mark strings for translation or supply dynamic URLs.
 -->
パターンブロックを使用して、ブロックテンプレート内に翻訳可能なコンテンツを挿入できます。このファイルは PHP ベースのため、翻訳用に文字列をマークしたり、動的なURLを提供する仕組みがあります。

<!-- 
#### Example

Register a pattern:
 -->
#### 例

パターンを登録します。 

```php
<?php
register_block_pattern(
	'myblocktheme/wordpress-credit',
	array(
		'title'      => __( 'Wordpress credit', 'myblocktheme' ),
		'content'    => '
						<!-- wp:paragraph -->
						<p>' .
						sprintf(
							/* Translators: WordPress link. */
							esc_html__( 'Proudly Powered by %s', 'myblocktheme' ),
							'<a href="' . esc_url( __( 'https://wordpress.org', 'myblocktheme' ) ) . '" rel="nofollow">WordPress</a>'
						) . '</p>
						<!-- /wp:paragraph -->',
		'inserter'   => false
	)
);
```
<!-- 
Load the pattern in a template or template part:
 -->
テンプレート、またはテンプレートパーツ内にパターンをロードします。

```html
<!-- wp:group -->
<div class="wp-block-group">
	<!-- wp:pattern {"slug":"myblocktheme/wordpress-credit"} /-->
</div>
<!-- /wp:group -->
```

<!-- 
You can read more about [internationalization in WordPress here](https://developer.wordpress.org/apis/handbook/internationalization/).
 -->
詳細については [WordPress の国際化](https://developer.wordpress.org/apis/handbook/internationalization/) を参照してください。

<!--
## Classic Themes
 -->
## クラシックテーマ

<!--
Users of classic themes can also build custom block templates and use them in their Pages and Custom Post Types that support Page Templates.
 -->
クラシックテーマのユーザーもカスタムブロックテンプレートを構築し、ページテンプレートをサポートする固定ページやカスタム投稿タイプで使用できます。

<!--
Theme authors can opt-out of this feature by removing the `block-templates` theme support in their `functions.php` file.
 -->
テーマ作者がこの機能をオプトアウトするには、`functions.php` ファイルで `block-templates` テーマサポートを削除してください。

```php
remove_theme_support( 'block-templates' );
```
<!-- 
## Accessibility
 -->
## アクセシビリティ

<!-- 
A [skip to content link](https://make.wordpress.org/accessibility/handbook/markup/skip-links/) is automatically added on the front of the website when a webpage includes a `<main>` HTML element.
The skip link points to the `<main>`.
 -->
ウェブページに HTML 要素 `<main>` が含まれている場合、[コンテンツへスキップするリンク](https://make.wordpress.org/accessibility/handbook/markup/skip-links/)が、自動的にウェブサイトの前に追加されます。
スキップリンクは `<main>` を指します。

<!-- 
The group, template part, and query blocks can be changed to use `<main>`. You can find the setting to change the HTML element in the block settings sidebar under Advanced.
 -->
グループブロック、テンプレートパーツ、クエリーブロックは、`<main>`を使用するように変更できます。HTML 要素を変更する設定は、ブロック設定サイドバーの「詳細設定」で確認できます。

<!--
## Resources

-   [Full Site Editing](https://github.com/WordPress/gutenberg/labels/%5BFeature%5D%20Full%20Site%20Editing) label.
-   [Theme Experiments](https://github.com/WordPress/theme-experiments) repository, full of block theme examples created by the WordPress community.
-->
## リソース

-   [Full Site Editing](https://github.com/WordPress/gutenberg/labels/%5BFeature%5D%20Full%20Site%20Editing) ラベル
-   [Theme Experiments](https://github.com/WordPress/theme-experiments) コミュニティで作成されたブロックテーマテンプレート用のリポジトリ

[原文](https://github.com/WordPress/gutenberg/blob/trunk/docs/how-to-guides/themes/block-theme-overview.md)
