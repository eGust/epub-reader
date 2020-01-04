import { readFile, existsSync } from 'fs';
// import { PassThrough } from 'stream';
import { promisify } from 'util';
import { createHash } from 'crypto';
import JSZip, { JSZipObject } from 'jszip';

import { MetaFile } from './meta_file';
import ZipFiles, { CompressedObject } from './zip_files';
import { Navigation, ManifestItem } from './navigation';
import {
  parseMeta, parseOpf, parseNcx, parseNav,
} from './parseXml';

interface ResponseObject {
  mime: string;
  raw: CompressedObject;
  zip: JSZipObject;
}

const readFileAsync = promisify(readFile);

const normalizeFilename = (filename: string): string | null => {
  if (!existsSync(filename)) return null;

  const fn = filename.replace(/\\/g, '/');
  const lower = fn.toLowerCase();
  return existsSync(lower) ? lower : fn;
};

const generateUid = (filename: string): string => createHash('sha256')
  .update(filename, 'utf8')
  .digest('hex').toLowerCase();

interface ZipObject extends JSZipObject {
  _data: CompressedObject;
}

export class PackageManager {
  private filename: string = '';

  private meta?: MetaFile;

  private files: ZipFiles | null = null;

  private nav?: Navigation;

  private fid: string = '';

  private bid: string = '';

  public get isReady() { return !!this.filename; }

  public get file() { return this.filename; }

  public get fileId() { return this.fid; }

  public get metadata() { return this.meta; }

  public get navigation() { return this.nav; }

  public get bookId() { return this.bid; }

  public async open(filename: string, id?: string): Promise<boolean> {
    const fn = normalizeFilename(filename);
    if (!fn) return false;

    this.filename = '';
    this.fid = '';
    this.bid = '';
    try {
      const zip = new JSZip();
      const buff = await readFileAsync(fn);
      await zip.loadAsync(buff);

      this.files?.release();
      this.files = new ZipFiles(zip);

      await this.loadMetaAll();
      if (!this.meta || !this.nav) return false;

      this.filename = fn;
      this.fid = (id ?? generateUid(fn)).toLowerCase();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  private async loadMetaAll(): Promise<void> {
    this.meta = undefined;
    try {
      const meta = await this.files?.asText('META-INF/container.xml');
      if (!meta) return;

      const opfPath = await parseMeta(meta);
      if (!opfPath) return;

      await this.loadOpf(opfPath);
      if (!this.meta) return;

      const ncx = this.meta!.getItemBy({ id: 'ncx' });
      const nav = ncx ? undefined : this.meta!.getItemBy({ id: 'nav' });
      if (!ncx && !nav) return;

      await this.loadNav({ ncx, nav });
    } catch (e) {
      console.error(e);
    }
  }

  private async loadOpf(path: string): Promise<void> {
    const opfXml = await this.files?.asText(path);
    if (!opfXml) return;

    const opfData = await parseOpf(opfXml);
    if (!opfData) return;

    this.bid = generateUid(opfXml);
    this.meta = new MetaFile(opfData, path, this.files!);
  }

  private async loadNav({ ncx, nav }: { ncx?: ManifestItem, nav?: ManifestItem }): Promise<void> {
    this.nav = undefined;
    try {
      if (ncx) {
        const xml = await this.files?.asText(ncx.path);
        if (!xml) return;

        const navigation = await parseNcx(xml);
        if (!navigation) return;

        this.nav = navigation;
      } else if (nav) {
        const xml = await this.files?.asText(nav.path);
        if (!xml) return;

        const navigation = await parseNav(xml);
        if (!navigation) return;

        this.nav = navigation;
      }
    } catch (e) {
      console.error(e);
    }
  }

  public asText(filename: string): Promise<string | null> {
    return this.files?.asText(filename) ?? Promise.resolve(null);
  }

  // public urlOf(filename: string): Promise<string | null> {
  //   return this.files?.asUrl(filename) ?? Promise.resolve(null);
  // }

  public toResponse(filename: string): ResponseObject | null {
    const path = filename || this.meta!.getStartPage().path;
    console.log({ filename, path });

    const zip = this.files?.raw(path);
    if (!zip) return null;

    const item = this.meta?.getItemBy({ path });
    if (!item) return null;

    const { _data: raw } = zip as ZipObject;

    return { mime: item.mime, raw, zip };
  }
}

const pool: PackageManager[] = [];

const cache: Record<string, PackageManager> = {};

export const openFile = async (filename: string): Promise<PackageManager | null> => {
  const fn = normalizeFilename(filename);
  if (!fn) return null;

  const id = generateUid(fn);
  if (!id) return null;
  if (id in cache) return cache[id];

  const pm = pool.length ? pool.pop()! : new PackageManager();
  if (await pm.open(fn, id)) {
    cache[pm.bookId] = pm;
    return pm;
  }

  pool.push(pm);
  return null;
};

export const getPackageManger = (id: string): PackageManager | undefined => cache[id.toLowerCase()];
