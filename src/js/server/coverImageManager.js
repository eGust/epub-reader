import { app } from 'electron'
import fs from 'fs'
import { docManager, respondNull } from './docManager'
import Api from '../mainInterface'

const COVER_PATH_ROOT = `${app.getPath('userData')}/appdata/covers`

export function handler({id, filePath}, cb) {
	const book = (Api.getReduxState() || { shelf: { books: {} } }).shelf.books[id]
		, coverPath = `${COVER_PATH_ROOT}/${id}`

	if (!book) {
		return respondNull(cb)
	}

	if (fs.existsSync(coverPath)) {
		fs.readFile(coverPath, (err, data) => {
			if (err) {
				console.log(err)
				return respondNull(cb)
			}
			const { mimeType } = book.coverImage
			cb && cb({ mimeType, data })
		})
	} else {
		docManager.handleCover({ doc, filePath, method: 'get' }, ({ mimeType, data }) => {
			cb && cb({ mimeType, data })
			fs.writeFile(coverPath, data)
		})
	}
}

export default handler
