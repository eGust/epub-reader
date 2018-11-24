import React from 'react';
import { connect } from 'react-redux';
import components from '../components/app';
import { openBookFiles } from '../redux/actions';

const mapStateToProps = (state, ownProps) => ({ ...state, ...ownProps });

const App = connect(
  mapStateToProps,
  dispatch => ({
    openBookFiles: files => dispatch(openBookFiles(files))
  })
)(components.App);

export default App;
