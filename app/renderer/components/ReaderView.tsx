// eslint-disable-next-line import/no-extraneous-dependencies
import { remote, WebviewTag } from 'electron';
import React, {
  FC, useState, useRef, useEffect,
} from 'react';
import { useHistory } from 'react-router-dom';

interface Props {
  fileId: string;
  bookId: string;
  pathname: string;
  hash: string;
  isHide?: boolean;
}

type LoadPage = (view: WebviewTag, args: { bookId: string, path: string }) => Promise<void>;

const loadPage: LoadPage = async (view, { bookId, path }) => {
  try {
    const res = await fetch(`epub://${bookId}${path}`);
    const [html, mimeType] = await Promise.all([
      res.text(),
      res.headers.get('Content-Type'),
    ]);
    view.send('load-page', { path, html, mimeType });
    console.log('loadPage', { bookId, path, mimeType });
  } catch (e) {
    console.error(e);
  }
};

const ReaderWebView: FC<Props> = (props: Props) => {
  const root = remote.app.getAppPath().replace(/\\/g, '/');
  const js = `file://${root}/.webpack/renderer/reader_preload/index.js`;
  const ref = useRef<WebviewTag>(null);
  const [isReady, setIsReady] = useState(false);

  const { bookId, pathname: currentPath, isHide } = props;

  useEffect(() => {
    if (!isReady) return;

    const path = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
    loadPage(ref.current!, { bookId, path });
  }, [isReady, bookId, currentPath]);

  useEffect(() => {
    if (!ref.current) return;
    const view = ref.current;

    view.addEventListener('ipc-message', (ev) => {
      const { channel, args } = ev;
      switch (channel) {
        case 'reader-ready': {
          console.log('reader-ready');
          setIsReady(true);
          break;
        }
        case 'click-link': {
          const { fileId } = props;
          const { pathname, hash } = args[0] as Location;
          const history = useHistory();
          console.log('click-link', { pathname, hash });
          history.push(`/read/${fileId}/${bookId}/${pathname}${hash}`);
          break;
        }
        default: {
          console.error('unknown ipc-message', { channel, args });
        }
      }
    });
  }, [ref]);

  return (
    <webview
      id="reader"
      key="reader"
      src="/reader/index.html"
      preload={js}
      className={isHide ? 'hide' : ''}
      style={{ flex: 1 }}
      ref={ref}
    />
  );
};

export default ReaderWebView;
