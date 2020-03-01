import { createAction, createReducer } from '@reduxjs/toolkit';

import { DEFAULT_STATE, State } from './state';
import { Settings, settingsManager } from '../settings';
import { PageInfo } from '../message';

type Current = typeof DEFAULT_STATE.current;

type SelectedChapter = typeof DEFAULT_STATE.current.selectedChapter;

export const updatePartialCurrent = createAction<Partial<Current>>('UPDATE_PARTIAL_CURRENT');

export const toggleBoolValue = createAction<string>('TOGGLE_BOOL_VALUE');

export const updateSelectedChapters = createAction<SelectedChapter>('UPDATE_SELECTED_CHAPTERS');

export const updateSettings = createAction<Partial<Settings>>('UPDATE_SETTINGS');

export const updatePageInfo = createAction<Partial<PageInfo>>('UPDATE_PAGE_INFO');

export const rootReducer = createReducer(DEFAULT_STATE, (builder) => (
  builder
    .addCase(updatePartialCurrent, ({ current }, { payload }) => ({
      current: {
        ...current,
        ...payload,
      }
    }))
    .addCase(toggleBoolValue, ({ current }, { payload: key }) => ({
      current: {
        ...current,
        [key]: !(current as unknown as Record<string, boolean>)[key],
      }
    }))
    .addCase(updateSelectedChapters, ({ current }, { payload: selectedChapter }) => ({
      current: {
        ...current,
        selectedChapter,
      },
    }))
    .addCase(updatePageInfo, ({ current }, { payload }) => ({
      current: {
        ...current,
        ...payload,
      },
    }))
    .addCase(updateSettings, ({ current }, { payload }) => {
      const settings = { ...current.settings, ...payload };
      settingsManager.updateSettings(settings);
      return { current: { ...current, settings } };
    })
));

export default rootReducer;
