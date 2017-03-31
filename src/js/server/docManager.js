import _ from 'lodash'
import path from 'path'
import fs from 'fs'
import { fetchDynamicCss } from './fetchDynamicCss'
import { absoluteFileName } from './docBase'

function fetchStatic({ mimeType, filePath, path }, cb) {
	fs.readFile(filePath, (err, data) => {
		if (err)
			return docManager.handleNull(cb)
		cb && cb({ mimeType, data })
	})
}

const GLOBAL_RESOURCES = {
	'lodash.js': {
		filePath: path.resolve(__dirname, `../../../node_modules/lodash/lodash.min.js`),
		mimeType: 'application/javascript',
		fetch: fetchStatic,
	},
	'jquery.js': {
		filePath: path.resolve(__dirname, `../../../node_modules/jquery/dist/jquery.min.js`),
		mimeType: 'application/javascript',
		fetch: fetchStatic,
	},
	// 'moment.js': {
	// 	filePath: path.resolve(__dirname, `../../../node_modules/moment/min/moment.min.js`),
	// 	mimeType: 'application/javascript',
	// 	fetch: fetchStatic
	// },
	'frame.js': {
		filePath: path.resolve(__dirname, `../client/frame.js`),
		mimeType: 'application/javascript',
		fetch: fetchStatic,
	},
	'frame.css': {
		fetch: fetchDynamicCss
	},
	'frame.html': {
		filePath: path.resolve(__dirname, `../../frame.html`),
		mimeType: 'text/html',
		fetch: fetchStatic,
	}
}

export class DocManager {
	registeredTypes = {}
	registeredExtNames = {}
	docs = {}
	fileNames = {}

	registerType(typeName, typeClass, extFileNames) {
		this.registeredTypes[typeName] = typeClass
		for (const ext of extFileNames) {
			this.registeredExtNames[extFileNames] = typeName
		}
	}

	addDoc(doc, fileName) {
		this.docs[doc.id] = doc
		if (fileName && fileName.length) {
			this.fileNames[this.getAbsoluteFileName(fileName)] = doc
		}
	}

	handleNull(cb) {
		cb && cb({ mimeType: null, data: null })
	}

	handleDoc({ doc, filePath, method }, cb) {
		// console.log('[DocManager.handleDoc]', Object.keys(this.docs), {doc, filePath, method})
		if (doc) {
			let item = doc.pathToItem(filePath) || doc.rootItem
			// console.log('item:', item)
			doc.fetchFile(item)
			.then((buff) => {
				let mimeType = item.mediaType, data = buff
				// console.log('[fetched]', {mimeType, data})
				cb({
					mimeType,
					data,
				})
			})
			.catch((r) => {
				// console.log(`[fetch failed] ${JSON.stringify(url)}\n${r}`)
				cb({ mimeType: null, data: null })
			})
			return
		}

		this.handleNull(cb)
	}

	handleToc({ doc }, cb) {
		if (doc) {
			const toc = JSON.stringify(doc.toc)
			return cb && cb({ mimeType: 'application/json', data: new Buffer(toc) })
		}
		this.handleNull(cb)
	}

	handleGlobals(path, cb) {
		const item = GLOBAL_RESOURCES[path]
		item ? item.fetch({ ...item, path }, cb) : this.handleNull(cb)
	}

	handle({ scope, url, method, id, filePath }, cb) {
		// console.log('[DocManager]', { scope, method, id, filePath })
		try {
			switch (scope) {
				case 'doc':
					if (filePath === 'frame.html') {
						return this.handleGlobals(filePath, cb)
					}
					return this.handleDoc({ doc: this.docs[id], filePath, method }, cb)
				case 'toc':
					return this.handleToc({ doc: this.docs[id] }, cb)
				case 'globals':
					return this.handleGlobals(filePath, cb)
			}
		} catch (ex) {
			// console.log('handle request failed:', ex)
		}
		this.handleNull(cb)
	}

	queryDocPath({ docId, chapterPath, go }) {
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
		return Type ? new Type({fileName, id}) : null
	}

	getDocumentById(id) {
		return this.docs[id]
	}

	getAbsoluteFileName(fileName) {
		return absoluteFileName(fileName)
	}

	getDocumentByFileName(fileName) {
		return this.fileNames[this.getAbsoluteFileName(fileName)]
	}
}

export const docManager = new DocManager
