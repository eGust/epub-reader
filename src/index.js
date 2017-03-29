import { app, BrowserWindow, ipcMain } from 'electron'
import { registerEBookProtocol } from './js/server/ebookProtocol'
import { registerServices } from './js/services'
import { getMainWindowSettings, saveMainWindowSettings, closeDB } from './js/db'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function setupUpdateWindowSizeEvents(mainWindow, initialSizePosition, initialMaximized, updateSettings) {
	let sizePosition = initialSizePosition, maximized = initialMaximized, sizePositionStack = [ initialSizePosition ]

	function getLastSizePosition() {
		return sizePositionStack[sizePositionStack.length - 1]
	}

	mainWindow.on('resize', () => {
		const [ newWidth, newHeight ] = mainWindow.getSize()
			, { x, y, width, height } = getLastSizePosition()

		if (width === newWidth && height === newHeight)
			return

		sizePositionStack.push(sizePosition = { x, y, width: newWidth, height: newHeight })
		updateSettings({sizePosition, maximized})
	})

	mainWindow.on('move', () => {
		const [ nX, nY ] = mainWindow.getPosition()
			, { x, y, width, height } = getLastSizePosition()

		if (x === nX && y === nY)
			return

		sizePositionStack.push(sizePosition = { x: nX, y: nY, width, height })
		updateSettings({sizePosition, maximized})
	})

	mainWindow.on('maximize', () => {
		// console.log({sizePositionStack})
		sizePosition = sizePositionStack[sizePositionStack.length - 3]
		maximized = true
		updateSettings({sizePosition, maximized})
	})

	mainWindow.on('unmaximize', () => {
		maximized = false
		updateSettings({sizePosition, maximized})
	})

	mainWindow.on('restore', () => {
		sizePosition = sizePositionStack[sizePositionStack.length - 2]
		updateSettings({sizePosition, maximized})
	})
}

const createWindow = () => {

	getMainWindowSettings(({ maximized = false, sizePosition = { width: 800, height: 600 } }) => {
		// Create the browser window.
		mainWindow = new BrowserWindow(sizePosition)
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

		setupUpdateWindowSizeEvents(mainWindow, sizePosition, maximized, (settings) => {
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
