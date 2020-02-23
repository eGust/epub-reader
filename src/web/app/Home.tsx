import React, { useState, ChangeEvent, useRef, useEffect, useCallback, useMemo } from 'react'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import TocIcon from '@material-ui/icons/Toc';
import SettingsIcon from '@material-ui/icons/Settings';

import TocView from './TocView';
import SettingsModal from './SettingsModal';
import PageIndicator, { PageIndicatorProps } from './PageIndicator';
import ArrowIconButton from './ArrowIconButton';

import { PackageManager, ResponseObject } from '../epub/package_manager';
import { tick } from '../utils';
import { addMessageHandler, current, sendMessage } from './message';
import { actions, toggleShortCutsDisabled } from './shortcuts';
import { PathHelper, ContentItem } from './path_helper';
import { Direction } from './types';
import { settingsManager } from './settings';

const openPath = async (page: ResponseObject | null, { pageNo = 0, pageCount }: { pageNo?: number, pageCount?: number } = {}): Promise<void> => {
  if (!page) { return; }

  const { mime, path, zip } = page;
  const content = await zip.async(mime.includes('html') ? 'text' : 'blob');
  sendMessage('open', { content, path, mime, pageNo, pageCount });
  current.path = path;
  current.pageCount = -1;
  current.pageNo = -1;
};

addMessageHandler('go', ({ path }) => {
  if (!path || !current.doc) return;
  openPath(current.doc.toResponse(path));
});

addMessageHandler('image', async ({ path }, respond) => {
  if (!path || !current.doc) return;
  const url = await current.doc.asUrl(path);
  console.debug('image', { path, url });
  respond({ url });
});

addMessageHandler('images', async ({ paths }, respond) => {
  if (!paths || !current.doc) return;
  const urls = (
      await Promise.all(
        paths.map(async (path) => [path, await current.doc!.asUrl(path)]),
      )
    ).mapToObject(([key, url]) => (url ? [key!, url] : false));
  respond({ urls });
});

const ui = {
  setSelected: (_id: string) => {},
  setPageStatus: (status: Record<string, any>) => {},
};

addMessageHandler('updateStatus', ({ pageCount, pageNo }) => {
  current.pageCount = pageCount;
  current.pageNo = pageNo;
  ui.setPageStatus({ count: pageCount, no: pageNo });
  settingsManager.saveCurrentInfo(current);
  console.debug('updateStatus', current);
});

const updateSelectedChapter = (spineIndex: number) => {
  const h = current.helper!;
  const { spineItems } = current.doc!.metadata!;
  for (let i = spineIndex; i >= 0; i -= 1) {
    const { item } = spineItems[spineIndex];
    const info = h.getPathInfo(item.path)!;
    if (info.tocItems.length) {
      ui.setSelected(info.tocItems[0].id);
      break;
    }
  }
};

const flipChapter = (direction: Direction): void => {
  const cur = current.helper!.getPathInfo(current.path);
  if (!cur || cur.spineIndex === undefined) {
    console.warn(current);
    return;
  }

  const spineIndex = cur.spineIndex + direction;
  const doc = current.doc!;
  const { spineItems } = doc.metadata!;
  if (spineIndex < 0 || spineIndex >= spineItems.length) {
    console.warn(current, cur);
    return;
  }

  const next = spineItems[spineIndex];
  const { item: { path } } = next;
  console.debug(cur, next, current.helper!.getPathInfo(path));
  openPath(doc.toResponse(path), { pageNo: direction });
  updateSelectedChapter(spineIndex);
}

actions.flipChapterPrev = () => flipChapter(Direction.prev);

actions.flipChapterNext = () => flipChapter(Direction.next);

const jumpPage = (pageNo: number): boolean => {
  if (pageNo < 0 || pageNo >= current.pageCount || pageNo === current.pageNo) {
    return false;
  }
  sendMessage('setPage', { pageNo });
  return true;
}

const flipPage = (direction: Direction): void => {
  if (current.pageCount < 0 || current.pageNo < 0) return;

  if (jumpPage(current.pageNo + direction)) {
    return;
  }

  flipChapter(direction);
}

actions.flipPagePrev = () => flipPage(Direction.prev);

actions.flipPageNext = () => flipPage(Direction.next);

actions.jumpPageFirst = () => jumpPage(0);

actions.jumpPageLast = () => jumpPage(current.pageCount - 1);

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
  const [selected, setSelected] = useState({ id: '', parentIds: new Set<string>() });
  const [showToc, setShowToc] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isOpening, setOpening] = useState(false);
  const [settings, setSettings] = useState(settingsManager.getSettings());
  const [pageIndProps, setPageIndProps] = useState<PageIndicatorProps>({
    count: -1,
    no: -1,
    hidden: false,
    onUpdate: jumpPage,
  });
  const refReader = useRef<HTMLIFrameElement>(null);

  const setCurrentDocument = useCallback(
    (doc: PackageManager | null) => {
      setShowToc(!!doc);
      setDoc(doc);
      current.doc = doc;
    },
    [setShowToc, setDoc],
  );

  useEffect(() => {
    current.reader = refReader.current?.contentWindow ?? null;
    if (!refReader.current) return;

    updateReaderHtml(refReader.current);
  }, [refReader]);

  useEffect(() => {
    current.helper = doc ? new PathHelper(doc) : null;
    setHelper(current.helper);
  }, [doc]);

  useEffect(() => {
    ui.setPageStatus = ({ count, no }: Record<string, number>) => {
      setPageIndProps({
        ...pageIndProps,
        count,
        no,
      });
    };
  }, [setPageIndProps]);

  const onSelectFile = useCallback(
    async (ev: ChangeEvent<HTMLInputElement>) => {
      const { target } = ev;
      const file = target.files![0];
      current.reader = refReader.current?.contentWindow ?? null;

      if (firstRun.firstRun) {
        settingsManager.syncSettings();
        firstRun.firstRun = false;
      }

      console.clear();
      sendMessage('reset');
      setOpening(true);
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
        setOpening(false);
      }
    },
    [refReader]
  );

  const title = useMemo(() => doc?.navigation?.title ?? (isOpening ? 'Loading...' : 'EPub Reader'), [doc, isOpening]);
  const onToggleSettingsModal = useCallback(
    () => {
      setShowSettingsModal(!showSettingsModal);
      toggleShortCutsDisabled();
    },
    [showSettingsModal, setShowSettingsModal],
  );
  const onCloseModalAndSave = useCallback(
    (data?: { css: string }) => {
      onToggleSettingsModal();
      if (!data) return;


      const newSettings = {
        ...settings,
        ...data,
      }
      setSettings(newSettings);
      settingsManager.updateSettings(newSettings);
    },
    [onToggleSettingsModal, settings, setSettings],
  );
  const onToggleToc = useCallback(
    () => setShowToc(!showToc),
    [showToc, setShowToc],
  );
  const onSelectItem = useCallback((id: string) => {
    const parentIds = new Set(current.helper!.getContentItemWithAllParentIds(id));
    setSelected({ id, parentIds });
  }, [setSelected]);
  const onClickItem = useCallback(
    (item: ContentItem) => {
      openPath(doc!.toResponse(item.path));
      onSelectItem(item.id);
      console.debug('open', item);
    },
    [doc],
  );

  useEffect(() => {
    actions.toggleToc = onToggleToc;
  }, [onToggleToc]);

  useEffect(() => {
    ui.setSelected = onSelectItem;
  }, [onSelectItem]);

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
            <TocView show={showToc} helper={helper} selected={selected} onClickItem={onClickItem} />
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
}

export default Home;
