/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import {
  app,
  BrowserWindow,
} from 'electron';
import {
  autoUpdater,
} from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import registerEBookProtocol from './js/main/ebookProtocol';
import {
  getMainWindowSettings,
  saveMainWindowSettings,
  closeDB,
} from './js/shared/db';
import {
  registerServices,
} from './js/main/services';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  registerServices();
  createWindow();
  registerEBookProtocol();
});

function setupUpdateWindowSizeEvents(window, initial, updateSettings) {
  const DELAY_INTERVAL = 1000;
  let {
    sizePosition,
    maximized,
    fullscreen,
  } = initial;

  let sizePositionStack = [sizePosition];

  let lastNormalSizePosition = sizePosition;

  let pendingTimer = false;

  let firedWhilePending = false;

  function onUpdateSettings() {
    if (firedWhilePending) {
      pendingTimer = true;
      firedWhilePending = false;
      setTimeout(onUpdateSettings, DELAY_INTERVAL);
      return;
    }
    pendingTimer = false;
    updateSettings({
      sizePosition,
      maximized,
      fullscreen,
    });
    sizePositionStack = [sizePosition];
  }

  function delayUpdateSettings() {
    // log(eventName, {sizePosition, maximized, fullscreen})
    if (pendingTimer) {
      firedWhilePending = true;
    } else {
      pendingTimer = true;
      firedWhilePending = false;
      setTimeout(onUpdateSettings, DELAY_INTERVAL);
    }
  }

  function getLastSizePosition() {
    return sizePositionStack[sizePositionStack.length - 1];
  }

  window.on('resize', () => {
    if (maximized || fullscreen) return;

    const [newWidth, newHeight] = window.getSize();

    const {
      x,
      y,
      width,
      height,
    } = getLastSizePosition();

    if (width === newWidth && height === newHeight) return;

    sizePositionStack.push(
      (sizePosition = {
        x,
        y,
        width: newWidth,
        height: newHeight,
      })
    );
    delayUpdateSettings('resize');
  });

  window.on('move', () => {
    const [nX, nY] = window.getPosition();

    const {
      x,
      y,
      width,
      height,
    } = getLastSizePosition();

    if (x === nX && y === nY) return;

    sizePositionStack.push(
      (sizePosition = {
        x: nX,
        y: nY,
        width,
        height,
      })
    );
    delayUpdateSettings('move');
  });

  function popPositionStackUntilNotEq({
    width,
    height,
  }) {
    while (sizePositionStack.length) {
      const {
        width: w,
        height: h,
      } = (sizePosition =
        sizePositionStack[sizePositionStack.length - 1]);
      if (w !== width || h !== height) break;
      sizePositionStack.pop();
    }
    lastNormalSizePosition = sizePosition;
  }

  window.on('maximize', () => {
    maximized = true;
    if (fullscreen) {
      sizePosition = lastNormalSizePosition;
    } else {
      popPositionStackUntilNotEq(sizePosition);
    }
    delayUpdateSettings('maximize');
  });

  window.on('enter-full-screen', () => {
    fullscreen = true;
    if (maximized) {
      sizePosition = lastNormalSizePosition;
    } else {
      popPositionStackUntilNotEq(sizePosition);
    }
    delayUpdateSettings('enter-full-screen');
  });

  window.on('unmaximize', () => {
    maximized = false;
    if (fullscreen) {
      sizePosition = lastNormalSizePosition;
    } else {
      popPositionStackUntilNotEq(sizePosition);
    }
    delayUpdateSettings('unmaximize');
  });

  window.on('leave-full-screen', () => {
    fullscreen = false;
    if (maximized) {
      sizePosition = lastNormalSizePosition;
    } else {
      popPositionStackUntilNotEq(sizePosition);
    }
    delayUpdateSettings('leave-full-screen');
  });

  window.on('restore', () => {
    if (maximized || fullscreen) {
      sizePosition = lastNormalSizePosition;
    }
    delayUpdateSettings('restore');
  });

  let savedBeforeClosing = false;

  window.on('close', e => {
    if (savedBeforeClosing) return;

    e.preventDefault();
    updateSettings({
      sizePosition,
      maximized,
      fullscreen,
    });
    closeDB(() => {
      savedBeforeClosing = true;
      window.close();
    });
  });
}

function createWindow() {
  getMainWindowSettings(
    ({
      maximized = false,
      sizePosition = {
        width: 800,
        height: 600,
      },
      fullscreen = false,
    }) => {
      // Create the browser window.
      mainWindow = new BrowserWindow({ ...sizePosition,
        fullscreen,
      });
      if (maximized) {
        mainWindow.maximize();
      }

      // and load the index.html of the app.
      mainWindow.loadURL(`file://${__dirname}/app.html`);

      // Open the DevTools.
      mainWindow.webContents.openDevTools();

      // Emitted when the window is closed.
      mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
      });

      setupUpdateWindowSizeEvents(
        mainWindow, {
          sizePosition,
          maximized,
          fullscreen,
        },
        settings => {
          saveMainWindowSettings(settings);
        }
      );

      mainWindow.webContents.on('did-finish-load', () => {
        if (!mainWindow) {
          throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
          mainWindow.minimize();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      });

      const menuBuilder = new MenuBuilder(mainWindow);
      menuBuilder.buildMenu();

      // Remove this if your app does not use auto updates
      // eslint-disable-next-line
      new AppUpdater();
    }
  );
}
