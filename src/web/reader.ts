import './reader.styl';
import { sendMessage, emitMessage, addMessageHandler } from './reader/message';
import { IMAGE_TYPES } from './reader/parser';
import { page, doOpen, doSetPageNo } from './reader/actions';
import { join } from './utils';

addMessageHandler('open', doOpen);

addMessageHandler('setPage', doSetPageNo);

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
  const { altKey: alt, ctrlKey: ctrl, metaKey: meta, shiftKey: shift, key, code } = ev;
  sendMessage('keyUp', { alt, ctrl, meta, shift, key, code });
}, false);
