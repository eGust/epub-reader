import _ from 'lodash'
import JSZip from 'jszip'
import fs from 'fs'
import path from 'path'
import { Doc } from './doc'
import jsdom from 'jsdom'

let $ = require('jquery')(jsdom.jsdom().defaultView)

const IS_WIN = _.startsWith(process.platform, 'win')

export const dirname = IS_WIN ? ((p) => path.dirname(p).replace(/\\/g, '/')) : ((p) => path.dirname(p))

export const resolvePath = IS_WIN ? ((...args) => path.join(...args).replace(/\\/g, '/')) : ((...args) => path.join(...args))

function parseToc(node, currentPath) {
	let results = []
	$(node).find('>navPoint').each((index, np) => {
		let $np = $(np)
		results.push({
			index,
			id: $np.attr('id'),
			playOrder: parseInt($np.attr('playOrder')),
			text: $np.find('>navLabel>text').text(),
			content: resolvePath(currentPath, $np.find('>content').attr('src')),
			subItems: parseToc(np, currentPath),
		})
	})

	return results.sort((a, b) => a.playOrder === b.playOrder ? a.index - b.index : a.playOrder - b.playOrder)
}

export class EPub extends Doc {
	loadZip(zip, cb) {
		let opfPath
		zip.files['META-INF/container.xml'].async('string')
		.then((container) => {
			let rootPath = $('rootfiles>rootfile', container).attr('full-path')
			opfPath = dirname(rootPath)
			return zip.files[rootPath].async('string')
		})
		.then((opf) => {
			try {
				let $opf = $(opf)
					, idIndexes = {}
					, groups = {}
					, spine = []
					, items = []
					, pathIndexes = {}

				$opf.find('manifest>item').each((_, itemNode) => {
					let $e = $(itemNode)
						, id = $e.attr('id'), mt = $e.attr('media-type')
						, group = (groups[mt] || (groups[mt] = {}))
					let item = {
						id,
						mediaType: mt,
						href: resolvePath(opfPath, $e.attr('href')),
					}
					pathIndexes[item.href] = item
					idIndexes[id] = group[id] = item
				})
				$opf.find('spine>itemref').each((index, ir) => {
					let id = $(ir).attr('idref'), item = idIndexes[id]
					spine.push(id)
					items.push(item)
					item.order = index
				})
				this.data = {
					opfPath,
					opf,
					items,
					spine,
					pathIndexes,
					groups,
					zip,
				}

				let toc = groups['application/x-dtbncx+xml']
				if (toc) {
					toc = toc[_.keys(toc)[0]]
					if (toc && toc.href) {
						this.data.tocPath = dirname(toc.href)
						toc = zip.files[toc.href]
						if(toc)
							return toc.async('string')
					}
				}
				return null
			} catch (ex) {
				console.log('exception', ex)
			}
		})
		.then((toc) => {
			if (toc) {
				this.data.toc = parseToc($(toc).find('>navMap'), this.data.tocPath)
			}
			cb && cb(this)
		})
	}

	get toc() {
		return this.data.toc
	}

	loadFile(fileName, cb) {
		let fileBuff
		this.fileName = path.resolve(fileName)
		fs.readFile(fileName, (err, zipBuff) => {
			if (err) {
				console.log('loadFile.error:', err)
				throw err;
			}
			JSZip.loadAsync(zipBuff)
			.then((zip) => {
				this.loadZip(zip, cb)
			})
		})
	}

	fetchFile(item) {
		if (item.cached) {
			return new Promise((fulfill, reject) => {
				fulfill(item.cached)
			})
		}
		return this.data.zip.files[item.href].async('nodebuffer').then((buffer) => {
			if (item.mediaType.indexOf('html') > 0) {
				return new Promise((fulfill, reject) => {
					jsdom.env(buffer.toString(), (err, window) => {
						let $ = require('jquery')(window), $head = $('head'), $body = $('body')
						$head.find('script').remove()
						$body.find('script').remove()
						$body.find('link').appendTo($head)
						$body.find('style').appendTo($head)
						item.cached = `<html>
<head>
${$head.html()}
	<link id="css-link" href="epub://globals/frame.css" rel="stylesheet" type="text/css"/>
	<script src="epub://globals/lodash.js"></script>
	<script src="epub://globals/jquery.js"></script>
	<script src="epub://globals/frame.js"></script>
	<style id="css-calc">
	</style>
</head>
<body>
<main id="main"><div id="content">
${$body.html()}
</div></main>
</body>
</html>`
						window.close()
						fulfill(item.cached)
					})
				})
			} else {
				return (item.cached = buffer)
			}
		})
	}

	get rootItem() {
		return this.data.items[0]
	}

	pathToItem(path) {
		// console.log(path, _.keys(this.data.pathIndexes), this.data.pathIndexes[path])
		return this.data.pathIndexes[path]
	}

	prevItemOf(item) {
		return this.data.items[item.order-1]
	}

	nextItemOf(item) {
		return this.data.items[item.order+1]
	}

	static loadFile(fileName, cb) {
		new EPub().loadFile(fileName, cb)
	}

}
