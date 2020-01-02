// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null = null;

export const getMainWindow = () => mainWindow;

export const setMainWindow = (window: BrowserWindow | null) => {
  mainWindow = window;
};
