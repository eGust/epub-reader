import { app, BrowserWindow } from 'electron'
import { registerEBookProtocol } from './js/main/ebookProtocol'
import { registerServices } from './js/main/services'
import { getMainWindowSettings, saveMainWindowSettings, closeDB } from './js/shared/db'
import log from './js/shared/logger'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function setupUpdateWindowSizeEvents(window, initial, updateSettings) {
	const DELAY_INTERVAL = 1000
	let   { sizePosition, maximized, fullscreen } = initial
		, sizePositionStack = [ sizePosition ]
		, lastNormalSizePosition = sizePosition
		, pendingTimer = false
		, firedWhilePending = false

	function onUpdateSettings() {
		if (firedWhilePending) {
			pendingTimer = true
			firedWhilePending = false
			setTimeout(onUpdateSettings, DELAY_INTERVAL)
			return
		}
		pendingTimer = false
		updateSettings({sizePosition, maximized, fullscreen})
		sizePositionStack = [ sizePosition ]
	}

	function delayUpdateSettings(eventName) {
		// log(eventName, {sizePosition, maximized, fullscreen})
		if (pendingTimer) {
			firedWhilePending = true
		} else {
			pendingTimer = true
			firedWhilePending = false
			setTimeout(onUpdateSettings, DELAY_INTERVAL)
		}
	}

	function getLastSizePosition() {
		return sizePositionStack[sizePositionStack.length - 1]
	}

	window.on('resize', () => {
		if (maximized || fullscreen)
			return

		const [ newWidth, newHeight ] = window.getSize()
			, { x, y, width, height } = getLastSizePosition()

		if (width === newWidth && height === newHeight)
			return

		sizePositionStack.push(sizePosition = { x, y, width: newWidth, height: newHeight })
		delayUpdateSettings('resize')
	})

	window.on('move', () => {
		const [ nX, nY ] = window.getPosition()
			, { x, y, width, height } = getLastSizePosition()

		if (x === nX && y === nY)
			return

		sizePositionStack.push(sizePosition = { x: nX, y: nY, width, height })
		delayUpdateSettings('move')
	})

	function popPositionStackUntilNotEq({width, height}) {
		while (sizePositionStack.length) {
			const { width: w, height: h } = sizePosition = sizePositionStack[sizePositionStack.length - 1]
			if (w !== width || h !== height)
				break
			sizePositionStack.pop()
		}
		lastNormalSizePosition = sizePosition
	}

	window.on('maximize', () => {
		maximized = true
		if (fullscreen) {
			sizePosition = lastNormalSizePosition
		} else {
			popPositionStackUntilNotEq(sizePosition)
		}
		delayUpdateSettings('maximize')
	})

	window.on('enter-full-screen', () => {
		fullscreen = true
		if (maximized) {
			sizePosition = lastNormalSizePosition
		} else {
			popPositionStackUntilNotEq(sizePosition)
		}
		delayUpdateSettings('enter-full-screen')
	})

	window.on('unmaximize', () => {
		maximized = false
		if (fullscreen) {
			sizePosition = lastNormalSizePosition
		} else {
			popPositionStackUntilNotEq(sizePosition)
		}
		delayUpdateSettings('unmaximize')
	})

	window.on('leave-full-screen', () => {
		fullscreen = false
		if (maximized) {
			sizePosition = lastNormalSizePosition
		} else {
			popPositionStackUntilNotEq(sizePosition)
		}
		delayUpdateSettings('leave-full-screen')
	})

	window.on('restore', () => {
		if (maximized || fullscreen) {
			sizePosition = lastNormalSizePosition
		}
		delayUpdateSettings('restore')
	})

	let savedBeforeClosing = false

	window.on('close', (e) => {
		if (savedBeforeClosing)
			return

		e.preventDefault()
		updateSettings({sizePosition, maximized, fullscreen})
		closeDB(() => {
			savedBeforeClosing = true
			window.close()
		})
	})
}

const createWindow = () => {

	getMainWindowSettings(({ maximized = false, sizePosition = { width: 800, height: 600 }, fullscreen = false }) => {
		// Create the browser window.
		mainWindow = new BrowserWindow({...sizePosition, fullscreen})
		if (maximized) {
			mainWindow.maximize()
		}

		// and load the index.html of the app.
		mainWindow.loadURL(`file://${__dirname}/index.html`);

		// Open the DevTools.
		mainWindow.webContents.openDevTools();

		// Emitted when the window is closed.
		mainWindow.on('closed', () => {
			// Dereference the window object, usually you would store windows
			// in an array if your app supports multi windows, this is the time
			// when you should delete the corresponding element.
			mainWindow = null;
		});

		setupUpdateWindowSizeEvents(mainWindow, {sizePosition, maximized, fullscreen}, (settings) => {
			saveMainWindowSettings(settings)
		})
	})

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	// console.log('locale:', app.getLocale())
	createWindow()
	registerEBookProtocol()
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	closeDB()
	if (mainWindow === null) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

registerServices()
