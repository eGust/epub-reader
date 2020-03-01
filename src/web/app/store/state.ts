import { DEFAULT_SETTINGS } from '../settings';

export const DEFAULT_STATE = {
  current: {
    docId: '',
    path: '',
    pageNo: -1,
    pageCount: -1,

    isOpening: false,
    showToc: false,
    showSettingsModal: false,
    selectedChapter: { id: '', parentIds: [''] },

    // handleShortCuts: false,
    settings: { ...DEFAULT_SETTINGS },
  }
};

export type State = typeof DEFAULT_STATE;

export default DEFAULT_STATE;
