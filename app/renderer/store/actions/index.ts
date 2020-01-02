import { ActionCreator } from 'redux';

export enum ActionType {
  Unknown = 'Unknown',
}

export interface Action {
  type: ActionType;
  payload: Record<string, unknown>;
}

export const foo: ActionCreator<Action> = () => ({
  type: ActionType.Unknown,
  payload: {},
});
