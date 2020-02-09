const { resolve, join } = require('path');
const { readFile, writeFile } = require('fs');
const { promisify } = require('util');

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

const DIST = resolve(__dirname, '../dist');

const readText = (file) => readFileAsync(join(DIST, file), { encoding: 'utf-8' });

const INDEX_HTML = './index.html';

const READER_HTML = './reader.html';

const RE_CSS_HREF = /<link rel="stylesheet" href="([^"]+.css)">/;

const RE_JS_SRC = / src="([^"]+.js)">/;

// const CSS_SOURCE_MAP = /\n\/\*# sourceMappingURL=.+/m;

// const JS_SOURCE_MAP = /\n\/\/# sourceMappingURL=.+/m;

(async () => {
  const [readerSrc, indexSrc] = await Promise.all([READER_HTML, INDEX_HTML].map(readText));
  const [readerHtml, { js, jsToReplace, html }] = await Promise.all([
    // reader.html
    (async (html) => {
      const [cssToReplace, cssPath] = html.match(RE_CSS_HREF);
      const [jsToReplace, jsPath] = html.match(RE_JS_SRC);

      const [css, js] = await Promise.all([cssPath, jsPath].map(readText));
      return html
        // .replace(cssToReplace, () => `<style>${css.replace(CSS_SOURCE_MAP, '')}</style>`)
        // .replace(jsToReplace, () => `>${js.replace(JS_SOURCE_MAP, '')}`);
        .replace(cssToReplace, () => `<style>${css}</style>`)
        .replace(jsToReplace, () => `>${js}`);
    })(readerSrc),
    // index.html
    (async (html) => {
      const [cssToReplace, cssPath] = html.match(RE_CSS_HREF);
      const [jsToReplace, jsPath] = html.match(RE_JS_SRC);

      const [css, js] = await Promise.all([cssPath, jsPath].map(readText));
      return {
        js,
        jsToReplace,
        // js: js.replace(JS_SOURCE_MAP, ''),
        html: html
          // .replace(cssToReplace, `<style>${css.replace(CSS_SOURCE_MAP, '')}</style>`)
          .replace(cssToReplace, `<style>${css}</style>`)
          .replace(/<template>.+<\/template>/, ''),
      };
    })(indexSrc),
  ]);

  const b64JsonHtml = JSON.stringify(Buffer.from(readerHtml).toString("base64"));
  const inlineJs = js
    .replace('setAttribute("src","./reader.html")', () => `setAttribute("src","about:blank")`)
    .replace(/=[\w\.]+contentDocument\.documentElement\.innerHTML/, () => `=atob(${b64JsonHtml})`)
    ;
  // console.log(inlineJs);
  const result = html.replace(jsToReplace, () => `>${inlineJs}`);
  // const result = html.replace(jsToReplace, () => `>${js}`);

  const release = join(DIST, './release.html');
  await writeFileAsync(release, result);
  console.log('DONE!', release);
})();
