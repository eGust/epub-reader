import _ from 'lodash'
import React, { Component } from 'react'
import { Menu, Icon, Modal, Segment, Checkbox, Dropdown, Form, Grid, Button } from 'semantic-ui-react'
import Slider from 'rc-slider'

import { mapToFontSize, mapToLineHeight, mapToLetterSpacing } from '../sizeMappings'
import { FontPicker } from './fontPicker'
import { ColorPicker } from './colorPicker'
import { PreviewBox } from './previewBox'

const Looking = ({ show, onUpdateSettings, settings: { fontFamily, fontWeight, fontStyle, color, linkColor, linkUnerline, backgroundColor, fontSize, lineHeight, letterSpacing } }) => (
	<Form className={show ? 'setting-panel' : 'hide'}>
		<Segment.Group>
			<Segment>
				<Grid>
					<Grid.Column width={6}>
						<Form.Field>
							<label>
								<Icon name='font' />
								Primery Font:
							</label>
							<FontPicker font={fontFamily[0]} onChange={(f) => onUpdateSettings({fontFamily: [f, fontFamily[1]]})} />
						</Form.Field>
					</Grid.Column>
					<Grid.Column width={6}>
						<Form.Field>
							<label>
								<Icon name='font' />
								Secondary Font:
							</label>
							<FontPicker font={fontFamily[1]} onChange={(f) => onUpdateSettings({fontFamily: [fontFamily[0], f]})} />
						</Form.Field>
					</Grid.Column>
					<Grid.Column width={4}>
						<Form.Field>
							<label>Styles:</label>
							<Button icon='bold' size='small'
								color={fontWeight==='bold' ? 'blue' : null}
								basic={fontWeight!=='bold'}
								onClick={(e) => {e.preventDefault(); onUpdateSettings({fontWeight: fontWeight==='bold' ? 'normal' : 'bold'})}}
								/>
							<Button icon='italic' size='small'
								color={fontStyle==='italic' ? 'blue' : null}
								basic={fontStyle!=='italic'}
								onClick={(e) => {e.preventDefault();onUpdateSettings({fontStyle: fontStyle==='italic' ? 'normal' : 'italic'})}}
								/>
						</Form.Field>
					</Grid.Column>
				</Grid>
			</Segment>

			<Segment>
				<Grid>
					<Grid.Column width={7}>
						<Form.Field>
							<label>
								<Icon name='text height' />
								{`Font Size: ${mapToFontSize(fontSize)}`}
							</label>
							<Slider min={0} max={100} className='font-size-slider' value={fontSize} onChange={(size) => onUpdateSettings({fontSize: size})} />
						</Form.Field>
					</Grid.Column>
					<Grid.Column width={5}>
						<Form.Field>
							<label>
								<Icon name='resize vertical' />
								{`Line Height: ${(mapToLineHeight(lineHeight)*100)|0}%`}
							</label>
							<Slider min={0} max={100} className='spacing-slider' value={lineHeight} onChange={(size) => onUpdateSettings({lineHeight: size})} />
						</Form.Field>
					</Grid.Column>
					<Grid.Column width={4}>
						<Form.Field>
							<label>
								<Icon name='resize horizontal' />
								{`Letter Spacing: ${mapToLetterSpacing(letterSpacing)}`}
							</label>
							<Slider min={0} max={100} className='spacing-slider' value={letterSpacing} onChange={(size) => onUpdateSettings({letterSpacing: size})} />
						</Form.Field>
					</Grid.Column>
				</Grid>
			</Segment>

			<Segment>
				<Grid>
					<Grid.Column width={5}>
						<Form.Field inline>
							<label>Text Color:</label>
							<ColorPicker color={color} onChange={(color) => onUpdateSettings({color: color.hex})} />
						</Form.Field>
					</Grid.Column>
					<Grid.Column width={6}>
						<Form.Field inline>
							<label>Link:</label>
							<ColorPicker color={linkColor} onChange={(color) => onUpdateSettings({linkColor: color.hex})} />
							<Button icon='underline' size='small'
								color={linkUnerline==='underline' ? 'blue' : null}
								basic={linkUnerline!=='underline'}
								onClick={(e) => {e.preventDefault();onUpdateSettings({linkUnerline: linkUnerline==='underline' ? 'none' : 'underline'})}}
								/>
						</Form.Field>
					</Grid.Column>
					<Grid.Column width={5}>
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
				<PreviewBox {...{ fontFamily, fontWeight, fontStyle, color, backgroundColor, fontSize, lineHeight, letterSpacing, link: { color: linkColor, textDecoration: linkUnerline } }} />
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

	shouldComponentUpdate(nextProps, nextState) {
		const { showSettings = false } = nextState
		return this.state.showSettings !== showSettings || (showSettings && !_.eq(this.state, nextState))
	}

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
