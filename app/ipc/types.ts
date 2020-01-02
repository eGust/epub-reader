import { Navigation } from '../epub/navigation';

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
}

export interface ParseXmlMessage {
  xml: string;
  target: ParseXmlType;
}

export interface MetaData {
  path: string;
}

export interface OpfItem {
  id: string;
  path: string;
  mime: string;
}

export interface OpfData {
  items: OpfItem[];
  refs: string[];
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
  normalized?: string;
  id?: string;
}

export interface IpcMessageData {
  type: IpcMessageType;
  data: ParseXmlMessage | ParseXmlResult | OpenFileMessage | OpenFileResult;
  error?: string;
}

export { NavPoint, Navigation } from '../epub/navigation';
