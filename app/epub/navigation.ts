export interface NavPoint {
  readonly label: string;
  readonly path: string;
  readonly children: NavPoint[];
  readonly category: string;
  readonly id: string | null;
  readonly order: number | null;
}

export interface Navigation {
  readonly title: string;
  readonly points: NavPoint[];
}
