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
	return fontSize
}

const Looking = ({ show, onUpdateSettings, settings: { fontFamily, fontWeight, fontStyle, color, backgroundColor, fontSize, lineHeight, letterSpacing } }) => (
	<Form className={show ? 'setting-panel' : 'hide'}>
		<Segment.Group>
			<Segment>
				<Grid columns={2}>
					<Grid.Column>
						<Form.Field>
							<label>
								<Icon name='font' />
								Primery Font:
							</label>
							<FontPicker font={fontFamily[0]} onChange={(f) => onUpdateSettings({fontFamily: [f, fontFamily[1]]})} />
						</Form.Field>
					</Grid.Column>
					<Grid.Column>
						<Form.Field>
							<label>
								<Icon name='font' />
								Secondary Font:
							</label>
							<FontPicker font={fontFamily[1]} onChange={(f) => onUpdateSettings({fontFamily: [fontFamily[0], f]})} />
						</Form.Field>
					</Grid.Column>
				</Grid>
			</Segment>

			<Segment>
				<Grid>
					<Grid.Column width={8}>
						<Form.Field>
							<label>
								<Icon name='text height' />
								{`Font Size: ${mapToFontSize(fontSize)}`}
							</label>
							<Slider min={0} max={100} className='font-size-slider' value={fontSize} onChange={(size) => onUpdateSettings({fontSize: size})} />
						</Form.Field>
					</Grid.Column>
					<Grid.Column width={4}>
						<Form.Field>
							<label>
								<Icon name='resize vertical' />
								{`Line Height: ${lineHeight}`}
							</label>
							<Slider min={0} max={100} className='spacing-slider' value={lineHeight} onChange={(size) => onUpdateSettings({lineHeight: size})} />
						</Form.Field>
					</Grid.Column>
					<Grid.Column width={4}>
						<Form.Field>
							<label>
								<Icon name='resize horizontal' />
								{`Letter Spacing: ${letterSpacing}`}
							</label>
							<Slider min={0} max={100} className='spacing-slider' value={letterSpacing} onChange={(size) => onUpdateSettings({letterSpacing: size})} />
						</Form.Field>
					</Grid.Column>
				</Grid>
			</Segment>

			<Segment>
				<Grid>
					<Grid.Column width={8}>
						<Form.Field inline>
							<label>Text Color:</label>
							<ColorPicker color={color} onChange={(color) => onUpdateSettings({color: color.hex})} />
						</Form.Field>
					</Grid.Column>
					<Grid.Column width={8}>
						<Form.Field inline>
							<label>Background:</label>
							<ColorPicker color={backgroundColor} onChange={(color) => onUpdateSettings({backgroundColor: color.hex})} />
						</Form.Field>
					</Grid.Column>
				</Grid>
			</Segment>

		</Segment.Group>

		<Segment.Group>
			<Segment>
				<h4>Preview:</h4>
			</Segment>
			<Segment>
			</Segment>
		</Segment.Group>
	</Form>
)

const Behavior = ({ show, onUpdateSettings, settings: { isTocOpen, isTocPinned } }) => (
	<div className={show ? 'setting-panel' : 'hide'}>
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
	</div>
)

export class Settings extends Component {
	state = { activeTab: 'looking' }

	render() {
		const { activeTab } = this.state
			, { reader, showSettings, globals, onUpdateSettings, onClose } = this.props

		return (
		<Modal open={showSettings}>
			<Modal.Header>
				<Grid>
					<Grid.Column floated='left' width={7}>
						<h2>Settings</h2>
					</Grid.Column>
					<Grid.Column floated='right' className='right aligned' width={7}>
						<Icon name='checkmark' className='settings-action' size='large' color='green' onClick={() => onClose({save: true})} />
						<Icon name='close' className='settings-action' size='large' color='red' onClick={onClose} />
					</Grid.Column>
				</Grid>
			</Modal.Header>

			<Modal.Content>
				<div className='settings-menu-group'>
					<Menu pointing fluid vertical>
					{
						[
							{
								name: 'looking',
								title: 'Fonts & Colors',
							},
							{
								name: 'behavior',
								title: 'Behavior',
							},
						].map(({ name, title }) => (
						<Menu.Item key={name} active={activeTab === name} onClick={() => {this.setState({activeTab: name})}}>
						{ title }
						</Menu.Item>
						))
					}
					</Menu>
				</div>
				<div className='settings-menu-items'>
					<Looking
						show={activeTab==='looking'}
						settings={globals}
						onUpdateSettings={(attrs) => onUpdateSettings({ globals: attrs })} />
					<Behavior
						show={activeTab==='behavior'}
						settings={globals}
						onUpdateSettings={(attrs) => onUpdateSettings({ globals: attrs })} />
				</div>
			</Modal.Content>
		</Modal>
		)
	}
}

const exported = {
	Settings,
}

export default exported
