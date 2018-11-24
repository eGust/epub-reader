import {
  ipcRenderer,
  shell,
} from 'electron'
import _ from 'lodash'
import serviceMessages from '../shared/serviceMessages'
import log from '../shared/logger'
import {
  installApi,
} from './redux/actions'

const $ = window.$ = require('jquery')

let onClientReadyEvent;
let onUpdateProgressEvent;
let onSwitchPageEvent

const MESSAGE_HANDLERS = {
  ready: () => {
    onClientReadyEvent && onClientReadyEvent()
  },

  updateProgress: (progress) => {
    onUpdateProgressEvent && onUpdateProgressEvent(progress)
  },

  switchPage: (delta) => {
    onSwitchPageEvent && onSwitchPageEvent(delta)
  },

  openExternal: ({
    url,
  }) => {
    shell.openExternal(url)
  },
}

function messageHandler(event) {
  const {
    channel,
    action,
    ...data
  } = event.data
  if (channel !== 'ebook')
    return
  log(`[main] receive`, {
    action,
    data,
  })
  MESSAGE_HANDLERS[action] && MESSAGE_HANDLERS[action](data)
}

window.addEventListener('message', messageHandler, false)

function postWebMessage(data) {
  log(`[main] send`, data)
  document.getElementById('frame-book').contentWindow.postMessage({ ...data,
    channel: 'ebook',
  }, '*')
}

function sendServiceMessage(msg, data) {
  log(`[A.SEND]`, msg, data)
  ipcRenderer.send(`s-${msg}`, data)
}

const onReceiveServiceMessages = {
  [serviceMessages.queryDocRoot]: ({
    rootItem,
    apiCallId,
  }) => {
    const cb = popApiCallbak(apiCallId)
    cb && cb(rootItem)
  },

  [serviceMessages.queryDocPath]: ({
    chapterPath,
    apiCallId,
  }) => {
    const cb = popApiCallbak(apiCallId)
    cb && cb(chapterPath)
  },

  [serviceMessages.openFiles]: ({
    fileIds,
    apiCallId,
  }) => {
    const cb = popApiCallbak(apiCallId)
    cb && cb(fileIds)
  },

  [serviceMessages.openBook]: ({
    book,
    toc = [],
    reason = null,
    progress = null,
    apiCallId,
  }) => {
    const cb = popApiCallbak(apiCallId)
    cb && cb({
      book,
      toc,
      progress: progress || DEFAULT_STATE.reader.progress,
      reason,
    })
  },

  [serviceMessages.getDbValue]: ({
    values,
    apiCallId,
  }) => {
    const cb = popApiCallbak(apiCallId)
    cb && cb(values)
  },
}

const DEFAULT_STATE = {
  routing: 'shelf',
  showSettings: false,
  shelf: {
    bookCovers: [],
    books: {},
    opening: false,
    filter: '',
    sorting: {
      method: 'Last Read',
      order: 'descending',
    },
  },
  reader: {
    book: {
      title: null,
      id: null,
    },
    opening: true,
    toc: [],
    isTocPinned: false,
    isTocOpen: false,
    progress: {
      chapterPath: null,
      chapterTitle: null,
      pageNo: 0,
      pageCount: 0,
      anchor: null,
    },
  },
  settings: {
    globals: {
      fontFamily: ['Arial', 'Microsoft YaHei'],
      color: '#000000',
      backgroundColor: '#ffffff',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontSize: 30,
      lineHeight: 50,
      letterSpacing: 0,
      linkColor: '#448aff',
      linkUnerline: 'underline',
    },
    reader: {
      isTocPinned: false,
      isTocOpen: false,
      opening: false,
    },
  },
}

let idApiCall = 1;
let reduxStore = null

function getApiCallbackId(cb) {
  const id = idApiCall;
  idApiCall += 1;
  apiCallbacks[id] = cb
  return id
}

function popApiCallbak(id) {
  const cb = apiCallbacks[id]
  delete apiCallbacks[id]
  return cb
}

function showToastDialog($dlg) {
  $('body>#dialog-container').append($dlg)
  setTimeout(() => {
    $dlg.remove()
  }, 4000)
}

const apiCallbacks = {};

const Api = {
  DEFAULT_STATE,

  setReduxStore(value) {
    reduxStore = value
  },

  getReduxState() {
    return reduxStore && reduxStore.getState()
  },

  async getSavedState(prepare, cb) {
    const r = _.merge({}, DEFAULT_STATE);

    r.shelf.books = {};
    _.each(await Api.loadSettings('books'), async (book) => {
      r.shelf.books[book.id] = {
        ...book,
        lastRead: await Api.loadSettings({
          scope: 'lastRead',
          'bookId': book.id,
        }),
      };
    });

    const settings = await Api.loadSettings('settings');
    if (settings) {
      r.settings = _.merge({}, r.settings, settings)
    }

    const sorting = await Api.loadSettings('shelf.sorting')
    if (sorting) {
      r.shelf.sorting = _.merge({}, r.shelf.sorting, sorting)
    }

    if (cb) cb(prepare(r));
  },

  registerServiceApi() {
    installApi(Api)
    for (const msg in onReceiveServiceMessages) {
      ipcRenderer.on(`r-${msg}`, (event, data) => {
        log(`[A.RECEIVE]`, msg, data)
        onReceiveServiceMessages[msg](data)
      })
    }
  },

  openFiles(files, cb) {
    sendServiceMessage(serviceMessages.openFiles, {
      files,
      apiCallId: getApiCallbackId(cb),
    })
  },

  openBook(book, cb) {
    sendServiceMessage(serviceMessages.openBook, {
      book,
      apiCallId: getApiCallbackId(cb),
    })
  },

  setClientPath(params) {
    postWebMessage({
      action: 'setPath',
      ...params,
    })
  },

  setClientPage(page) {
    postWebMessage({
      action: 'setPage',
      page,
    })
  },

  updateClientCss(styles) {
    postWebMessage({
      action: 'updateCss',
      styles,
    })
  },

  showClientToast(message) {
    postWebMessage({
      action: 'showToast',
      message,
    })
  },

  decodeDocumentPath(path) {
    const p = path.split('#', 1)[0];
    const h = path.slice(p.length + 1)
    return {
      chapterPath: p,
      anchor: h.length ? h : null,
    }
  },

  queryDocRoot(docId, cb) {
    sendServiceMessage(serviceMessages.queryDocRoot, {
      docId,
      apiCallId: getApiCallbackId(cb),
    })
  },

  queryDocPath({
    docId,
    chapterPath,
    go,
  }, cb) {
    sendServiceMessage(serviceMessages.queryDocPath, {
      docId,
      chapterPath,
      go,
      apiCallId: getApiCallbackId(cb),
    })
  },

  onClientReady(cb) {
    onClientReadyEvent = cb
  },

  onUpdateProgress(cb) {
    onUpdateProgressEvent = cb
  },

  onSwitchPage(cb) {
    onSwitchPageEvent = cb
  },

  saveSettings(key, values) {
    sendServiceMessage(serviceMessages.setDbValue, {
      path: key,
      values,
    })
  },

  loadSettings: path => new Promise((resolve) => {
    const apiCallId = getApiCallbackId(resolve);
    sendServiceMessage(serviceMessages.getDbValue, {
      path,
      apiCallId,
    });
  }),

  showToast(message, style = null) {
    showToastDialog($(`<dialog class="${style || ''}">`).text(message))
  },
}

export default Api
