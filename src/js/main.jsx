import _ from 'lodash'
import $ from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'
import { ipcRenderer } from 'electron'

ipcRenderer.on('reply-setupDevTools', (event, arg) => {
	require('electron-react-devtools').install()
})

ipcRenderer.send('require-setupDevTools', 'setup')

const App = () => (
	<div id='main'>
		<nav id='nav'>
		</nav>
		<div id='frm-wrap'>
			<iframe src='epub://doc:1/' id='frm-book'></iframe>
		</div>
	</div>
)

ReactDOM.render(
	<App />,
	document.getElementById('root')
)

window.$ = $

function messageHandler(event) {
	console.log('[main]', event)
}

window.addEventListener('message', messageHandler, false)

function postWebMessage(data) {
	$('#frm-book')[0].contentWindow.postMessage(data, '*')
}
