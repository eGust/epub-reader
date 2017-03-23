import { docManager } from './docManager'
import path from 'path'

let docId = 0

export class DocBase {
	constructor() {
		this.id = `${++docId}`
	}

	get toc() {
		return {}
	}

	setFileName(fileName) {
		docManager.addDoc(this, this.fileName = path.resolve(fileName))
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
