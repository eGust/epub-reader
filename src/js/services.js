import _ from 'lodash'
import { serviceMessages } from './serviceMessages'
import { app, BrowserWindow, ipcMain } from 'electron'
import { docManager } from './server/docManager'
import EPub from './server/epubDoc'
import { getDbValue, setDbValue } from './db'
import log from './logger'

const services = {
	[serviceMessages.queryDocRoot]: ({docId, apiCallId}, reply) => {
		const doc = docManager.getDocumentById(docId)
		reply({rootItem: doc && doc.rootItem, apiCallId})
	},

	[serviceMessages.queryDocPath]: ({docId, chapterPath, go, apiCallId}, reply) => {
		go = go > 0 ? 'next' : 'prev'
		chapterPath = docManager.queryDocPath({docId, chapterPath, go})
		reply({chapterPath, apiCallId})
	},

	[serviceMessages.openFiles]: ({files, apiCallId}, reply) => {
		const fileIds = {}
			, lastRead = (new Date).toISOString()
			, fns = files.map((fileName, i) => {
			const index = i+1
			return () => {
				docManager.loadFile(fileName, (doc) => {
					doc && (fileIds[fileName] = { id: doc.id, title: doc.title, lastRead, fileInfo: doc.fileInfo })
					// console.log({files, apiCallId, index})
					if (index >= files.length) {
						reply({fileIds, apiCallId})
					} else {
						fns[index]()
					}
				})
			}
		})

		if (fns.length) {
			fns[0]()
		} else {
			reply({fileIds, apiCallId})
		}
	},

	[serviceMessages.openBook]: ({book, apiCallId}, reply) => {
		docManager.loadFile(book.fileInfo.path, (doc) => {
			if (!doc)
				return reply({apiCallId})
			return reply({book, toc: doc.toc, apiCallId})
		})
	},

	[serviceMessages.getDbValue]: ({path, apiCallId}, reply) => {
		getDbValue(path, (values) => reply({values, apiCallId}))
	},

	[serviceMessages.setDbValue]: ({path, values}) => {
		setDbValue(path, values)
	},

}

export function registerServices() {
	EPub.register()

	ipcMain.once('require-setupDevTools', (event, data) => {
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
