import _ from 'lodash'
import React, { Component } from 'react'
import { Menu, Sidebar, Icon, Popup, Segment, Accordion, List } from 'semantic-ui-react'

class TocItem extends Component {
	state = { active: false }

	componentWillReceiveProps(nextProps) {
		const { collapse } = nextProps
		if (collapse == null || collapse === this.props.collapse)
			return
		this.setState({ active: collapse })
	}

	render() {
		const { item, onClickTocItem, collapse } = this.props
			, { active } = this.state
			, folding = collapse==null ? {} : { collapse }
		return (
			item.subItems && item.subItems.length ?
			<div className='toc-item'>
				<Accordion.Title key='title' active={active} onClick={() => this.setState({ active: !active })}>
					<Icon name={active ? 'folder open' : 'folder'} />
					{item.text}
					<Icon name='dropdown' />
				</Accordion.Title>
				<Accordion.Content key='index' active={active}>
					<Accordion styled exclusive={false} fluid className='list divided relaxed' inverted>
					{
						item.subItems.map((item, index) => (
							<TocItem item={item} key={index} onClickTocItem={onClickTocItem} {...folding} />
						))
					}
					</Accordion>
				</Accordion.Content>
			</div>
			:
			<List.Item className='toc-item'>
				<List.Icon name='file' />
				<List.Content>
					<a href={item.content} onClick={(e) => { e.preventDefault(); onClickTocItem(item) }}>{item.text}</a>
				</List.Content>
			</List.Item>
		)
	}
}

export const ReaderMenu = ({ bookName, chapterTitle, onClickToggleToc, onClickShowSettings, onClickShowShelf, isTocOpen }) => (
	<Sidebar as={Menu} direction='top' visible inverted fluid>
		{
			isTocOpen ?
			<Menu.Item onClick={onClickToggleToc}>
				<Icon name='chevron left' />
			</Menu.Item> :
			<Popup inverted
				trigger={
					<Menu.Item onClick={onClickToggleToc}>
						<Icon name='ordered list' />
					</Menu.Item>
				}
				content='Show Table of Contents'
			/>
		}

		<Menu.Item className='title-middle-bar'>
			<label>{ chapterTitle && chapterTitle.length ? `${bookName} - ${chapterTitle}` : bookName }</label>
		</Menu.Item>

		<Menu.Menu position='right'>
			<Popup inverted
				trigger={
					<Menu.Item onClick={onClickShowShelf}>
						<Icon name='block layout' />
					</Menu.Item>
				}
				content='BookShelf'
			/>
			<Popup inverted
				trigger={
					<Menu.Item onClick={onClickShowSettings}>
						<Icon name='settings' />
					</Menu.Item>
				}
				content='Settings'
			/>
		</Menu.Menu>
	</Sidebar>
)

export class ReaderBody extends Component {
	state = { collapse: null }

	foldToc(collapse) {
		this.setState({collapse})
		setTimeout(() => this.setState({collapse: null}), 0)
	}

	render() {
		const { bookId, chapterPath, toc, isTocOpen = false, isTocPinned = false, opening,
				onClickPin, onClickDimmer, onClickTocItem, onClickPagePrev, onClickPageNext } = this.props
			, { collapse } = this.state
			, folding = collapse==null ? {} : { collapse }
		return (
		<div id='book-reader' as={Menu}>
			<Segment id='toc-container' inverted className={opening ? 'hide' : (isTocOpen ? 'toc-slide-in' : 'toc-slide-out') }>
				<List className='collapse-toggle' horizontal size='mini'>
					<List.Item onClick={() => this.foldToc(true)}>
						<Icon name='folder open' color='teal' title='Unfold All'/>
						<List.Content>Unfold All</List.Content>
					</List.Item>
					<List.Item onClick={() => this.foldToc(false)}>
						<Icon name='folder' color='blue' title='Fold All'/>
						<List.Content>Fold All</List.Content>
					</List.Item>
				</List>
				<div className='pin-toggle' onClick={onClickPin}>
					<span style={{ fontSize: '.78rem', marginRight: 5 }}>{isTocPinned ? 'Pinned' : 'Unpinned'}</span>
					<Icon name={isTocPinned ? 'toggle on' : 'toggle off'} color={isTocPinned ? 'green' : 'red'} />
				</div>

				<Accordion id='toc-menu' styled exclusive={false} fluid className='list divided relaxed' inverted>
				{
					toc.map((item, index) => (
						<TocItem item={item} key={index} onClickTocItem={onClickTocItem} {...folding} />
					))
				}
				</Accordion>
			</Segment>
			<div id='book-container' className={isTocOpen ? 'book-with-toc' : 'book-full-src' }>
				<iframe className={bookId ? 'full-size' : 'hide'} id='frame-book' src={`ebook://doc:${bookId || ''}/frame.html`} />
				<div className='page-navigator prev-page' onClick={onClickPagePrev}>
					<Icon name='angle left' size='large' title='Previous Page' />
				</div>
				<div className='page-navigator next-page' onClick={onClickPageNext}>
					<Icon name='angle right' size='large' title='Next Page' />
				</div>
				<div className='page-status'>
				</div>
				<div className={isTocOpen && !isTocPinned ? 'reader-dimmer' : 'hide'} onClick={onClickDimmer} />
			</div>
		</div>
		)
	}
}

const exported = {
	ReaderMenu,
	ReaderBody,
}

export default exported
