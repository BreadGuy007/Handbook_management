<!-- Learn how to maintain this file at https://github.com/WordPress/gutenberg/tree/master/packages#maintaining-changelogs. -->

## Unreleased

## 3.24.0 (2020-12-17)

### New Feature

-   Added a store definition `store` for the core data namespace to use with `@wordpress/data` API ([#26655](https://github.com/WordPress/gutenberg/pull/26655)).

# 3.1.0 (2019-06-03)

-   The `@wordpress/nux` package has been deprecated. Please use the `Guide` component in `@wordpress/components` to show a user guide.

## 3.0.6 (2019-01-03)

## 3.0.5 (2018-12-12)

## 3.0.4 (2018-11-30)

## 3.0.3 (2018-11-22)

## 3.0.2 (2018-11-21)

## 3.0.1 (2018-11-20)

## 3.0.0 (2018-11-15)

### Breaking Changes

-   The id prop of DotTip has been removed. Please use the tipId prop instead.

## 2.0.13 (2018-11-12)

## 2.0.12 (2018-11-12)

## 2.0.11 (2018-11-09)

## 2.0.10 (2018-11-09)

## 2.0.9 (2018-11-03)

## 2.0.8 (2018-10-30)

## 2.0.7 (2018-10-29)

### Deprecations

-   The id prop of DotTip has been deprecated. Please use the tipId prop instead.

## 2.0.6 (2018-10-22)

## 2.0.5 (2018-10-19)

## 2.0.4 (2018-10-18)

## 2.0.0 (2018-09-05)

### Breaking Change

-   Change how required built-ins are polyfilled with Babel 7 ([#9171](https://github.com/WordPress/gutenberg/pull/9171)). If you're using an environment that has limited or no support for ES2015+ such as lower versions of IE then using [core-js](https://github.com/zloirock/core-js) or [@babel/polyfill](https://babeljs.io/docs/en/next/babel-polyfill) will add support for these methods.
