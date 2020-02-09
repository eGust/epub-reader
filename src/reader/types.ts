export interface PayloadType {
  open: {
    mime: string;
    path: string;
    content: string | Blob;
  },
  setPage: {
    pageNo?: number;
    flip?: -1 | 1;
  };
}

export interface MessageData {
  type: keyof PayloadType;
  payload: PayloadType[keyof PayloadType];
}
