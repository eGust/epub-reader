import React from 'react'
import { connect } from 'react-redux'
import components from '../components/app'

const mapStateToProps = (state, ownProps) => ({...state, ...ownProps})

const App = connect(mapStateToProps)(components.App)

export default App
