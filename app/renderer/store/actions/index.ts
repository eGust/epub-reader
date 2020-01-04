import { ActionCreator } from 'redux';

import { ApiPackage } from '../../api/open_file';

export enum ActionType {
  OpenFile = 'OpenFile',
  Unknown = 'Unknown',
}

export interface Action {
  type: ActionType;
  data: ApiPackage | null;
}

export const actionOpenFile: ActionCreator<Action> = (data: ApiPackage) => ({
  type: ActionType.OpenFile,
  data,
});
