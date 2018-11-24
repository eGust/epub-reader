import {
  showSettings,
  openBookFiles,
  openExistingBook,
  updateFilter,
  updateSorting
} from '../redux/actions';
import components from '../components/shelf';
import { connect } from 'react-redux';

const mapStateToProps = ({ settings, shelf }, ownProps) => ({
  ...settings.shelf,
  ...shelf,
  ...ownProps
});

export const ShelfMenu = connect(
  mapStateToProps,
  dispatch => ({
    onClickShowSettings: () => dispatch(showSettings()),
    openBookFiles: files => dispatch(openBookFiles(files)),
    changeFilter: filter => dispatch(updateFilter(filter)),
    changeOrder: order => dispatch(updateSorting(order))
  })
)(components.ShelfMenu);

export const ShelfBody = connect(
  mapStateToProps,
  dispatch => ({
    onClickOpenBook: book => dispatch(openExistingBook(book))
    // onSizeChanged: (sizes) => dispatch(updateWindowSize(sizes)),
  })
)(components.ShelfBody);
