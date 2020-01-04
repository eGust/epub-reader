import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { combineReducers, Reducer } from 'redux';

import { ActionType, Action } from '../actions';
import { RootState } from './types';
import { ApiPackage } from '../../api/open_file';

const DEFAULT_STATE: RootState = {
  covers: [],
  bookFiles: {},
  bookData: {},
};

const rootReducer: Reducer<RootState, Action> = (
  state = DEFAULT_STATE,
  action: Action,
) => {
  switch (action.type) {
    case ActionType.OpenFile: {
      const data = action.data as ApiPackage;
      const { covers: oldCovers, bookFiles: oldFiles, bookData: oldData } = state;
      const { bookId, fileId, filename } = data;
      const meta = data.meta!;

      const cover = oldCovers.find(({ fileId: fid }) => fid === fileId) ?? {
        bookId,
        fileId,
        filename,
        title: meta.title,
        coverImageURL: '',
      };
      const covers = [...oldCovers.filter((c) => c !== cover), cover];

      const bookFiles = fileId in oldFiles ? oldFiles : {
        ...oldFiles,
        [fileId]: {
          fileId, bookId, filename, nav: [],
        },
      };

      const bookData = bookId in oldData ? oldData : {
        ...oldData,
        [bookId]: {
          bookId,
          spine: data.spine,
          meta,
          toc: data.toc || {
            title: meta.title,
            items: [],
          },
          cover: data.cover,
        },
      };

      return { covers, bookFiles, bookData };
    }
    default:
      return state;
  }
};

export const createRootReducer = (history: History) => combineReducers({
  root: rootReducer,
  router: connectRouter(history),
});

export type StoreState = ReturnType<ReturnType<typeof createRootReducer>>;

export * from './types';
