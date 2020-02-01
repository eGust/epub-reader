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

export interface MetaData {
  path: string;
}

export interface OpfMeta {
  title: string;
  creators: string[];
  description: string;
  cover: string;
  otherMeta: Record<string, string>;
  docContent: Record<string, string[]>;
}

export interface OpfItem {
  id: string;
  path: string;
  mime: string;
}

export interface OpfItemRef {
  idRef: string;
  isLinear: boolean;
}

export interface OpfData {
  meta: OpfMeta;
  items: OpfItem[];
  refs: OpfItemRef[];
}

export interface OpenFileMessage {
  filename: string;
}

export interface OpenFileResult {
  filename: string;
  fileId?: string;
  bookId?: string;
  meta?: OpfMeta;
  toc?: Navigation;
  spine?: ManifestRef[];
  cover?: {
    id: string;
    path: string;
    mime: string;
  };
}
