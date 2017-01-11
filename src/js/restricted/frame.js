let currentLocation = {
	filePath: null,
	toHash: null,
	page: 0,
	pageCount: 1,
	gapWidth: null,
	pageWidth: null,
}

$(document)
.on('click', 'a', function (event) {
	// event.preventDefault()
	// let $el = $(this), target = $el.attr('href')
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
	// console.log('updatePageNo', { page, left: pageWidth * currentPage })
	currentLocation.currentPage = Math.max(0, Math.min(currentLocation.pageCount-1, page))
	$('main#main>#content').css({left: -currentLocation.pageWidth * currentLocation.currentPage})
}

$(window).resize(() => {
	updatePageCount()
	updatePageNo(currentLocation.currentPage)
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
		console.log('changePage', { go })
		let page
		if (go === 'prev') {
			page = currentPage - 1
		} else if (go === 'next') {
			page = currentPage + 1
		}

		if (page === currentPage) {
			console.log('same page', { page, currentPage })
			return
		}

		if (page < 0 || page >= pageCount) {
			postWebMessage({ action: 'changePath', go })
			console.log('changePath', { go })
			return
		}

		updatePageNo(page)
	},

	changePath({ filePath, toHash }) {
		$.get(`/${filePath}`)
		.then((html) => {
			let $html = $(html), $head = $html.find('head')
			console.log($head)
			$('main#main>#content').html($html.find('body').children())
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
