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
	<Sidebar as={Menu} animation='overlay' direction='top' visible={true} inverted>
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

	onClickedTocMenuItem(event, item) {
		event.preventDefault()
		let [ filePath, toHash = '' ] = item.content.split('#')
		this.setState({ filePath, toHash })
		console.log('clicked', item, { filePath, toHash })
	}

	render() {
		const { tocVisible, docId, filePath, toHash, toc } = this.state
		return (
	<div id='main'>
		<Sidebar as={Menu} direction='top' visible={true} inverted>
			<Menu.Item name='home' onClick={() => this.toggleTocVisibility()}>
				<Icon name={ tocVisible ? 'chevron left' : 'content' } inverted />
			</Menu.Item>
		</Sidebar>
		<Sidebar.Pushable id='menu-toc'>
			<Sidebar as={Segment} animation='overlay' width='wide' visible={tocVisible} icon='labeled' vertical inverted>
				<TocItems items={toc} onClickItem={(e, item) => this.onClickedTocMenuItem(e, item)} />
			{/*
				_.map(toc, (item, index) => (
					<TocItem as={Menu.Item} item={item} prefix={index} key={index} onClickItem={(e, item) => this.onClickedTocMenuItem(e, item)} />
				))
				//*/
			}
			</Sidebar>
			<Sidebar.Pusher>
				<Dimmer.Dimmable dimmed={tocVisible} id='dimmer-wrap'>
					<Dimmer active={tocVisible} onClickOutside={() => this.setState({ tocVisible: false })} />
					<iframe src={docId ? `epub://doc:${docId}/${filePath}${toHash.length ? `#${toHash}` : ''}` : ''} id='frm-book' onLoad={() => this.updateCurrentDoc()}></iframe>
					<a className='page-nav-button left' href='#' onClick={(e) => {e.preventDefault(); this.goPrevPage()}}>
						<Icon name='chevron left' className='big' />
					</a>
					<a className='page-nav-button right' href='#' onClick={(e) => {e.preventDefault(); this.goNextPage()}}>
						<Icon name='chevron right' className='big' />
					</a>
				</Dimmer.Dimmable>
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
		console.log(toc)
		updateAppState({
			toc,
			docId,
			filePath: '',
			toHash: '',
		})
	})
}

$(() => {
	switchDoc(1)
})

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
