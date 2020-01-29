import { createHashHistory } from 'history';

if (window.location.pathname !== '/') {
  console.log('initialized index');
  window.history.replaceState({}, '', '/');

  const history = createHashHistory<{}>();
  window.h = history;

  document.addEventListener('click', (ev) => {
    const { target } = ev;
    if (!target) return;

    const el = target as HTMLElement;
    if (!el.matches?.('a[href]')) return;

    const a = el as HTMLAnchorElement;
    if (a.pathname === window.location.pathname) return;

    ev.preventDefault();
    ev.stopPropagation();
    const { pathname: rawPath, hash: rawHash } = a;
    const relPath = `${rawPath.slice(1)}${rawHash ?? ''}`;
    const { pathname, hash } = new URL(relPath, `http://0${history.location.pathname}`);
    window.sendToHost('click-link', { pathname, hash });
    console.log(pathname, hash);
    console.info(a.href, history.location);
  }, true);

  (() => {
    const { pathname, hash } = history.location;
    window.sendToHost('reader-ready', { pathname, hash });
  })();
}
