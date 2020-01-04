import * as React from 'react';
import { render } from 'react-dom';

import App from './routes/App';

import './file_drop';

const mountAppTo = (rootElement: HTMLElement) => {
  if (process.env.NODE_ENV === 'production') {
    render((<App />), rootElement);
  } else {
    // eslint-disable-next-line global-require
    require('./debug');
    // eslint-disable-next-line global-require
    const { AppContainer } = require('react-hot-loader');
    render((
      <AppContainer>
        <App />
      </AppContainer>
    ),
    rootElement);
  }
};

export default mountAppTo;
