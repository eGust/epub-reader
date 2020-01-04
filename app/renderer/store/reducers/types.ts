import { INavLinkGroup } from 'office-ui-fabric-react';

import { ManifestRef } from '../../../epub/navigation';
import { OpfMeta, Navigation } from '../../../ipc/types';

export interface BookCover {
  fileId: string;
  bookId: string;
  filename: string;
  title: string;
  coverImageURL: string;
}

export interface BookFile {
  fileId: string;
  bookId: string;
  filename: string;
  nav: INavLinkGroup[];
}

export interface BookData {
  bookId: string;
  spine: ManifestRef[];
  meta: OpfMeta;
  toc: Navigation;
  cover?: {
    id: string;
    path: string;
    mime: string;
  };
}

export interface RootState {
  covers: BookCover[];
  bookFiles: Record<string, BookFile>;
  bookData: Record<string, BookData>;
}
