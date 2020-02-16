import { NavItem } from './../epub/types';
import { PackageManager } from "../epub/package_manager";

export interface ContentItem {
  id: string;
  label: string;
  path: string;
  level: number;
  parentId: string;
  items: ContentItem[];
}

interface PathMapItem {
  tocItems: ContentItem[];
  spineIndex?: number;
}

export class PathHelper {
  private pathMap = new Map<string, PathMapItem>();
  private idMap = new Map<string, ContentItem>();

  public readonly tocItems: readonly ContentItem[];

  public getPathInfo(path: string): PathMapItem | null {
    return this.pathMap.get(path) ?? null;
  }

  public getContentItem(id: string): ContentItem | null {
    return this.idMap.get(id) ?? null;
  }

  public getContentItemWithAllParentIds(id: string): string[] {
    const ids: string[] = [];
    const { idMap } = this;
    for (let item = idMap.get(id); item; item = idMap.get(item.parentId)) {
      ids.push(item.parentId);
    }
    return ids;
  }

  private convert(navItems: NavItem[], level = 0, key = '', parentId = ''): ContentItem[] {
    const lvl = level + 1;
    const { pathMap, idMap } = this;
    return navItems.map(({ label, path, items }, index) => {
      const id = `${key}${index}`;
      const item = {
        id,
        label,
        path,
        level,
        parentId,
        items: this.convert(items, lvl, `${id}-`, id),
      };
      idMap.set(id, item);

      if (pathMap.has(item.path)) {
        pathMap.get(item.path)!.tocItems.push(item);
      } else {
        pathMap.set(item.path, { tocItems: [item] });
      }
      return item;
    });
  }

  constructor (pm: PackageManager) {
    this.tocItems = this.convert(pm.navigation!.items);
    const { pathMap } = this;
    pm.metadata!.spineItems.forEach(({ item: { path } }, spineIndex) => {
      if (pathMap.has(path)) {
        pathMap.get(path)!.spineIndex = spineIndex;
      } else {
        pathMap.set(path, { spineIndex, tocItems: [] });
      }
    });
  }
}
