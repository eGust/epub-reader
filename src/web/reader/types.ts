export interface PayloadType {
  open: {
    mime: string;
    path: string;
    content: string | Blob;
    atLast: boolean;
  },
  setPage: {
    pageNo: number;
    forceSync?: boolean;
  },
}

export interface MessageData {
  type: keyof PayloadType;
  payload: PayloadType[keyof PayloadType];
}
