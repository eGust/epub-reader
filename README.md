# EPub Reader

EPub Reader in Browser or Desktop

## About the Electron Version

The Electron version that I wrote in 2017 had been moved to branch `v1`. You can also use tag [`v1-archive`](https://github.com/eGust/epub-reader/tree/v1-archive) to browse it.

## Status

A while ago I started to rewrite this project. The `v1` I started in 2017 is something I tried to learn both React and Electron at that time. There are some good reasons to rewrite: a lot of dependencies are out-dated, and the code style and syntax is quite old, plus no eslint adapted, etc.

So I decided to write it in TypeScript with the latest Electron. As soon as I implemented core code, I found I don't really need Electron. A browser version maybe good enough. Then I can probably ship desktop versions with [webview](https://github.com/zserge/webview/) than Electron.

Currently, the browser version is working but still lacks features. It's **PRE-ALPHA** stage now. If you want something just works, you may checkout [`v1` branch](https://github.com/eGust/epub-reader/tree/v1).

## Stack

* TypeScript
* React
* Pug for HTML
* Stylus for CSS
* Parcel.js v2 for packaging
* Rust with [web-view](https://github.com/Boscop/web-view) for Desktop

## Road-map

- [ ] Add more features
- [ ] Add ESLint or TSLint
- [ ] May switch to Webpack
- [ ] Desktop friendly features

## Known Issues

Since Windows just switched Edge to Chromium based recently, it seems not working well.

## Development

### Pre-requirement

1. Node.js
2. Yarn
3. optional - Rust(if you want to try desktop version)

### Install

1. `yarn` to install dependencies
2. `yarn dev` to start dev
3. `yarn build` to generate static assets
4. optional - `yarn cargo:clean:run` to run desktop version
