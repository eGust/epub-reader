import React from 'react';
import ReactDOM from 'react-dom';

import './index.styl';
import App from './App';
import './input';

(() => {
  ReactDOM.render(
    <App />,
    document.getElementById('root'),
  );

  const tmp = document.getElementById('temp');
  if (tmp) { tmp.parentNode!.removeChild(tmp); }
})();
