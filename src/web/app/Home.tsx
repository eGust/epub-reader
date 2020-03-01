import React, { useState, ChangeEvent, useRef, useEffect, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import TocIcon from '@material-ui/icons/Toc';
import SettingsIcon from '@material-ui/icons/Settings';

import TocView from './TocView';
import SettingsModal from './SettingsModal';
import PageIndicator from './PageIndicator';
import ArrowIconButton from './ArrowIconButton';

import { PackageManager, ResponseObject } from '../epub/package_manager';
import { tick } from '../utils';
import { addMessageHandler, currentReader, sendMessage } from './message';
import { actions, toggleShortCutsDisabled } from './shortcuts';
import { PathHelper, ContentItem } from './path_helper';
import { Direction } from './types';
import { settingsManager } from './settings';
import { State } from './store/state';
import { toggleBoolValue, updateSettings, updateSelectedChapters, updatePageInfo, updatePartialCurrent } from './store/reducer';
import { store } from './store';

const updateSelectedChapter = (path: string) => {
  const h = currentReader.helper!;
  const spineIndex = h.getPathInfo(path)?.spineIndex;
  if (spineIndex === undefined) return;

  const { spineItems } = currentReader.doc!.metadata!;
  for (let i = spineIndex; i >= 0; i -= 1) {
    const { item } = spineItems[spineIndex];
    const info = h.getPathInfo(item.path)!;
    if (info.tocItems.length) {
      const { id } = info.tocItems[0];
      const parentIds = currentReader.helper!.getContentItemWithAllParentIds(id);
      store.dispatch(updateSelectedChapters({ id, parentIds }));
      break;
    }
  }
};

const openPath = async (page: ResponseObject | null, { pageNo = 0, pageCount }: { pageNo?: number, pageCount?: number } = {}): Promise<void> => {
  if (!page) { return; }

  const { mime, path, zip } = page;
  const content = await zip.async(mime.includes('html') ? 'text' : 'blob');
  sendMessage('open', { content, path, mime, pageNo, pageCount });
  store.dispatch(updatePageInfo({ path, pageCount: -1, pageNo: -1 }));
  updateSelectedChapter(path);
};

addMessageHandler('go', ({ path }) => {
  if (!path || !currentReader.doc) return;
  openPath(currentReader.doc.toResponse(path));
});

addMessageHandler('image', async ({ path }, respond) => {
  if (!path || !currentReader.doc) return;
  const url = await currentReader.doc.asUrl(path);
  console.debug('image', { path, url });
  respond({ url });
});

addMessageHandler('images', async ({ paths }, respond) => {
  if (!paths || !currentReader.doc) return;
  const urls = (
      await Promise.all(
        paths.map(async (path) => [path, await currentReader.doc!.asUrl(path)]),
      )
    ).mapToObject(([key, url]) => (url ? [key!, url] : false));
  respond({ urls });
});

addMessageHandler('updateStatus', ({ pageCount, pageNo }) => {
  store.dispatch(updatePageInfo({ pageCount, pageNo }));
  settingsManager.saveCurrentInfo(store.getState().current);
});

const flipChapter = (direction: Direction): void => {
  const { current } = store.getState();
  const cur = currentReader.helper!.getPathInfo(current.path);
  if (!cur || cur.spineIndex === undefined) {
    console.warn(current);
    return;
  }

  const spineIndex = cur.spineIndex + direction;
  const doc = currentReader.doc!;
  const { spineItems } = doc.metadata!;
  if (spineIndex < 0 || spineIndex >= spineItems.length) {
    console.warn(current, cur);
    return;
  }

  const next = spineItems[spineIndex];
  const { item: { path } } = next;
  console.debug(cur, next, currentReader.helper!.getPathInfo(path));
  openPath(doc.toResponse(path), { pageNo: direction });
}

actions.flipChapterPrev = () => flipChapter(Direction.prev);

actions.flipChapterNext = () => flipChapter(Direction.next);

const jumpPage = (pageNo: number): boolean => {
  const { current } = store.getState();
  if (pageNo < 0 || pageNo >= current.pageCount || pageNo === current.pageNo) {
    return false;
  }
  sendMessage('setPage', { pageNo });
  return true;
}

const flipPage = (direction: Direction): void => {
  const { current } = store.getState();
  if (current.pageCount < 0 || current.pageNo < 0) return;

  if (jumpPage(current.pageNo + direction)) {
    return;
  }

  flipChapter(direction);
}

actions.flipPagePrev = () => flipPage(Direction.prev);

actions.flipPageNext = () => flipPage(Direction.next);

actions.jumpPageFirst = () => jumpPage(0);

actions.jumpPageLast = () => jumpPage(store.getState().current.pageCount - 1);

addMessageHandler('trigger', ({ action }) => {
  actions[action]?.();
});

const updateReaderHtml = async (reader: HTMLIFrameElement) => {
  if (reader.getAttribute('src')) return;

  try {
    reader.setAttribute('src', './reader.html');
    await tick();
  } catch (e) {
    console.error(e);
  } finally {
    if (reader.getAttribute('src') !== 'about:blank') return;

    const html = reader.contentDocument!.documentElement.innerHTML;
    console.warn({ html });
    await tick();
    const doc = reader.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();
    console.warn('updated html');
  }
};

const firstRun = { firstRun: true };

const Home = () => {
  const [doc, setDoc] = useState<PackageManager | null>(null);
  const [helper, setHelper] = useState<PathHelper | null>(null);
  const refReader = useRef<HTMLIFrameElement>(null);
  const dispatch = useDispatch();

  const isOpening = useSelector(({ current }: State) => current.isOpening);
  const showToc = useSelector(({ current }: State) => current.showToc);
  const showSettingsModal = useSelector(({ current }: State) => current.showSettingsModal);
  const selectedChapter = useSelector(({ current: { selectedChapter: { id, parentIds } } }: State) => ({
    id,
    parentIds: new Set(parentIds),
  }));
  const pageIndProps = useSelector(({ current: { pageNo, pageCount } }: State) => ({
    no: pageNo,
    count: pageCount,
    onUpdate: jumpPage,
  }));
  const settings = useSelector(({ current }: State) => current.settings);

  const setCurrentDocument = useCallback(
    (doc: PackageManager | null) => {
      dispatch(updatePartialCurrent({
        showToc: !!doc,
        docId: doc?.id ?? '',
      }));
      setDoc(doc);
      currentReader.doc = doc;
    },
    [dispatch, setDoc],
  );

  useEffect(() => {
    currentReader.reader = refReader.current?.contentWindow ?? null;
    if (!refReader.current) return;

    updateReaderHtml(refReader.current);
  }, [refReader]);

  useEffect(() => {
    currentReader.helper = doc ? new PathHelper(doc) : null;
    setHelper(currentReader.helper);
    console.debug(currentReader);
  }, [doc]);

  const onSelectFile = useCallback(
    async (ev: ChangeEvent<HTMLInputElement>) => {
      const { target } = ev;
      const file = target.files![0];
      currentReader.reader = refReader.current?.contentWindow ?? null;

      if (firstRun.firstRun) {
        settingsManager.syncSettings();
        firstRun.firstRun = false;
      }

      console.clear();
      sendMessage('reset');
      dispatch(updatePartialCurrent({ isOpening: true }));
      try {
        setCurrentDocument(null);
        await tick();

        target.files = null;
        target.value = '';
        console.time('loading');
        const pm = new PackageManager(file);
        if (!await pm.open()) {
          console.error('unable to open file:', file);
          return;
        }

        console.timeEnd('loading');
        setCurrentDocument(pm);

        await tick();
        // open home
        const saved = settingsManager.getCurrentInfo(pm);
        if (saved) {
          const { path, pageNo, pageCount } = saved;
          openPath(pm.toResponse(path), { pageNo, pageCount });
        } else {
          openPath(pm.getHome());
        }
      } finally {
        dispatch(updatePartialCurrent({ isOpening: false }));
      }
    },
    [dispatch, refReader]
  );

  const title = useMemo(() => doc?.navigation?.title ?? (isOpening ? 'Loading...' : 'EPub Reader'), [doc, isOpening]);
  const onToggleSettingsModal = useCallback(
    () => {
      dispatch(toggleBoolValue('showSettingsModal'));
      toggleShortCutsDisabled();
    },
    [dispatch],
  );
  const onCloseModalAndSave = useCallback(
    (data?: { css: string }) => {
      onToggleSettingsModal();
      if (!data) return;

      dispatch(updateSettings(data));
    },
    [dispatch],
  );
  const onToggleToc = useCallback(
    () => dispatch(toggleBoolValue('showToc')),
    [dispatch],
  );
  const onClickItem = useCallback(
    (item: ContentItem) => {
      openPath(doc!.toResponse(item.path));
      console.debug('open', item);
    },
    [doc],
  );

  useEffect(() => {
    actions.toggleToc = onToggleToc;
  }, [onToggleToc]);

  return (
    <div className="flex column flex-auto">
      <AppBar className="app-bar" position="sticky">
        <Toolbar variant="dense">
          {
            doc?.navigation ? (
              <IconButton edge="start" color="inherit" onClick={onToggleToc}>
                <TocIcon />
              </IconButton>
            ) : (
              null
            )
          }
          <div className="flex-auto">
            <Typography className="title">{title}</Typography>
          </div>

          <IconButton edge="end" color="inherit" onClick={onToggleSettingsModal}>
            <SettingsIcon />
          </IconButton>
          <IconButton edge="end" color="inherit" component="label">
            <input type="file" accept=".epub" className="hide" onChange={onSelectFile} />
            <LibraryAddIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div className="reader-wrap flex-auto">
        {
          helper ? (
            <TocView show={showToc} helper={helper} selected={selectedChapter} onClickItem={onClickItem} />
            ) : null
        }
        <div className="reader">
          {
            doc ? (
              <ArrowIconButton direction={Direction.prev} onClick={flipPage} />
            ) : null
          }
          <iframe id="reader" ref={refReader} className={doc?.navigation ? '': "hide"} />
          {
            doc ? (
              <ArrowIconButton direction={Direction.next} onClick={flipPage} />
            ) : null
          }
          {
            doc && pageIndProps.count > 1 ? (
              <PageIndicator {...pageIndProps} />
            ) : null
          }
        </div>
      </div>
      <SettingsModal open={showSettingsModal} css={settings.css} onClose={onCloseModalAndSave} />
    </div>
  );
};

export default Home;
