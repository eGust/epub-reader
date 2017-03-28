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
	UPDATE_READER_PROGRESS,
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
				toMerge = { opening: true }
				break
			case ADD_BOOKS_TO_SHELF:
				const covers = [], books = {}
				_.each(action.fileIds, ({id, title}, fileName) => {
					if (state.books[id])
						return
					covers.push(books[id] = {id, title, fileName})
				})
				toMerge = { bookCovers: covers.concat(state.bookCovers), books, opening: false }
				break
			default:
		}
		return toMerge ? _.merge({}, state, toMerge) : state
	},
	reader(state = {}, action) {
		switch (action.type) {
			case OPEN_EXISTING_BOOK:
				state = _.merge({}, DEFAULT_STATE.reader, { book: action.book })
				break
			case CHANGE_CURRENT_BOOK:
				state = _.merge({}, state, action.bookInfo)
				break
			case CHANGE_READER_CONTENT_PATH:
				break
			case TOGGLE_TOC_PIN:
				state = { ...state, isTocPinned: !state.isTocPinned }
				break
			case TOGGLE_TOC_OPEN:
				state = { ...state, isTocOpen: action.open == null ? !state.isTocOpen : action.open }
				break
			case UPDATE_READER_PROGRESS:
				const { progress, ...others } = state
				state = { ...others, progress: { ...progress, ...action.progress } }
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
			default:
		}
		return toMerge ? _.merge({}, state, toMerge)  : state
	},
})

export const reducer = (state, action) => {
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
		default:
			state = combinedReducer(state, action)
	}
	return state
}

let DEFAULT_STATE

export function setDefaultState(state) {
	DEFAULT_STATE = state
}
