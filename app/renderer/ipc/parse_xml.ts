import {
  ParseXmlMessage, ParseXmlType, ParseXmlResult,
  IpcMessageType, IpcMessageData, NavItem, OpfMeta,
} from '../../ipc/types';

const parser: DOMParser = new DOMParser();

const xmlToDoc = (data: string): Document => parser.parseFromString(data.trim(), 'text/xml');

const loadNavItems = (element: Element): NavItem[] => Array.from(element.children)
  .filter((el) => el.matches('navPoint'))
  .map((el) => {
    const label = el.querySelector('navLabel text')!.textContent!;
    const path = el.querySelector('content')!.getAttribute('src')!;
    const items = loadNavItems(el);
    const cat = el.getAttribute('class') ?? '';
    const id = el.getAttribute('id') ?? null;
    const playOrder = el.getAttribute('playOrder') ?? null;
    const seq = (playOrder && Number.parseInt(playOrder, 10)) || null;

    const item: NavItem = {
      label, path, items, cat, id, seq,
    };
    return item;
  });

const loadListItems = (ol: Element): NavItem[] => Array.from(ol.children)
  .filter((el) => el.matches('li'))
  .map((el) => {
    const label = (el.querySelector('a') || el.querySelector('span'))?.textContent ?? '';
    const path = el.querySelector('a')?.getAttribute('src') ?? '';
    const orderedList = el.querySelector('ol');
    const items = orderedList ? loadListItems(orderedList) : [];

    const item: NavItem = {
      label, path, items, cat: '', id: null, seq: null,
    };
    return item;
  });

export const parseXml = (message: ParseXmlMessage): IpcMessageData => {
  const data: ParseXmlResult = { type: message.target };
  const result: IpcMessageData = {
    type: IpcMessageType.ParseXmlResult,
    data,
  };

  try {
    const xml = xmlToDoc(message.xml);

    switch (message.target) {
      case ParseXmlType.Meta: {
        const path = xml.querySelector('rootfile')?.getAttribute('full-path');
        if (path) {
          data.result = { path };
        } else {
          result.error = 'not-found';
        }
        break;
      }
      case ParseXmlType.Opf: {
        const meta: OpfMeta = {
          title: '',
          creators: [],
          description: '',
          cover: '',
          otherMeta: {},
          docContent: {},
        };

        xml.querySelectorAll('metadata > meta[name][content]').forEach((el) => {
          meta.otherMeta[el.getAttribute('name')!] = el.getAttribute('content')!;
        });

        Array.from(xml.querySelectorAll('metadata > :not(meta)'))
          .filter((el) => el.tagName.toLowerCase().startsWith('dc:'))
          .forEach((el) => {
            const name = el.tagName.toLowerCase().slice(3);
            const value = el.textContent ?? '';
            if (!(name in meta.otherMeta)) {
              meta.docContent[name] = [];
            }
            meta.docContent[name].push(value);
          });

        if (meta.otherMeta.cover) {
          meta.cover = meta.otherMeta.cover;
          delete meta.otherMeta.cover;
        }
        if (meta.docContent.title) {
          meta.title = meta.docContent.title[0]!;
          delete meta.docContent.title;
        }
        if (meta.docContent.description) {
          meta.description = meta.docContent.description[0]!;
          delete meta.docContent.description;
        }
        if (meta.docContent.creator) {
          meta.creators = meta.docContent.creator;
          delete meta.docContent.creator;
        }

        const items = Array.from(xml.querySelectorAll('manifest > item')).map((item) => {
          const id = item.getAttribute('id')!;
          const mime = item.getAttribute('media-type')!;
          const path = item.getAttribute('href')!;
          return { id, mime, path };
        });

        const refs = Array.from(xml.querySelectorAll('spine > itemref'))
          .map((itemRef) => ({
            idRef: itemRef.getAttribute('idref')!,
            isLinear: itemRef.getAttribute('linear')?.toLocaleLowerCase() !== 'no',
          }));

        data.result = { meta, items, refs };
        break;
      }
      case ParseXmlType.Ncx: {
        const navMap = xml.querySelector('navMap');
        if (!navMap) {
          result.error = 'navMap is required';
        } else {
          const title = xml.querySelector('docTitle > text')?.textContent ?? '';
          const items = loadNavItems(navMap);
          data.result = { title, items };
        }
        break;
      }
      case ParseXmlType.Nav: {
        const nav = xml.querySelector('nav > ol');
        if (!nav) {
          result.error = 'nav is required';
        } else {
          const title = xml.querySelector('head > title')?.textContent ?? '';
          const items = loadListItems(nav);
          data.result = { title, items };
        }
        break;
      }
      default: {
        console.warn('Unknown ParseXml:', message.target);
        result.error = `Unsupported target: ${message.target}`;
      }
    }
  } catch (e) {
    console.error(e);
    result.error = e.message;
  }
  return result;
};

export default parseXml;
