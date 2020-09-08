# Getting Started

Gutenberg is built using the [latest active LTS release](https://github.com/nodejs/Release#release-schedule) of [Node.js](https://nodejs.org/en/), along with the latest version of [NPM](http://npmjs.com/).

The easiest way to install and manage node and NPM (on macOS, Linux, or Windows 10 with the Linux Subsystem) is by using [nvm](https://github.com/creationix/nvm). Once nvm is installed, you can install the correct version of Node by running nvm install --latest-npm in the Gutenberg directory.

> **Note:** If you find yourself needing to build older versions of Gutenberg, nvm makes that process easier too. Because Gutenberg's `.nvmrc` file is regularly updated to the current available LTS release, running `nvm install` on an older branch will install whichever LTS version was active at that time.

Once you have Node installed, run these scripts from within your local Gutenberg repository:

Note: The install scripts require [Python](https://www.python.org/) to be installed and in the path of the local system.

```bash
npm install
npm run build
```

This will build Gutenberg, ready to be used as a WordPress plugin!

`npm run build` is intended for one-off compilations of the project. If you're planning to do continued development in the source files, using `npm run dev` will most often be the better option. This will configure the build to avoid minifying the generated output, rebuild files automatically as they are changed in your working directory, and configure dependencies as running in a development environment so that useful warnings and errors are logged to your browser's developer console.

If you don't have a local WordPress environment to load Gutenberg in, we can help get that up and running, too.

## Local Environment

### Step 1: Installing a Local Environment

The quickest way to get up and running is to use the [`wp-env` command](/packages/env/README.md), that is developed within the Gutenberg source repository, and published as `@wordpress/env` to npm. By default, wp-env can install and run a local WordPress environment for you. It is also possible to configure it to use a pre-existing local WordPress installation, [see package documentation](/packages/env/README.md) for configuration details.

If you don't already have it, you'll need to install Docker and Docker Compose in order to use `wp-env`.

To install Docker, follow the instructions for [Windows 10 Pro](https://docs.docker.com/docker-for-windows/install/), [all other version of Windows](https://docs.docker.com/toolbox/toolbox_install_windows/), [macOS](https://docs.docker.com/docker-for-mac/install/), or [Linux](https://docs.docker.com/v17.12/install/linux/docker-ce/ubuntu/#install-using-the-convenience-script). If running Ubuntu, see these [extended instructions for help and troubleshooting](/docs/designers-developers/developers/tutorials/devenv/docker-ubuntu.md).

To install Docker Compose, [follow their instructions here](https://docs.docker.com/compose/install/), be sure to select your operating system for proper instructions.

Once Docker is installed and running, run this script to install WordPress, and build your local environment:

```bash
# Note: prefixing with "npm run" will resolve npm from the local Gutenberg source code, rather than a global install which may be out of date.
npm run wp-env start
```

### Step 2: Accessing and Configuring the Local WordPress Install

#### Accessing the Local WordPress Install

The WordPress installation should now be available at `http://localhost:8888` (**Username**: `admin`, **Password**: `password`).
If this port is in use, you can override it using the `WP_ENV_PORT` environment variable. For more information, consult the `wp-env` [README](https://github.com/WordPress/gutenberg/blob/master/packages/env/README.md).

To shut down this local WordPress instance run `npm run wp-env stop`. To start it back up again, run `npm run wp-env start` again.

#### Toggling Debug Systems

WordPress comes with specific [debug systems](https://wordpress.org/support/article/debugging-in-wordpress/) designed to simplify the process as well as standardize code across core, plugins and themes. In order to use with `wp-env,` you'll have to edit your local WordPress install's `wp-config.php`.

#### Troubleshooting

See the [relevant section in `wp-env` docs](https://github.com/WordPress/gutenberg/tree/master/packages/env#troubleshooting-common-problems).

## Using MAMP

You can also develop with MAMP by cloning and installing Gutenberg as a regular plugin in a WP install, but you'll require some extra configuration to be able to run the e2e tests.

Change the current directory to the plugins folder and symlink all e2e test plugins:

```bash
ln -s gutenberg/packages/e2e-tests/plugins/* .
```

You'll need to run this again if new plugins are added. To run e2e tests:

```bash
WP_BASE_URL=http://localhost:8888/gutenberg npm run test-e2e
```

## On A Remote Server

You can use a remote server in development by building locally and then uploading the built files as a plugin to the remote server.

To build: open a terminal (or if on Windows, a command prompt) and navigate to the repository you cloned. Now type `npm install` to get the dependencies all set up. Once that finishes, you can type `npm run build`.

After building the cloned gutenberg directory contains the complete plugin, you can upload the entire repository to your `wp-content/plugins` directory and activate the plugin from the WordPress admin.

Another way to upload after building is to run `npm run build:plugin-zip` to create a plugin zip file — this requires `bash` and `php` to run. The script creates `gutenberg.zip` that you can use to install Gutenberg through the WordPress admin.

## Storybook

> Storybook is an open source tool for developing UI components in isolation for React, React Native and more. It makes building stunning UIs organized and efficient.

The Gutenberg repository also includes [Storybook](https://storybook.js.org/) integration that allows testing and developing in a WordPress-agnostic context. This is very helpful for developing reusable components and trying generic JavaScript modules without any backend dependency.

You can launch Storybook by running `npm run storybook:dev` locally. It will open in your browser automatically.

You can also test Storybook for the current `master` branch on GitHub Pages: [https://wordpress.github.io/gutenberg/](https://wordpress.github.io/gutenberg/)

## Developer Tools

We recommend configuring your editor to automatically check for syntax and lint errors. This will help you save time as you develop by automatically fixing minor formatting issues. Here are some directions for setting up Visual Studio Code, a popular editor used by many of the core developers, these tools are also available for other editors.

### EditorConfig

[EditorConfig](https://editorconfig.org/) defines a standard configuration for setting up your editor, for example using tabs instead of spaces. You should install the [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=editorconfig.editorconfig) extension and it will automatically configure your editor to match the rules defined in [.editorconfig](https://github.com/WordPress/gutenberg/blob/master/.editorconfig).

### ESLint

[ESLint](https://eslint.org/) statically analyzes the code to find problems. The lint rules are integrated in the continuous integration process and must pass to be able to commit. You should install the [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) for Visual Studio Code, see eslint docs for [more editor integrations](https://eslint.org/docs/user-guide/integrations).

With the extension installed, ESLint will use the [.eslintrc.js](https://github.com/WordPress/gutenberg/blob/master/.eslintrc.js) file in the root of the Gutenberg repository for formatting rules. It will highlight issues as you develop, you can also set the following preference to fix lint rules on save.

```json
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
```

### Prettier

[Prettier](https://prettier.io/) is a tool that allows you to define an opinionated format, and automate fixing the code to match that format. Prettier and ESlint are similar, Prettier is more about formatting and style, while ESlint is for detecting coding errors.

To use Prettier with Visual Studio Code, you should install the [Prettier - Code formatter extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode). You can then configure it to be the default formatter and to automatically fix issues on save, by adding the following to your settings.

```json
"\[javascript\]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
},
"\[markdown\]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
},
```

This will use the `.prettierrc.js` file included in the root of the Gutenberg repository. The config is included from the [@wordpress/prettier-config](/packages/prettier-config/README.md) package.

If you only want to use this configuration with the Gutenberg project, create a directory called .vscode at the top-level of Gutenberg, and place your settings in a settings.json there. Visual Studio Code refers to this as Workplace Settings, and only apply to the project.

For other editors, see [Prettier's Editor Integration docs](https://prettier.io/docs/en/editors.html)

### TypeScript

**TypeScript** is a typed superset of JavaScript language. The Gutenberg project uses TypeScript via JSDoc to [type check JavaScript files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html). If you use Visual Studio Code, TypeScript support is built-in, otherwise see [TypeScript Editor Support](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support) for editor integrations.
