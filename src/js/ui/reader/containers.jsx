import {
	showSettings,
	changeRouting,
	toggleTocPin,
	toggleTocOpen,
	changeReaderContentPath,
} from '../actions'
import components from './components'
import { connect } from 'react-redux'

const mapStateToProps = ({settings, reader}, ownProps) => ({...settings.reader, ...reader, ...ownProps})

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
		})
	)(components.ReaderBody)

