import { protocol } from 'electron'
import { EPub } from './epub'
import Url from 'url'
import _ from 'lodash'
import { epubManager } from './epubManager'

protocol.registerStandardSchemes(['epub'])

export const registerEPubProtocol = () => {
	protocol.registerBufferProtocol('epub',
		({ url, referrer, method }, callback) => {
			console.log('epub request', { referrer, url, method })
			url = Url.parse(url)
			let scope = url.hostname, id = url.port, filePath = url.pathname.slice(1)
			epubManager.handle({ scope, url, method, id, filePath }, callback)
		},
		(err) => {
			if (!err)
				return
			console.log('epub request error:', err)
		}
	)
}
