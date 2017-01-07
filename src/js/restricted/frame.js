$(() => {
	console.log('frame ready')
})

function messageHandler(event) {
	console.log('[frame]', event)
	postWebMessage({ source: 'frame', received: event.data })
}

window.addEventListener('message', messageHandler, false)

function postWebMessage(data) {
	window.parent.postMessage(data, '*')
}

function reloadCSSLink() {
	$('#css-link').replaceWith(`<link id="css-link" href="epub://globals/frame.css?t=${(new Date).toISOString().replace(/\W/g, '')}" rel="stylesheet" type="text/css"/>`)
}

function updateCSSCalc(css) {
	$('#css-calc').html(css)
}
