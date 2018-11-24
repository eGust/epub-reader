import {
  protocol,
} from 'electron'
import Url from 'url'
import querystring from 'querystring'
import {
  docManager,
} from './docManager'
import coverImageHandler from './coverImageManager'
import log from '../shared/logger'

protocol.registerStandardSchemes(['ebook'])

const registerEBookProtocol = () => {
  protocol.registerBufferProtocol('ebook',
    ({
      url,
      referrer,
      method,
    }, callback) => {
      log('[EBOOK://REQ]', {
        referrer,
        url,
        method,
      });
      const cb = (data) => {
        log('[EBOOK://RES]', data)
        callback(data)
      };

      const u = Url.parse(url);
      const scope = u.hostname.split('.', 1)[0];
      const id = u.hostname.slice(scope.length + 1);
      const filePath = u.pathname.slice(1);
      const qs = querystring.parse(u.query);
      console.log({
        url,
        scope,
        id,
        filePath,
        qs,
      });

      try {
        switch (scope) {
          case 'doc':
            if (filePath === '') {
              switch (qs.s) {
                case 'root':
                  return docManager.handleGlobals('frame.html', cb)
                case 'cover':
                  const {
                    p: filePath,
                    mt: mimeType,
                  } = qs;
                  return coverImageHandler({
                    id,
                    filePath,
                    mimeType,
                  }, cb)
                default:
              }
              respondNull(cb)
            }
            return docManager.handleDoc({
              doc: docManager.docs[id],
              filePath,
              method,
            }, cb)
          case 'toc':
            return docManager.handleToc({
              doc: docManager.docs[id],
            }, cb)
          case 'globals':
            return docManager.handleGlobals(filePath, cb)
          default:
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

export default registerEBookProtocol;
