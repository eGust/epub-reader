import JSZip, { JSZipObject } from 'jszip';

import { MetaFile } from './meta_file';
import { Navigation, ManifestItem } from './types';
import { ZipFiles, CompressedObject } from './zip_files';
import {
  parseMeta, parseOpf, parseNcx, parseNav,
} from './parseXml';

interface ResponseObject {
  mime: string;
  zip: JSZipObject;
}

interface ZipObject extends JSZipObject {
  _data: CompressedObject;
}

const readFile = (file: File): Promise<ArrayBuffer> => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = ({ target }) => {
    resolve(target.result as ArrayBuffer);
  };
  reader.readAsArrayBuffer(file);
});

export class PackageManager {
  private meta?: MetaFile;

  private files: ZipFiles | null = null;

  public readonly file: File;

  private nav?: Navigation;

  private digest: string;

  public get isReady() { return !!this.digest; }

  public get metadata() { return this.meta; }

  public get navigation() { return this.nav; }

  public get id() { return this.digest; }

  public constructor(file: File) {
    this.file = file;
  }

  public async open(): Promise<boolean> {
    try {
      const zip = new JSZip();
      const buff = await readFile(this.file);
      await zip.loadAsync(buff);

      this.files?.release();
      this.files = new ZipFiles(zip);

      const [digest] = await Promise.all([
        crypto.subtle.digest('SHA-256', buff),
        this.loadMetaAll(),
      ]);
      if (!this.meta || !this.nav) return false;

      const hash = btoa(String.fromCharCode.apply(null, new Uint8Array(digest)));
      this.digest = hash + buff.byteLength.toString(36);
      console.debug(this.id)
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
      await this.loadOpf(opfPath.path);
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
    const opfData = await parseOpf(opfXml);
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

  public asText(filename: string): Promise<string> | null {
    return this.files?.asText(filename) ?? null;
  }

  public toResponse(filename: string): ResponseObject | null {
    const path = filename || this.meta!.getStartPage().path;
    console.log({ filename, path });

    const zip = this.files?.raw(path);
    if (!zip) return null;

    const item = this.meta?.getItemBy({ path });
    if (!item) return null;

    return { mime: item.mime, zip };
  }
}

export default PackageManager;
