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
	, OPEN_BOOK_FILE = 'OPEN_BOOK_FILE'

export const openExistingBook = (book) => ({
	type: OPEN_EXISTING_BOOK,
	book,
})

export const openBookFile = (file) => ({
	type: OPEN_BOOK_FILE,
	file,
})

// reader
export
const TOGGLE_TOC_PIN = 'TOGGLE_TOC_PIN'
	, TOGGLE_TOC_OPEN = 'TOGGLE_TOC_OPEN'
	, CHANGE_READER_CONTENT_PATH = 'CHANGE_READER_CONTENT_PATH'

export const toggleTocPin = () => ({
	type: TOGGLE_TOC_PIN,
})

export const toggleTocOpen = (open = null) => ({
	type: TOGGLE_TOC_OPEN,
	open,
})

export const changeReaderContentPath = (item) => ({
	type: CHANGE_READER_CONTENT_PATH,
	item,
})

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

