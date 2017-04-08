import { docManager } from './docManager'
import path from 'path'
import moment from 'moment'

const idBase = '2000-01-01'

export class DocBase {
	loaded = false

	constructor(params = {}) {
		const { fileName = null, id = null } = params
		if (fileName) {
			this.setFileName(fileName, id)
		} else {
			this.id = id
		}
	}

	get toc() {
		return []
	}

	setFileName(fileName, id) {
		if (this.fileName)
			return this
		this.id = id || `${Date.now().toString(36)}.${moment().diff(idBase).toString(36)}`
		docManager.addDoc(this, this.fileName = path.resolve(fileName))
		return this
	}

	static register(typeName, typeClass, ...extFileNames) {
		extFileNames = extFileNames.map((ext) => {
			ext = ext.toLowerCase()
			return ext.startsWith('.') ? ext : '.'+ext
		})
		docManager.registerType(typeName, typeClass, extFileNames)
	}
}

const IS_WIN = process.platform.startsWith('win')

export const dirname = IS_WIN ? ((p) => path.dirname(p).replace(/\\/g, '/')) : ((p) => path.dirname(p))

export const resolvePath = IS_WIN ? ((...args) => path.join(...args).replace(/\\/g, '/')) : ((...args) => path.join(...args))

export const absoluteFileName = IS_WIN ? (fn) => path.resolve(fn).toLowerCase() : (fn) => path.resolve(fn)
