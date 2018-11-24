import {
  mapToFontSize,
  mapToLineHeight,
  mapToLetterSpacing,
} from './sizeMappings'

const builder = ({
  fontFamily,
  fontWeight,
  fontStyle,
  color,
  backgroundColor,
  fontSize,
  lineHeight,
  letterSpacing,
  linkUnerline,
  linkColor,
}) => ({
  bodyStyles: {
    'font-family': fontFamily.map((fm) => `"${fm}"`).join(', '),
    'font-weight': fontWeight,
    'font-style': fontStyle,
    'color': color,
    'background-color': backgroundColor,
    'font-size': `${mapToFontSize(fontSize)}px`,
    'line-height': `${mapToLineHeight(lineHeight)}rem`,
    'letter-spacing': `${mapToLetterSpacing(letterSpacing)}px`,
  },
  linkStyles: {
    'color': linkColor,
    'text-decoration': linkUnerline,
  },
  allStyles: {
    'font-size': `${mapToFontSize(fontSize)}px`,
    'line-height': `${mapToLineHeight(lineHeight)}rem`,
    'letter-spacing': `${mapToLetterSpacing(letterSpacing)}px`,
  },
});

export default builder
