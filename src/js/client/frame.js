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

const DEBOUNCE_DELAY = 150
let skipWheelEvent = false

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
			toPage = (a.offsetLeft / currentPosition.pageWidth | 0) + 1
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
	setTimeout(() => {
		skipWheelEvent = false
	}, DEBOUNCE_DELAY)
}

$(window).resize(_.debounce(() => {
	updatePageCount()
	setPageNo(currentPosition.pageNo)
}, DEBOUNCE_DELAY))

function switchPage(delta) {
	skipWheelEvent = true
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

	const debouncedOnWheel = _.debounce((delta) => {
		if (delta > 0) {
			pageUp()
		} else if (delta < 0) {
			pageDown()
		}
	}, DEBOUNCE_DELAY, { leading: true, trailing: false })

	$('body')
	.on('mousewheel', (e) => {
		e.preventDefault()
		if (skipWheelEvent)
			return
		debouncedOnWheel(e.originalEvent.wheelDelta)
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
			case 32: // space
			case 13: // enter
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

function styleMapToLines(styles) {
	const lines = []
	for (let key in styles) {
		lines.push(`\t${key}: ${styles[key]} !important;`)
	}
	return lines
}

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
			$('#dialog-container').empty()
			$('head>base').attr('href', `/${chapterPath}`)
			const $xhtml = $(xhtml)

			const xhead = $xhtml.find('head'), xbody = $xhtml.find('body')
			xbody.find('script').remove()
			xhead.find('style,link').prependTo(xbody)

			currentPosition.chapterPath = chapterPath
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

	updateCss({styles}) {
		const { bodyStyles, linkStyles, } = styles
			, bodyLines = styleMapToLines(bodyStyles).join('\n')
			, linkLines = styleMapToLines(linkStyles).join('\n')

		$('#dyn-css').html(`
html, body {
${bodyLines}
}

* {
	font-family: ${bodyStyles['font-family']} !important;
	color: ${bodyStyles['color']};
	background-color: ${bodyStyles['background-color']};
}

a {
${linkLines}
}

a * {
${linkLines}
}
`)
		setTimeout(() => {
			updatePageCount()
			setPageNo(currentPosition.pageNo)
		}, 1)
	},

	showToast({ message }) {
		const $t = $('<dialog>').text(message)
		$('body>#dialog-container').append($t)
		setTimeout(() => {
			$t.remove()
		}, 4000)
	},
}

function postWebMessage(data) {
	log('send', data)
	window.parent.postMessage(_.merge({ channel: 'ebook' }, data), '*')
}
