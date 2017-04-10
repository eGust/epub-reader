import { updateSettings, closeSettings } from '../redux/actions'
import components from '../components/settings'
import { connect } from 'react-redux'

const mapStateToProps = ({settings}, ownProps) => ({...settings, ...ownProps})

export const Settings = connect(
		mapStateToProps,
		(dispatch) => ({
			onUpdateSettings: (settings) => dispatch(updateSettings(settings)),
			onClose: (options = {save: false}) => dispatch(closeSettings(options)),
		})
	)(components.Settings)
