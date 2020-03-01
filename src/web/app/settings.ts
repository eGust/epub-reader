import { DEFAULT_STATE } from './store/state';
import { sendMessage, PageInfo } from "./message";
import { PackageManager } from "../epub/package_manager";

export interface Settings {
  css: string;
}

export interface CurrentInfo {
  path: string;
  pageNo: number;
  pageCount: number;
}

const DEFAULT_CSS = `
  line-height: 1.8;
  font-size: 14pt;
  font-family: '微软雅黑';
  color: black;
  background-color: #f5f5dc;
`;

export const APP_KEY = `_EPUB_READER`;

export const DEFAULT_SETTINGS: Settings = {
  css: DEFAULT_CSS
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s)
    .join('\n'),
};

const readStorage = (key: string): Record<string, any> => {
  const value = localStorage.getItem(key);
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error(e);
    return {};
  }
};

const CURRENT_KEY = `${APP_KEY}.position`;

const SETTINGS_KEY = `${APP_KEY}.settings`;

type CurrentType = typeof DEFAULT_STATE.current;

class SettingsManager {
  constructor() {
    const saved = readStorage(SETTINGS_KEY);
    this.settings = { ...DEFAULT_SETTINGS, ...saved };
  }

  private settings: Settings;

  public getSettings(): Settings {
    return { ...this.settings };
  }

  public reset(): Settings {
    this.updateSettings(DEFAULT_SETTINGS);
    return this.getSettings();
  }

  public updateSettings(settings: Settings) {
    this.settings = settings;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    this.syncSettings();
  }

  public syncSettings() {
    sendMessage('updateStyles', this.settings);
  }

  public getCurrentInfo(doc: PackageManager): CurrentInfo | null {
    const saved = readStorage(`${CURRENT_KEY}.${doc.id}`);
    return saved.path ? saved as PageInfo : null;
  }

  public saveCurrentInfo<T extends PageInfo>(current: T): void {
    if (!current.docId) return;

    const key = `${CURRENT_KEY}.${current.docId}`;
    const { path, pageNo, pageCount } = current;
    localStorage.setItem(key, JSON.stringify({ path, pageNo, pageCount }));
  }
}

export const settingsManager = new SettingsManager();
