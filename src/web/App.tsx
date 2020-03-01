import React from 'react';
import { Provider } from 'react-redux';

import Home from './app/Home';
import { store } from './app/store';

declare const module: any;
const App = () => (
  <Provider store={store}>
    <Home />
  </Provider>
);

if (module.hot) {
  module.hot.accept();
}

export default App;
