import _ from 'lodash'
import { combineReducers } from 'redux'
import {
	UPDATE_WINDOW_SIZE,
	CHANGE_READER_CONTENT_PATH,
	UPDATE_SETTINGS,
	TOGGLE_TOC_PIN,
	TOGGLE_TOC_OPEN,
	SHOW_SETTINGS,
	CLOSE_SETTINGS,
	CHANGE_ROUTING,
	OPEN_EXISTING_BOOK,
	OPEN_BOOK_FILE,
} from './actions'

const combinedReducer = combineReducers({
	routing(state = 'shelf', action) {
		switch (action.type) {
			case CHANGE_ROUTING:
				state = action.routing
				break
			case OPEN_EXISTING_BOOK:
			case OPEN_BOOK_FILE:
				state = 'reader'
				break
			default:
		}
		return state
	},
	showSettings: (state = false) => state,
	backupSettings: (state = null) => state,
	shelf(state = {}, action) {
		switch (action.type) {
			case UPDATE_WINDOW_SIZE:
				break
			default:
		}
		return state
	},
	reader(state = {}, action) {
		switch (action.type) {
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

export function reducer(state, action) {
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

