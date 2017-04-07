import _ from 'lodash'
import { mapToFontSize, mapToLineHeight, mapToLetterSpacing } from './sizeMappings'

const builder = ({ fontFamily, fontWeight, fontStyle, color, backgroundColor, fontSize, lineHeight, letterSpacing }) => (
	{
		'font-family': fontFamily.map((fm) => `"${fm}"`).join(', '),
		'font-weight': fontWeight,
		'font-style': fontStyle,
		'color': color,
		'background-color': backgroundColor,
		'font-size': `${mapToFontSize(fontSize)}px`,
		'line-height': `${mapToLineHeight(lineHeight)}rem`,
		'letter-spacing': `${mapToLetterSpacing(letterSpacing)}px`,
	}
)

export default builder
