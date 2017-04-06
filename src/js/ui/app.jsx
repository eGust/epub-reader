import _ from 'lodash'
import React, { Component } from 'react'
import { Icon, Header, Modal } from 'semantic-ui-react'
import { ShelfMenu, ShelfBody } from './shelf/containers'
import { ReaderMenu, ReaderBody } from './reader/containers'
import { Settings } from './settings/containers'
import { connect } from 'react-redux'

let droot

const Dimmer = ({show, content}) => (
	<div className={show ? 'waiting-dimmer' : 'waiting-dimmer hide'}>
		<Header as='h1'>
			<Icon loading name='spinner' size='massive' />
			{content}
		</Header>
	</div>
)

class AppUi extends Component {
	state = {
		dragging: false,
		viewMargin: 0,
		bookMargin: 0,
		customMargin: false,
	}

	componentDidMount() {
		droot = document.getElementById('root')
		this.updateSize()
		window.addEventListener('resize', () => this.updateSize())
	}

	updateSize() {
		let w = droot.clientWidth
		if (w < 1300) {
			this.setState({ customMargin: false })
			return
		}
		const cnt = Math.floor(w / 310)
			, bookMargin = Math.floor((w - 40 - 240 * cnt) / (cnt * 10)) * 10
			, viewMargin = (w - (240 + bookMargin) * cnt) / 2 - 10

		this.setState({
			customMargin: true,
			viewMargin,
			bookMargin,
		})
	}

	render() {
		const { dragging, ...margins } = this.state
			, { routing, showSettings, reader, shelf } = this.props
		// customMargin, viewMargin, bookMargin, bookCovers,

		const onPreventDefault = (e) => {
				e.preventDefault()
				e.stopPropagation()
			}
			, onDragStart = (e) => {
				e.preventDefault()
				// e.stopPropagation()
				this.setState({ dragging: true })
			}
			, onDragEnd = (e) => {
				e.preventDefault()
				// e.stopPropagation()
				this.setState({ dragging: false })
			}

		return (
			<div className="App" onDragEnter={onDragStart}>
				<div className={routing === 'shelf' ? 'full-size' : 'hide'} >
					<ShelfMenu />
					<ShelfBody {...margins} />
					<Dimmer show={shelf.opening} content='Opening...' />
				</div>

				<div className={routing === 'reader' ? 'full-size' : 'hide'} >
					<ReaderMenu />
					<ReaderBody />
					<Dimmer show={reader.opening} content='Opening...' />
				</div>

				<Settings showSettings={showSettings} />

				<div className={dragging ? 'dragging-wrap' : 'hide'}>
					<Icon name='file text' className='file-icon' style={{color: 'gray'}} />
					<Icon name='level down' className='file-icon' style={{color: 'black', marginLeft: '10vw'}} />
					<div id='dragging-file' className='dragging'
						onDragOver={onPreventDefault}
						onDragEnter={onPreventDefault}
						onDrag={onPreventDefault}
						onDragStart={onPreventDefault}
						onDragEnd={onDragEnd}
						onDragLeave={onDragEnd}
						onDrop={onDragEnd}
					/>
				</div>
			</div>
		)
	}
}

const mapStateToProps = (state, ownProps) => ({...state, ...ownProps})

const App = connect(mapStateToProps)(AppUi)

export default App
