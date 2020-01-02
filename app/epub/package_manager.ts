import { readFile, existsSync } from 'fs';
// import { PassThrough } from 'stream';
import { promisify } from 'util';
import { createHash } from 'crypto';
import JSZip, { JSZipObject } from 'jszip';

import { MetaFile, ManifestItem } from './meta_file';
import ZipFiles, { CompressedObject } from './zip_files';
import { Navigation } from './navigation';
import { parseMeta, parseOpf, parseNav } from './parseXml';

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

const generateUniqFileId = (filename: string): string => createHash('sha256')
  .update(filename, 'utf8')
  .digest('hex').toLowerCase();

interface ZipObject extends JSZipObject {
  _data: CompressedObject;
}

export class PackageManager {
  private currentFilename: string = '';

  private meta?: MetaFile;

  private files: ZipFiles | null = null;

  private nav?: Navigation;

  private uid: string = '';

  public get isReady() { return !!this.currentFilename; }

  public get filename() { return this.currentFilename; }

  public get metadata() { return this.meta; }

  public get navigation() { return this.nav; }

  public get id() { return this.uid; }

  public async open(filename: string, id?: string): Promise<boolean> {
    const fn = normalizeFilename(filename);
    if (!fn) return false;

    this.currentFilename = '';
    this.uid = '';
    try {
      const zip = new JSZip();
      const buff = await readFileAsync(fn);
      await zip.loadAsync(buff);

      this.files?.release();
      this.files = new ZipFiles(zip);

      await this.loadMetaAll();
      if (!this.meta || !this.nav) return false;

      this.currentFilename = fn;
      this.uid = (id ?? generateUniqFileId(fn)).toLowerCase();
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
      if (!ncx) return;

      await this.loadNav(ncx);
    } catch (e) {
      console.error(e);
    }
  }

  private async loadOpf(path: string): Promise<void> {
    const opfXml = await this.files?.asText(path);
    if (!opfXml) return;

    const opfData = await parseOpf(opfXml);
    if (!opfData) return;

    this.meta = new MetaFile(opfData, path, this.files!);
  }

  private async loadNav(ncx: ManifestItem): Promise<void> {
    this.nav = undefined;
    try {
      const xml = await this.files?.asText(ncx.path);
      if (!xml) return;

      const navigation = await parseNav(xml);
      if (!navigation) return;

      this.nav = navigation;
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
    const zip = this.files?.raw(filename);
    if (!zip) return null;

    const item = this.meta?.getItemBy({ path: filename });
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

  const id = generateUniqFileId(fn);
  if (!id) return null;
  if (id in cache) return cache[id];

  const pm = pool.length ? pool.pop()! : new PackageManager();
  if (await pm.open(fn, id)) {
    cache[pm.id] = pm;
    return pm;
  }

  pool.push(pm);
  return null;
};

export const getPackageManger = (id: string): PackageManager | undefined => cache[id.toLowerCase()];
