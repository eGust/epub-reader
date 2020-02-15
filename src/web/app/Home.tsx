import React, { useState, ChangeEvent, useRef, useEffect } from 'react'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import TocIcon from '@material-ui/icons/Toc';

import TocView from './TocView';

import { PackageManager, ResponseObject } from '../epub/package_manager';
import { tick } from '../utils';
import { addMessageHandler, current, sendMessage } from './message';
import { actions } from './shortcuts';
import { PathHelper, ContentItem } from './path_helper';

const openPath = async (page: ResponseObject | null, atLast = false): Promise<void> => {
  if (!page) { return; }

  const { mime, path, zip } = page;
  const content = await zip.async(mime.includes('html') ? 'text' : 'blob');
  sendMessage('open', { content, path, mime, atLast });
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

addMessageHandler('updateStatus', ({ pageCount, pageNo }) => {
  current.pageCount = pageCount;
  current.pageNo = pageNo;
  console.debug('updateStatus', current);
});

const ui = {
  setSelected: () => {},
};

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

const flipChapter = (direction: 1 | -1): void => {
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
  openPath(doc.toResponse(path), direction < 0);
  updateSelectedChapter(spineIndex);
}

actions.flipChapterPrev = () => flipChapter(-1);

actions.flipChapterNext = () => flipChapter(+1);

const flipPage = (direction: 1 | -1): void => {
  if (current.pageCount < 0 || current.pageNo < 0) return;

  const pageNo = current.pageNo + direction;
  if (pageNo >= 0 && pageNo < current.pageCount) {
    sendMessage('setPage', { pageNo });
    return;
  }

  flipChapter(direction);
}

actions.flipPagePrev = () => flipPage(-1);

actions.flipPageNext = () => flipPage(+1);

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

const Home = () => {
  const [doc, setDoc] = useState<PackageManager | null>(null);
  const [helper, setHelper] = useState<PathHelper | null>(null);
  const [selected, setSelected] = useState('');
  const [showToc, setShowToc] = useState(false);
  const [isOpening, setOpening] = useState(false);
  const refReader = useRef<HTMLIFrameElement>(null);

  const setCurrentDocument = (doc: PackageManager | null) => {
    setShowToc(!!doc);
    setDoc(doc);
    current.doc = doc;
  }

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
    ui.setSelected = setSelected;
  }, [setSelected]);

  const onSelectFile = async (ev: ChangeEvent<HTMLInputElement>) => {
    const { target } = ev;
    const file = target.files![0];
    current.reader = refReader.current?.contentWindow ?? null;

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
      openPath(pm.getHome());
    } finally {
      setOpening(false);
    }
  };

  const title = doc?.navigation?.title ?? (isOpening ? 'Loading...' : 'EPub Reader');
  const onToggleToc = () => setShowToc(!showToc);
  const onClickItem = (item: ContentItem) => {
    openPath(doc!.toResponse(item.path));
    setSelected(item.id);
    console.debug('open', item);
  };

  actions.toggleToc = onToggleToc;

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
        <iframe id="reader" ref={refReader} className={doc?.navigation ? '': "hide"} />
      </div>
    </div>
  );
}

export default Home;
