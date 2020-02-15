export interface PayloadType {
  open: {
    mime: string;
    path: string;
    content: string | Blob;
  },
  setPage: {
    pageNo: number;
  },
}

export interface MessageData {
  type: keyof PayloadType;
  payload: PayloadType[keyof PayloadType];
}
