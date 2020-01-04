interface TocItem {
  label: string;
  path: string;
  isExpanded: boolean;
  items: TocItem[];
  key: string;
}
