import _ from 'lodash'
import { combineReducers } from 'redux'
import {
	CHANGE_READER_CONTENT_PATH,
	UPDATE_SETTINGS,
	TOGGLE_TOC_PIN,
	TOGGLE_TOC_OPEN,
	SHOW_SETTINGS,
	CLOSE_SETTINGS,
	CHANGE_ROUTING,
	OPEN_EXISTING_BOOK,
	OPEN_BOOK_FILES,
	ADD_BOOKS_TO_SHELF,
	CHANGE_CURRENT_BOOK,

	addBooksToShelf,
	changeRouting,
	openExistingBook,
	changeCurrentBook,
} from './actions'

const combinedReducer = combineReducers({
	routing(state = 'shelf', action) {
		switch (action.type) {
			case CHANGE_ROUTING:
				state = action.routing
				break
			case CHANGE_CURRENT_BOOK:
			case OPEN_EXISTING_BOOK:
				state = 'reader'
				break
			default:
		}
		return state
	},
	showSettings: (state = false) => state,
	backupSettings: (state = null) => state,
	shelf(state = {}, action) {
		let toMerge = null
		switch (action.type) {
			case OPEN_BOOK_FILES:
				Api.openFiles(action.files, (fileIds) => {
					dispatch(addBooksToShelf({fileIds, open: Object.keys(fileIds).length === 1}))
				})
				toMerge = { opening: true }
				break
			case ADD_BOOKS_TO_SHELF:
				const covers = _.map(action.fileIds, ({id, title}, fileName) => ({id, title, fileName}))
				if (action.open && covers.length) {
					delayDispatch(openExistingBook(covers[0]))
				}
				toMerge = { bookCovers: covers.concat(state.bookCovers), opening: false }
				console.log(toMerge)
				break
			default:
		}
		return toMerge ? _.merge({}, state, toMerge)  : state
	},
	reader(state = {}, action) {
		switch (action.type) {
			case OPEN_EXISTING_BOOK:
				state = Api.DEFAULT_STATE.reader
				break
			case CHANGE_CURRENT_BOOK:
				state = _.merge({}, Api.DEFAULT_STATE.reader, action.book)
				break
			case CHANGE_READER_CONTENT_PATH:
				break
			default:
		}
		return state
	},
	settings(state = {}, action) {
		let toMerge = null
		switch (action.type) {
			case UPDATE_SETTINGS:
				toMerge = action.settings
				break
			case TOGGLE_TOC_PIN:
				toMerge = { reader: { isTocPinned: !state.reader.isTocPinned } }
				break
			case TOGGLE_TOC_OPEN:
				toMerge = { reader: { isTocOpen: action.open == null ? !state.reader.isTocOpen : action.open } }
				break
			default:
		}
		return toMerge ? _.merge({}, state, toMerge)  : state
	},
})

const reducer = (state, action) => {
	switch (action.type) {
		case SHOW_SETTINGS:
			state = {
				...state,
				showSettings: true,
				backupSettings: _.cloneDeep(state.settings),
			}
			break
		case CLOSE_SETTINGS:
			state = {
				...state,
				showSettings: false,
				settings: action.save ? state.settings : state.backupSettings,
				backupSettings: null,
			}
			break
		case OPEN_EXISTING_BOOK:
			Api.openBook(action.book, (book) => {
				dispatch(changeCurrentBook(book))
			})
			break
		default:
			state = combinedReducer(state, action)
	}
	return state
}

let Api, dispatch

function delayDispatch(action) {
	setTimeout(() => {
		dispatch(action)
	}, 1)
}

export function getReducer(api, storeDispatch) {
	Api = api
	dispatch = storeDispatch
	return reducer
}
