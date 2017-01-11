function log() {
	console.log.call(console, '[frame]')
}

let currentLocation = {
	filePath: null,
	anchor: null,
	pageNo: 0,
	pageCount: 1,
	gapWidth: null,
	pageWidth: null,
}

$(document)
.on('click', 'a', function (event) {
	event.preventDefault()
	let a = $(this)[0], filePath = a.pathname.slice(1), anchor = a.hash
	// console.log($el[0])
	MESSAGE_HANDLERS.changePath({ filePath, anchor })
})

function updatePageCount() {
	let $m = $('main#main'), $c = $('main#main>#content'), c = $c[0]
		, gapWidth = parseFloat($c.css('column-gap')) || $m.width() * 0.02
		, pageWidth = c.clientWidth + gapWidth
		, pageCount = Math.floor(c.scrollWidth/ pageWidth + 0.7)
	currentLocation = _.merge(currentLocation, {
		gapWidth,
		pageWidth,
		pageCount,
	})
	console.log($c.width(), c.scrollWidth, pageCount)
}

function updatePageNo(page) {
	// console.log('updatePageNo', { page, left: pageWidth * pageNo })
	currentLocation.pageNo = Math.max(0, Math.min(currentLocation.pageCount-1, page))
	$('main#main>#content').css({left: -currentLocation.pageWidth * currentLocation.pageNo})
}

function switchToAnchor(anchor) {
	let pageNo = 0
	if (anchor && anchor.length) {
		if (anchor === '*scroll-to-last-page') {
			pageNo = currentLocation.pageCount - 1
		} else {
			let a = $(anchor)[0]
			if (a) {
				pageNo = Math.floor(a.offsetLeft / currentLocation.pageWidth)
			}
		}
	}
	updatePageNo(pageNo)
}

$(window).resize(() => {
	updatePageCount()
	updatePageNo(currentLocation.pageNo)
})

$(() => {
	console.log('frame ready', currentLocation)
	updatePageCount()
})

function messageHandler(event) {
	let data = event.data, { channel, action } = data
	if (channel !== 'epub')
		return

	_.unset(data, [ 'channel', 'action', ])
	console.log('[frame]', { action, data })
	MESSAGE_HANDLERS[action] && MESSAGE_HANDLERS[action](data)
}

window.addEventListener('message', messageHandler, false)

const MESSAGE_HANDLERS = {
	changePage({ go }) {
		let { pageNo, pageCount, filePath } = currentLocation
		console.log('changePage', { go, pageNo, pageCount, filePath })
		if (go === 'prev') {
			page = pageNo - 1
		} else if (go === 'next') {
			page = pageNo + 1
		}

		if (page === pageNo) {
			console.log('same page', { page, pageNo })
			return
		}

		if (page < 0 || page >= pageCount) {
			postWebMessage({ action: 'changePath', go, filePath })
			console.log('changePath', { go, filePath })
			return
		}

		updatePageNo(page)
	},

	changePath({ filePath, anchor }) {
		if (filePath === currentLocation.filePath) {
			return
		}

		console.log('changePath', { filePath, anchor })

		$('main#main').removeClass('show')
		$.get(`/${filePath}`)
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

			history.pushState({}, '', `/${filePath}`)
			currentLocation.filePath = filePath

			$head.prepend(xhead.children())
			$('main#main>#content').html(xbody.children())
			updatePageCount()
			switchToAnchor(anchor)
			$('main#main').addClass('show')
		})
	},
}

function postWebMessage(data) {
	window.parent.postMessage(_.merge({ channel: 'epub' }, data), '*')
}

function reloadCSSLink() {
	$('#css-link').replaceWith(`<link id="css-link" href="epub://globals/frame.css?t=${(new Date).toISOString().replace(/\W/g, '')}" rel="stylesheet" type="text/css"/>`)
}

function updateCSSCalc(css) {
	$('#css-calc').html(css)
}
