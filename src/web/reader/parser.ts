import { emitMessage } from './message';
import { page } from './actions';
import { join } from '../utils';

export const IMAGE_TYPES: Record<string, string> = {
  'svg image': 'xlink:href',
  img: 'src',
}

const domParser = new DOMParser();

const resolveImages = async (root: HTMLElement): Promise<string> => {
  const images = new Map<Element, { attr: string, path: string }>();
  Object.entries(IMAGE_TYPES).forEach(([selector, attrName]) => {
    const attrs = { attr: attrName };
    root.querySelectorAll(selector).forEach((el) => {
      const path = el.getAttribute(attrName);
      if (!path) return;

      images.set(el, { ...attrs, path: join(page.basePath, path) });
    })
  });

  const paths = [...new Set([...images.values()].map(({ path }) => path))];
  const urls = (await emitMessage<{ urls: Record<string, string> }>('images', { paths }))?.urls;
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

export const parseHtml = (html: string, mime: string): Promise<string> => {
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
