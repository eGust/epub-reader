export interface PayloadType {
  open: {
    mime: string;
    path: string;
    content: string | Blob;
    pageNo: number;
    pageCount?: number;
  },
  setPage: {
    pageNo: number;
    forceSync?: boolean;
  },
  updateStyles: {
    css: string;
  },
}

export interface MessageData {
  type: keyof PayloadType;
  payload: PayloadType[keyof PayloadType];
}
