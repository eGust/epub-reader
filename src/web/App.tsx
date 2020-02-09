import React from 'react';
import Home from './app/Home';

declare const module: any;
const App = () => (<Home />);

if (module.hot) {
  module.hot.accept();
}

export default App;
