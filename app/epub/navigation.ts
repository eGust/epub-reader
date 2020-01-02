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
