import _ from 'lodash'
import { combineReducers } from 'redux'
import {
	CHANGE_READER_CONTENT_PATH,
	UPDATE_SETTINGS,
	TOGGLE_TOC_PIN,
	TOGGLE_TOC_OPEN,
	TOGGLE_TOC_ITEM_OPEN,
	SHOW_SETTINGS,
	CLOSE_SETTINGS,
	CHANGE_ROUTING,
	OPEN_BOOK_FILES,
	UPDATE_SHELF_BOOKS,
	UPDATE_FILTER,
	UPDATE_SORTING,
	CHANGE_CURRENT_BOOK,
	UPDATE_READER_PROGRESS,
} from './actions'

function updateSelectedTocItem(items, path) {
	let chapterTitle = null
	function updateEachItem(items) {
		let anyChanged = false
		const newItems = items.map((item) => {
			let { isSelected, subItems, ...others } = item
			isSelected = false
			subItems = updateEachItem(item.subItems)

			if (item.content && item.content.split('#', 1)[0] === path) {
				isSelected = true
				chapterTitle = item.text
			} else {
				isSelected = !!subItems.find(({isSelected}) => isSelected)
			}

			anyChanged = anyChanged || isSelected !== item.isSelected || subItems != item.subItems
			return anyChanged ? { isSelected, subItems, ...others } : item
		})
		return anyChanged ? newItems : items
	}
	const results = updateEachItem(items)
	return { items: results, chapterTitle }
}

function toggleTocItemOpen(items, itemOrAllOpen) {
	if (itemOrAllOpen === true || itemOrAllOpen === false) {
		const isOpen = itemOrAllOpen

		function toggleOpen(items) {
			return items.map(({isOpen: _, subItems, ...others}) => {
				return { subItems: toggleOpen(subItems), ...others, isOpen }
			})
		}

		return toggleOpen(items)
	}

	function toggleItemOpenEq(items) {
		return items.map((item) => {
			const { isOpen, subItems, ...others } = item
			return item === target ? { isOpen: !isOpen, subItems, ...others } : { isOpen, subItems: toggleItemOpenEq(subItems), ...others }
		})
	}

	const target = itemOrAllOpen
	return toggleItemOpenEq(items)
}

function filterBookCovers(covers, { filter, sorting }) {
	let sorter
	switch (sorting.method) {
		case 'Title':
			sorter = sorting.order === 'ascending' ? (a, b) => (a.title > b.title ? 1 : -1) : (a, b) => (a.title < b.title ? 1 : -1)
			break
		case 'Last Read':
			sorter = sorting.order === 'ascending' ? (a, b) => (a.lastRead > b.lastRead ? 1 : -1) : (a, b) => (a.lastRead < b.lastRead ? 1 : -1)
			break
		default:
			sorter = (a, b) => (a.title > b.title ? 1 : -1)
	}

	if (filter) {
		filter.trim().toLowerCase().split(/\s+/).forEach((f) => {
			covers = covers.filter(({ lower }) => lower.indexOf(f) >= 0)
		})
	}
	return covers.sort(sorter)
}

const combinedReducer = combineReducers({
	routing(state = 'shelf', action) {
		switch (action.type) {
			case CHANGE_ROUTING:
				state = action.routing
				break
			case CHANGE_CURRENT_BOOK:
				state = 'reader'
				break
			default:
		}
		return state
	},
	showSettings: (state = false) => state,
	backupSettings: (state = null) => state,
	shelf(state = {}, action) {
		let toMerge = null, newBookCovers = null
		switch (action.type) {
			case OPEN_BOOK_FILES:
				toMerge = { opening: true }
				break
			case UPDATE_SHELF_BOOKS:
				toMerge = { books: action.books, opening: false }
				newBookCovers = filterBookCovers(_.values(action.books), state)
				break
			case UPDATE_FILTER:
				toMerge = { filter: action.filter }
				newBookCovers = filterBookCovers(_.values(state.books), { filter: action.filter, sorting: state.sorting })
				break
			case UPDATE_SORTING:
				toMerge = { sorting: action.order }
				newBookCovers = filterBookCovers(_.values(state.books), { filter: state.filter, sorting: _.merge({}, state.sorting, action.order) })
				break
			default:
		}
		state = toMerge ? _.merge({}, state, toMerge) : state
		if (newBookCovers)
			state.bookCovers = newBookCovers
		return state
	},
	reader(state = {}, action) {
		switch (action.type) {
			case CHANGE_CURRENT_BOOK:
				state = action.bookInfo
				break
			case CHANGE_READER_CONTENT_PATH:
				break
			case TOGGLE_TOC_PIN:
				state = { ...state, isTocPinned: !state.isTocPinned }
				break
			case TOGGLE_TOC_OPEN:
				state = { ...state, isTocOpen: action.open == null ? !state.isTocOpen : action.open }
				break
			case TOGGLE_TOC_ITEM_OPEN:
				state = { ...state, toc: toggleTocItemOpen(state.toc, action.itemOrAllOpen) }
				break
			case UPDATE_READER_PROGRESS:
				const { progress, toc, ...others } = state
					, { chapterTitle, items } = updateSelectedTocItem(toc, action.progress.chapterPath)
				if (toc === items) {
					state = { ...others, toc, progress: { ...progress, ...action.progress, chapterTitle } }
				} else {
					state = { ...others, toc: items, progress: { ...progress, ...action.progress, chapterTitle } }
				}
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

export function prepareSavedState(state) {
	state.shelf.bookCovers = filterBookCovers(_.values(state.shelf.books), { sorting: state.shelf.sorting })
	return state
}
