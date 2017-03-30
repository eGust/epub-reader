import React from 'react'
import ReactDOM from 'react-dom'

import { applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'
import createLogger from 'redux-logger'
import thunk from 'redux-thunk'

import _ from 'lodash'

import Api from './js/mainInterface'
import App from './js/ui/app'
import { reducer, setDefaultState } from './js/ui/reducers'

Api.registerServiceApi()

setDefaultState(Api.DEFAULT_STATE)

const docRoot = document.getElementById('root')
	, logger = createLogger({ collapsed: true, duration: true, diff: true })
	, store = createStore(reducer, Api.getSavedState(), applyMiddleware(thunk, logger))
	// , store = createStore(reducer, Api.getSavedState(), applyMiddleware(thunk))

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	docRoot
)
