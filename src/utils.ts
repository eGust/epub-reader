export const join = (base: string, path: string): string => {
  const p = `/${base}/`.replace(/(^\/+|\/+$)/g, '/');
  const url = new URL(path, `http://x.co${p}`);
  return url.pathname.replace(/(^\/|\/$)/g, '');
}

export const getBasePath = (path: string): string => {
  const last = path.lastIndexOf('/');
  return last < 0 ? '' : path.slice(0, last);
}

export const tick = (ms = 0): Promise<void> => new Promise((resolve) => {
  setTimeout(resolve, ms);
});
