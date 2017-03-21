import { epubManager } from './epubManager'

let docId = 0;

export class Doc {
	constructor() {
		this.id = `${++docId}`
		epubManager.addDoc(this)
	}

	get toc() {
		return {}
	}
}
