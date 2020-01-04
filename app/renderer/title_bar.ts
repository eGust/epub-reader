// eslint-disable-next-line import/no-extraneous-dependencies
import { Menu, remote, MenuItemConstructorOptions } from 'electron';
import { Titlebar } from 'custom-electron-titlebar';

const DEFAULT_MENU_ITEMS: MenuItemConstructorOptions[] = [
  {
    label: 'Open',
    accelerator: 'CmdOrCtrl+O',
    click: () => {
      console.log('clicked open');
    },
  },
  {
    label: 'Toggle Full Screen',
    accelerator: 'F11',
    click: () => {
      const window = remote.getCurrentWindow();
      const isFullScreen = window.isFullScreen();
      window.setFullScreen(!isFullScreen);
    },
  },
];

export const titleBar = new Titlebar();

export const setTitle = (title: string) => {
  titleBar.updateTitle(title);
};

export const setMenu = (menu: Menu) => {
  remote.Menu.setApplicationMenu(menu);
  titleBar.updateMenu(menu);
};

export const setIcon = (icon: string) => {
  titleBar.updateIcon(icon);
};

const setDefaultMenu = () => {
  const menu = remote.Menu.buildFromTemplate([{
    label: '?',
    submenu: DEFAULT_MENU_ITEMS,
  }]);
  setMenu(menu);
};

setDefaultMenu();
