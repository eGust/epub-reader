import { ipcRenderer } from 'electron'
import $ from 'jquery'
import { serviceMessages } from './serviceMessages'
import { installApi } from './ui/actions'
import log from './logger'

window.$ = $

function now() {
	return (new Date).toISOString()
}

let onClientReadyEvent, onUpdateProgressEvent

const MESSAGE_HANDLERS = {
	ready: () => {
		onClientReadyEvent && onClientReadyEvent()
	},

	updateProgress: (progress) => {
		onUpdateProgressEvent && onUpdateProgressEvent(progress)
	},
}

function messageHandler(event) {
	let { channel, action, ...data } = event.data
	if (channel !== 'ebook')
		return
	log(`[main] receive`, { action, data })
	MESSAGE_HANDLERS[action] && MESSAGE_HANDLERS[action](data)
}

window.addEventListener('message', messageHandler, false)

function postWebMessage(data) {
	log(`[main] send`, data)
	document.getElementById('frame-book').contentWindow.postMessage({ ...data, channel: 'ebook', }, '*')
}

function sendServiceMessage(msg, data) {
	log(`[A.SEND]`, msg, data)
	ipcRenderer.send(`s-${msg}`, data)
}

const onReceiveServiceMessages = {
	[serviceMessages.queryDocRoot]: ({rootItem, apiCallId}) => {
		const cb = popApiCallbak(apiCallId)
		cb && cb(rootItem)
	},

	[serviceMessages.queryDocPath]: ({chapterPath, apiCallId}) => {
		const cb = popApiCallbak(apiCallId)
		cb && cb(chapterPath)
	},

	[serviceMessages.openFiles]: ({fileIds, apiCallId}) => {
		const cb = popApiCallbak(apiCallId)
		cb && cb(fileIds)
	},

	[serviceMessages.openBook]: ({book, toc = [], apiCallId}) => {
		const cb = popApiCallbak(apiCallId)
		cb && cb({book, toc})
	},

	[serviceMessages.getDbValue]: ({values, apiCallId}) => {
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
			method: 'Title',
			order: 'ascending',
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
			//
		},
		reader: {
			isTocPinned: false,
			isTocOpen: false,
			opening: false,
		},
	}
}

let apiCallId = 1

function getApiCallbackId(cb) {
	const id = apiCallId++
	apiCallbacks[id] = cb
	return id
}

function popApiCallbak(id) {
	const cb = apiCallbacks[id]
	delete apiCallbacks[id]
	return cb
}

const apiCallbacks = {}
	, Api = {
	DEFAULT_STATE,

	getSavedState() {
		return DEFAULT_STATE
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
		sendServiceMessage(serviceMessages.openFiles, { files, apiCallId: getApiCallbackId(cb) })
	},

	openBook(book, cb) {
		sendServiceMessage(serviceMessages.openBook, { book, apiCallId: getApiCallbackId(cb) })
	},

	setClientPath(params) {
		postWebMessage({ action: 'setPath', ...params })
	},

	setClientPage(page) {
		postWebMessage({ action: 'setPage', page })
	},

	decodeDocumentPath(path) {
		const p = path.split('#', 1)[0]
			, h = path.slice(p.length+1)
		return { chapterPath: p, anchor: h.length ? h : null }
	},

	queryDocRoot(docId, cb) {
		sendServiceMessage(serviceMessages.queryDocRoot, { docId, apiCallId: getApiCallbackId(cb) })
	},

	queryDocPath({docId, chapterPath, go}, cb) {
		sendServiceMessage(serviceMessages.queryDocPath, { docId, chapterPath, go, apiCallId: getApiCallbackId(cb) })
	},

	onClientReady(cb) {
		onClientReadyEvent = cb
	},

	onUpdateProgress(cb) {
		onUpdateProgressEvent = cb
	},

	saveSettings(key, values) {
		sendServiceMessage(serviceMessages.setDbValue, { path: key, values })
	},

	loadSettings(key, cb) {
		sendServiceMessage(serviceMessages.getDbValue, { path: key, apiCallId: getApiCallbackId(cb) })
	},
}

export default Api
