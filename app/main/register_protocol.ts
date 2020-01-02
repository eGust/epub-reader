// eslint-disable-next-line import/no-extraneous-dependencies
import { protocol } from 'electron';
// import { PassThrough } from 'stream';
import { URL } from 'url';

import { getPackageManger } from '../epub/package_manager';

const SCHEME = 'epub';

const parseUrl = (url: string) => {
  const {
    href: rawUrl,
    host,
    pathname: path,
    searchParams,
  } = new URL(url);

  return {
    rawUrl,
    host,
    path,
    query: Object.fromEntries(searchParams.entries()),
  };
};

protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      bypassCSP: true,
      standard: true,
      secure: true,
      corsEnabled: true,
      supportFetchAPI: process.env.NODE_ENV !== 'production',
    },
  },
]);

// const CORS_HEADERS = {
//   'Access-Control-Allow-Origin': '*',
// };

const registerProtocol = () => {
  protocol.registerBufferProtocol(SCHEME, async (req, cb) => {
    const { host, path, query } = parseUrl(req.url);
    const file = await getPackageManger(host)?.toResponse(
      path.startsWith('/') ? path.slice(1) : path
    );
    console.info({ host, path, query }, file?.mime ?? 'NOT_FOUND');

    if (!file) {
      cb();
      return;
    }

    cb({ mimeType: file.mime, data: Buffer.from(await file.zip.async('uint8array')) });
  });

  // protocol.registerStreamProtocol(SCHEME, async (req, cb) => {
  //   const { host, path, query } = parseUrl(req.url);
  //   const file = await getPackageManger(host)?.toResponse(
  //     path.startsWith('/') ? path.slice(1) : path
  //   );
  //   console.info({ host, path, query }, file?.mime ?? 'NOT_FOUND');

  //   if (!file) {
  //     cb({ headers: CORS_HEADERS, statusCode: 404, data: null });
  //     return;
  //   }

  //   const headers = {
  //     ...CORS_HEADERS,
  //     'Content-Type': file.mime,
  //   };

  //   const data = new PassThrough();
  //   data.push(await file.zip.async('uint8array'));
  //   data.push(null);

  //   cb({ headers, data });
  // });
};

export default registerProtocol;
