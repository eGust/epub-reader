export const join = (base: string, path: string): string => {
  const p = `/${base}/`.replace(/(^\/+|\/+$)/g, '/');
  const url = new URL(path, `http://x.co${p}`);
  return url.pathname.replace(/(^\/|\/$)/g, '');
}
