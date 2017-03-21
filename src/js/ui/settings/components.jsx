import _ from 'lodash'
import React, { Component } from 'react'
import { Menu, Icon, Modal, Segment, Checkbox, Dropdown, Form } from 'semantic-ui-react'

const GlobalSettings = ({ settings: { fontName, fontSize, fontStyles, fontColor, backgroundColor }, systemFonts, onUpdateSettings }) => (
	<Segment attached className='setting-panel'>
		<Segment.Group>
			<Segment as={Form}>
				<Form.Field inline>
					<label>Font:</label>
					<Dropdown placeholder='Select Font ...' selection options={['font 1', 'font 2'].map((k) => ({ text: k, value: k, }))} />
				</Form.Field>
			</Segment>
			<Segment>
				<label>Background Color:</label>
			</Segment>
		</Segment.Group>
	</Segment>
)

const ReaderSettings = ({ settings: { isTocOpen, isTocPinned }, onUpdateSettings }) => (
	<Segment attached className='setting-panel'>
		<Segment.Group>
			<Segment>
				<h4>When Open a Book:</h4>
			</Segment>
			<Segment>
				<Checkbox toggle
					label='Pop-up Table of Contents'
					onChange={() => onUpdateSettings({ isTocOpen: !isTocOpen })}
					checked={isTocOpen} />
			</Segment>
			<Segment>
				<Checkbox toggle
					label='Pin Table of Contents'
					onChange={() => onUpdateSettings({ isTocPinned: !isTocPinned })}
					checked={isTocPinned} />
			</Segment>
		</Segment.Group>
	</Segment>
)

export class Settings extends Component {
	state = { activeTab: 'global' }

	render() {
		const { activeTab } = this.state
			, { reader, globals, onUpdateSettings, onClose } = this.props

		return (
			<Modal.Content>

				<Menu attached='top' tabular>
				{
					[
						{
							name: 'global',
							title: 'Font & Color',
						},
						{
							name: 'reader',
							title: 'Reader',
						},
					].map(({ name, title }) => (
					<Menu.Item key={name} active={activeTab === name} onClick={() => {this.setState({activeTab: name})}}>
					{ title }
					</Menu.Item>
					))
				}

					<Menu.Menu position='right'>
						<Icon name='checkmark' className='settings-action' size='big' color='green' onClick={() => onClose({save: true})} />
						<Icon name='close' className='settings-action' size='big' color='red' onClick={onClose} />
					</Menu.Menu>
				</Menu>

				{
					(() => {
						switch (activeTab ) {
							case 'global':
								return (
									<GlobalSettings settings={globals} onUpdateSettings={(attrs) => onUpdateSettings({ globals: attrs })} />
								)
							case 'reader':
								return (
									<ReaderSettings settings={reader} onUpdateSettings={(attrs) => onUpdateSettings({ reader: attrs })} />
								)
							default:
								return null
						}
					})()
				}

			</Modal.Content>
		)
	}
}

const exported = {
	Settings,
}

export default exported
