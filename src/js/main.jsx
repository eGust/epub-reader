import _ from 'lodash'
import $ from 'jquery'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { ipcRenderer } from 'electron'
import { Menu, Sidebar, Button, Icon, Segment, Header } from 'semantic-ui-react'

ipcRenderer.on('reply-setupDevTools', (event, data) => {
	require('electron-react-devtools').install()
})

ipcRenderer.send('require-setupDevTools', 'setup')

const NavBar = ({onClickedMenu, iconName}) => {
	return (
	<Sidebar as={Menu} animation='overlay' direction='top' visible={true} inverted>
		<Menu.Item name='menu' style={{cursor: 'pointer'}} onClick={onClickedMenu}>
			<Icon name={iconName} />
		</Menu.Item>
	</Sidebar>
	)
}

let updateAppState, getAppState, getCurrentDoc

class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
			tocVisible: false,
			docId: '1',
			filePath: '',
			toHash: '',
		}

		this.currentDoc = {
			docId: '1',
			filePath: '',
		}
	}

	updateCurrentDoc() {
		let { hostname, port, pathname, toHash } = document.getElementById('frm-book').contentWindow.location
		if (hostname === 'doc') {
			this.currentDoc = {
				docId: port,
				filePath: pathname.slice(1),
				toHash,
			}
			console.log('curDoc:', this.currentDoc)
		}
	}

	componentWillMount() {
		updateAppState = (state) => this.setState(state)
		getAppState = () => this.state
		getCurrentDoc = () => this.currentDoc
	}

	toggleTocVisibility() {
		this.setState({ tocVisible: !this.state.tocVisible })
	}

	goPrevPage() {
		postWebMessage({ action: 'changePage', go: 'prev', })
	}

	goNextPage() {
		postWebMessage({ action: 'changePage', go: 'next', })
	}

	render() {
		const { tocVisible, docId, filePath, toHash } = this.state
		return (
	<div id='main'>
		<Sidebar as={Menu} direction='top' visible={true} inverted>
			<Menu.Item name='home' onClick={() => this.toggleTocVisibility()}>
				<Icon name={ tocVisible ? 'chevron left' : 'content' } inverted />
			</Menu.Item>
		</Sidebar>
		<Sidebar.Pushable id='menu-toc'>
			<Sidebar as={Menu} animation='overlay' width='thin' visible={tocVisible} icon='labeled' vertical inverted>
				<Menu.Item name='home'>
					<Icon name='home' />
					Home
				</Menu.Item>
				<Menu.Item name='gamepad'>
					<Icon name='gamepad' />
					Games
				</Menu.Item>
				<Menu.Item name='camera'>
					<Icon name='camera' />
					Channels
				</Menu.Item>
			</Sidebar>
			<Sidebar.Pusher>
				<iframe src={`epub://doc:${docId}/${filePath}${toHash.length ? `#${toHash}` : ''}`} id='frm-book' onLoad={() => this.updateCurrentDoc()} ></iframe>
				<a className='page-nav-button left' href='#' onClick={(e) => {e.preventDefault(); this.goPrevPage()}}>
					<Icon name='chevron left' className='big' />
				</a>
				<a className='page-nav-button right' href='#' onClick={(e) => {e.preventDefault(); this.goNextPage()}}>
					<Icon name='chevron right' className='big' />
				</a>
			</Sidebar.Pusher>
		</Sidebar.Pushable>
		<footer>test</footer>
	</div>
		)
	}
}

ReactDOM.render(
	<App />,
	document.getElementById('root')
)

window.$ = $

ipcRenderer.on('reply-doc-path', (event, data) => {
	console.log('reply-doc-path', data)
	if (data.path) {
		let { go } = data.query, toHash = go === 'prev' ? '#scroll-to-last-page' : ''
		updateAppState({ filePath: data.path, toHash })
	}
})

const MESSAGE_HANDLERS = {
	changePath({ go }) {
		let { docId, filePath } = getCurrentDoc()
		console.log('changePath', { docId, filePath, go })
		ipcRenderer.send('query-doc-path', { docId, filePath, go })
		// updateAppState({ path })
	},

	pageChanged({ page }) {
		console.log('pageChanged', { page })
	},

	pathChanged({ path }) {
		//
	},
}

function messageHandler(event) {
	let { channel, action, ...data } = event.data
	if (channel !== 'epub')
		return
	console.log('[main]', { action, data })
	MESSAGE_HANDLERS[action] && MESSAGE_HANDLERS[action](data)
}

window.addEventListener('message', messageHandler, false)

function postWebMessage(data) {
	document.getElementById('frm-book').contentWindow.postMessage({ ...data, channel: 'epub', }, '*')
}
