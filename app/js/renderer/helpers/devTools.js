import {
  ipcRenderer,
} from 'electron'

export function installDevTools() {
  ipcRenderer.on('reply-setupDevTools', (event, data) => {
    require('electron-react-devtools').install()
  })

  ipcRenderer.send('require-setupDevTools', 'setup')
}
