import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { combineReducers, Reducer } from 'redux';

import { ActionType, Action } from '../actions';

export interface RootState {
  x: Record<string, any>;
}

const DEFAULT_STATE: RootState = {
  x: {},
};

const rootReducer: Reducer<RootState, Action> = (
  state = DEFAULT_STATE,
  action: Action,
) => {
  switch (action.type) {
    case ActionType.Unknown: {
      return { ...state };
    }
    default:
      return state;
  }
};

export const createRootReducer = (history: History) => combineReducers({
  root: rootReducer,
  router: connectRouter(history),
});
