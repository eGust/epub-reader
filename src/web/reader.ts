import './reader.styl';
import { sendMessage, emitMessage, addMessageHandler } from './reader/message';
import { IMAGE_TYPES } from './reader/parser';
import { doOpen, doSetPageNo, page } from './reader/actions';
import { join } from './utils';
import './input';

addMessageHandler('open', doOpen);

const goToLink = (path: string) => sendMessage('go', { path });

document.addEventListener('error', async ({ target }) => {
  if (!target) return;

  const $el = target as HTMLBaseElement;
  const attr = IMAGE_TYPES[$el.tagName.toLowerCase()];
  if (attr) {
    const srcPath = $el.getAttribute(attr)!;
    if (srcPath.startsWith('blob:http')) {
      console.error('blob image', srcPath);
      return;
    }

    const url = new URL(srcPath, location.toString());
    const path = url.pathname.slice(1);
    const blobUrl = (await emitMessage<{ url: string }>('image', { path }))?.url;
    if (blobUrl) {
      $el.setAttribute(attr, blobUrl);
      return;
    }
    console.warn('image', $el, { path, url });
  }
  console.error('unknown error', $el);
}, true);

document.addEventListener('click', async (ev) => {
  const { target } = ev;
  if (!target) return;

  const $el = target as HTMLAnchorElement;
  const href = $el.getAttribute('href');
  if (!href) return;

  ev.preventDefault();
  ev.stopPropagation();

  const path = join(page.basePath, href);
  goToLink(path);
  console.debug('clicked', { path });
}, true);

window.addEventListener('keyup', (ev) => {
  console.debug(ev.code);
  switch (ev.code) {
    case 'ArrowLeft':
    case 'PageUp': {
      doSetPageNo({ flip: -1 });
      return;
    }
    case 'ArrowRight':
    case 'PageDown': {
      doSetPageNo({ flip: +1 });
      return;
    }
  }
}, false);
