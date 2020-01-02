import {
  ParseXmlType, ParseXmlMessage, ParseXmlResult,
  MetaData, OpfData, Navigation,
} from '../ipc/types';

const parseXml = async (data: ParseXmlMessage): Promise<ParseXmlResult> => {
  switch (process.type) {
    case 'browser': {
      // eslint-disable-next-line global-require
      const parse = require('./parseXml.main').default;
      return parse(data);
    }
    case 'renderer': {
      // eslint-disable-next-line global-require
      const parse = require('./parseXml.renderer').default;
      return parse(data);
    }
    default: {
      console.error();
      return { type: data.target };
    }
  }
};

export const parseMeta = async (xml: string): Promise<string> => {
  const { result } = await parseXml({ xml, target: ParseXmlType.Meta });
  if (!result) return '';
  return (result as MetaData).path;
};

export const parseOpf = async (xml: string): Promise<OpfData | null> => {
  const { result } = await parseXml({ xml, target: ParseXmlType.Opf });
  if (!result) return null;
  return result as OpfData;
};

export const parseNav = async (xml: string): Promise<Navigation | null> => {
  const { result } = await parseXml({ xml, target: ParseXmlType.Ncx });
  if (!result) return null;
  return result as Navigation;
};
