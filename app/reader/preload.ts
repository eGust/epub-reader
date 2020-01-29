// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { SendAsyncMessage } from './types';

const parser = new DOMParser();

const parseHtml = (html: string): HTMLElement => {
  const doc = parser.parseFromString(html, 'text/html');
  return doc.documentElement;
};

ipcRenderer.on('load-page', (ev, { path, html, mimeType }) => {
  const $r = document.getElementById('reader')!;
  $r.innerHTML = '';
  $r.appendChild(parseHtml(html));
  console.log('load-page', { path, mimeType });
});

const sendAsyncMessage: SendAsyncMessage = (channel, ...args) => new Promise((resolve) => {
  ipcRenderer.once(`${channel}:result`, (ev, ...results) => {
    resolve(results);
  });
  ipcRenderer.sendToHost(channel, ...args);
});

window.sendAsyncMessage = sendAsyncMessage;

window.sendToHost = (channel, payload) => {
  ipcRenderer.sendToHost(channel, payload);
};
