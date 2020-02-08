import { MessageData, PayloadType } from "./types";
import { tick } from "../utils";

let messageId = 0;

interface Resolvers {
  [type: string]: {
    [name: string]: {
      resolve: (...args: any[]) => void,
      reject: (...args: any[]) => void
    }
  }
}

const resolvers: Resolvers = {
  respond: {},
};

export const emitMessage = <T>(type: string, payload: Record<string, any>) => new Promise<T>((resolve, reject) => {
  messageId += 1;
  resolvers.respond[messageId] = { resolve, reject };
  window.parent.postMessage({ type, messageId, payload }, '/');
});

type MessageHandler = (payload: any) => void | Promise<any>;

interface RespondPayload {
  messageId: string;
  data: Record<string, any>;
}

const messageHandlers: Record<string, undefined | MessageHandler> = {
  'reset': async (): Promise<void> => {
    const rejectors = Object.values(resolvers.respond).map(({ reject }) => reject);
    resolvers.respond = {};
    await tick();
    rejectors.forEach((reject) => reject('file closed'));
  },

  'respond': ({ messageId, data }: RespondPayload): void => {
    resolvers.respond[messageId]?.resolve?.(data);
  },
};

window.addEventListener('message', async ({ data }) => {
  const message = data as MessageData;
  const handler = messageHandlers[message.type];
  if (!handler) {
    console.debug('iframe received message', data);
    return;
  }

  handler(message.payload);
}, false);

export const addMessageHandler = (message: keyof PayloadType, handler: MessageHandler): void => {
  messageHandlers[message] = handler;
};

export const removeMessageHandler = (message: keyof PayloadType): MessageHandler | null => {
  const result = messageHandlers[message] ?? null;
  delete messageHandlers[message];
  return result;
};

export const sendMessage = (type: string, payload: Record<string, any>): void => {
  window.parent.postMessage({ type, payload }, '/');
};
