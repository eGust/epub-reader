import { addMessageHandler } from "./message";
import { MessageType } from "./types";

const shortCutSettings = {
  disabledHandling: false,
};

export const toggleShortCutsDisabled = (disabled?: boolean): void => {
  shortCutSettings.disabledHandling = disabled === undefined
    ? !shortCutSettings.disabledHandling
    : disabled;
};

export const enableShortCuts = () => toggleShortCutsDisabled(false);
export const disableShortCuts = () => toggleShortCutsDisabled(true);

export const bindings: { [key: string]: Record<string, string> } = {
  keyboard: {
    'CtrlMeta + ArrowLeft': 'flipChapterPrev',
    'CtrlMeta + ArrowRight': 'flipChapterNext',
    ArrowLeft: 'flipPagePrev',
    ArrowRight: 'flipPageNext',
    PageUp: 'flipPagePrev',
    PageDown: 'flipPageNext',
    Backquote: 'toggleToc',
    Home: 'jumpPageFirst',
    End: 'jumpPageLast',
  },
  mouse: {},
};

export const actions: Record<string, Function> = {};

const CONTROL_KEYS = new Set(['Control', 'Meta', 'Shift', 'Alt']);

const keyHandler = (keyStatus: MessageType['keyUp']) => {
  if (shortCutSettings.disabledHandling) return;

  if (CONTROL_KEYS.has(keyStatus.key)) return;

  const maps = [[keyStatus.code]];

  if (keyStatus.alt) {
    maps[0].push('Alt');
  }
  if (keyStatus.shift) {
    maps[0].push('Shift');
  }
  if (keyStatus.ctrl || keyStatus.meta) {
    maps.push([...maps[0]]);
    maps[0].push('CtrlMeta');
    maps[1].push(keyStatus.ctrl ? 'Ctrl' : 'Meta');
  }

  const handled = maps.some((keys) => {
    const bind = [...keys].reverse().join(' + ');
    const actionName = bindings.keyboard[bind];
    if (actionName) {
      console.log('[shortcut]', bind, actionName);
      actions[actionName]?.();
      return true;
    }
  });

  if (!handled) {
    console.log(maps);
  }
};

window.addEventListener('keyup', (ev) => {
  const { altKey: alt, ctrlKey: ctrl, metaKey: meta, shiftKey: shift, key, code } = ev;
  keyHandler({ alt, ctrl, meta, shift, key, code });
}, false);

addMessageHandler('keyUp', keyHandler);
