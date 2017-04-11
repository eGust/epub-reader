import _ from 'lodash'
import React from 'react'
import { Menu, Sidebar, Icon, Popup, Input, Label } from 'semantic-ui-react'
import querystring from 'querystring'

export const ShelfMenu = ({ filter, sorting, onClickShowSettings, openBookFiles, changeFilter, changeOrder }) => (
	<Sidebar as={Menu} direction='top' visible inverted fluid>
		<Popup inverted
			trigger={
				<Menu.Item>
					<Icon name='folder open' />
					<label className='full-size'>
						<input type='file' multiple className='hide' accept='.epub' onChange={(e) => {
							const input = e.currentTarget
								, files = _.map(input.files, (f) => f.path)
							input.value = null
							openBookFiles(files)
						}} />
					</label>
				</Menu.Item>
			}
			content='Open EPub files'
		/>
		<Popup inverted
			trigger={
				<Menu.Item>
					<Icon name='filter' />
					{
						filter && filter.length ? (
						<Label color='blue' className='text-lowercase'>
							{filter}
							<Icon name='close' onClick={() => changeFilter()} />
						</Label>
						) : 'Filter'
					}
				</Menu.Item>
			}
			on='click'
		>
			<Input
				value={filter}
				onChange={(e) => changeFilter(e.target.value)}
				icon={<Icon name='close' inverted circular link onClick={() => changeFilter()} />}
				placeholder='Search...' />
		</Popup>

		<Menu.Item className='title-middle-bar'>
			<label>EPub Reader</label>
		</Menu.Item>

		<Menu.Menu position='right'>
			<Popup inverted
				trigger={
					<Menu.Item>
						<Label color='brown' className='text-uppercase'>
							{sorting.method}
							<Label.Detail>
								<Icon name={`sort content ${sorting.order}`} />
							</Label.Detail>
						</Label>
						<Icon name='dropdown' />
					</Menu.Item>
				}
				content={
					<Menu vertical inverted>
						<Menu.Item>
							<Menu.Header>Sort by:</Menu.Header>
							<Menu.Menu>
							{
								['Title', 'Last Read'].map((title, index) => (
								<Menu.Item active={title === sorting.method} key={index} onClick={() => changeOrder({method: title})}>
									{title}
									{
										title === sorting.method ? (<Icon name='check' />) : null
									}
								</Menu.Item>
								))
							}
							</Menu.Menu>
						</Menu.Item>
						<Menu.Item>
							<Menu.Menu>
							{
								['ascending', 'descending'].map((title, index) => (
								<Menu.Item className='text-capitalize' active={title === sorting.order} key={index} onClick={() => changeOrder({order: title})}>
									{title}
									<Icon name={`sort content ${title}`} />
								</Menu.Item>
								))
							}
							</Menu.Menu>
						</Menu.Item>
					</Menu>
				}
				on='click'
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

export const ShelfBody = ({ customMargin, viewMargin, bookMargin, bookCovers, onClickOpenBook }) => (
	<div id='books-shelf' style={ customMargin ? { paddingLeft: viewMargin, paddingRight: viewMargin, } : {} }>
	{
		bookCovers.map((book, index) => (
			<div key={index}
				className='book'
				onClick={() => onClickOpenBook(book)}
				style={ customMargin ? { marginLeft: bookMargin/2, marginRight: bookMargin/2, } : {} }
				>
				<div className='cover-wrap'>
					<div className='cover-border'>
					{
						book.coverImage ? (
						<img className='cover-image'
							src={`ebook://doc.${book.id || ''}/?${querystring.stringify({s: 'cover', p: book.coverImage.href, mt: book.coverImage.mediaType })}`} />
						) : null
					}
					</div>
				</div>
				<label className='book-title' title={book.fileName}>{book.title}</label>
			</div>
		))
	}
	</div>
)

const exported = {
	ShelfMenu,
	ShelfBody,
}

export default exported
