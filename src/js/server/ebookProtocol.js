import { protocol } from 'electron'
import Url from 'url'
import _ from 'lodash'
import { docManager } from './docManager'

protocol.registerStandardSchemes(['ebook'])

export const registerEBookProtocol = () => {
	protocol.registerBufferProtocol('ebook',
		({ url, referrer, method }, callback) => {
			// console.log('[EBOOK REQ]', { referrer, url, method })
			url = Url.parse(url)
			const scope = url.hostname.split('.', 1)[0]
				, id = url.hostname.slice(scope.length+1)
				, filePath = url.pathname.slice(1)
			docManager.handle({ scope, url, method, id, filePath }, callback)
		},
		(err) => {
			if (!err)
				return
			console.log('[EBOOK REQ] error:', err)
		}
	)
}
