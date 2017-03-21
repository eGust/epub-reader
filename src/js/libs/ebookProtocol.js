import { protocol } from 'electron'
import { EPub } from './epubDoc'
import Url from 'url'
import _ from 'lodash'
import { docManager } from './docManager'

protocol.registerStandardSchemes(['ebook'])

export const registerEBookProtocol = () => {
	protocol.registerBufferProtocol('ebook',
		({ url, referrer, method }, callback) => {
			console.log('epub request', { referrer, url, method })
			url = Url.parse(url)
			let scope = url.hostname, id = url.port, filePath = url.pathname.slice(1)
			docManager.handle({ scope, url, method, id, filePath }, callback)
		},
		(err) => {
			if (!err)
				return
			console.log('epub request error:', err)
		}
	)
}
