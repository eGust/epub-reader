function log(...args) {
	console.log.call(console, '[frame]', ...args)
}

let currentPosition = {
	chapterPath: null,
	anchor: null,
	pageNo: 1,
	pageCount: 1,

	gapWidth: null,
	pageWidth: null,
}

$(document)
.on('click', 'a', function (event) {
	event.preventDefault()
	let a = $(this)[0], chapterPath = a.pathname.slice(1), anchor = a.hash
	// console.log($el[0])
	MESSAGE_HANDLERS.changePath({ chapterPath, anchor })
})

function updatePageCount() {
	let $m = $('main#main'), $c = $('main#main>#content'), c = $c[0]
		, gapWidth = parseFloat($c.css('column-gap')) || $m.width() * 0.02
		, pageWidth = c.clientWidth + gapWidth
		, pageCount = Math.floor(c.scrollWidth/ pageWidth + 0.7)
	currentPosition = _.merge(currentPosition, {
		gapWidth,
		pageWidth,
		pageCount,
	})
}

function setPageNo(page) {
	// log('setPageNo', { page, left: pageWidth * pageNo })
	currentPosition.pageNo = Math.max(1, Math.min(currentPosition.pageCount, page))
	$('main#main>#content').css({left: -currentPosition.pageWidth * (currentPosition.pageNo-1)})
}

function goToPage({ anchor, pageNo, pageCount }) {
	let toPage = 1
	if (anchor && anchor.length) {
		const a = $(anchor)[0]
		if (a) {
			toPage = Math.floor(a.offsetLeft / currentPosition.pageWidth)
		}
	} else if (pageNo === 1 || pageNo === -1) {
		toPage = pageNo === 1 ? 1 : currentPosition.pageCount
	} else if (pageNo && pageCount) {
		toPage = pageNo / pageCount * currentPosition.pageCount | 0
	}
	setPageNo(toPage)
}

$(window).resize(() => {
	updatePageCount()
	setPageNo(currentPosition.pageNo)
})

$(() => {
	log('frame ready', currentPosition)
	updatePageCount()
	postWebMessage({action: 'ready'})
})

function messageHandler(event) {
	const data = event.data, { channel, action } = data
	if (channel !== 'ebook')
		return

	delete data.channel
	delete data.action
	log('receive', { action, data })
	MESSAGE_HANDLERS[action] && MESSAGE_HANDLERS[action](data)
}

window.addEventListener('message', messageHandler, false)

const MESSAGE_HANDLERS = {
	setPath({ path: chapterPath, anchor, pageNo, pageCount }) {
		if (chapterPath === currentPosition.chapterPath) {
			goToPage({anchor, pageNo, pageCount})
			return
		}

		$('main#main').removeClass('show')
		$.get(`/${chapterPath}`)
		.then((xhtml) => {
			let $xhtml = $(xhtml), $head = $('head'), cssLink = $('#css-link')[0], toRemove = []
			for (let el of $head.find('> *')) {
				if (el === cssLink)
					break
				toRemove.push(el)
			}
			_.each(toRemove, (el) => $(el).remove())

			let xhead = $xhtml.find('head'), xbody = $xhtml.find('body')

			xhead.find('script').remove()
			xbody.find('script').remove()
			xbody.find('link').appendTo(xhead)
			xbody.find('style').appendTo(xhead)

			history.pushState({}, '', `/${chapterPath}`)
			currentPosition.chapterPath = chapterPath

			$head.prepend(xhead.children())
			$('main#main>#content').html(xbody.children())
			updatePageCount()
			goToPage({anchor, pageNo, pageCount})
			$('main#main').addClass('show')
		})
	},

	changePage({ go }) {
		let { pageNo, pageCount, chapterPath } = currentPosition
		log('changePage', { go, pageNo, pageCount, chapterPath })
		if (go === 'prev') {
			page = pageNo - 1
		} else if (go === 'next') {
			page = pageNo + 1
		}

		if (page === pageNo) {
			log('same page', { page, pageNo })
			return
		}

		if (page < 0 || page >= pageCount) {
			postWebMessage({ action: 'changePath', go, chapterPath })
			log('changePath', { go, chapterPath })
			return
		}

		setPageNo(page)
	},

	changePath({ chapterPath, anchor }) {
		if (chapterPath === currentPosition.chapterPath) {
			return
		}

		log('changePath', { chapterPath, anchor })

		$('main#main').removeClass('show')
		$.get(`/${chapterPath}`)
		.then((xhtml) => {
			let $xhtml = $(xhtml), $head = $('head'), cssLink = $('#css-link')[0], toRemove = []
			for (let el of $head.find('> *')) {
				if (el === cssLink)
					break
				toRemove.push(el)
			}
			_.each(toRemove, (el) => $(el).remove())

			let xhead = $xhtml.find('head'), xbody = $xhtml.find('body')

			xhead.find('script').remove()
			xbody.find('script').remove()
			xbody.find('link').appendTo(xhead)
			xbody.find('style').appendTo(xhead)

			history.pushState({}, '', `/${chapterPath}`)
			currentPosition.chapterPath = chapterPath

			$head.prepend(xhead.children())
			$('main#main>#content').html(xbody.children())
			updatePageCount()
			switchToAnchor(anchor)
			$('main#main').addClass('show')
		})
	},
}

function postWebMessage(data) {
	log('send', data)
	window.parent.postMessage(_.merge({ channel: 'ebook' }, data), '*')
}

function reloadCSSLink() {
	$('#css-link').replaceWith(`<link id="css-link" href="ebook://globals/frame.css?t=${(new Date).toISOString().replace(/\W/g, '')}" rel="stylesheet" type="text/css"/>`)
}

function updateCSSCalc(css) {
	$('#css-calc').html(css)
}
