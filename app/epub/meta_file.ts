import { join } from 'path';

import ZipFiles from './zip_files';
import { OpfItem, OpfData, OpfMeta } from '../ipc/types';

export interface ManifestItem {
  readonly id: string;

  readonly path: string;

  readonly mime: string;

  index: number;
}

export interface ManifestRef {
  readonly id: string;

  readonly isLinear: boolean;

  readonly item: ManifestItem;

  readonly index: number;
}

const createItem = ({ path, ...item }: OpfItem, base: string): ManifestItem => ({
  ...item,
  path: join(base, path).replace(/\\/g, '/'),
  index: -1,
});

export class MetaFile {
  private itemById: Record<string, ManifestItem> = {};

  private itemByPath: Record<string, ManifestItem> = {};

  private spine: ManifestRef[] = [];

  public readonly path: string;

  public readonly metadata: OpfMeta;

  public readonly files: ZipFiles;

  constructor(opf: OpfData, path: string, files: ZipFiles) {
    this.path = path;
    this.files = files;
    this.metadata = opf.meta;

    const basePath = join(this.path, '..');
    opf.items.forEach((opfItem) => {
      const item = createItem(opfItem, basePath);
      this.itemById[item.id] = item;
      this.itemByPath[item.path] = item;
    });

    opf.refs.forEach((ref, index) => {
      const item = this.itemById[ref.idRef]!;
      if (ref.isLinear) {
        item.index = index;
      }
      const refItem = {
        id: ref.idRef,
        isLinear: ref.isLinear,
        item,
        index,
      };
      this.spine.push(refItem);
    });
  }

  public get spineItems() { return this.spine; }

  public getItemBy({ id, path }: { id?: string, path?: string }): ManifestItem | undefined {
    if (id) return this.itemById[id];
    if (path) return this.itemByPath[path];
    return undefined;
  }

  public getPrevOf({ id, path }: { id?: string, path?: string }): ManifestItem | undefined {
    const item = this.getItemBy({ id, path });
    if (!item || item.index <= 0) return undefined;
    return this.spine[item.index - 1]?.item;
  }

  public getNextOf({ id, path }: { id?: string, path?: string }): ManifestItem | undefined {
    const item = this.getItemBy({ id, path });
    if (!item || item.index < 0) return undefined;
    return this.spine[item.index + 1]?.item;
  }
}

export default MetaFile;
