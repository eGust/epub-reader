import { Navigation, ManifestRef } from '../epub/navigation';

export enum IpcMessageType {
  ParseXml = 'parse-xml',
  ParseXmlResult = 'parse-xml:result',
  OpenFile = 'open-file',
  OpenFileResult = 'open-file:result',
}

export enum ParseXmlType {
  Meta,
  Opf,
  Ncx,
  Nav,
}

export interface ParseXmlMessage {
  xml: string;
  target: ParseXmlType;
}

export interface MetaData {
  path: string;
}

export interface OpfMeta {
  title: string;
  creators: string[];
  description: string;
  cover: string;
  otherMeta: Record<string, string>;
  docContent: Record<string, string[]>;
}

export interface OpfItem {
  id: string;
  path: string;
  mime: string;
}

export interface OpfItemRef {
  idRef: string;
  isLinear: boolean;
}

export interface OpfData {
  meta: OpfMeta;
  items: OpfItem[];
  refs: OpfItemRef[];
}

export interface ParseXmlResult {
  type: ParseXmlType;
  result?: MetaData | OpfData | Navigation;
}

export interface OpenFileMessage {
  filename: string;
}

export interface OpenFileResult {
  filename: string;
  fileId?: string;
  bookId?: string;
  meta?: OpfMeta;
  toc?: Navigation;
  spine?: ManifestRef[];
  cover?: {
    id: string;
    path: string;
    mime: string;
  };
}

export interface IpcMessageData {
  type: IpcMessageType;
  data: ParseXmlMessage | ParseXmlResult | OpenFileMessage | OpenFileResult;
  error?: string;
}

export { NavItem, Navigation } from '../epub/navigation';