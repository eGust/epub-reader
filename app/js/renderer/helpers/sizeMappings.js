// 0..100 -> [6..25.5, 26..65, 66..]
export function mapToFontSize(value) {
  let fontSize
  if (value < 40) {
    fontSize = 6 + value / 2
  } else if (value < 80) {
    fontSize = 26 + value - 40
  } else {
    fontSize = 66 + (value - 80) * 2
  }
  return fontSize
}

// 0..100 -> [1.00..1.65, 1.65..3.0]
export function mapToLineHeight(value) {
  let lineHeight
  if (value < 50) {
    lineHeight = 1 + value * 0.013
  } else {
    lineHeight = 1.65 + (value - 50) * 0.027
  }
  return lineHeight
}

// 0..100 -> [0..100]
export function mapToLetterSpacing(value) {
  return value
}
