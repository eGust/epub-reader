interface PathPayload { path: string }

export interface MessageType {
  go: PathPayload,
  image: PathPayload,
  images: { paths: string[] },
  trigger: { action: string },
  keyUp: {
    alt: boolean;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
    key: string;
    code: string;
  },
  updateStatus: {
    pageCount: number;
    pageNo: number;
    basePath: string;
  },
}

export enum Direction {
  prev = -1,
  next = +1,
}
