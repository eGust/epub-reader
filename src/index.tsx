import React from 'react';
import ReactDOM from 'react-dom';

import './index.styl';
import App from './App';

(() => {
  ReactDOM.render(
    <App />,
    document.getElementById('root'),
  );

  const tmp = document.getElementById('temp');
  if (tmp) { tmp.parentNode!.removeChild(tmp); }
})();
// window.addEventListener('message', (ev) => {
//   console.log('main window received message', ev);
// }, false);
