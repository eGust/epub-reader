import React from 'react';
import ReactDOM from 'react-dom';

import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';

import Api from './mainApi';
import App from './containers/app_container';
import { reducer, prepareSavedState } from './redux/reducers';

Api.registerServiceApi();

Api.getSavedState(prepareSavedState, initialState => {
  const docRoot = document.getElementById('root');
  const logger = createLogger({ collapsed: true, duration: true, diff: true });
  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(thunk, logger)
  );

  Api.setReduxStore(store);

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    docRoot
  );
});
