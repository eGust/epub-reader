import JSZip, { JSZipObject } from 'jszip';

export interface CompressedObject {
  compressedContent: Uint8Array;
  compressedSize: number;
  uncompressedSize: number;
  crc32: number;
}

class ZipFiles {
  public readonly zip: JSZip;

  constructor(zip: JSZip) {
    this.zip = zip;
  }

  private urlCache: Record<string, string | null> = {};

  public asText(filename: string): Promise<string | null> {
    return this.zip.file(filename)?.async('text') || null;
  }

  public asBytes(filename: string): Promise<Uint8Array | null> {
    return this.zip.file(filename)?.async('uint8array') || null;
  }

  // public async asUrl(filename: string): Promise<string | null> {
  //   const cached = this.urlCache[filename];
  //   if (cached !== undefined) return cached;

  //   const file = this.zip.file(filename);
  //   if (!file) return null;

  //   const blob = await file.async('blob');
  //   const url = URL.createObjectURL(blob);
  //   this.urlCache[filename] = url;
  //   return url;
  // }

  public of(filename: string): JSZipObject {
    return this.zip.file(filename);
  }

  public release() {
    const cache = this.urlCache;
    this.urlCache = {};
    const urls = Object.values(cache).filter((x) => x!) as string[];
    urls.forEach((url) => URL.revokeObjectURL(url));
  }

  public raw(filename: string): JSZipObject | null {
    return this.zip.file(filename) || null;
  }
}

export default ZipFiles;
