import './reader.styl';

window.addEventListener('message', (ev) => {
  console.log('iframe received message', ev);
}, false);

document.addEventListener('error', (ev) => {
  console.warn('document error', ev);
}, true);

window.addEventListener('error', (ev) => {
  console.warn('window error', ev);
}, true);
