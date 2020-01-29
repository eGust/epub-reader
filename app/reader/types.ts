import { History } from 'history';

export type SendAsyncMessage = (channel: string, ...args: any[]) => Promise<any[]>;

declare global {
  interface Window {
    h: History<{}>;
    sendAsyncMessage: SendAsyncMessage;
    sendToHost: (channel: string, payload?: Record<string, any>) => void;
  }
}
