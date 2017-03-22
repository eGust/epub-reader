import React from 'react'
import ReactDOM from 'react-dom'

import { applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'
import createLogger from 'redux-logger'

import _ from 'lodash'

import Api from './js/mainInterface'
import App from './js/ui/app'
import { getReducer } from './js/ui/reducers'

Api.registerServiceApi()

const logger = createLogger()
	, store = createStore(getReducer(Api, storeDispatch), Api.getSavedState(), applyMiddleware(logger))

function storeDispatch(action) {
	return store.dispatch(action)
}

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
)
