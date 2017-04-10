import buildStyle from '../helpers/styleBuilder'

// global
export
const CHANGE_ROUTING = 'CHANGE_ROUTING'
	, SHOW_SETTINGS = 'SHOW_SETTINGS'

export const changeRouting = (routing) => ({
	type: CHANGE_ROUTING,
	routing,
})

export const showSettings = () => ({
	type: SHOW_SETTINGS,
})

function updateClientCss({ settings }) {
	Api.updateClientCss(buildStyle(settings.globals))
}

// shelf
export
const OPEN_BOOK_FILES = 'OPEN_BOOK_FILES'
	, UPDATE_SHELF_BOOKS = 'UPDATE_SHELF_BOOKS'
	, UPDATE_FILTER = 'UPDATE_FILTER'
	, UPDATE_SORTING = 'UPDATE_SORTING'

export const openExistingBook = (book) => (
	(dispatch, getState) => {
		const state = getState()
		Api.openBook(book, (bookInfo) => {
			bookInfo = { ...bookInfo, ...state.settings.reader }

			Api.onClientReady(() => {
				document.getElementById('frame-book').focus()
				const { chapterPath = null, pageNo = null, pageCount = null } = bookInfo.progress || {}
				if (chapterPath && chapterPath.length) {
					Api.setClientPath({chapterPath, pageNo, pageCount})
				} else {
					Api.queryDocRoot(bookInfo.book.id, ({href: chapterPath}) => {
						// console.log('queryDocRoot', { chapterPath, pageNo, pageCount, state, })
						Api.setClientPath({chapterPath, pageNo, pageCount})
					})
				}
				updateClientCss(getState())
				// console.log({ chapterPath, pageNo, pageCount, state, })
			})

			Api.onUpdateProgress(({progress}) => {
				document.getElementById('frame-book').focus()
				const lastRead = (new Date).toISOString()
					, books = {}
					, oldBooks = getState().shelf.books
				for (const bookId in oldBooks) {
					const book = oldBooks[bookId]
					if (bookId === bookInfo.book.id) {
						books[bookId] = { ...book, lastRead }
					} else {
						books[bookId] = book
					}
				}
				dispatch({
					type: UPDATE_SHELF_BOOKS,
					books,
				})
				dispatch({
					type: UPDATE_READER_PROGRESS,
					progress,
				})
				Api.saveSettings({ scope: 'progress', 'bookId': bookInfo.book.id }, progress)
				Api.saveSettings({ scope: 'lastRead', 'bookId': bookInfo.book.id }, lastRead)
			})

			Api.onSwitchPage(({delta}) => {
				const { book, progress } = getState().reader
				doChangeReaderPage({ book, progress, delta })
			})

			dispatch({
				type: CHANGE_CURRENT_BOOK,
				bookInfo,
			})
		})
	}
)

export const openBookFiles = (files) => (
	(dispatch) => {
		Api.openFiles(files, (fileIds) => {
			dispatch(addBooksToShelf({fileIds, open: Object.keys(fileIds).length === 1}))
		})
		dispatch({
			type: OPEN_BOOK_FILES,
			files,
		})
	}
)

export const addBooksToShelf = ({fileIds, open}) => (
	(dispatch, getState) => {
		const books = { ...getState().shelf.books }
		for (const bookId in fileIds) {
			const book = fileIds[bookId]
			books[book.id] = { ...book, lower: book.title.toLowerCase() }
			Api.saveSettings({ scope: 'lastRead', bookId: book.id }, book.lastRead)
		}
		dispatch({
			type: UPDATE_SHELF_BOOKS,
			books,
		})
		Api.saveSettings('books', Object.keys(books).map((k) => {
			const { lower, lastRead, ...book } = books[k]
			return book
		}))

		if (open) {
			const keys = Object.keys(fileIds)
			if (keys.length) {
				dispatch(openExistingBook(fileIds[keys[0]]))
			}
		}
	}
)

export const updateFilter = (filter = '') => ({
	type: UPDATE_FILTER,
	filter,
})

export const updateSorting = (order) => ({
	type: UPDATE_SORTING,
	order,
})

// reader
export
const TOGGLE_TOC_PIN = 'TOGGLE_TOC_PIN'
	, TOGGLE_TOC_OPEN = 'TOGGLE_TOC_OPEN'
	, TOGGLE_TOC_ITEM_OPEN = 'TOGGLE_TOC_ITEM_OPEN'
	, CHANGE_CURRENT_BOOK = 'CHANGE_CURRENT_BOOK'
	, CHANGE_READER_CONTENT_PATH = 'CHANGE_READER_CONTENT_PATH'
	, UPDATE_READER_PROGRESS = 'UPDATE_READER_PROGRESS'

export const toggleTocPin = () => ({
	type: TOGGLE_TOC_PIN,
})

export const toggleTocOpen = (open = null) => ({
	type: TOGGLE_TOC_OPEN,
	open,
})

export const toggleTocItemOpen = (itemOrAllOpen) => ({
	type: TOGGLE_TOC_ITEM_OPEN,
	itemOrAllOpen,
})

export const changeReaderContentPath = (path) => (
	() => {
		// console.log(CHANGE_READER_CONTENT_PATH, {path})
		Api.setClientPath(Api.decodeDocumentPath(path.content))
	}
)

export const doChangeReaderPage = ({ book, progress, delta }) => {
	if (delta < 0 && progress.pageNo <= 1) {
		Api.queryDocPath({ docId: book.id, chapterPath: progress.chapterPath, go: -1 }, (chapterPath) => {
			if (chapterPath) {
				Api.setClientPath({ chapterPath, pageNo: -1 })
			} else {
				Api.showClientToast('No more chapters')
			}
		})
	} else if (delta > 0 && progress.pageNo >= progress.pageCount) {
		Api.queryDocPath({ docId: book.id, chapterPath: progress.chapterPath, go: +1 }, (chapterPath) => {
			if (chapterPath) {
				Api.setClientPath({ chapterPath })
			} else {
				Api.showClientToast('No more chapters')
			}
		})
	} else {
		const pageNo = progress.pageNo+delta
		Api.setClientPage(pageNo)
	}
}

export const changeReaderPageNo = (pageNo) => (
	() => {
		Api.setClientPage(pageNo)
	}
)

export const changeReaderChapter = (delta) => (
	(dispatch, getState) => {
		const { reader: { book, progress } } = getState()
		Api.queryDocPath({ docId: book.id, chapterPath: progress.chapterPath, go: delta }, (chapterPath) => {
			if (chapterPath) {
				Api.setClientPath({ chapterPath })
			} else {
				Api.showClientToast('No more chapters')
			}
		})
	}
)

// settings
export
const UPDATE_SETTINGS = 'UPDATE_SETTINGS'
	, CLOSE_SETTINGS = 'CLOSE_SETTINGS'

export const updateSettings = (settings) => ({
	type: UPDATE_SETTINGS,
	settings,
})

export const closeSettings = ({save}) => (
	(dispatch, getState) => {
		dispatch({
			type: CLOSE_SETTINGS,
			save,
		})
		if (!save) return

		Api.saveSettings('settings', getState().settings)
		updateClientCss(getState())
	}
)

let Api

export function installApi(api) {
	Api = api
}
