import { createServer } from 'http';
import { URL } from 'url';

import { getPackageManger } from '../epub/package_manager';

const parseUrl = (url: string) => {
  const {
    href: rawUrl,
    pathname: path,
    searchParams,
  } = new URL(url, 'http://localhost');

  const fullPath = path.startsWith('/') ? path.slice(1) : path;
  const splitPos = fullPath.indexOf('/');

  const id = splitPos > 0 ? fullPath.slice(0, splitPos) : '';
  const filename = splitPos > 0 ? fullPath.slice(splitPos + 1) : '';

  return {
    rawUrl,
    id,
    filename,
    query: Object.fromEntries(searchParams.entries()),
  };
};

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const { id, filename } = parseUrl(req.url!);

    const file = getPackageManger(id)?.toResponse(filename);
    if (!file) {
      res.statusCode = 404;
      res.end();
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', file.mime);
    if (file.raw.compressedSize < file.raw.uncompressedSize) {
      res.setHeader('Content-Encoding', 'deflate');
    }
    res.write(file.raw.compressedContent);
    res.end();
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.write(e.message);
    res.end();
  }
});

const startServer = () => server.listen(3012, 'localhost');

export default startServer;
