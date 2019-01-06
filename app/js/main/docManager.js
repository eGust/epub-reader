import _ from 'lodash'
import path from 'path'
import fs from 'fs'
import {
  absoluteFileName,
} from './docBase'

function fetchStatic({
  mimeType,
  filePath,
  // path,
}, cb) {
  fs.readFile(filePath, (err, data) => {
    if (err)
      return respondNull(cb)
    if (cb) cb({
      mimeType,
      data,
    });
  })
}

const appPath = process.env.NODE_ENV === 'production' ? __dirname : path.join(__dirname, '..', '..');

const GLOBAL_RESOURCES = {
  'lodash.js': {
    filePath: path.resolve(appPath, `../node_modules/lodash/lodash.min.js`),
    mimeType: 'application/javascript',
    fetch: fetchStatic,
  },
  'jquery.js': {
    filePath: path.resolve(appPath, `../node_modules/jquery/dist/jquery.min.js`),
    mimeType: 'application/javascript',
    fetch: fetchStatic,
  },
  // 'moment.js': {
  // 	filePath: path.resolve(__dirname, `../../../node_modules/moment/min/moment.min.js`),
  // 	mimeType: 'application/javascript',
  // 	fetch: fetchStatic
  // },
  'frame.js': {
    filePath: path.resolve(appPath, `js/client/frame.js`),
    mimeType: 'application/javascript',
    fetch: fetchStatic,
  },
  'frame.css': {
    filePath: path.resolve(appPath, `css/client/frame.css`),
    mimeType: 'text/css',
    fetch: fetchStatic,
  },
  'frame.html': {
    filePath: path.resolve(appPath, `frame.html`),
    mimeType: 'text/html',
    fetch: fetchStatic,
  },
}

export function respondNull(cb) {
  if (cb) cb({
    mimeType: null,
    data: null,
  })
}

export class DocManager {
  registeredTypes = {}

  registeredExtNames = {}

  docs = {}

  fileNames = {}

  registerType(typeName, typeClass, extFileNames) {
    this.registeredTypes[typeName] = typeClass
    extFileNames.forEach((ext) => {
      this.registeredExtNames[ext] = typeName
    })
  }

  addDoc(doc, fileName) {
    this.docs[doc.id] = doc
    if (fileName && fileName.length) {
      this.fileNames[this.getAbsoluteFileName(fileName)] = doc
    }
  }

  handleDoc = ({
    doc,
    filePath,
    // method,
  }, cb) => {
    // console.log('[DocManager.handleDoc]', Object.keys(this.docs), {doc, filePath, method})
    if (doc) {
      const item = doc.pathToItem(filePath) || doc.rootItem
      // console.log('item:', item)
      doc.fetchFile(item)
        .then((buff) => {
          const mimeType = item.mediaType;
          const data = buff
          // console.log('[fetched]', {mimeType, data})
          cb({
            mimeType,
            data,
          });
          return null;
        })
        .catch(() => {
          // console.log(`[fetch failed] ${JSON.stringify(url)}\n${r}`)
          respondNull(cb)
        })
      return
    }

    respondNull(cb)
  }

  handleToc = ({
    doc,
  }, cb) => {
    if (doc) {
      const toc = JSON.stringify(doc.toc)
      return cb && cb({
        mimeType: 'application/json',
        data: Buffer.from(toc),
      })
    }
    respondNull(cb)
  }

  handleGlobals = (path, cb) => {
    const item = GLOBAL_RESOURCES[path];
    console.log('handleGlobals', {
      path,
      item,
    });
    if (!item) return respondNull(cb);

    item.fetch({ ...item,
      path,
    }, cb);
  }

  queryDocPath({
    docId,
    chapterPath,
    go,
  }) {
    const doc = this.docs[docId]
    // console.log('DocManager.queryDocPath', { docId, chapterPath, go }, 'doc:', !!doc)
    if (!doc) return null

    let item = chapterPath == null || chapterPath === '' ? doc.rootItem : doc.pathToItem(chapterPath)
    // console.log('DocManager.queryDocPath from', { item })
    if (!item) return null

    item = doc[`${go}ItemOf`].call(doc, item)
    // console.log('DocManager.queryDocPath to', { item })
    return item && item.href
  }

  loadFile(fileName, cb, typeName = null) {
    const doc = this.getFileInstance(fileName, typeName)
    if (doc) {
      if (doc.loaded) {
        cb && cb(doc)
      } else {
        doc.loadFile(cb)
      }
    } else {
      cb && cb()
    }
  }

  openBook(fileName, bookId, cb) {
    const doc = this.getFileInstance(fileName, null, bookId)
    if (doc) {
      if (doc.loaded) {
        cb && cb(doc)
      } else {
        doc.loadFile(cb)
      }
    } else {
      cb && cb()
    }
  }

  getFileInstance(fileName, typeName, id = null) {
    const doc = this.getDocumentByFileName(fileName)
    if (doc) {
      return doc
    }

    typeName = typeName || this.registeredExtNames[path.extname(fileName).toLowerCase()]
    const Type = typeName && this.registeredTypes[typeName]
    return Type ? new Type({
      fileName,
      id,
    }) : null
  }

  getDocumentById(id) {
    return this.docs[id]
  }

  getAbsoluteFileName = (fileName) => absoluteFileName(fileName);

  getDocumentByFileName(fileName) {
    return this.fileNames[this.getAbsoluteFileName(fileName)]
  }
}

export const docManager = new DocManager
