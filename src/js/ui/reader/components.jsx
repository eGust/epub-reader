import _ from 'lodash'
import React, { Component } from 'react'
import { Menu, Sidebar, Icon, Popup, Segment, Accordion, List, Dropdown } from 'semantic-ui-react'

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

export const ReaderMenu = ({ book, progress, onClickToggleToc, onClickShowSettings, onClickShowShelf, isTocOpen }) => (
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
			<label>{ progress.chapterTitle && progress.chapterTitle.length ? `${book.title} - ${progress.chapterTitle}` : book.title }</label>
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
		const { book, progress, toc, isTocOpen = false, isTocPinned = false, opening,
				onClickPin, onClickDimmer, onClickTocItem,
				onClickPagePrev, onClickPageNext, onClickChapterPrev, onClickChapterNext } = this.props
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
				<iframe className={book.id ? 'full-size' : 'hide'} id='frame-book' src={`ebook://doc.${book.id}/frame.html`} />
				<div className='page-navigator prev-page' onClick={onClickPagePrev}>
					<Icon name='chevron left' size='large' title='Previous Page' />
				</div>
				<div className='page-navigator next-page' onClick={onClickPageNext}>
					<Icon name='chevron right' size='large' title='Next Page' />
				</div>
				<div className='page-status'>
					<Menu icon size='small' color='brown' inverted>
						<Menu.Item title='Previous Chapter' onClick={onClickChapterPrev}>
							<Icon name='step backward' />
						</Menu.Item>
						<Menu.Item title='Previous Page' onClick={onClickPagePrev}>
							<Icon name='caret left' />
						</Menu.Item>

						<Dropdown text={progress.pageNo ? progress.pageNo : '-'} className='link item upward'>
							<Dropdown.Menu>
							{
								_.times(progress.pageCount, (i) => (<Dropdown.Item>{i+1}</Dropdown.Item>))
							}
							</Dropdown.Menu>
						</Dropdown>

						<Menu.Item className='title-middle-bar'>
							<label>{progress.pageCount ? ` of ${progress.pageCount}` : '-'}</label>
						</Menu.Item>

						<Menu.Menu position='right'>
							<Menu.Item title='Next Page' onClick={onClickPageNext}>
								<Icon name='caret right' />
							</Menu.Item>
							<Menu.Item title='Next Chapter' onClick={onClickChapterNext}>
								<Icon name='step forward' />
							</Menu.Item>
						</Menu.Menu>
					</Menu>
				</div>
				<div className={isTocOpen && !isTocPinned ? 'reader-dimmer' : 'hide'} onClick={onClickDimmer} />
			</div>
		</div>
		)
	}
}

/*
					<Button.Group color='grey'>
						<Button icon='step backward' title='Previous Chapter' />
						<Button icon='caret left' title='Next Page' />
						<Button icon='caret right' title='Previous Page' />
						<Button icon='step forward' title='Next Chapter' />
					</Button.Group>
*/

const exported = {
	ReaderMenu,
	ReaderBody,
}

export default exported
