import { PayloadType } from "./types";
import { parseHtml } from "./parser";
import { tick } from "../utils";

const pending: Record<string, number> = {};

const PAGE_COUNT_DELAY = 150;

const page = { count: 1, no: 0 };

const setPageNo = (pageNo: number) => {
  if (pageNo < 0 || pageNo > page.count - 1) return;
  $content.style.setProperty('--page-no', pageNo.toString());
  page.no = pageNo;
}

const setPageCount = (pageCount: number) => {
  $content.style.setProperty('--page-count', pageCount.toString());
  page.count = pageCount;
};

export const doSetPageNo = ({ pageNo, flip }: PayloadType['setPage']): void => {
  if (flip) {
    setPageNo(page.no + flip);
    return;
  }

  if (pageNo === undefined) return;
  setPageNo(pageNo);
}

export const updatePageCount = async () => {
  const timestamp = Date.now();
  if (timestamp < pending.pageCount ?? 0) return;

  pending.pageCount = timestamp + PAGE_COUNT_DELAY;
  await tick(PAGE_COUNT_DELAY);

  const fullWidth = Math.max(...[...$content.children].map((element) => {
    const el = element as HTMLElement;
    return el.offsetLeft + el.clientWidth;
  }));
  const pageWidth = $content.clientWidth;
  const vw = window.innerWidth * 0.03;
  const count = (fullWidth + pageWidth * 0.4 + vw) / (pageWidth + vw);
  console.debug({ fullWidth, pageWidth }, count, (fullWidth + vw) / (pageWidth + vw));
  setPageCount(Math.round(count));

  if (page.no + 1 < page.count) return;
  setPageNo(page.count - 1);
};

export const $content = document.querySelector('main > section') as HTMLDivElement;

export const doOpen = async ({ mime, path, content }: PayloadType['open']): Promise<void> => {
  if (/(html|xml)/.test(mime)) {
    $content.innerHTML = '';
    history.pushState({ path }, '', `/${path}`);
    const elements = await parseHtml(content as string, mime);
    console.debug('open', { path, elements });
    $content.innerHTML = elements;
    $content.style.setProperty('--page-no', '0');
    updatePageCount();
    return;
  }
  console.error('open', { mime, path, content });
};

window.addEventListener('resize', updatePageCount);
