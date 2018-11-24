import {
  ipcMain,
} from 'electron'
import {
  docManager,
} from './docManager'
import EPub from './epubDoc'
import serviceMessages from '../shared/serviceMessages'
import {
  getDbValue,
  setDbValue,
} from '../shared/db'
import log from '../shared/logger'

const services = {
  [serviceMessages.queryDocRoot]: ({
    docId,
    apiCallId,
  }, reply) => {
    const doc = docManager.getDocumentById(docId)
    log('queryDocRoot', {
      doc,
      rootItem: doc && doc.rootItem,
    })
    reply({
      rootItem: doc && doc.rootItem,
      apiCallId,
    })
  },

  [serviceMessages.queryDocPath]: ({
    docId,
    chapterPath,
    go,
    apiCallId,
  }, reply) => {
    go = go > 0 ? 'next' : 'prev'
    chapterPath = docManager.queryDocPath({
      docId,
      chapterPath,
      go,
    })
    reply({
      chapterPath,
      apiCallId,
    })
  },

  [serviceMessages.openFiles]: ({
    files,
    apiCallId,
  }, reply) => {
    const fileIds = {};


    const lastRead = (new Date).toISOString();


    const fns = files.map((fileName, i) => {
      const index = i + 1
      return () => {
        docManager.loadFile(fileName, (doc) => {
          doc && (fileIds[fileName] = {
            id: doc.id,
            title: doc.title,
            lastRead,
            fileInfo: doc.fileInfo,
            coverImage: doc.data && doc.data.coverImage,
          })
          // console.log({files, apiCallId, index})
          if (index >= files.length) {
            reply({
              fileIds,
              apiCallId,
            })
          } else {
            fns[index]()
          }
        })
      }
    })

    if (fns.length) {
      fns[0]()
    } else {
      reply({
        fileIds,
        apiCallId,
      })
    }
  },

  [serviceMessages.openBook]: ({
    book,
    apiCallId,
  }, reply) => {
    docManager.openBook(book.fileInfo.path, book.id, (doc) => {
      if (!doc.id) {
        return reply({
          book: null,
          reason: doc.reason,
          apiCallId,
        })
      }
      getDbValue({
        scope: 'progress',
        'bookId': book.id,
      }, (progress) => {
        reply({
          book,
          toc: doc.toc,
          progress,
          apiCallId,
        })
      })
    })
  },

  [serviceMessages.getDbValue]: ({
    path,
    apiCallId,
  }, reply) => {
    getDbValue(path, (values) => reply({
      values,
      apiCallId,
    }))
  },

  [serviceMessages.setDbValue]: ({
    path,
    values,
  }) => {
    setDbValue(path, values)
  },

}

export function registerServices() {
  EPub.register()

  ipcMain.once('require-setupDevTools', (event) => {
    if (process.env.NODE_ENV !== 'production') {
      event.sender.send('reply-setupDevTools', 'setup')
    }
  })

  for (const msg in services) {
    ipcMain.on(`s-${msg}`, (event, data) => {
      log(`[S.RECEIVE] ${msg}`, data)
      services[msg](data, (data) => {
        log(`[S.REPLY] ${msg}`, Object.keys(data))
        event.sender.send(`r-${msg}`, data)
      })
    })
  }
}
