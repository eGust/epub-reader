import { getBasePath } from './../utils';
import { PayloadType } from "./types";
import { parseHtml } from "./parser";
import { tick } from "../utils";
import { sendMessage } from './message';

const pending: Record<string, number> = {};

const PAGE_COUNT_DELAY = 150;

export const page = { basePath: '', count: 1, no: 0 };

export const $body = document.querySelector('body')!;

export const $content = document.querySelector('main > section') as HTMLDivElement;

const setPageNo = (pageNo: number) => {
  const no = pageNo | 0;
  if (Number.isNaN(no) || no < 0 || no > page.count - 1) return;
  $content.style.setProperty('--page-no', no.toString());
  page.no = no;
}

const setPageCount = (pageCount: number) => {
  $content.style.setProperty('--page-count', pageCount.toString());
  page.count = pageCount;
};

const syncStatus = () => {
  const { basePath, count: pageCount, no: pageNo } = page;
  sendMessage('updateStatus', { pageNo, pageCount, basePath });
};

export const doSetPageNo = ({ pageNo, forceSync = false }: PayloadType['setPage']): void => {
  const oldNo = page.no;
  setPageNo(pageNo);
  if (oldNo !== page.no || forceSync) {
    syncStatus();
  }
};

export const updatePageCount = async ({ ignoreSync = false } = {}) => {
  const timestamp = Date.now();
  if (timestamp < pending.pageCount ?? 0) return;

  pending.pageCount = timestamp + PAGE_COUNT_DELAY;
  await tick(PAGE_COUNT_DELAY);

  const fullWidth = Math.max(0, ...[...$content.children].map((element) => {
    const el = element as HTMLElement;
    return el.offsetLeft + el.clientWidth;
  })) || $content.scrollWidth;
  const pageWidth = $content.clientWidth;
  const vw = $body.clientWidth * 0.03;
  const count = (fullWidth + pageWidth * 0.4 + vw) / (pageWidth + vw);
  console.debug({ fullWidth, pageWidth, vw }, count, (fullWidth + vw) / (pageWidth + vw));
  try {
    setPageCount(Math.round(count));

    if (page.no + 1 < page.count) return;
    setPageNo(page.count - 1);
  } finally {
    if (!ignoreSync) {
      syncStatus();
    }
  }
};

export const doOpen = async ({ mime, path, content, atLast }: PayloadType['open']): Promise<void> => {
  if (/(html|xml)/.test(mime)) {
    $content.innerHTML = '';
    page.basePath = `/${getBasePath(path)}`;
    try {
      const elements = await parseHtml(content as string, mime);
      console.debug('open', { path, elements });
      $content.innerHTML = elements;
      $content.style.setProperty('--debug--path', path);
      $content.style.setProperty('visibility', 'hidden');

      await updatePageCount({ ignoreSync: true });
      $content.style.removeProperty('visibility');
      doSetPageNo({ pageNo: atLast ? page.count - 1 : 0, forceSync: true });
    } catch (e) {
      console.error('doOpen', e);
    }
    return;
  }
  console.error('open', { mime, path, content });
};

window.addEventListener('resize', () => updatePageCount());
