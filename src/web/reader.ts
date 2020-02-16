import './reader.styl';
import { sendMessage, emitMessage, addMessageHandler } from './reader/message';
import { IMAGE_TYPES } from './reader/parser';
import { page, doOpen, doSetPageNo, $content } from './reader/actions';
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

const WHEEL_EVENT_TIMEOUT = 250; // ms
const TOUCH_SWIPE_THRESHOLD = 20; // px

const wheelTimeouts = {
  next: 0,
  prev: 0,
};

window.addEventListener('wheel', (ev) => {
  const { deltaX, deltaY } = ev;
  const now = Date.now();

  if (deltaX > 0 || deltaY > 0) {
    if (now < wheelTimeouts.next) return;
    wheelTimeouts.next = now + WHEEL_EVENT_TIMEOUT;
    sendMessage('trigger', { action: 'flipPageNext' });
  } else if (deltaX < 0 || deltaY < 0) {
    if (now < wheelTimeouts.prev) return;
    wheelTimeouts.prev = now + WHEEL_EVENT_TIMEOUT;
    sendMessage('trigger', { action: 'flipPagePrev' });
  }
}, false);

const touchPosition = { startX: -1 };

$content.addEventListener('touchstart', (ev) => {
  if (ev.touches.length !== 1) return;

  touchPosition.startX = ev.touches[0].pageX;
}, false);

$content.addEventListener('touchmove', (ev) => {
  if (ev.touches.length !== 1) return;

  ev.preventDefault();
}, false);

$content.addEventListener('touchend', (ev) => {
  try {
    if (ev.changedTouches.length !== 1 || touchPosition.startX < 0) return;

    const endX = ev.changedTouches[0].pageX;
    const direction = touchPosition.startX - endX;
    if (Math.abs(direction) > TOUCH_SWIPE_THRESHOLD) {
      sendMessage('trigger', { action: direction < 0 ? 'flipPagePrev' : 'flipPageNext' });
    }
  } finally {
    touchPosition.startX = -1;
  }
}, false);

$content.addEventListener('touchcancel', (ev) => {
  if (ev.touches.length !== 1) return;

  touchPosition.startX = -1;
}, false);
