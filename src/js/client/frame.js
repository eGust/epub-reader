function log(...args) {
	// console.log(`[frame] ${(new Date).toISOString()}`, ...args)
}

function now() {
	return (new Date).toISOString()
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
	MESSAGE_HANDLERS.setPath({ chapterPath, anchor })
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
	page = isNaN(page) ? 1 : page
	log('setPageNo', { page })
	currentPosition.pageNo = Math.max(1, Math.min(currentPosition.pageCount, page || 1))
	$('main#main>#content').css({left: -currentPosition.pageWidth * (currentPosition.pageNo-1)})
	updateProgress()
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

function updateProgress() {
	log('updateProgress', currentPosition)
	const { chapterPath, anchor, pageNo, pageCount } = currentPosition
	postWebMessage({ action: 'updateProgress', progress: { chapterPath, anchor, pageNo, pageCount } })
	$('#main').focus()
}

$(window).resize(() => {
	updatePageCount()
	setPageNo(currentPosition.pageNo)
})

function switchPage(delta) {
	let page = (currentPosition.pageNo|0) + delta
	if (page < 1 || page > currentPosition.pageCount) {
		postWebMessage({ action: 'switchPage', delta })
	} else {
		setPageNo(page)
	}
}

function pageUp() {
	switchPage(-1)
}

function pageDown() {
	switchPage(+1)
}

$(() => {
	log('frame ready', currentPosition)
	updatePageCount()
	postWebMessage({action: 'ready', bookId: location.hostname.slice(4)})

	$('body')
	.on('mousewheel', (e) => {
		if (e.originalEvent.wheelDelta > 0) {
			pageUp()
		} else if (e.originalEvent.wheelDelta < 0) {
			pageDown()
		}
	})
	.on('keyup', (e) => {
		switch (e.which) {
			case 33: // page up
			case 38: // up
			case 37: // left
				pageUp()
				break
			case 34: // page down
			case 40: // down
			case 39: // right
				pageDown()
				break
		}
	})
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
	setPath({ chapterPath, anchor, pageNo, pageCount }) {
		log('setPath', {chapterPath})
		if (chapterPath === currentPosition.chapterPath) {
			goToPage({anchor, pageNo, pageCount})
			return
		}

		$('main#main').removeClass('show')
		$.get(`/${chapterPath}`)
		.then((xhtml) => {
			const $xhtml = $(xhtml), $head = $('head'), cssLink = $('#css-link')[0], toRemove = []
			for (const el of $head.find('> *')) {
				if (el === cssLink)
					break
				toRemove.push(el)
			}
			_.each(toRemove, (el) => $(el).remove())

			const xhead = $xhtml.find('head'), xbody = $xhtml.find('body')

			xhead.find('script').remove()
			xbody.find('script').remove()
			xbody.find('link').appendTo(xhead)
			xbody.find('style').appendTo(xhead)

			history.pushState({}, '', `/${chapterPath}`)
			currentPosition.chapterPath = chapterPath

			$head.prepend(xhead.children())
			$('main#main>#content').html(xbody.children())
			setTimeout(() => {
				updatePageCount()
				goToPage({anchor, pageNo, pageCount})
				$('main#main').addClass('show')
			}, 1)
		})
	},

	setPage({page}) {
		setPageNo(page)
	},

}

function postWebMessage(data) {
	log('send', data)
	window.parent.postMessage(_.merge({ channel: 'ebook' }, data), '*')
}

function reloadCSSLink() {
	$('#css-link').replaceWith(`<link id="css-link" href="ebook://globals/frame.css?t=${(now()).toISOString().replace(/\W/g, '')}" rel="stylesheet" type="text/css"/>`)
}

function updateCSSCalc(css) {
	$('#css-calc').html(css)
}
