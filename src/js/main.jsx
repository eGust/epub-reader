import _ from 'lodash'
import $ from 'jquery'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { ipcRenderer } from 'electron'
import { Menu, Sidebar, Button, Icon, Segment, Header, Accordion, List, Item, Dimmer } from 'semantic-ui-react'

ipcRenderer.on('reply-setupDevTools', (event, data) => {
	require('electron-react-devtools').install()
})

ipcRenderer.send('require-setupDevTools', 'setup')

const NavBar = ({onClickedMenu, iconName}) => {
	return (
	<Sidebar as={Menu} animation='overlay' direction='top' visible inverted>
		<Menu.Item name='menu' style={{cursor: 'pointer'}} onClick={onClickedMenu}>
			<Icon name={iconName} />
		</Menu.Item>
	</Sidebar>
	)
}

let updateAppState, getAppState, getCurrentDoc

const TocItems = ({items, onClickItem, prefix = ''}) => (
	<Accordion inverted styled exclusive={false} fluid className='list divided relaxed'>
	{
		_.map(items, (item, index) => (
			item && item.subItems && item.subItems.length ? ([
				<Accordion.Title key={`${prefix}.${index}.title`}>
					<Icon name='folder' />
					{item.text}
					<Icon name='dropdown' />
				</Accordion.Title>,
				<Accordion.Content key={`${prefix}.${index}.content`}>
				{
					<TocItems items={item.subItems} prefix={`${prefix}.${index}`} onClickItem={onClickItem} />
				}
				</Accordion.Content>
			]) : (
				<List.Item key={`${prefix}.${index}`}>
					<List.Icon name='file' />
					<List.Content>
						<a href={item.content} onClick={(e) => onClickItem(e, item)}>{item.text}</a>
					</List.Content>
				</List.Item>
			)
		))
	}
	</Accordion>
)

class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
			tocVisible: false,
		}

		this.currentDoc = {}
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

	onClickedTocMenuItem(event, item) {
		event.preventDefault()
		let [ filePath, anchor = '' ] = item.content.split('#')
		postWebMessage({ action: 'changePath', filePath, anchor })
		console.log('clicked', item, { filePath, anchor })
	}

	render() {
		const { tocVisible, docId, toc } = this.state
		return (
	<div id='main'>
		<Sidebar as={Menu} direction='top' visible={true} inverted>
			<Menu.Item name='home' onClick={() => this.toggleTocVisibility()}>
				<Icon name={ tocVisible ? 'chevron left' : 'content' } inverted />
			</Menu.Item>
		</Sidebar>
		<Sidebar.Pushable id='menu-toc'>
			<Sidebar as={Segment} animation='push' width='wide' visible={tocVisible} icon='labeled' vertical inverted>
				<TocItems items={toc} onClickItem={(e, item) => this.onClickedTocMenuItem(e, item)} />
			</Sidebar>
			<Sidebar.Pusher>
				<iframe src={docId ? `epub://doc:${docId}/frame.html` : ''} id='frm-book' onLoad={() => postWebMessage({ action: 'changePath', filePath: '', anchor: '' })}></iframe>
				<a className='page-nav-button left' href='#' onClick={(e) => {e.preventDefault(); this.goPrevPage()}}>
					<Icon name='chevron left' className='big' />
				</a>
				<a className='page-nav-button right' href='#' onClick={(e) => {e.preventDefault(); this.goNextPage()}}>
					<Icon name='chevron right' className='big' />
				</a>
				<div id='dimmer' className={tocVisible ? 'active' : ''} onClick={() => this.setState({ tocVisible: false })} />
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

function switchDoc(docId) {
	$.getJSON(`epub://toc:${docId}/`)
	.done((toc) => {
		console.log(window.toc = toc)
		updateAppState({
			toc,
			docId,
		})
	})
}

$(() => {
	switchDoc(1)
})

ipcRenderer.on('reply-doc-path', (event, data) => {
	console.log('reply-doc-path', data)
	if (data.path) {
		let { go } = data.query, anchor = go === 'prev' ? '*scroll-to-last-page' : ''
		postWebMessage({ action: 'changePath', filePath: data.path, anchor })
		// updateAppState({ filePath: data.path, anchor })
	}
})

const MESSAGE_HANDLERS = {
	changePath({ go, filePath }) {
		let { docId } = getAppState()
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
