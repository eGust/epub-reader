import './reader.styl';
import { tick } from './utils';

interface PayloadType {
  reset: {},
  open: {
    mime: string;
    path: string;
    content: string | Blob;
  },
  respond: {
    messageId: string;
    data: Record<string, any>;
  }
}

interface MessageData {
  type: keyof PayloadType;
  payload: PayloadType[keyof PayloadType];
}

// let basePath = '';
// const $base = document.querySelector('base')!;

let messageId = 0;

const domParser = new DOMParser();

const $main = document.querySelector('main') as HTMLDivElement;

interface Resolvers {
  [type: string]: {
    [name: string]: {
      resolve: (...args: any[]) => void,
      reject: (...args: any[]) => void
    }
  }
}

const resolvers: Resolvers = {
  respond: {},
};

const emit = <T>(type: string, payload: Record<string, any>) => new Promise<T>((resolve, reject) => {
  messageId += 1;
  resolvers.respond[messageId] = { resolve, reject };
  window.parent.postMessage({ type, messageId, payload }, '/');
});

const IMAGE_TYPES: Record<string, string> = {
  'svg image': 'xlink:href',
  img: 'src',
}

const resolveImages = async (root: HTMLElement): Promise<string> => {
  const images = new Map<Element, { attr: string, path: string }>();
  const base = location.toString();
  Object.entries(IMAGE_TYPES).forEach(([selector, attrName]) => {
    const attrs = { attr: attrName };
    root.querySelectorAll(selector).forEach((el) => {
      const path = el.getAttribute(attrName);
      if (!path) return;

      const url = new URL(path, base);
      images.set(el, { ...attrs, path: url.pathname.slice(1) });
    })
  });

  const paths = [...new Set([...images.values()].map(({ path }) => path))];
  const urls = (await emit<{ urls: Record<string, string> }>('images', { paths }))?.urls;
  if (urls) {
    for (const [el, { attr, path }] of images) {
      const blobUrl = urls[path];
      if (blobUrl) {
        el.setAttribute(attr, blobUrl);
      }
    }
  }
  return root.innerHTML;
};


const TAG_SELECTOR_REMOVE = [
  'script',
  'style',
];

const parseHtml = async (html: string, mime: string): Promise<string> => {
  const dom = domParser.parseFromString(html, mime as SupportedType);
  const body = dom.querySelector('body');
  if (body) {
    const toRemove: Element[] = [];
    TAG_SELECTOR_REMOVE.forEach((selector) => {
      toRemove.push(...dom.querySelectorAll(selector));
    });
    toRemove.forEach((el) => {
      el.parentNode?.removeChild(el);
    });
    return resolveImages(body);
  }
  return resolveImages(dom.documentElement);
}

window.addEventListener('message', async ({ data }) => {
  const message = data as MessageData;
  switch (message.type) {
    case 'reset': {
      const rejectors = Object.values(resolvers.respond).map(({ reject }) => reject);
      resolvers.respond = {};
      await tick();
      rejectors.forEach((reject) => reject('file closed'));
      break;
    }
    case 'open': {
      const { mime, path, content } = message.payload as PayloadType['open'];
      if (/(html|xml)/.test(mime)) {
        $main.innerHTML = '';
        history.pushState({ path }, '', `/${path}`);
        const elements = await parseHtml(content as string, mime);
        console.debug('open', { path, elements });
        $main.innerHTML = elements;
      }
      break;
    }
    case 'respond': {
      const { messageId, data } = message.payload as PayloadType['respond'];
      resolvers.respond[messageId]?.resolve?.(data);
      break;
    }
    default: {
      console.debug('iframe received message', data);
    }
  }
}, false);

const goToLink = (path: string) => {
  window.parent.postMessage({ type: 'go', payload: { path } }, '/');
};

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
    const blobUrl = (await emit<{ url: string }>('image', { path }))?.url;
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
  const path = $el.pathname?.slice(1);
  if (!path) return;

  ev.preventDefault();
  ev.stopPropagation();

  goToLink(path);
  console.debug('clicked', { path });
}, true);
