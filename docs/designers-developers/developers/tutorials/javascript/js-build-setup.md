# JavaScript Build Setup

This page covers how to set up your development environment to use the ESNext syntax. ESNext is JavaScript code written using features that are only available in a specification greater than ECMAScript 5 (ES5 for short) or that includes a custom syntax such as [JSX](https://reactjs.org/docs/introducing-jsx.html).

This documentation covers development for your plugin to work with Gutenberg. If you want to setup a development environment for developing Gutenberg itself, see the [CONTRIBUTING.md](https://github.com/WordPress/gutenberg/blob/master/CONTRIBUTING.md) documentation.

Most browsers can not interpret or run ESNext and JSX syntaxes, so we use a transformation step to convert these syntaxes to code that browsers can understand.

There are a few reasons to use ESNext and the extra step. First, it makes for simpler code that is easier to read and write. Using a transformation step allows for tools to optimize the code to work on the widest variety of browsers. Also, by using a build step you can organize your code into smaller modules and files that can be bundled together into a single download.

There are many tools that can perform this transformation or build step, but in this tutorial we will focus on Webpack and Babel.

[Webpack](https://webpack.js.org/) is a pluggable tool that processes JavaScript creating a compiled bundle that runs in a browser. [Babel](https://babeljs.io/) transforms JavaScript from one format to another. You use Babel as a plugin to Webpack to transform both ESNext and JSX to JavaScript.

## Quick Start

For a quick start, you can use one of the examples from the [Gutenberg Examples repository](https://github.com/wordpress/gutenberg-examples/). Each one of the `-esnext` directories contain the necessary files for working with ESNext and JSX.

## Setup

Both Webpack and Babel are tools written in JavaScript and run using [Node.js](https://nodejs.org/) (node). Node.js is a runtime environment for JavaScript outside of a browser. Simply put, node allows you to run JavaScript code on the command-line.

First, you need to set up node for your development environment. The steps required change depending on your operating system, but if you have a package manager installed, setup can be as straightforward as:

- Ubuntu: `apt install node`
- macOS: `brew install node`
- Windows: `choco install node`

Additionally, the [Node.js download page](https://nodejs.org/en/download/) includes installers and binaries.

**Note:** The build tools and process occur on the command-line, so some basic familiarity using a terminal application is required. Some text editors have a terminal built-in which is fine to use; Visual Studio Code and PhpStorm are two popular options.

### Node Package Manager (npm)

The Node Package Manager (npm) is a tool included with node. npm allows you to install and manage JavaScript packages. npm can also generate and process a special file called `package.json`, which contains some information about your project and the packages your project uses.

To start a new node project, first create a directory to work in.

```
mkdir myguten-block
```

You create a new package.json running `npm init` in your terminal.  This will walk you through creating your package.json file:

```
npm init

package name: (myguten-block) myguten-block
version: (1.0.0)
description: Test block
entry point: (index.js) block.js
test command:
git repository:
keywords:
author: mkaz
license: (ISC) GPL-2.0-only
About to write to /home/mkaz/src/wp/scratch/package.json:

{
  "name": "myguten-block",
  "version": "1.0.0",
  "description": "Test block",
  "main": "block.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "mkaz",
  "license": "GPL-2.0-only"
}


Is this OK? (yes) yes
```

### Using npm to install packages

The next step is to install the packages required. You can install packages using the npm command `npm install`. If you pass the `--save-dev` parameter, npm will write the package as a dev dependency in the package.json file.

Run `npm install --save-dev webpack`

After installing, a `node_modules` directory is created with the webpack module and its dependencies.

Also, if you look at package.json file it will include a new section:

```json
"dependencies": {
	"webpack": "^4.29.0"
}
```

## Webpack & Babel

Next, we will configure webpack to process the `block.js` file and run babel to transform the JSX within it.

Create the file `webpack.config.js`

```js
// sets mode webpack runs under
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
	mode: NODE_ENV,

	// entry is the source script
	entry: './block.js',

	// output is where to write the built file
	output: {
		path: __dirname,
		filename: 'block.build.js',
	},
	module: {
		// the list of rules used to process files
		// this looks for .js files, exclude files
		// in node_modules directory, and uses the
		// babel-loader to process
		rules: [
			{
				test: /.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
		],
	},
};
```

Next, you need to install babel, the webpack loader, and the JSX plugin using:

```
npm install --save babel-loader babel-core babel-plugin-transform-react-jsx
```

You configure babel by creating a `.babelrc` file:

```
{
	"plugins": [
		[ "transform-react-jsx", {
			"pragma": "wp.element.createElement"
		} ]
	]
}
```

This pragma setting instructs Babel that any JSX syntax such as `<Hello />` should be transformed into `wp.element.createElement( Hello )`. The name of the setting (`transform-react-jsx`) is derived from the fact that it overrides the default assumption to transform to `React.createElement( Hello )`.

With both configs in place, you can now run webpack.

First you need a basic block.js to build. Create `block.js` with the following content:

```js
const { registerBlockType } = wp.blocks;

registerBlockType( 'myguten/test-block', {
	title: 'Basic Example',
	icon: 'smiley',
	category: 'layout',
	edit() {
		return <div>Hola, mundo!</div>;
	},
	save() {
		return <div>Hola, mundo!</div>;
	},
} );
```

To configure npm to run a script, you use the scripts section in `package.json` webpack:

```json
  "scripts": {
    "build": "webpack"
  },
```

You can then run the build using: `npm run build`.

After the build finishes, you will see the built file created at `block.build.js`.

## Finishing Touches

### Development Mode

The basics are in place to build. You might have noticed the webpack.config.js sets a default mode of "development". Webpack can also run in a "production" mode, which shrinks the code down so it downloads faster, but makes it difficult to read.

The mode is setup so it can be configured using environment variables, which can be added in the scripts section of `package.json`.

```json
  "scripts": {
    "dev": "webpack --watch",
    "build": "cross-env NODE_ENV=production webpack"
  },
```

This sets the environment variables, but different environments handle these settings in different ways. Using the `cross-env` helper module can help to handle this. Be sure to install the `cross-env` package using `npm install --save cross-env`.

Additionally, webpack has a `--watch` flag that will keep the process running, watching for any changes to the `block.js` file and re-building as changes occur. This is useful during development, when you might have a lot of changes in progress.

You can start the watcher by running `npm run dev` in a terminal. You can then edit away in your text editor; after each save, webpack will automatically build. You can then use the familiar edit/save/reload development process.

**Note:** keep an eye on your terminal for any errors. If you make a typo or syntax error, the build will fail and the error will be in the terminal.

### Babel Browser Targeting

Babel has the ability to build JavaScript using rules that target certain browsers and versions. By setting a reasonable set of modern browsers, Babel can optimize the JavaScript it generates.

WordPress has a preset default you can use to target the minimum supported browsers by WordPress.

Install the module using: `npm install --save @wordpress/babel-preset-default`

You then update `.babelrc` by adding a "presets" section:

```
{
	"presets": [ "@wordpress/babel-preset-default" ],
	"plugins": [
		[ "transform-react-jsx", {
			"pragma": "wp.element.createElement"
		} ]
	]
}
```

### Source Control

Because a typical `node_modules` folder will contain thousands of files that change with every software update, you should exclude `node_modules/` from your source control. If you ever start from a fresh clone, simply run `npm install` in the same folder your `package.json` is located to pull your required packages.

Likewise, you do not need to include `node_modules` or any of the above configuration files in your plugin because they will be bundled inside the file that webpack builds. **Be sure to enqueue the `block.build.js` file** in your plugin PHP. This is the only JavaScript file needed for your block to run.

## Summary

Yes, the initial setup is rather tedious, and there are a number of different tools and configs to learn. However, as the quick start alluded to, copying an existing config is the typical way most people start.

With a setup in place, the standard workflow is:

- Install dependencies: `npm install`
- Start development builds: `npm run dev`
- Develop. Test. Repeat.
- Create production build: `npm run build`
