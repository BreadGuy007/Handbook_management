<!--
# `wp-env`

`wp-env` lets you easily set up a local WordPress environment for building and testing plugins and themes. It's simple to install and requires no configuration.

## Quick (tl;dr) instructions

Ensure that Docker is running, then:
 -->
# `@wordpress/env`

`wp-env` を使用してプラグインやテーマのビルド用とテスト用の WordPress ローカル環境を簡単にセットアップできます。シンプルにインストールできて構成する必要もありません。

## クイック (tl;dr) インストラクション

Docker が動作していることを確認し、以下のコマンドを実行してください。

```sh
$ cd /path/to/a/wordpress/plugin
$ npm -g i @wordpress/env
$ wp-env start
```

<!--
The local environment will be available at http://localhost:8888 (Username: `admin`, Password: `password`).

## Prerequisites

`wp-env` requires Docker to be installed. There are instructions available for installing Docker on [Windows 10 Pro](https://docs.docker.com/docker-for-windows/install/), [all other versions of Windows](https://docs.docker.com/toolbox/toolbox_install_windows/), [macOS](https://docs.docker.com/docker-for-mac/install/), and [Linux](https://docs.docker.com/v17.12/install/linux/docker-ce/ubuntu/#install-using-the-convenience-script).

Node.js and NPM are required. The latest LTS version of Node.js is used to develop `wp-env` and is recommended.
 -->
http://localhost:8888 (ユーザー名: `admin`、パスワード: `password`) でローカル環境が利用できます。

## 前提ソフトウエア

`wp-env` を使用するにはまず Docker をインストールしてください。インストールの詳細については以下の OS ごとのドキュメントを参照してください。[Windows 10 Pro](https://docs.docker.com/docker-for-windows/install/)、[Windows の他のバージョン](https://docs.docker.com/toolbox/toolbox_install_windows/), [macOS](https://docs.docker.com/docker-for-mac/install/)、[Linux](https://docs.docker.com/v17.12/install/linux/docker-ce/ubuntu/#install-using-the-convenience-script)

Node.js と NPM も必要です。`wp-env` の開発には最新の LTS バージョンの Node.js を使用しているため、これを推奨します。

<!--
## Installation

### Installation as a global package

After confirming that the prerequisites are installed, you can install `wp-env` globally like so:
 -->
## インストール

### グローバルパッケージとしてのインストール

前提ソフトウエアをインストールを確認できたら、グローバルに `wp-env` をインストールできます。

```sh
$ npm -g i @wordpress/env
```
<!--
You're now ready to use `wp-env`!
-->
これで `wp-env` を使うことができます !

<!--
### Installation as a local package

If your project already has a package.json, it's also possible to use `wp-env` as a local package. First install `wp-env` locally as a dev dependency:
 -->
### ローカルパッケージとしてのインストール

プロジェクトにすでに package.json がある場合、`wp-env` をローカルパッケージとして使用することもできます。まず `wp-env` を開発依存としてローカルにインストールします。

```sh
$ npm i @wordpress/env --save-dev
```
<!--
Then modify your package.json and add an extra command to npm `scripts` (https://docs.npmjs.com/misc/scripts):
 -->
次に package.json を変更し、npm `scripts` (https://docs.npmjs.com/misc/scripts) にコマンドを追加します。

```json
"scripts": {
	"wp-env": "wp-env"
}
```
<!--
When installing `wp-env` in this way, all `wp-env` commands detailed in these docs must be prefixed with `npm run`, for example:
 -->
この方法で `wp-env` をインストールした場合、この文書で説明するすべての `wp-env` コマンドの前に `npm run` を追加してください。たとえば

<!--
```sh
# You must add another double dash to pass the "update" flag to wp-env
$ npm run wp-env start -- --update
```
 -->
```sh
# wp-env に "update" を渡すには別の二重ダッシュ(-)を追加する必要があります。
$ npm run wp-env start -- --update
```

<!--
instead of:
 -->
と実行します。以後は次のような形式のみ記述します。

```sh
$ wp-env start --update
```
<!--
## Usage

### Starting the environment

First, ensure that Docker is running. You can do this by clicking on the Docker icon in the system tray or menu bar.

Then, change to a directory that contains a WordPress plugin or theme:
 -->
## 使用方法

### 環境の開始

まず Docker が実行されていることを確認してください。確認するにはシステムトレイ、またはメニューバーの Docker アイコンをクリックします。

次に WordPress プラグインやテーマを含むディレクトリーに移動してください。

```sh
$ cd ~/gutenberg
```
<!--
Then, start the local environment:
 -->
ローカル環境を開始します。

```sh
$ wp-env start
```
<!--
Finally, navigate to http://localhost:8888 in your web browser to see WordPress running with the local WordPress plugin or theme running and activated. Default login credentials are username: `admin` password: `password`.

### Stopping the environment

To stop the local environment:
 -->
Web ブラウザーで http://localhost:8888 を開きます。ローカルのプラグインやテーマがインストール、有効化された状態で WordPress が表示されます。デフォルトのログインアカウントはユーザー名 `admin`、パスワード `password` です。

### 環境の停止

ローカル環境を停止するには以下を実行します。

```sh
$ wp-env stop
```

<!--
## Troubleshooting common problems

Many common problems can be fixed by running through the following troubleshooting steps in order:

### 1. Check that `wp-env` is running

First, check that `wp-env` is running. One way to do this is to have Docker print a table with the currently running containers:
 -->
## 一般的な問題のトラブルシューティング

以下のトラブルシューティングを順に実行することで多くの一般的な問題を解決できます。

### 1. `wp-env` が動作していることの確認

まず `wp-env` が動作していることを確認します。現在実行中の Docker コンテナ一覧を出力します。

```sh
$ docker ps
```
<!--
In this table, by default, you should see three entries: `wordpress` with port 8888, `tests-wordpress` with port 8889 and `mariadb` with port 3306.

### 2. Check the port number

By default `wp-env` uses port 8888, meaning that the local environment will be available at http://localhost:8888.

You can configure the port that `wp-env` uses so that it doesn't clash with another server by specifying the `WP_ENV_PORT` environment variable when starting `wp-env`:
 -->
リストにはデフォルトで3つのエントリーが表示されます。ポート 8888 の `wordpress`、ポート 8889 の `tests-wordpress`、ポート 3306 の `mariadb` です。

### 2. ポート番号の確認

デフォルトでは `wp-env` はポート 8888 を使用し、ローカル環境が http://localhost:8888 で利用可能になります。

別のサーバーと衝突しないように `wp-env` の使用するポートを構成できます。`wp-env` を開始する際に `WP_ENV_PORT` 環境変数を指定してください。

```sh
$ WP_ENV_PORT=3333 wp-env start
```

<!--
Running `docker ps` and inspecting the `PORTS` column allows you to determine which port `wp-env` is currently using.

You may also specify the port numbers in your `.wp-env.json` file, but the environment variables take precedent.

### 3. Restart `wp-env`

Restarting `wp-env` will restart the underlying Docker containers which can fix many issues.

To restart `wp-env`:
 -->
`docker ps` を実行し `PORTS` 列を参照すると、現在 `wp-env` がどのポートを使用しているかを調べることができます。

`.wp-env.json` ファイル内にポート番号を指定することもできますが、環境変数が指定されるとそちらが優先されます。

### 3. `wp-env` の再起動

`wp-env` を再起動すると、内部で使用される Docker コンテナが再起動され、多くの問題を解消します。

`wp-env` を再起動するには、

```sh
$ wp-env stop
$ wp-env start
```

<!--
### 4. Restart Docker

Restarting Docker will restart the underlying Docker containers and volumes which can fix many issues.

To restart Docker:

1. Click on the Docker icon in the system tray or menu bar.
2. Select _Restart_.

Once restarted, start `wp-env` again:
 -->
### 4. Docker の再起動

Docker を再起動すると、内部で使用する Docker コンテナとボリュームが再起動され、多くの問題を解消します。

Docker を再起動するには

1. システムトレイ、または、メニューバーの Docker アイコンをクリックする。
2. _Restart_ を選択する。

Docker の再起動後、`wp-env` を起動します。

```sh
$ wp-env start
```

<!--
### 5. Reset the database

Resetting the database which the local environment uses can fix many issues, especially when they are related to the WordPress installation.

To reset the database:

**⚠️ WARNING: This will permanently delete any posts, pages, media, etc. in the local WordPress installation.**
 -->
### 5. データベースのリセット

ローカル環境の使用するデータベースをリセットすると、多くの問題、特に WordPress のインストールに関する問題が解消します。

データベースをリセットするには

**⚠️ 警告: 次のコマンドは、ローカル WordPress 環境内の投稿、ページ、メディア等を完全に削除します。**

```sh
$ wp-env clean all
$ wp-env start
```
<!--
### 6. Nuke everything and start again 🔥

When all else fails, you can use `wp-env destroy` to forcibly remove all of the underlying Docker containers and volumes. This will allow you to start from scratch.

To nuke everything:

**⚠️ WARNING: This will permanently delete any posts, pages, media, etc. in the local WordPress installation.**
 -->
### 6. すべてを破壊して、最初からやり直す 🔥

上のすべてがうまくいかない場合、`wp-env destroy` を使用してローカルの Docker コンテナとボリュームを強制的に削除できます。ゼロからやり直すことができます。

すべてを破壊するには

**⚠️ 警告: 次のコマンドは、ローカル WordPress 環境内の投稿、ページ、メディア等を完全に削除します。**

```sh
$ wp-env destroy
$ wp-env start
```
<!--
### 7. Debug mode and inspecting the generated dockerfile.
 -->
### 7. デバッグモードと生成された docker ファイルの確認
<!--
`wp-env` uses docker behind the scenes. Inspecting the generated docker-compose file can help to understand what's going on.

Start `wp-env` in debug mode
 -->
`wp-env` は裏側で docker を使用しています。生成された docker-compose ファイルを調べると何が起きているかを理解できます。

`wp-env` をデバッグモードで開始します。

```sh
wp-env start --debug
```
<!--
`wp-env` will output its config which includes `dockerComposeConfigPath`.
 -->
`wp-env` `dockerComposeConfigPath` を含む構成情報を出力します。

```sh
ℹ Config:
	...
	"dockerComposeConfigPath": "/Users/$USERNAME/.wp-env/5a619d332a92377cd89feb339c67b833/docker-compose.yml",
	...
```
<!--
## Using Xdebug
 -->
## Xdebug の使用

<!--
Xdebug is installed in the wp-env environment, but it is turned off by default. To enable Xdebug, you can use the `--xdebug` flag with the `wp-env start` command. Here is a reference to how the flag works:
 -->
wp-env 環境には Xdebug がインストールされていますが、デフォルトではオフになっています。Xdebug を有効にするには `wp-env start` コマンドの `--xdebug` フラグを使用します。以下ではフラグの動作について説明します。

<!--
```sh
# Sets the Xdebug mode to "debug" (for step debugging):
wp-env start --xdebug

# Sets the Xdebug mode to "off":
wp-env start

# Enables each of the Xdebug modes listed:
wp-env start --xdebug=profile,trace,debug
```
 -->

```sh
# Xdebug モードを "debug" に設定 (ステップデバッグ用)
wp-env start --xdebug

# Xdebug モードを "off" に設定
wp-env start

# リストしたそれぞれの Xdebug モードを有効
wp-env start --xdebug=profile,trace,debug
```
<!-- 
When you're running `wp-env` using `npm run`, like when working in the Gutenberg repo or when having `wp-env` as a local project dependency, don't forget to add an extra double dash before the `--xdebug` command:
 -->
`npm run` を使って `wp-env` を実行する場合、たとえば、Gutenberg リポジトリで作業刷る場合や、`wp-env` をプロジェクトのローカルな依存関係として持つ場合、`--xdebug` コマンドの前に、忘れずに二重ダッシュを追加してください。

```sh
npm run wp-env start -- --xdebug
```
<!-- 
If you forget about that, the `--xdebug` parameter will be passed to NPM instead of the `wp-env start` command and it will be ignored.
 -->
これを忘れると、`wp-env start` コマンドの代わりに `--xdebug` パラメータが NPM に渡され、無視されます。

<!--
You can see a reference on each of the Xdebug modes and what they do in the [Xdebug documentation](https://xdebug.org/docs/all_settings#mode).
 -->
Xdebgu のモードと定義については [Xdebug ドキュメント](https://xdebug.org/docs/all_settings#mode) を参照してください。

<!--
_Since we are only installing Xdebug 3, Xdebug is only supported for PHP versions greater than or equal to 7.2 (the default). Xdebug won't be installed if `phpVersion` is set to a legacy version._
 -->
_Xdebug 3 のみをインストールするため、Xdebug としては PHP 7.2 (デフォルト) 以上が必要です。`phpVersion` に古いバージョンに設定されている場合、Xdebug はインストールできません。_

<!--
### Xdebug IDE support
 -->
### Xdebug の IDE サポート

<!--
To connect to Xdebug from your IDE, you can use these IDE settings. This bit of JSON was tested for VS Code's `launch.json` format (which you can [learn more about here](https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes)) along with [this PHP Debug extension](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-debug). Its path mapping also points to a specific plugin -- you should update this to point to the source you are working with inside of the wp-env instance.

You should only have to translate `port` and `pathMappings` to the format used by your own IDE.
 -->
IDE から Xdebug に接続するには以下の IDE 設定を使用できます。この JSON は VS Code の `launch.json` 形式 ([詳細についてはこちら](https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes)) と [PHP デバッグエクステンション](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-debug) でテストされました。なお、パスマッピングは特定のプラグインを指しています。これを wp-env インスタンス内の作業中のソースコードを指すよう更新してください。

`port` と `pathMappings` のみを IDE で使用する形式に変換する必要があります。

```json
{
  "name": "Listen for XDebug",
  "type": "php",
  "request": "launch",
  "port": 9003,
  "pathMappings": {
    "/var/www/html/wp-content/plugins/gutenberg": "${workspaceFolder}/"
  }
}
```
<!-- 
After you create a `.vscode/launch.json` file in your repository, you probably want to add it to your [global gitignore file](https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files#configuring-ignored-files-for-all-repositories-on-your-computer) so that it stays private for you and is not committed to the repository.
 -->
リポジトリに `.vscode/launch.json` ファイルを作成したら、それを [グローバル gitignore ファイル](https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files#configuring-ignored-files-for-all-repositories-on-your-computer) に追加すると良いでしょう。ファイルはプライベートになり、リポジトリにはコミットされません。

<!--
Once your IDEs Xdebug settings have been enabled, you should just have to launch the debugger, put a breakpoint on any line of PHP code, and then refresh your browser!
 -->
IDE Xdebug 設定が有効になればあとはデバッガを起動し、PHP コードの任意の行にブレークポイントを置き、ブラウザをリフレッシュするだけです。

<!--
Here is a summary:

1. Start wp-env with xdebug enabled: `wp-env start --xdebug`
2. Install a suitable Xdebug extension for your IDE if it does not include one already.
3. Configure the IDE debugger to use port `9003` and the correct source files in wp-env.
4. Launch the debugger and put a breakpoint on any line of PHP code.
5. Refresh the URL wp-env is running at and the breakpoint should trigger.
 -->
まとめ:

1. Xdebug を有効化して wp-env を起動する: `wp-env start --xdebug`
2. もしまだなら IDE 用に適切な Xdebug エクステンションをインストールする。
3. IDE デバッガーがポート `9003` と wp-env 内の正しいソースファイルを使用するよう構成する。
4. デバッガーを起動し、PHP コードの任意の行にブレークポイントを置く。
5. wp-env の稼働する URL をリフレッシュすれば、ブレークポイントに達する。

<!--
## Command reference

`wp-env` creates generated files in the `wp-env` home directory. By default, this is `~/.wp-env`. The exception is Linux, where files are placed at `~/wp-env` [for compatibility with Snap Packages](https://github.com/WordPress/gutenberg/issues/20180#issuecomment-587046325). The `wp-env` home directory contains a subdirectory for each project named `/$md5_of_project_path`. To change the `wp-env` home directory, set the `WP_ENV_HOME` environment variable. For example, running `WP_ENV_HOME="something" wp-env start` will download the project files to the directory `./something/$md5_of_project_path` (relative to the current directory).
 -->
## コマンドリファレンス

`wp-env` は生成したファイルを `wp-env` ホームディレクトリー、デフォルトでは `~/.wp-env` に置きます。例外は Linux で [Snap パッケージの互換性のため](https://github.com/WordPress/gutenberg/issues/20180#issuecomment-587046325)、ファイルは `~/wp-env` に置かれます。`wp-env` ホームディレクトリーには各プロジェクトのサブディレクトリーが `/$md5_of_project_path` として作成されます。`wp-env` ホームディレクトリーを変更するには、`WP_ENV_HOME` 環境変数を設定してください。例えば `WP_ENV_HOME="something" wp-env start` と実行すると、プロジェクトファイルは現行ディレクトリーからの相対パスでディレクトリー `./something/$md5_of_project_path` にダウンロードされます。

<!--
### `wp-env start`

The start command installs and initializes the WordPress environment, which includes downloading any specified remote sources. By default, `wp-env` will not update or re-configure the environment except when the configuration file changes. Tell `wp-env` to update sources and apply the configuration options again with `wp-env start --update`. This will not overwrite any existing content.
 -->
### wp-env start

start コマンドは WordPress 環境をインストールし初期化します。これには指定された任意のリモートのソースのダウンロードも含まれます。`wp-env` はデフォルトでは構成ファイルが変更されない限り、環境を更新も再考性もしません。ソースを更新し、構成オプションを再度適用するには `wp-env start --update` を使用してください。既存のコンテンツは上書きされません。

<!--
```sh
wp-env start

Starts WordPress for development on port 8888 (override with WP_ENV_PORT) and
tests on port 8889 (override with WP_ENV_TESTS_PORT). The current working
directory must be a WordPress installation, a plugin, a theme, or contain a
.wp-env.json file. After first install, use the '--update' flag to download
updates to mapped sources and to re-apply WordPress configuration options.

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --debug    Enable debug output.                     [boolean] [default: false]
  --update   Download source updates and apply WordPress configuration.
                                                      [boolean] [default: false]
  --xdebug   Enables Xdebug. If not passed, Xdebug is turned off. If no modes
             are set, uses "debug". You may set multiple Xdebug modes by passing
             them in a comma-separated list: `--xdebug=develop,coverage`. See
             https://xdebug.org/docs/all_settings#mode for information about
             Xdebug modes.                                              [string]
```
 -->
```sh
wp-env start

WordPress 開発環境をポート 8888 (​http://localhost:8888​) で (ポートは WP_ENV_PORT で指定可)、
テスト環境を 8889 (​http://localhost:8889​) で (ポートは WP_ENV_TESTS_PORT で指定可) 開始します。
コマンドは WordPress インストールディレクトリー、プラグインやテーマのディレクトリー、
または .wp-env.json ファイルのあるディレクトリーで実行する必要があります。最初のインストール後、
'--update' フラグを使用して更新をマップされたソースにダウンロードし、WordPress 構成オプションに
再適用します。

引数:
  --update   ソースの更新をダウンロードし、WordPress 構成に適用する
                                                      [boolean] [デフォルト: false]
```

<!--
### `wp-env stop`

```sh
wp-env stop

Stops running WordPress for development and tests and frees the ports.
```
 -->
### wp-env stop

```sh
wp-env stop

実行中の WordPress 開発環境、テスト環境を停止し、ポートを解放します。
```

<!--
### `wp-env clean [environment]`

```sh
wp-env clean [environment]

Cleans the WordPress databases.

Positionals:
  environment  Which environments' databases to clean.
            [string] [choices: "all", "development", "tests"] [default: "tests"]
```
 -->
### wp-env clean

```sh
wp-env clean [environment]

WordPress データベースをクリアします。

引数:
  environment  どの環境のデータベースをクリアするか。
            [string] [選択: "all", "development", "tests"] [デフォルト: "tests"]
```

<!--
### `wp-env run [container] [command]`
 -->
### wp-env run [container] [command]

<!-- 
The run command can be used to open shell sessions or invoke WP-CLI commands.
 -->
run コマンドは、シェルセッションを開いたり、WP-CLI コマンドの呼び出しに使用できます。

<!-- 
<div class="callout callout-alert">
To run a WP-CLI command that includes optional arguments, enclose the WP-CLI command in quotation marks; otherwise, the optional arguments are ignored. This is because flags are normally passed to `wp-env` itself, meaning that the flags are not considered part of the argument that specifies the WP-CLI command. With quotation marks, `wp-env` considers everything inside quotation marks the WP-CLI command argument.
 -->
オプションの引数を含む WP-CLI コマンドを実行するには、WP-CLI コマンドを引用符 (`'`) で囲みます。囲まない場合、オプションの引数は無視されます。フラグは通常 WP-CLI コマンドを指定する引数の一部とはみなされず、`wp-env` 自身に渡されるためです。引用符を使用すると、 `wp-env` は引用符の中のすべてを WP-CLI コマンドの引数と見なします。

<!-- 
For example, to list cron schedules with optional arguments that specify the fields returned and the format of the output:
 -->
たとえば、cron のスケジュールをリストし、オプションに返すフィールドと出力フォーマットを指定するには、

```sh
wp-env run cli "wp cron schedule list --fields=name --format=csv"
```
<!-- 
Without the quotation marks, WP-CLI lists the schedule in its default format, ignoring the `fields` and `format` arguments.
</div>
 -->
引用符がない場合、WP-CLI は `fields` と `format` の引数を無視して、デフォルトのフォーマットでスケジュールをリストします。

<!-- 
Note that quotation marks are not required for a WP-CLI command that excludes optional arguments, although it does not hurt to include them. For example, the following command syntaxes return identical results: `wp-env run cli "wp cron schedule list"` or `wp-env run cli wp cron schedule list`.
 -->
注意: オプションの引数を除外する WP-CLI コマンドでは引用符は必要ありませんが、引用符を含めても問題ありません。たとえば、次のコマンド構文`wp-env run cli "wp cron schedule list"` と `wp-env run cli wp cron schedule list` は、同一の結果を返します。

<!-- 
For more information about all the available commands, see [WP-CLI Commands](https://developer.wordpress.org/cli/commands/).
 -->
利用可能なコマンドの詳細については、[WP-CLI コマンド](https://developer.wordpress.org/cli/commands/)を参照してください。

<!--
```sh
wp-env run <container> [command..]

Runs an arbitrary command in one of the underlying Docker containers. The
"container" param should reference one of the underlying Docker services like
"development", "tests", or "cli". To run a wp-cli command, use the "cli" or
"tests-cli" service. You can also use this command to open shell sessions like
bash and the WordPress shell in the WordPress instance. For example, `wp-env run
cli bash` will open bash in the development WordPress instance. When using long
commands with arguments and quotation marks, you need to wrap the "command"
param in quotation marks. For example: `wp-env run tests-cli "wp post create
--post_type=page --post_title='Test'"` will create a post on the tests WordPress
instance.

Positionals:
  container  The container to run the command on.            [string] [required]
  command    The command to run.                           [array] [default: []]

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --debug    Enable debug output.                     [boolean] [default: false]
```

For example:
 -->
```sh
wp-env run <container> [command..]

動作している Docker コンテナ内で任意のコマンドを実行します。
"container" パラメータは Docker サービス "development"、"tests"、"cli"の1つを指定する必要が
あります。wp-cli コマンドを実行するには "cli" または "tests-cli" サービスを使用してください。
また bash のようなシェルセッションや、WordPress インスタンス内の WordPress シェルを開くためにも
使用できます。たとえば `wp-env run cli bash` は開発 WordPress インスタンス内で bash を開きます。
引数や引用符を含む長いコマンドを使用する場合には、"command" パラメータ全体を引用符で囲む必要が
あります。例えば `wp-env run tests-cli "wp post create
--post_type=page --post_title='Test'"` は  WordPress インスタンス "tests" に投稿を
作成します。

引数:
  container  コマンドを実行するコンテナ        [string] [必須]
  command    実行するコマンド                [array] [デフォルト: []]

オプション:
  --help     ヘルプの表示                                              [boolean]
  --version  バージョン番号の表示                                       [boolean]
  --debug    デバッグ出力の有効化                     [boolean] [でファルト: false]
```

例:

<!--
#### Displaying the users on the development instance:
 -->
#### development インスタンス上のユーザーの表示

```sh
wp-env run cli wp user list
⠏ Running `wp user list` in 'cli'.

ID      user_login      display_name    user_email      user_registered roles
1       admin   admin   wordpress@example.com   2020-03-05 10:45:14     administrator

✔ Ran `wp user list` in 'cli'. (in 2s 374ms)
```
<!--
#### Creating a post on the tests instance:
 -->
#### tests インスタンスで投稿を作成

```sh
wp-env run tests-cli "wp post create --post_type=page --post_title='Ready'"

ℹ Starting 'wp post create --post_type=page --post_title='Ready'' on the tests-cli container.

Success: Created post 5.
✔ Ran `wp post create --post_type=page --post_title='Ready'` in 'tests-cli'. (in 3s 293ms)
```
<!--
#### Opening the WordPress shell on the tests instance and running PHP commands:
 -->
#### tests インスタンスで WordPress シェルを開き、PHP コマンドを実行

```sh
wp-env run tests-cli wp shell
ℹ Starting 'wp shell' on the tests-cli container. Exit the WordPress shell with ctrl-c.

Starting 31911d623e75f345e9ed328b9f48cff6_mysql_1 ... done
Starting 31911d623e75f345e9ed328b9f48cff6_tests-wordpress_1 ... done
wp> echo( 'hello world!' );
hello world!
wp> ^C
✔ Ran `wp shell` in 'tests-cli'. (in 16s 400ms)
```
<!--
#### Installing a plugin or theme on the development instance
 -->
#### development インスタンスでのプラグインやテーマのインストール

```sh
wp-env run cli wp plugin install custom-post-type-ui

Creating 500cd328b649d63e882d5c4695871d04_cli_run ... done
Installing Custom Post Type UI (1.9.2)
Downloading installation package from https://downloads.wordpress.org/plugin/custom-post-type-ui.zip...
The authenticity of custom-post-type-ui.zip could not be verified as no signature was found.
Unpacking the package...
Installing the plugin...
Plugin installed successfully.
Success: Installed 1 of 1 plugins.
✔ Ran `plugin install custom-post-type-ui` in 'cli'. (in 6s 483ms)
```

<!--
**NOTE**: Depending on your host OS, you may experience errors when trying to install plugins or themes (e.g. `Warning: Could not create directory.`). This is typically because the user ID used within the container does not have write access to the mounted directories created by `wp-env`. To resolve this, run the `docker-compose` command directly from the directory created by `wp-env` and add `-u $(id -u)` and `-e HOME=/tmp` the `run` command as options:
 -->
**注意**: ホスト OS によっては、プラグインやテーマをインストールしようとすると、エラーが発生する場合があります (例: `Warning: Could not create directory.`）。これは通常、コンテナ内で使用されているユーザー ID が、`wp-env` で作成、マウントしたディレクトリへの書き込み権限を持っていないことが原因です。この問題を解決するには、`wp-env` で作成したディレクトリから直接 `docker-compose` コマンドを使用します。`run`コマンドに、`-u $(id -u)` と `-e HOME=/tmp` オプションを追加してください。

```sh
$ cd ~/wp-env/500cd328b649d63e882d5c4695871d04
$ docker-compose run --rm -u $(id -u) -e HOME=/tmp cli [plugin|theme] install <plugin|theme>
```

<!--
### `wp-env destroy`

```sh
wp-env destroy

Destroy the WordPress environment. Deletes docker containers, volumes, and
networks associated with the WordPress environment and removes local files.
```
 -->
### wp-env destroy

```sh
wp-env destroy

WordPress 環境を破壊します。WordPress 環境と関連する Docker コンテナ、ボリューム、
ネットワークを削除し、ローカルファイルを削除します。
```
<!--
### `wp-env logs [environment]`

```sh
wp-env logs

displays PHP and Docker logs for given WordPress environment.

Positionals:
  environment  Which environment to display the logs from.
      [string] [choices: "development", "tests", "all"] [default: "development"]

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --debug    Enable debug output.                     [boolean] [default: false]
  --watch    Watch for logs as they happen.            [boolean] [default: true]
```
 -->
### wp-env logs

```sh
wp-env logs [environment]

指定した WordPress 環境の PHP と Docker のログを表示します。

引数:
  environment  どの環境のログを出力するか
      [string] [選択: "development", "tests", "all"] [デフォルト: "development"]

オプション:
  --help     ヘルプの表示                [boolean]
  --version  バージョン番号の表示         [boolean]
  --debug    デバッグ出力の有効化         [boolean] [デフォルト: false]
  --watch    ログをウオッチする          [boolean] [デフォルト: true]
```
<!-- 
### `wp-env install-path`
 -->
### wp-env install-path
<!-- 
Outputs the absolute path to the WordPress environment files.

Example:
 -->
WordPress 環境ファイルへの絶対パスを出力します。

例:

```sh
$ wp-env install-path

/home/user/.wp-env/63263e6506becb7b8613b02d42280a49
```

<!--
## .wp-env.json

You can customize the WordPress installation, plugins and themes that the development environment will use by specifying a `.wp-env.json` file in the directory that you run `wp-env` from.

`.wp-env.json` supports six fields for options applicable to both the tests and development instances.
 -->
## .wp-env.json

WordPress のインストールや開発環境で使用するプラグインやテーマをカスタマイズできます。`.wp-env.json` ファイルに指定し、同じディレクトリーで `wp-env` を実行してください。

`.wp-env.json` はテストと開発の両方のインスタンスに適用可能なオプションとして、6つのフィールドをサポートします。

<!--
| Field          | Type           | Default                                | Description                                                                                                                      |
| -------------- | -------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `"core"`       | `string\|null` | `null`                                 | The WordPress installation to use. If `null` is specified, `wp-env` will use the latest production release of WordPress.         |
| `"phpVersion"` | `string\|null` | `null`                                 | The PHP version to use. If `null` is specified, `wp-env` will use the default version used with production release of WordPress. |
| `"plugins"`    | `string[]`     | `[]`                                   | A list of plugins to install and activate in the environment.                                                                    |
| `"themes"`     | `string[]`     | `[]`                                   | A list of themes to install in the environment.                                                                                  |
| `"port"`       | `integer`      | `8888` (`8889` for the tests instance) | The primary port number to use for the installation. You'll access the instance through the port: 'http://localhost:8888'.       |
| `"config"`     | `Object`       | See below.                             | Mapping of wp-config.php constants to their desired values.                                                                      |
| `"mappings"`   | `Object`       | `"{}"`                                 | Mapping of WordPress directories to local directories to be mounted in the WordPress instance.                                   |
 -->
| フィールド      | タイプ         | デフォルト                                   | 説明                                                                                                               |
| ------------- | ------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `"core"`      | `string|null` | `null`                                     | 使用する WordPress のバージョンまたはビルド。`null` の場合、最新リリース版 |
| `"phpVersion"` | `string\|null` | `null`                                 | 使用する PHP のバージョン。`null` が指定されると `wp-env` は WordPress の製品版リリースで使用されるデフォルトバージョンを使用する。|
| `"plugins"`   | `string[]`    | `[]`                                       | 環境にインストール、有効化するプラグインのリスト                                                             |
| `"themes"`    | `string[]`    | `[]`                                       | 環境にインストールするテーマのリスト                            |
| `"port"`      | `integer`      | `8888` (テストインスタンスでは `8889`)        | インストールに使用するポート番号。インスタンスには 'http://localhost:8888' でアクセスできる |
| `"config"`    | `Object`      | 以下を参照                                    | wp-config.php の定数とその値のマッピング                                                               |
| `"mappings"`  | `Object`       | `"{}"`                                     | WordPress インスタンス内にマウントされるローカルディレクトリと WordPress ディレクトリのマッピング                                      |

<!--
_Note: the port number environment variables (`WP_ENV_PORT` and `WP_ENV_TESTS_PORT`) take precedent over the .wp-env.json values._

Several types of strings can be passed into the `core`, `plugins`, `themes`, and `mappings` fields.
 -->
_注意: ポート番号に関する環境変数 (`WP_ENV_PORT` と `WP_ENV_TESTS_PORT`) は .wp-env.json の値に優先します。_

`core`、`plugins`、`themes`、`mappings` フィールドに指定できる文字列のタイプを以下に示します。

<!--
| Type              | Format                        | Example(s)                                               |
| ----------------- | ----------------------------- | -------------------------------------------------------- |
| Relative path     | `.<path>\|~<path>`            | `"./a/directory"`, `"../a/directory"`, `"~/a/directory"` |
| Absolute path     | `/<path>\|<letter>:\<path>`   | `"/a/directory"`, `"C:\\a\\directory"`                   |
| GitHub repository | `<owner>/<repo>[#<ref>]`      | `"WordPress/WordPress"`, `"WordPress/gutenberg#trunk"`   |
| ZIP File          | `http[s]://<host>/<path>.zip` | `"https://wordpress.org/wordpress-5.4-beta2.zip"`        |
 -->
| タイプ             | 形式                           | 例                                                       |
| ----------------- | ----------------------------- | -------------------------------------------------------- |
| 相対パス     | `.<path>|~<path>`             | `"./a/directory"`, `"../a/directory"`, `"~/a/directory"` |
| 絶対パス     | `/<path>|<letter>:\<path>`    | `"/a/directory"`, `"C:\\a\\directory"`                   |
| GitHub リポジトリ | `<owner>/<repo>[#<ref>]`      | `"WordPress/WordPress"`, `"WordPress/gutenberg#trunk"`  |
| ZIP ファイル          | `http[s]://<host>/<path>.zip` | `"https://wordpress.org/wordpress-5.4-beta2.zip"`        |

<!--
Remote sources will be downloaded into a temporary directory located in `~/.wp-env`.
 -->
リモートのソースは `~/.wp-env` 内の一時ディレクトリーにダウンロードされます。

<!--
Additionally, the key `env` is available to override any of the above options on an individual-environment basis. For example, take the following `.wp-env.json` file:
 -->
さらにキー `env` は上の任意のオプションを個々の環境ごとに上書きできます。たとえば次の `.wp-env.json` ファイルでは

```json
{
  "plugins": ["."],
  "config": {
    "KEY_1": true,
    "KEY_2": false
  },
  "env": {
    "development": {
      "themes": ["./one-theme"]
    },
    "tests": {
      "config": {
        "KEY_1": false
      },
      "port": 3000
    }
  }
}
```
<!--
On the development instance, `cwd` will be mapped as a plugin, `one-theme` will be mapped as a theme, KEY_1 will be set to true, and KEY_2 will be set to false. Also note that the default port, 8888, will be used as well.
 -->
development インスタンスでは、`cwd` がプラグインに、`one-theme` がテーマにマップされ、KEY_1 が true に、KEY_2 が false に設定されます。デフォルトのポートは引き続き 8888 が使用されます。



<!--
On the tests instance, `cwd` is still mapped as a plugin, but no theme is mapped. Additionally, while KEY_2 is still set to false, KEY_1 is overridden and set to false. 3000 overrides the default port as well.

This gives you a lot of power to change the options applicable to each environment.
 -->
tests インスタンスでは、`cwd` がプラグインマップされますがテーマのマップはありません。また KEY_2 は false のままですが、KEY_1 は false で、デフォルトのポートは 3000 で上書きされます。

この強力な機能により環境ごとにオプションを変更できます。

## .wp-env.override.json
<!--
Any fields here will take precedence over .wp-env.json. This file is useful when ignored from version control, to persist local development overrides. Note that options like `plugins` and `themes` are not merged. As a result, if you set `plugins` in your override file, this will override all of the plugins listed in the base-level config. The only keys which are merged are `config` and `mappings`. This means that you can set your own wp-config values without losing any of the default values.
 -->
このファイルのフィールド値は、.wp-env.json の値よりも優先されます。このファイルをバージョンコントロールの対象外とすると、常に希望のローカル環境で上書きできて便利です。注意: `plugins` や `themes` などのオプションはマージされません。結果として .wp-env.override.json ファイル内で `plugins` を設定すると、ベースレベルの構成でリストされたすべてのプラウグインを上書きします。マージされるキーは `config` と `mappings` のみです。すなわちデフォルト値を失うこと無く自身の wp-config 値を設定できます。

<!--
## Default wp-config values.
 -->
## デフォルト wp-config 値

<!--
On the development instance, these wp-config values are defined by default:
 -->
development インスタンスでは次の wp-config 値がデフォルトとして定義されます。

```
WP_DEBUG: true,
SCRIPT_DEBUG: true,
WP_PHP_BINARY: 'php',
WP_TESTS_EMAIL: 'admin@example.org',
WP_TESTS_TITLE: 'Test Blog',
WP_TESTS_DOMAIN: 'http://localhost',
WP_SITEURL: 'http://localhost',
WP_HOME: 'http://localhost',
```
<!--
On the test instance, all of the above are still defined, but `WP_DEBUG` and `SCRIPT_DEBUG` are set to false.

Additionally, the values referencing a URL include the specified port for the given environment. So if you set `testsPort: 3000, port: 2000`, `WP_HOME` (for example) will be `http://localhost:3000` on the tests instance and `http://localhost:2000` on the development instance.
 -->
tests インスタンスでは同じすべての値が定義されますが、`WP_DEBUG` と `SCRIPT_DEBUG` は false に設定されます。

また URL を参照する値には環境で指定されたポート番号が含まれます。たとえば `testsPort: 3000, port: 2000` を設定すると、`WP_HOME` は tests インスタンスでは `http://localhost:3000`、development インスタンスでは `http://localhost:2000` になります。

<!--
### Examples

#### Latest production WordPress + current directory as a plugin

This is useful for plugin development.
 -->
### 例

#### 最新のリリース版 WordPress + 現行ディレクトリーのプラグインをインストールし有効化

この設定はプラグイン開発時に便利です。

```json
{
  "core": null,
  "plugins": ["."]
}
```

<!--
#### Latest development WordPress + current directory as a plugin

This is useful for plugin development when upstream Core changes need to be tested.
 -->
#### 最新の開発版 WordPress + 現行ディレクトリーのプラグインをインストール

この設定はプラグイン開発時に、最新のコアの変更の影響を見る上で便利です。

```json
{
  "core": "WordPress/WordPress#master",
  "plugins": ["."]
}
```
<!--
#### Local `wordpress-develop` + current directory as a plugin

This is useful for working on plugins and WordPress Core at the same time.
 -->
#### ローカルの `wordpress-develop` + 現行ディレクトリーのプラグインをインストール

プラグインと WordPress コアで同時に作業する場合に便利です。

<!-- 
If you are running a _build_ of `wordpress-develop`, point `core` to the `build` directory.
 -->
`wordpress-develop` の _build_ を実行している場合は、`core` を `build` ディレクトリに指定します。

```json
{
  "core": "../wordpress-develop/build",
  "plugins": ["."]
}
```
<!-- 
If you are running `wordpress-develop` in a dev mode (e.g. the watch command `dev` or the dev build `build:dev`), then point `core` to the `src` directory.
 -->
もし、`wordpress-develop` を dev モード（例: watch コマンド `dev` や dev ビルド `build:dev`）で実行している場合は、`core` を `src` ディレクトリに指定します。

```json
{
  "core": "../wordpress-develop/src",
  "plugins": ["."]
}
```

<!--
#### A complete testing environment

This is useful for integration testing: that is, testing how old versions of WordPress and different combinations of plugins and themes impact each other.
 -->
#### 完全なテスト環境

インテグレショーンテストで便利です。古いバージョンの WordPress と異なるプラグインの組み合わせで互いに与える影響をテストできます。

```json
{
  "core": "WordPress/WordPress#5.2.0",
  "plugins": ["WordPress/wp-lazy-loading", "WordPress/classic-editor"],
  "themes": ["WordPress/theme-experiments"]
}
```
<!--
#### Add mu-plugins and other mapped directories

You can add mu-plugins via the mapping config. The mapping config also allows you to mount a directory to any location in the wordpress install, so you could even mount a subdirectory. Note here that theme-1, will not be activated.
 -->
#### mu-plugins とマッピングディレクトリの追加

マッピング構成を使用して mu-plugins を追加できます。マッピング構成を使用すると、WordPress インストール内の任意の場所にディレクトリをマウントできます。サブディレクトリにマウントすることも可能です。ただし theme-1 は有効化されないことに注意してください。

```json
{
  "plugins": ["."],
  "mappings": {
    "wp-content/mu-plugins": "./path/to/local/mu-plugins",
    "wp-content/themes": "./path/to/local/themes",
    "wp-content/themes/specific-theme": "./path/to/local/theme-1"
  }
}
```
<!--
#### Avoid activating plugins or themes on the instance

Since all plugins in the `plugins` key are activated by default, you should use the `mappings` key to avoid this behavior. This might be helpful if you have a test plugin that should not be activated all the time.
 -->
#### インスタンスのプラグインやテーマを有効化しない

デフォルトでは `plugins` キーのすべてのプラグインは有効化されます。この動きを避けるには `mappings` キーを使用してください。この方法は常には有効化すべきでない、テスト用のプラグインがある場合に便利です。

```json
{
  "plugins": ["."],
  "mappings": {
    "wp-content/plugins/my-test-plugin": "./path/to/test/plugin"
  }
}
```

<!--
#### Map a plugin only in the tests environment

If you need a plugin active in one environment but not the other, you can use `env.<envName>` to set options specific to one environment. Here, we activate cwd and a test plugin on the tests instance. This plugin is not activated on any other instances.
 -->
#### テスト環境にのみプラグインをマップする

1つの環境でのみプラグインを有効化し、他の環境では有効化しない場合、`env.<envName>` を使用して1つの環境でのみオプションを設定できます。ここではテストインスタンスでのみ現行ディレクトリとテストプラグインを有効化しています。他のインスタンスではプラグインは有効化されません。

```json
{
  "plugins": ["."],
  "env": {
    "tests": {
      "plugins": [".", "path/to/test/plugin"]
    }
  }
}
```

<!--
#### Custom Port Numbers

You can tell `wp-env` to use a custom port number so that your instance does not conflict with other `wp-env` instances.
 -->
#### カスタムポート番号

`wp-env` にカスタムポート番号を指定することで、他の `wp-env` インスタンスとの衝突を避けられます。

```json
{
  "plugins": ["."],
  "port": 4013,
  "env": {
    "tests": {
      "port": 4012
    }
  }
}
```
<!--
#### Specific PHP Version
 -->
#### PHP バージョンの指定

<!--
You can tell `wp-env` to use a specific PHP version for compatibility and testing. This can also be set via the environment variable `WP_ENV_PHP_VERSION`.
 -->
互換性やテストのため、`wp-env` では特定の PHP バージョンを使用できます。これは環境変数 `WP_ENV_PHP_VERSION` からでも設定できます。

```json
{
  "phpVersion": "7.2",
  "plugins": ["."]
}
```

<!-- 
## Contributing to this package
 -->
## このパッケージへのコントリビュート

<!-- 
This is an individual package that's part of the Gutenberg project. The project is organized as a monorepo. It's made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.
 -->
これは、Gutenberg プロジェクトの一部である、個別パッケージです。このプロジェクトは、monorepo として構成されています。複数の自己完結型ソフトウェアパッケージで構成されており、それぞれが特定の目的を持ちます。この monorepo のパッケージは [npm](https://www.npmjs.com/) で公開され、[WordPress](https://make.wordpress.org/core/) や他のソフトウェアプロジェクトで利用されています。

<!-- 
To find out more about contributing to this package or Gutenberg as a whole, please read the project's main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).
 -->
このパッケージや Gutenberg 全体へのコントリビュートの詳細については、プロジェクトのメインの[コントリビューターガイド](https://ja.wordpress.org/team/handbook/block-editor/contributors/)を参照ください。

<br /><br /><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>

[原文](https://github.com/WordPress/gutenberg/blob/trunk/packages/env/README.md)
