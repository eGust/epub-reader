import _ from 'lodash'
import React, { Component } from 'react'
import { Menu, Sidebar, Icon, Popup, Segment, Accordion, List, Dropdown } from 'semantic-ui-react'

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

const TocItem = ({ item, onClickTocItem, onToggleTocFolding }) => {
	const { subItems, isOpen, isSelected, content, text } = item
	return subItems && subItems.length ? (
	<div className='toc-item'>
		<Accordion.Title key='title' className={isSelected ? 'selected' : ''} active={isOpen} onClick={() => onToggleTocFolding(item)}>
			<Icon name={isOpen ? 'folder open' : 'folder'} />
			{text}
			<Icon name='dropdown' />
		</Accordion.Title>
		<Accordion.Content key='index' active={isOpen}>
			<Accordion styled exclusive={false} fluid className='list divided relaxed' inverted>
			{
				isOpen ?
				subItems.map((item, index) => (
					<TocItem item={item} key={index} onClickTocItem={onClickTocItem} onToggleTocFolding={onToggleTocFolding} />
				))
				: null
			}
			</Accordion>
		</Accordion.Content>
	</div>
	) : (
	<List.Item className={isSelected ? 'toc-item selected' : 'toc-item'} as='a'  href={content} onClick={(e) => { e.preventDefault(); onClickTocItem(item) }}>
		<List.Icon name='file' />
		<List.Content> {text} </List.Content>
	</List.Item>
	)
}

const TocContainer = ({toc, isTocOpen = false, isTocPinned = false, opening, onClickPin, onClickTocItem, onToggleTocFolding}) => (
	<Segment id='toc-container' inverted className={opening ? 'hide' : (isTocOpen ? 'toc-slide-in' : 'toc-slide-out') }>
		<List className='collapse-toggle' horizontal size='mini'>
			<List.Item onClick={() => onToggleTocFolding(true)}>
				<Icon name='folder open' color='teal' title='Unfold All'/>
				<List.Content>Unfold All</List.Content>
			</List.Item>
			<List.Item onClick={() => onToggleTocFolding(false)}>
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
				<TocItem item={item} key={index} onClickTocItem={onClickTocItem} onToggleTocFolding={onToggleTocFolding} />
			))
		}
		</Accordion>
	</Segment>
)

const PageStatus = ({book, progress, onClickChapterPrev, onClickChapterNext, onClickPageGoDelta, onChangePageNo}) => (
	<div className='page-status'>
		<Menu icon size='small' color='brown' inverted>
			<Menu.Item title='Previous Chapter' onClick={onClickChapterPrev}>
				<Icon name='step backward' />
			</Menu.Item>
			<Menu.Item title='Previous Page' onClick={() => onClickPageGoDelta({book, progress, delta: -1})}>
				<Icon name='caret left' />
			</Menu.Item>

			<Dropdown text={progress.pageNo ? `${progress.pageNo}` : '-'} className='link item upward'>
				<Dropdown.Menu>
				{
					_.times(progress.pageCount, (i) => (
						<Dropdown.Item key={`${i}`} onClick={() => onChangePageNo(i+1)}>{i+1}</Dropdown.Item>
					))
				}
				</Dropdown.Menu>
			</Dropdown>

			<Menu.Item className='title-middle-bar'>
				<label>{progress.pageCount ? ` of ${progress.pageCount}` : '-'}</label>
			</Menu.Item>

			<Menu.Menu position='right'>
				<Menu.Item title='Next Page' onClick={() => onClickPageGoDelta({book, progress, delta: +1})}>
					<Icon name='caret right' />
				</Menu.Item>
				<Menu.Item title='Next Chapter' onClick={onClickChapterNext}>
					<Icon name='step forward' />
				</Menu.Item>
			</Menu.Menu>
		</Menu>
	</div>
)

const ProgressBar = ({ pageNo = 1, pageCount = 0, onChangePageNo }) => (
	<div className='progress-bar'>
	{
		_.times(pageCount, (index) => (
			<span key={index}
				className={index+1 === pageNo ? "current item" : index < pageNo ? 'past item' : 'future item'}
				title={`Page ${index+1}`}
				onClick={() => { index+1 !== pageNo && onChangePageNo(index+1) }}
				/>
		))
	}
	</div>
)

const BookContainer = ({isTocOpen, isTocPinned, book, progress, ...events}) => (
	<div id='book-container' className={isTocOpen ? 'book-with-toc' : 'book-full-src' }
		onKeyUp={(e) => {
			switch (e.which) {
				case 33: // page up
				case 38: // up
				case 37: // left
					events.onClickPageGoDelta({book, progress, delta: -1})
					break
				case 34: // page down
				case 40: // down
				case 39: // right
					events.onClickPageGoDelta({book, progress, delta: +1})
					break
			}
		}}>
		<iframe
			className={book.id ? 'full-size' : 'hide'}
			id='frame-book'
			src={`ebook://doc.${book.id || ''}/frame.html`}
			/>
		<ProgressBar pageNo={progress.pageNo} pageCount={progress.pageCount} onChangePageNo={events.onChangePageNo} />
		<div className='page-navigator prev-page' onClick={() => events.onClickPageGoDelta({book, progress, delta: -1})}>
			<Icon name='chevron left' size='large' title='Previous Page' />
		</div>
		<div className='page-navigator next-page' onClick={() => events.onClickPageGoDelta({book, progress, delta: +1})}>
			<Icon name='chevron right' size='large' title='Next Page' />
		</div>
		<div className={isTocOpen && !isTocPinned ? 'reader-dimmer' : 'hide'} onClick={events.onClickDimmer} />
		<PageStatus book={book} progress={progress} onClickPageGoDelta={events.onClickPageGoDelta} {...events} />
	</div>
)

export const ReaderBody = (props) => (
	<div id='book-reader' as={Menu}>
		<TocContainer {...props} />
		<BookContainer {...props} />
	</div>
)

const exported = {
	ReaderMenu,
	ReaderBody,
}

export default exported
