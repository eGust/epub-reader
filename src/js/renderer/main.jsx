import React from 'react'
import ReactDOM from 'react-dom'

import { applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'
import createLogger from 'redux-logger'
import thunk from 'redux-thunk'

import Api from './js/renderer/mainApi'
import App from './js/renderer/containers/app_container'
import { reducer, prepareSavedState } from './js/renderer/redux/reducers'

Api.registerServiceApi()

Api.getSavedState(prepareSavedState, (initialState) => {
const docRoot = document.getElementById('root')
	, logger = createLogger({ collapsed: true, duration: true, diff: true })
	// , store = createStore(reducer, initialState, applyMiddleware(thunk, logger))
	, store = createStore(reducer, initialState, applyMiddleware(thunk))

	Api.setReduxStore(store)

	ReactDOM.render(
		<Provider store={store}>
			<App />
		</Provider>,
		docRoot
	)
})
