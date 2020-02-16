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

## Operation

### Keyboard

1. Prev Page: `PageUp`, `ArrowLeft`
2. Next Page: `PageDown`, `ArrowRight`
3. Prev Chapter: `Ctrl/Meta + ArrowLeft`
4. Next Chapter: `Ctrl/Meta + ArrowRight`
5. Toggle ToC: `Backquote`
6. First Page of Chapter: `Home`
7. Last Page of Chapter: `End`

> Not configurable yet.

### Mouse

1. Wheel Up / Down
2. Wheel Left / Right
3. Click Page No. on the bottom bar
4. Click Left / Right arrows

### Touch

* Swipe Left / Right

## Road-map

1. Generic Features
   * [x] flip pages between chapters
   * [x] keyboard shortcuts: toggle ToC, prev/next page/chapter
   * [x] mouse & touch supports
   * [ ] settings: fonts, background, themes, keybindings
   * [ ] remember position
   * [ ] drag and drop files to read
   * [ ] multiple tabs?
2. Desktop only
   * [ ] settings: font family
   * [ ] native open dialog / drag and drop
   * [ ] book shelf
   * [ ] cloud files
   * [ ] multiple windows?
   * [ ] sync settings?
3. Tooling
   * [ ] add ESLint or TSLint
   * [ ] switch to Webpack?

## Known Issues

Since Windows just switched Edge to Chromium based recently, it seems not working well yet.

## Development

### Pre-requirement

1. Node.js
2. Yarn
3. optional - Rust(if you want to try desktop version)

### Install, Develop and Build

1. `yarn` to install dependencies
2. `yarn dev` to start dev server
3. `yarn build` to generate static assets
4. optional - `yarn cargo:clean:run` to run desktop version

> Dev server(`yarn dev`) is running on [http://0.0.0.0:1234/](http://0.0.0.0:1234/). However, `window.crypto.subtle` may not exist in some browsers due `0.0.0.0` is not one of "secure origins". Just use [http://localhost:1234](http://localhost:1234) or try other browsers.
