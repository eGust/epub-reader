import { app, protocol } from 'electron'
import Url from 'url'
import _ from 'lodash'
import { docManager } from './docManager'
import coverImageManagerHandler from './coverImageManager'

protocol.registerStandardSchemes(['ebook'])

export const registerEBookProtocol = () => {
	protocol.registerBufferProtocol('ebook',
		({ url, referrer, method }, callback) => {
			// console.log('[EBOOK REQ]', { referrer, url, method })
			url = Url.parse(url)
			const scope = url.hostname.split('.', 1)[0]
				, id = url.hostname.slice(scope.length+1)
				, filePath = url.pathname.slice(1)

			try {
				switch (scope) {
					case 'doc':
						if (filePath === 'frame.html') {
							return docManager.handleGlobals(filePath, cb)
						}
						return docManager.handleDoc({ doc: docManager.docs[id], filePath, method }, cb)
					case 'toc':
						return docManager.handleToc({ doc: docManager.docs[id] }, cb)
					case 'globals':
						return docManager.handleGlobals(filePath, cb)
					case 'cover':
						return coverImageManagerHandler({id, filePath}, cb)
				}
				respondNull(cb)
			} catch (ex) {
				console.log('handle request failed:', ex)
			}
		},
		(err) => {
			if (!err)
				return
			console.log('[EBOOK REQ] error:', err)
		}
	)
}
