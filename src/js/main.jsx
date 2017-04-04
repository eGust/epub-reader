import React from 'react'
import ReactDOM from 'react-dom'

import { applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'
import createLogger from 'redux-logger'
import thunk from 'redux-thunk'

import Api from './js/mainInterface'
import App from './js/ui/app'
import { reducer, setDefaultState, prepareSavedState } from './js/ui/reducers'

Api.registerServiceApi()

setDefaultState(Api.DEFAULT_STATE)

Api.getSavedState(prepareSavedState, (initialState) => {
const docRoot = document.getElementById('root')
	, logger = createLogger({ collapsed: true, duration: true, diff: true })
	// , store = createStore(reducer, initialState, applyMiddleware(thunk, logger))
	, store = createStore(reducer, initialState, applyMiddleware(thunk))

	ReactDOM.render(
		<Provider store={store}>
			<App />
		</Provider>,
		docRoot
	)
})
