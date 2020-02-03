import React, { useState, ChangeEvent } from 'react'
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

const $reader = document.getElementById('reader')! as HTMLIFrameElement;
const reader = $reader.contentWindow!;

const openPath = (() => {
  const post = (payload: Record<string, any>) => {
    reader.postMessage({ type: 'open', payload }, '/');
  };

  return async (page: ResponseObject | null): Promise<void> => {
    if (!page) { return; }

    const { mime, path, zip } = page;
    const content = await zip.async(mime.includes('html') ? 'text' : 'blob');
    post({ content, path, mime });
  };
})();

let currentDoc: PackageManager | null = null;

interface PathPayload { path: string }
interface ImagePathsPayload { paths: string[] }

(() => {
  // @ts-ignore
  if (window.initialized) return;

  // @ts-ignore
  window.initialized = true;

  const respondMessage = (messageId: string, data: Record<string, any>) => {
    reader.postMessage({ type: 'respond', payload: { messageId, data } }, '/');
  };

  window.addEventListener('message', async ({ data }) => {
    if (!currentDoc || !(data?.type)) return;

    switch (data.type) {
      case 'image': {
        const { path } = data.payload as PathPayload;
        const url = await currentDoc.asUrl(path);
        console.debug('image', { path, url });
        respondMessage(data.messageId as string, { url });
        break;
      }
      case 'images': {
        const { paths } = data.payload as ImagePathsPayload;
        const urlPairs = await Promise.all(
          paths.map(async (path) => [
            path,
            await currentDoc!.asUrl(path),
          ])
        );
        const urls = Object.fromEntries(urlPairs.filter(([, url]) => !!url));
        console.debug('images', { urlPairs, urls });
        respondMessage(data.messageId as string, { urls });
        break;
      }
      case 'go': {
        const { path } = data.payload as PathPayload;
        console.debug('go', { path });
        if (!path) return;
        openPath(currentDoc.toResponse(path));
        break;
      }
      default: {
        console.debug('main window received message', data);
      }
    }
  }, false);
})();

const Home = () => {
  const [doc, setDoc] = useState<PackageManager | null>(null);
  const [selected, setSelected] = useState('');
  const [showToc, setShowToc] = useState(false);
  const [isOpening, setOpening] = useState(false);

  const onSelectFile = async (ev: ChangeEvent<HTMLInputElement>) => {
    const { target } = ev;
    const file = target.files![0];

    console.clear();
    reader.postMessage({ type: 'reset' }, '/');
    setOpening(true);
    setShowToc(false);
    setDoc(null);
    currentDoc = null;
    await tick();

    console.time('loading');
    const pm = new PackageManager(file);
    target.files = null;
    target.value = '';

    if (!await pm.open()) {
      console.error('unable to open file:', file);
      $reader.classList.add('hide');
      return;
    }

    console.timeEnd('loading');
    currentDoc = pm;
    $reader.classList.remove('hide');
    await tick();

    console.debug(pm);
    setShowToc(true);
    setDoc(pm);
    await tick();

    // open home
    openPath(pm.getHome());
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
      {
        doc?.navigation ? (
          <div className={`toc-wrap ${showToc ? 'flex-auto' : 'hide'}`}>
            <TocView nav={doc.navigation} selected={selected} onClickItem={onClickItem} />
          </div>
         ) : null
      }
    </div>
  );
}

export default Home;
