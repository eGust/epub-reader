import { showSettings, openBookFiles, openExistingBook } from '../actions'
import components from './components'
import { connect } from 'react-redux'

const mapStateToProps = ({settings, shelf}, ownProps) => ({...settings.shelf, ...shelf, ...ownProps})

export const ShelfMenu = connect(
		mapStateToProps,
		(dispatch) => ({
			onClickShowSettings: () => dispatch(showSettings()),
			openBookFiles: (files) => dispatch(openBookFiles(files)),
		})
	)(components.ShelfMenu)

export const ShelfBody = connect(
		mapStateToProps,
		(dispatch) => ({
			onClickOpenBook: (book) => dispatch(openExistingBook(book)),
			// onSizeChanged: (sizes) => dispatch(updateWindowSize(sizes)),
		})
	)(components.ShelfBody)

