import _ from 'lodash'
import React, { PureComponent } from 'react'
import { Icon, Header, Modal } from 'semantic-ui-react'
import { ShelfMenu, ShelfBody } from '../containers/shelf_containers'
import { ReaderMenu, ReaderBody } from '../containers/reader_containers'
import { Settings } from '../containers/settings_containers'
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

class App extends PureComponent {
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
			, { routing, showSettings, reader, shelf, openBookFiles } = this.props
		// customMargin, viewMargin, bookMargin, bookCovers,

		const onPreventDefault = (e) => {
				e.preventDefault()
				e.stopPropagation()
			}
			, onDragStart = (e) => {
				e.preventDefault()
				e.stopPropagation()
				this.setState({ dragging: true })
			}
			, onDragEnd = (e) => {
				e.preventDefault()
				e.stopPropagation()
				this.setState({ dragging: false })
			}
			, onDrop = (e) => {
				e.preventDefault()
				e.stopPropagation()
				this.setState({ dragging: false })
				openBookFiles(_.map(e.dataTransfer.files, (f) => f.path))
			}

		return (
			<div className="App" onDragEnterCapture={onDragStart}>
				<div className={routing === 'shelf' ? 'full-size' : 'hide'} >
					<ShelfMenu />
					<ShelfBody {...margins} />
					<Dimmer show={shelf.opening} content='Opening...' />
				</div>

				<div className={routing === 'reader' ? 'full-size' : 'hide'} >
					<ReaderMenu />
					<ReaderBody onDragStart={onDragStart} onDragEnd={onDragEnd} onDrop={onDrop} />
					<Dimmer show={reader.opening} content='Opening...' />
				</div>

				<Settings showSettings={showSettings} />

				<div className={dragging ? 'dragging-wrap' : 'hide'}>
					<Icon name='file text' className='file-icon' style={{color: 'gray'}} />
					<Icon name='level down' className='file-icon' style={{color: 'black', marginLeft: '10vw'}} />
					<div id='dragging-file' className='dragging'
						onDragOverCapture={onPreventDefault}
						onDragEnterCapture={onPreventDefault}
						onDragCapture={onPreventDefault}
						onDragStartCapture={onPreventDefault}
						onDragEndCapture={onDragEnd}
						onDragLeaveCapture={onDragEnd}
						onDropCapture={onDrop}
					/>
				</div>
			</div>
		)
	}
}

const exported = { App }

export default exported
