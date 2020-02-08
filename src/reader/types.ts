export interface PayloadType {
  open: {
    mime: string;
    path: string;
    content: string | Blob;
  },
}

export interface MessageData {
  type: keyof PayloadType;
  payload: PayloadType[keyof PayloadType];
}
