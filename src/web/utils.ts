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

type Optional<T> = T | false | null | undefined;

declare global {

  interface Array<T> {
    mapToObject<V>(cb: (value: T, index: number) => Optional<[PropertyKey, V]>): { [K in PropertyKey]: V };
  }

  interface ReadonlyArray<T> {
    mapToObject<V>(cb: (value: T, index: number) => Optional<[PropertyKey, V]>): { [K in PropertyKey]: V };
  }
}

function updateObject<V>(this: any, pair: Optional<[PropertyKey, V]>) {
  if (!pair) return;
  this[pair[0]] = pair[1];
}

Array.prototype.mapToObject = function mapToObject<T, V>(this: T[], cb: (value: T, index: number) => Optional<[PropertyKey, V]>) {
  const obj: { [K in PropertyKey]: V } = {};
  for (let i = 0; i < this.length; i += 1) {
    updateObject.call(obj, cb(this[i], i));
  }
  return obj;
}
