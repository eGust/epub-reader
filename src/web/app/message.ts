import PackageManager from "../epub/package_manager";
import { MessageType } from "./types";

interface Current {
  doc: PackageManager | null;
  reader: Window | null;
}

export const current: Current = {
  doc: null,
  reader: null,
};

export const sendMessage = (type: string, payload: Record<string, any> = {}): void => {
  current.reader?.postMessage({ type, payload }, '/');
};

const respondMessage = (messageId: string, data: Record<string, any>): void =>
  sendMessage('respond', { messageId, data });

const buildRespond = ({ messageId }: { messageId: string }) =>
  (data: Record<string, any>): void => respondMessage(messageId, data);

export type Respond = ReturnType<typeof buildRespond>;

type MessageHandler = (payload: any, respond: Respond) => void | Promise<any>;

const messageHandlers: Record<string, MessageHandler> = {};

window.addEventListener('message', async ({ data }) => {
  if (!current.doc || !(data?.type)) return;

  const handler = messageHandlers[data.type];
  if (!handler) {
    console.debug('main window received message', data);
    return;
  }

  handler(data.payload, buildRespond(data));
}, false);

export const addMessageHandler = (message: keyof MessageType, handler: MessageHandler): void => {
  messageHandlers[message] = handler;
};

export const removeMessageHandler = (message: keyof MessageType): MessageHandler | null => {
  const result = messageHandlers[message] ?? null;
  delete messageHandlers[message];
  return result;
};
