import { initializeIcons } from 'office-ui-fabric-react';
import * as React from 'react';
import { Provider } from 'react-redux';

import store from '../store';
import Routes from './Routes';

initializeIcons();

// Render components
const App = () => (
  // <React.StrictMode>
  <Provider store={store}>
    <Routes />
  </Provider>
  // </React.StrictMode>
);

export default App;
