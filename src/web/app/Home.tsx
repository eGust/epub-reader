import React, { useState, ChangeEvent, useRef, useEffect } from 'react'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import TocIcon from '@material-ui/icons/Toc';

import TocView from './TocView';

import PackageManager, { ResponseObject } from '../epub/package_manager';
import { tick } from '../utils';
import { NavItem } from '../epub/types';
import { addMessageHandler, current, Respond, sendMessage } from './message';
import { MessageType } from './types';

const openPath = async (page: ResponseObject | null): Promise<void> => {
  if (!page) { return; }

  const { mime, path, zip } = page;
  const content = await zip.async(mime.includes('html') ? 'text' : 'blob');
  sendMessage('open', { content, path, mime });
};

addMessageHandler('go', ({ path }: MessageType['go']) => {
  if (!path || !current.doc) return;
  openPath(current.doc.toResponse(path));
});

addMessageHandler('image', async ({ path }: MessageType['image'], respond: Respond) => {
  if (!path || !current.doc) return;
  const url = await current.doc.asUrl(path);
  console.debug('image', { path, url });
  respond({ url });
});

addMessageHandler('images', async ({ paths }: MessageType['images'], respond: Respond) => {
  if (!paths || !current.doc) return;
  const urlPairs = await Promise.all(
    paths.map(async (path) => [
      path,
      await current.doc!.asUrl(path),
    ])
  );
  const urls = Object.fromEntries(urlPairs.filter(([, url]) => !!url));
  console.debug('images', { urlPairs, urls });
  respond({ urls });
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

const Home = () => {
  const [doc, setDoc] = useState<PackageManager | null>(null);
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
  const onClickItem = (item: NavItem) => {
    openPath(doc!.toResponse(item.path));
    console.debug('open', item);
  };

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
          doc?.navigation ? (
            <TocView show={showToc} nav={doc.navigation} selected={selected} onClickItem={onClickItem} />
            ) : null
        }
        <iframe id="reader" ref={refReader} className={doc?.navigation ? '': "hide"} />
      </div>
    </div>
  );
}

export default Home;