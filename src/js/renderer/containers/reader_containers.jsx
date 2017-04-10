import {
	showSettings,
	changeRouting,
	toggleTocPin,
	toggleTocOpen,
	toggleTocItemOpen,
	changeReaderContentPath,
	// changeReaderPage,
	changeReaderChapter,
	changeReaderPageNo,
	doChangeReaderPage,
} from '../redux/actions'
import components from '../components/reader'
import { connect } from 'react-redux'

const mapStateToProps = ({reader, settings}, ownProps) => ({...reader, progresses: settings.progresses, ...ownProps})

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
			// onClickPagePrev: () => dispatch(changeReaderPage(-1)),
			// onClickPageNext: () => dispatch(changeReaderPage(+1)),
			onClickPageGoDelta: (data) => doChangeReaderPage(data),
			onClickChapterPrev: () => dispatch(changeReaderChapter(-1)),
			onClickChapterNext: () => dispatch(changeReaderChapter(+1)),
			onChangePageNo: (pageNo) => dispatch(changeReaderPageNo(pageNo)),
			onToggleTocFolding: (itemOrAllOpen) => dispatch(toggleTocItemOpen(itemOrAllOpen)),
		})
	)(components.ReaderBody)

