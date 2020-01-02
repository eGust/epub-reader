import { parseXml } from '../renderer/ipc/parse_xml';
import { ParseXmlResult, ParseXmlMessage } from '../ipc/types';

const parse = (data: ParseXmlMessage): ParseXmlResult => {
  const result = parseXml(data);
  if (result.error) console.warn(result.error);
  return result.data as ParseXmlResult;
};

export default parse;
