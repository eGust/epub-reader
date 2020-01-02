import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import {
  applyMiddleware, compose, createStore, Store,
} from 'redux';

import { createRootReducer, RootState } from './reducers';

export const history = createBrowserHistory();

const configureStore = (initialState?: { root: RootState }): Store => {
  const middlewares = applyMiddleware(routerMiddleware(history));
  const rootReducer = createRootReducer(history);
  const enhancer = process.env.NODE_ENV === 'production'
    ? compose(middlewares)
    // eslint-disable-next-line global-require,import/no-extraneous-dependencies
    : require('redux-devtools-extension').composeWithDevTools(middlewares);
  return createStore(rootReducer, initialState, enhancer);
};

const store = configureStore();

declare let module: NodeModule;

if (process.env.NODE_ENV !== 'production' && typeof module.hot !== 'undefined') {
  // eslint-disable-next-line global-require
  module.hot.accept('./reducers', () => store.replaceReducer(require('./reducers').rootReducer));
}

export default store;
