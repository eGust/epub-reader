window.location.toHash = window.location.hash
window.location.hash = ''

$(document)
.on('click', 'a', function (event) {
	// event.preventDefault()
	// let $el = $(this), target = $el.attr('href')
})

let pageCount = 1, currentPage = 0, gapWidth, pageWidth

function updatePageCount() {
	let $m = $('main#main'), $c = $('main#main>#content'), c = $c[0]
	gapWidth = parseFloat($c.css('column-gap'))
	pageWidth = c.clientWidth + gapWidth
	pageCount = Math.floor(c.scrollWidth/ pageWidth + 0.7)
	console.log($c.width(), c.scrollWidth, pageCount)
}

function updatePageNo(page) {
	currentPage = Math.max(0, Math.min(pageCount-1, page))
	$('main#main>#content').css({left: -pageWidth * currentPage})
}

$(window).resize(() => {
	updatePageCount()
	updatePageNo(currentPage)
})

$(() => {
	console.log('frame ready', location.toString())
	updatePageCount()
	switch (window.location.toHash) {
		case '##scroll-to-first-page':
			updatePageNo(0)
			break
		case '##scroll-to-last-page':
			updatePageNo(pageCount-1)
			break
		case '':
			break
		default:
	}
	$('main#main').addClass('show')
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

		if (page === currentPage)
			return

		if (page < 0 || page >= pageCount) {
			postWebMessage({ action: 'changePath', go })
			return
		}

		updatePageNo(page)
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
