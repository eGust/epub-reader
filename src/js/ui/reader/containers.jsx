import {
	showSettings,
	changeRouting,
	toggleTocPin,
	toggleTocOpen,
	changeReaderContentPath,
	changeReaderPage,
} from '../actions'
import components from './components'
import { connect } from 'react-redux'

const mapStateToProps = ({reader}, ownProps) => ({...reader, ...ownProps})

export const ReaderMenu = connect(
		mapStateToProps,
		(dispatch) => ({
			onClickToggleToc: () => dispatch(toggleTocOpen()),
			onClickShowSettings: () => dispatch(showSettings()),
			onClickShowShelf: () => dispatch(changeRouting('shelf')),
		})
	)(components.ReaderMenu)

export const ReaderBody = connect(
		mapStateToProps,
		(dispatch) => ({
			onClickPin: () => dispatch(toggleTocPin()),
			onClickDimmer: () => dispatch(toggleTocOpen(false)),
			onClickTocItem: (item) => dispatch(changeReaderContentPath(item)),
			onClickPagePrev: () => dispatch(changeReaderPage(-1)),
			onClickPageNext: () => dispatch(changeReaderPage(+1)),
		})
	)(components.ReaderBody)

