## 2.2.0 (2018-10-29)

### Features

- Added `getQueryArg`.
- Added `hasQueryArg`.
- Added `removeQueryArgs`.

## 2.1.0 (2018-10-16)

### Features

- Added `safeDecodeURI`.

## 2.0.1 (2018-09-30)

### Bug Fixes

- Fix typo in the `qs` dependency definition in the `package.json`

## 2.0.0 (2018-09-05)

### Breaking Change

- Change how required built-ins are polyfilled with Babel 7 ([#9171](https://github.com/WordPress/gutenberg/pull/9171)).  If you're using an environment that has limited or no support for ES2015+ such as lower versions of IE then using [core-js](https://github.com/zloirock/core-js) or [@babel/polyfill](https://babeljs.io/docs/en/next/babel-polyfill) will add support for these methods.
