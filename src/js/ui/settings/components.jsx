import _ from 'lodash'
import React, { Component } from 'react'
import { Menu, Icon, Modal, Segment, Checkbox, Dropdown, Form, Grid } from 'semantic-ui-react'
import { FontPicker } from './fontPicker'
import { ColorPicker } from './colorPicker'
import Slider from 'rc-slider'

function mapToFontSize(value) {
	let fontSize
	if (value < 40) {
		fontSize = 6 + value / 2
	} else if (value < 80) {
		fontSize = 26 + value-40
	} else {
		fontSize = 66 + (value-80) * 2
	}
	console.log(value, '=>', fontSize)
}

const GlobalSettings = ({ show, systemFonts, onUpdateSettings, settings: { fontName, fontSize, fontStyles, fontColor, backgroundColor,isTocOpen, isTocPinned } }) => (
	show ? (
	<Segment attached className='setting-panel'>
		<Segment.Group>
			<Segment>
				<h4>Looking:</h4>
			</Segment>
			<Segment as={Form}>
				<Grid columns={2}>
					<Grid.Column>
						<Form.Field inline>
							<label>Primery Font:</label>
							<FontPicker />
						</Form.Field>
					</Grid.Column>
					<Grid.Column>
						<Form.Field inline>
							<label>Secondary Font:</label>
							<FontPicker />
						</Form.Field>
					</Grid.Column>
				</Grid>
			</Segment>

			<Segment as={Form}>
				<Grid>
					<Grid.Column width={4}>
						<Form.Field inline>
							<label>Text Color:</label>
							<ColorPicker />
						</Form.Field>
					</Grid.Column>
					<Grid.Column width={8}>
						<Form.Field inline>
							<label>Size:</label>
							<Slider min={0} max={100} className='font-size-slider' onChange={(v) => mapToFontSize(v)} />
						</Form.Field>
					</Grid.Column>
					<Grid.Column width={4} textAlign='right'>
						<Form.Field inline>
							<label>Background:</label>
							<ColorPicker />
						</Form.Field>
					</Grid.Column>
				</Grid>
			</Segment>

		</Segment.Group>

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
	) : null
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
							title: 'Settings',
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

				<GlobalSettings
					show={activeTab==='global'}
					settings={globals}
					onUpdateSettings={(attrs) => onUpdateSettings({ globals: attrs })} />

			</Modal.Content>
		)
	}
}

const exported = {
	Settings,
}

export default exported
