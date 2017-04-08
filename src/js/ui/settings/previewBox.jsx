import React from 'react'
import { mapToFontSize, mapToLineHeight, mapToLetterSpacing } from '../sizeMappings'

export const PreviewBox = ({ fontFamily, fontWeight, fontStyle, color, link, backgroundColor, fontSize, lineHeight, letterSpacing }) => (
	<div className='preview-container'>
		<div className='preview-content' style={{
			fontFamily: fontFamily.map((fm) => `"${fm}"`).join(', '),
			fontWeight, fontStyle, color, backgroundColor,
			fontSize: mapToFontSize(fontSize),
			lineHeight: mapToLineHeight(lineHeight),
			letterSpacing: mapToLetterSpacing(letterSpacing),
			borderColor: color,
		}}>
			Lorem ipsum dolor sit amet, <a href='#' style={link}>[link]</a> consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
			<br />
			张华考上了北京大学；李萍进了中等技术学校；我在百货公司当售货员：我们都有光明的前途。
		</div>
	</div>
)
