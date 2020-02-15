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

type MessageHandler<T extends keyof MessageType, P = MessageType[T]> = (payload: P, respond: Respond) => void | Promise<void>;

const messageHandlers: { [T in keyof MessageType]?: MessageHandler<T> } = {};

window.addEventListener('message', async ({ data }) => {
  if (!current.doc || !(data?.type)) return;

  const handler = messageHandlers[data.type as keyof MessageType];
  if (!handler) {
    console.debug('main window received message', data);
    return;
  }

  handler(data.payload, buildRespond(data));
}, false);

export const addMessageHandler = <T extends keyof MessageType>(message: T, handler: MessageHandler<T>): void => {
  messageHandlers[message] = handler as typeof messageHandlers[T];
};

export const removeMessageHandler = <T extends keyof MessageType>(message: T): MessageHandler<T> | null => {
  const result = messageHandlers[message] ?? null;
  delete messageHandlers[message];
  return result as MessageHandler<T>;
};
