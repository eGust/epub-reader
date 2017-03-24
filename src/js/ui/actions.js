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

// shelf
export
const OPEN_EXISTING_BOOK = 'OPEN_EXISTING_BOOK'
	, OPEN_BOOK_FILES = 'OPEN_BOOK_FILES'
	, ADD_BOOKS_TO_SHELF = 'ADD_BOOKS_TO_SHELF'

export const openExistingBook = (book) => (
	(dispatch) => {
		Api.openBook(book, (bookInfo) => {
			dispatch(changeCurrentBook(bookInfo))
		})
		dispatch({
			type: OPEN_EXISTING_BOOK,
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
	(dispatch) => {
		dispatch({
			type: ADD_BOOKS_TO_SHELF,
			fileIds,
		})
		if (open) {
			const keys = Object.keys(fileIds)
			if (keys.length) {
				const {id, title} = fileIds[keys[0]]
				dispatch(openExistingBook({id, title, fileName: keys[0]}))
			}
		}
	}
)

// reader
export
const TOGGLE_TOC_PIN = 'TOGGLE_TOC_PIN'
	, TOGGLE_TOC_OPEN = 'TOGGLE_TOC_OPEN'
	, CHANGE_CURRENT_BOOK = 'CHANGE_CURRENT_BOOK'
	, CHANGE_READER_CONTENT_PATH = 'CHANGE_READER_CONTENT_PATH'
	, CHANGE_READER_PAGE = 'CHANGE_READER_PAGE'
	, CHANGE_READER_CHAPTER = 'CHANGE_READER_CHAPTER'

export const toggleTocPin = () => ({
	type: TOGGLE_TOC_PIN,
})

export const toggleTocOpen = (open = null) => ({
	type: TOGGLE_TOC_OPEN,
	open,
})

export const changeCurrentBook = (bookInfo) => (
	(dispatch, getState) => {
		const state = getState()
			, bookInfo = { ...bookInfo, ...state.settings.reader }
		console.log(bookInfo)
		dispatch({
			type: CHANGE_CURRENT_BOOK,
			bookInfo,
		})

		Api.onClientReady(() => {
			const { chapterPath: path = '', pageNo = null, pageCount = null } = bookInfo.progress || {}
			console.log({ path, pageNo, pageCount, state, })
			Api.setClientPath({path, pageNo, pageCount})
		})
	}
)

export const changeReaderContentPath = (path) => (
	(dispatch) => {
		console.log(CHANGE_READER_CONTENT_PATH, {path})
		Api.setClientPath(Api.decodeDocumentPath(path))
	}
)

export const changeReaderPage = (delta) => (
	(dispatch) => {
		console.log(CHANGE_READER_PAGE, {delta})
		dispatch({
			type: CHANGE_READER_PAGE,
			delta,
		})
	}
)

export const changeReaderChapter = (delta) => (
	(dispatch) => {
		console.log(CHANGE_READER_CHAPTER, {delta})
		dispatch({
			type: CHANGE_READER_CHAPTER,
			delta,
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

export const closeSettings = ({save}) => ({
	type: CLOSE_SETTINGS,
	save,
})

let Api

export function installApi(api) {
	Api = api
}
