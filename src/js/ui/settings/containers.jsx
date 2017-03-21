import { updateSettings, closeSettings } from '../actions'
import components from './components'
import { connect } from 'react-redux'

const mapStateToProps = ({settings}, ownProps) => ({...settings, ...ownProps})

export const Settings = connect(
		mapStateToProps,
		(dispatch) => ({
			onUpdateSettings: (settings) => dispatch(updateSettings(settings)),
			onClose: (options = {save: false}) => dispatch(closeSettings(options)),
		})
	)(components.Settings)
