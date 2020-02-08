import { PayloadType } from "./types";
import { parseHtml } from "./parser";

export const $main = document.querySelector('main') as HTMLDivElement;

export const doOpen = async ({ mime, path, content }: PayloadType['open']): Promise<void> => {
  if (/(html|xml)/.test(mime)) {
    $main.innerHTML = '';
    history.pushState({ path }, '', `/${path}`);
    const elements = await parseHtml(content as string, mime);
    console.debug('open', { path, elements });
    $main.innerHTML = elements;
  }
};
