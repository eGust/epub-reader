interface PathPayload { path: string }

export interface MessageType {
  'go': PathPayload;
  'image': PathPayload;
  'images': { paths: string[] }
}
