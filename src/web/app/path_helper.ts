import { NavItem } from './../epub/types';
import { PackageManager } from "../epub/package_manager";

export interface ContentItem {
  id: string;
  label: string;
  path: string;
  level: number;
  items: ContentItem[];
}

interface PathMapItem {
  tocItems: ContentItem[];
  spineIndex?: number;
}

export class PathHelper {
  private map = new Map<string, PathMapItem>();

  public readonly tocItems: readonly ContentItem[];

  public getPathInfo(path: string): PathMapItem | null {
    return this.map.get(path) ?? null;
  }

  private convert(navItems: NavItem[], level = 0, key = ''): ContentItem[] {
    const lvl = level + 1;
    const { map } = this;
    return navItems.map(({ label, path, items }, index) => {
      const id = `${key}${index}`;
      const item = {
        id: `${key}${index}`,
        label,
        path,
        level,
        items: this.convert(items, lvl, `${id}-`),
      };

      if (map.has(item.path)) {
        map.get(item.path)!.tocItems.push(item);
      } else {
        map.set(item.path, { tocItems: [item] });
      }
      return item;
    });
  }

  constructor (pm: PackageManager) {
    this.tocItems = this.convert(pm.navigation!.items);
    const { map } = this;
    pm.metadata!.spineItems.forEach(({ item: { path } }, spineIndex) => {
      if (map.has(path)) {
        map.get(path)!.spineIndex = spineIndex;
      } else {
        map.set(path, { spineIndex, tocItems: [] });
      }
    });
  }
}
