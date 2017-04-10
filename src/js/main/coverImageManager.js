import { app } from 'electron'
import fs from 'fs'
import { docManager, respondNull } from './docManager'

const COVER_PATH_ROOT = `${app.getPath('userData')}/appdata/covers`

export function handler({id, filePath, mimeType}, cb) {
	const coverPath = `${COVER_PATH_ROOT}/${id}`

	if (fs.existsSync(coverPath)) {
		fs.readFile(coverPath, (err, data) => {
			if (err) {
				console.log(err)
				return respondNull(cb)
			}
			cb && cb({ mimeType, data })
		})
	} else {
		docManager.handleDoc({ doc: docManager.getDocumentById(id), filePath, method: 'get' }, ({ mimeType, data }) => {
			cb && cb({ mimeType, data })
			if (mimeType && data) {
				fs.mkdir(COVER_PATH_ROOT, () => fs.writeFile(coverPath, data))
			}
		})
	}
}

export default handler
