// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';

import {
  IpcMessageData, OpenFileResult, OpfMeta, Navigation,
} from '../../ipc/types';
import { ManifestRef } from '../../epub/navigation';

export interface ApiPackage {
  bookId: string;
  filename: string;
  fileId: string;
  spine: ManifestRef[];
  meta?: OpfMeta;
  toc?: Navigation;
  cover?: {
    id: string;
    path: string;
    mime: string;
  };
}

export const apiOpenFile = async (file: File): Promise<false | ApiPackage> => {
  const options = { type: 'open-file', data: { filename: file.path } };
  const result = (await ipcRenderer.invoke(options.type, options)) as IpcMessageData;
  const data = result.data as OpenFileResult;
  return data.bookId ? data as ApiPackage : false;
};
