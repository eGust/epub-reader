import _ from 'lodash'
import JSZip from 'jszip'
import fs from 'fs'
import crypto from 'crypto'
import cheerio from 'cheerio'
import {
  DocBase,
  dirname,
  resolvePath,
} from './docBase'
import log from '../shared/logger'
// import jsdom from 'jsdom'

// let $ = require('jquery')(jsdom.jsdom().defaultView)

function parseTocNcx($, basePath) {
  function parse($node) {
    const results = []
    $node.find('>navPoint').each((index, np) => {
      const $np = $(np)
      results.push({
        index,
        id: $np.attr('id'),
        playOrder: $np.attr('playOrder') | 0,
        text: $np.find('>navLabel>text').text(),
        content: resolvePath(basePath, $np.find('>content').attr('src')),
        subItems: parse($np),
      })
    })
    return results.sort((a, b) => a.playOrder === b.playOrder ? a.index - b.index : a.playOrder - b.playOrder)
  }

  return parse($('navMap'))
}

function parseTocXml($, basePath) {
  function parse($node) {
    const results = []
    $node.length && $node.find('>li').each((index, li) => {
      const $li = $(li);

        
const $a = $li.find('>a');

        
const $ol = $li.find('>ol')
      if ($a.length) {
        results.push({
          index,
          text: $a.attr('title') || $a.text(),
          content: resolvePath(basePath, $a.attr('href')),
          subItems: parse($li.find('>ol')),
        })
      }
    })
    return results
  }

  return parse($('nav>ol'))
}

class EPubDoc extends DocBase {
  findCoverImage($, opfPath) {
    function verifyImage($node) {
      const {
        href,
        'media-type': mediaType,
      } = $node && $node.length ? $node.attr() : {}
      return href && href.length && mediaType && mediaType.length && mediaType.startsWith('image/') ? {
        href: resolvePath(opfPath, href),
        mediaType,
      } : null
    }

    const image = verifyImage($('manifest>item[properties="cover-image"]'))
    if (image) {
      return image
    }

    const $node = $('metadata>meta[name="cover"]')
    return ($node.length && verifyImage($(`#${$node.attr('content').replace(/(\W)/g, '\\$1')}`))) || verifyImage($('#cover'))
  }

  loadToc($, cb) {
    const parseToc = ($toc) => {
      if (!$toc.length)
        return false

      const tocPath = resolvePath(this.data.opfPath, $toc.attr('href'))
      let tocParser = null
      switch ($toc.attr('media-type')) {
        case 'application/x-dtbncx+xml':
          tocParser = parseTocNcx
          break
        case 'application/xhtml+xml':
          tocParser = parseTocXml
          break
      }

      if (tocParser) {
        const tocZip = zip.files[this.data.tocPath = tocPath]
        if (tocZip) {
          tocZip.async('string')
            .then((toc) => {
              this.data.toc = tocParser(cheerio.load(toc, {
                xmlMode: true,
              }), dirname(tocPath))
              cb('success', this)
            })
          return true
        }
      }
      return false
    }

    const {
      opfPath,
      zip,
    } = this.data

    const tocId = $('spine').prop('toc')
    if (tocId && tocId.length && parseToc($(`#${tocId}`)) ||
      parseToc($('manifest>[properties="nav"]')) ||
      parseToc($('manifest>[media-type="application/x-dtbncx+xml"]')))
      return

    cb('success', this)
  }

  loadOpf({
    zip,
    opf,
    cb,
    opfPath,
  }) {
    try {
      const $ = cheerio.load(opf, {
          xmlMode: true,
        });

        
const idIndexes = {};

        
const groups = {};

        
const spine = [];

        
const items = [];

        
const pathIndexes = {};

        
const title = $('metadata > dc\\:title').text().trim()

      $('manifest>item').each((__, itemNode) => {
        const $e = $(itemNode);

          
const id = $e.attr('id');

          
const mt = $e.attr('media-type');

          
const group = (groups[mt] || (groups[mt] = {}))
        const item = {
          id,
          mediaType: mt,
          href: resolvePath(opfPath, $e.attr('href')),
        }
        pathIndexes[item.href] = item
        idIndexes[id] = group[id] = item
      })
      $('spine>itemref').each((index, ir) => {
        const id = $(ir).attr('idref');

          
const item = idIndexes[id]
        spine.push(id)
        items.push(item)
        item.order = index
      })

      this.data = {
        opfPath,
        items,
        spine,
        pathIndexes,
        groups,
        zip,
        title,
        coverImage: this.findCoverImage($, opfPath),
        toc: [],
      }

      this.loadToc($, cb)
    } catch (ex) {
      console.log('exception', ex)
    }
  }

  loadZip(zip, cb) {
    let opfPath
    zip.files['META-INF/container.xml'].async('string')
      .then((container) => {
        const $ = cheerio.load(container, {
            xmlMode: true,
          });

          
const rootPath = $('rootfiles>rootfile').attr('full-path')
        opfPath = dirname(rootPath)

        zip.files[rootPath].async('string')
          .then((opf) => {
            this.loadOpf({
              zip,
              opf,
              cb,
              opfPath,
            })
          })
      })
  }

  get toc() {
    return this.data && this.data.toc
  }

  loadFile(cb) {
    this.loaded = false
    if (!fs.existsSync(this.fileName)) {
      cb && cb({
        id: null,
        reason: 'not exist',
      })
    }

    fs.readFile(this.fileName, (err, zipBuff) => {
      if (err) {
        console.log('loadFile.error:', err)
        return cb && cb({
          id: null,
          reason: 'read error',
        })
      }

      const hash = crypto.createHash('sha256')
      hash.update(zipBuff)

      this.fileInfo = {
        path: this.fileName,
        size: zipBuff.length,
        hash: hash.digest('hex'),
      }

      JSZip.loadAsync(zipBuff)
        .then((zip) => {
          this.loadZip(zip, (status, ...args) => {
            this.loaded = status
            cb && cb(...args)
          })
        })
    })
  }

  fetchFile(item) {
    if (item.cached) {
      return new Promise((fulfill, reject) => {
        fulfill(item.cached)
      })
    }
    return this.data && this.data.zip.files[item.href].async('nodebuffer').then((buffer) => (item.cached = buffer))
  }

  get title() {
    return this.data && this.data.title
  }

  get rootItem() {
    return this.data && this.data.items[0]
  }

  pathToItem(path) {
    // console.log(path, _.keys(this.data.pathIndexes), this.data.pathIndexes[path])
    return this.data && this.data.pathIndexes[path]
  }

  prevItemOf(item) {
    return this.data && this.data.items[item.order - 1]
  }

  nextItemOf(item) {
    return this.data && this.data.items[item.order + 1]
  }

}

const exp = {
  register: () => DocBase.register('EPub', EPubDoc, '.epub'),
}

export default exp
