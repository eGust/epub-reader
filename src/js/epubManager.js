import _ from 'lodash'
import path from 'path'
import fs from 'fs'
import { EPub } from './epub'
import { fetchDynamicCss } from './fetchDynamicCss'

function fetchStatic({ mimeType, filePath, path }, cb) {
	fs.readFile(filePath, (err, data) => {
		if (err)
			return epubManager.handleNull(cb)
		cb({ mimeType, data })
	})
}

const GLOBAL_RESOURCES = {
	'lodash.js': {
		filePath: path.resolve(__dirname, `../../node_modules/lodash/lodash.min.js`),
		mimeType: 'application/javascript',
		fetch: fetchStatic
	},
	'jquery.js': {
		filePath: path.resolve(__dirname, `../../node_modules/jquery/dist/jquery.min.js`),
		mimeType: 'application/javascript',
		fetch: fetchStatic
	},
	// 'moment.js': {
	// 	filePath: path.resolve(__dirname, `../../node_modules/moment/min/moment.min.js`),
	// 	mimeType: 'application/javascript',
	// 	fetch: fetchStatic
	// },
	'frame.js': {
		filePath: path.resolve(__dirname, `restricted/frame.js`),
		mimeType: 'application/javascript',
		fetch: fetchStatic
	},
	'frame.css': {
		fetch: fetchDynamicCss
	},
}

export class EPubManager {
	constructor() {
		this.epubs = {}
	}

	addDoc(doc) {
		this.epubs[doc.id] = doc
	}

	handleNull(cb) {
		cb({ mimeType: null, data: null })
	}

	handleDoc({ doc, filePath, method }, cb) {
		if (doc) {
			let item = doc.pathToItem(filePath) || doc.rootItem
			// console.log('item:', item)
			doc.fetchFile(item)
			.then((buff) => {
				let mimeType = item.mediaType, data = buff
				if (item.mediaType.indexOf('html') > 0) {
					mimeType = 'text/html'
					data = new Buffer(`<!DOCTYPE html>${buff}`)
				}
				// console.log(mimeType, data.toString())
				cb({
					mimeType,
					data,
				})
			})
			.catch((r) => {
				console.log(`[fetch failed] ${JSON.stringify(url)}\n${r}`)
				cb({ mimeType: null, data: null })
			})
			return
		}

		this.handleNull(cb)
	}

	handleToc({ doc }, cb) {
		if (doc) {
			let toc = JSON.stringify(doc.toc)
			cb({ mimeType: 'application/json', data: new Buffer(toc) })
			return
		}
		this.handleNull(cb)
	}

	handleGlobals(path, cb) {
		let item = GLOBAL_RESOURCES[path]
		item ? item.fetch({ ...item, path }, cb) : this.handleNull(cb)
	}

	handle({ scope, url, method, id, filePath }, cb) {
		console.log('handle', { scope, url, method, id, filePath })
		try {
			switch (scope) {
				case 'doc':
					return this.handleDoc({ doc: this.epubs[id], filePath, method }, cb)
				case 'toc':
					return this.handleToc({ doc: this.epubs[id] }, cb)
				case 'globals':
					return this.handleGlobals(filePath, cb)
			}
		} catch (ex) {
			console.log('handle request failed:', ex)
		}
		this.handleNull(cb)
	}
}

export const epubManager = new EPubManager
