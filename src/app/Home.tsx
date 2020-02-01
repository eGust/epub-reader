import React, { useState, ChangeEvent } from 'react'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import TocIcon from '@material-ui/icons/Toc';

import TocView from './TocView';

import { NavItem } from '../epub/types';
import PackageManager from '../epub/package_manager';
import { tick } from './utils';


const $reader = document.getElementById('reader')!;

const Home = () => {
  const [doc, setDoc] = useState<PackageManager | null>(null);
  const [selected, setSelected] = useState('');
  const [showToc, setShowToc] = useState(false);
  const [isOpening, setOpening] = useState(false);

  const onSelectFile = async (ev: ChangeEvent<HTMLInputElement>) => {
    const { target } = ev;
    const file = target.files![0];
    setOpening(true);
    setShowToc(false);
    setDoc(null);
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
    $reader.classList.remove('hide');
    await tick();
    console.debug(pm);
    setShowToc(true);
    setDoc(pm);
  };

  const title = doc?.navigation?.title ?? (isOpening ? 'Loading...' : 'EPub Reader');
  const onClickItem = (item: NavItem) => {
    console.debug('open', item);
  };
  const onToggleToc = () => {
    setShowToc(!showToc);
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
