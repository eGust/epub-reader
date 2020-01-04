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

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly items: NavItem[];
  readonly cat: string;
  readonly id: string | null;
  readonly seq: number | null;
}

export interface Navigation {
  readonly title: string;
  readonly items: NavItem[];
}
