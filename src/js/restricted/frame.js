$(() => {
	console.log('frame ready')
	$(window).resize(() => {
		console.log($(window).width(), $(window).height(), $('main#main>#content').width(), $('main#main>#content').height())
	})
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
		// postWebMessage({ action: 'pageChanged', page: '' })
		postWebMessage({ action: 'changePath', go })
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
