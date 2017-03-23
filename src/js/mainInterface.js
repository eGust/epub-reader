import { ipcRenderer } from 'electron'
import $ from 'jquery'
import { serviceMessages } from './serviceMessages'
import { installApi } from './ui/actions'

window.$ = $

function messageHandler(event) {
	let { channel, action, ...data } = event.data
	if (channel !== 'ebook')
		return
	console.log('[main] receive:', { action, data })
	MESSAGE_HANDLERS[action] && MESSAGE_HANDLERS[action](data)
}

window.addEventListener('message', messageHandler, false)

function postWebMessage(data) {
	console.log('[main] send:', data)
	document.getElementById('frame-book').contentWindow.postMessage({ ...data, channel: 'ebook', }, '*')
}

function sendServiceMessage(msg, data) {
	console.log(`[A.SEND] ${msg}`, data)
	ipcRenderer.send(`s-${msg}`, data)
}

const onReceiveServiceMessages = {
	[serviceMessages.docPath]: (data) => {
		if (data.path) {
			let { go } = data.query, anchor = go === 'prev' ? '*scroll-to-last-page' : ''
			postWebMessage({ action: 'changePath', filePath: data.path, anchor })
			// updateAppState({ filePath: data.path, anchor })
		}
	},

	[serviceMessages.openFiles]: ({fileIds, apiCallId}) => {
		const cb = popApiCallbak(apiCallId)
		cb && cb(fileIds)
	},

	[serviceMessages.openBook]: ({bookId = null, bookName = null, toc = [], apiCallId}) => {
		const cb = popApiCallbak(apiCallId)
		cb && cb({bookId, bookName, toc})
	},
}

const DEFAULT_STATE = {
	routing: 'shelf',
	showSettings: false,
	shelf: {
		bookCovers: [],
		books: {},
		opening: false,
	},
	reader: {
		bookName: null,
		bookId: null,
		opening: true,
		toc: [],
		chapterTitle: null,
		chapterPath: null,
		pageIndex: null,
		pageCount: null,
		isTocPinned: false,
		isTocOpen: false,
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
				console.log(`[A.RECEIVE] ${msg}`, {event, data})
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
}

export default Api
