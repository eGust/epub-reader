// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';

import { IpcMessageType, ParseXmlMessage, IpcMessageData } from '../../ipc/types';
import { parseXml } from './parse_xml';

ipcRenderer.on(IpcMessageType.ParseXml, (ev, message: IpcMessageData) => {
  const result = parseXml(message.data as ParseXmlMessage);
  ev.sender.send(result.type, result);
});
