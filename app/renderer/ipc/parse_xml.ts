import {
  ParseXmlMessage, ParseXmlType, ParseXmlResult,
  IpcMessageType, IpcMessageData, NavPoint,
} from '../../ipc/types';

const parser: DOMParser = new DOMParser();

const xmlToDoc = (data: string): Document => parser.parseFromString(data.trim(), 'text/xml');

const loadPoints = (element: Element): NavPoint[] => Array.from(element.children)
  .filter((el) => el.matches('navPoint'))
  .map((el) => {
    const label = el.querySelector('navLabel text')!.textContent!;
    const path = el.querySelector('content')!.getAttribute('src')!;
    const children = loadPoints(el);
    const category = el.getAttribute('class') ?? '';
    const id = el.getAttribute('id') ?? null;
    const playOrder = el.getAttribute('playOrder') ?? null;
    const order = (playOrder && Number.parseInt(playOrder, 10)) || null;

    const point: NavPoint = {
      label, path, children, category, id, order,
    };
    return point;
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
        const items = Array.from(xml.querySelectorAll('manifest > item')).map((item) => {
          const id = item.getAttribute('id')!;
          const mime = item.getAttribute('media-type')!;
          const path = item.getAttribute('href')!;
          return { id, mime, path };
        });

        const refs = Array.from(xml.querySelectorAll('spine > itemref'))
          .map((itemRef) => itemRef.getAttribute('idref')!);

        data.result = { items, refs };
        break;
      }
      case ParseXmlType.Ncx: {
        const navMap = xml.querySelector('navMap');
        if (!navMap) {
          result.error = 'navMap is required';
        } else {
          const title = xml.querySelector('docTitle > text')?.textContent ?? '';
          const points = loadPoints(navMap);
          data.result = { title, points };
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
