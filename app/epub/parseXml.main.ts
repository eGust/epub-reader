import { getMainWindow } from '../main/main_window';
import { ParseXmlResult, ParseXmlMessage, IpcMessageType } from '../ipc/types';
import { invokeIpc } from '../main/ipc';

const parse = async (data: ParseXmlMessage): Promise<ParseXmlResult> => {
  const result = await invokeIpc(getMainWindow()!, { type: IpcMessageType.ParseXml, data });
  if (result.error) console.warn(result.error);
  return result.data as ParseXmlResult;
};

export default parse;
