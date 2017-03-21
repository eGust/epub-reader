import { showSettings, openBookFile, openExistingBook } from '../actions'
import components from './components'
import { connect } from 'react-redux'

const mapStateToProps = ({settings, shelf}, ownProps) => ({...settings.shelf, ...shelf, ...ownProps})

export const ShelfMenu = connect(
		mapStateToProps,
		(dispatch) => ({
			onClickShowSettings: () => dispatch(showSettings()),
			onOpenBookFile: (file) => dispatch(openBookFile(file)),
		})
	)(components.ShelfMenu)

export const ShelfBody = connect(
		mapStateToProps,
		(dispatch) => ({
			onClickOpenBook: (book) => dispatch(openExistingBook(book)),
			// onSizeChanged: (sizes) => dispatch(updateWindowSize(sizes)),
		})
	)(components.ShelfBody)

