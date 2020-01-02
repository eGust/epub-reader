// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcMain, BrowserWindow } from 'electron';

import {
  IpcMessageType, IpcMessageData, OpenFileMessage, OpenFileResult,
} from '../ipc/types';
import { openFile } from '../epub/package_manager';

type IpcInvoker = (window: BrowserWindow, data: IpcMessageData) => Promise<IpcMessageData>;

export const invokeIpc: IpcInvoker = (window, data) => new Promise((resolve) => {
  ipcMain.once(`${data.type}:result`, (ev, result: IpcMessageData) => {
    resolve(result);
  });
  window.webContents.send(data.type, data);
});

ipcMain.handle(IpcMessageType.OpenFile, async (event, message: IpcMessageData) => {
  const data: OpenFileResult = { filename: (message.data as OpenFileMessage).filename };
  const result: IpcMessageData = {
    type: IpcMessageType.OpenFileResult,
    data,
  };

  const pm = await openFile(data.filename);
  if (pm) {
    data.normalized = pm.filename;
    data.id = pm.id;
  }
  return result;
});

export default invokeIpc;
