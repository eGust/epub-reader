import fs from 'fs'
import path from 'path'

const FRAME_CSS_PATH = path.resolve(__dirname, `../css/restricted/frame.css`)

export function fetchDynamicCss({ path }, cb) {
	console.log('fetchDynamicCss', path)
	fs.readFile(FRAME_CSS_PATH, 'utf-8', (err, css) => {
		if (err)
			return cb(null)
		cb({ mimeType: 'text/css', data: new Buffer(css) })
	})
}
