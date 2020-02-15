import { addMessageHandler } from "./message";
import { MessageType } from "./types";

export const bindings: { [key: string]: Record<string, string> } = {
  keyboard: {
    ArrowLeft: 'flipPrev',
    ArrowRight: 'flipNext',
    PageUp: 'flipPrev',
    PageDown: 'flipNext',
  },
  mouse: {},
};

export const actions: Record<string, Function> = {};

const CONTROL_KEYS = new Set(['Control', 'Meta', 'Shift', 'Alt']);

const keyHandler = (keyStatus: MessageType['keyUp']) => {
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

  maps.find((keys) => {
    const bind = [...keys].reverse().join(' + ');
    const actionName = bindings.keyboard[bind];
    if (actionName) {
      console.log('[shortcut]', bind, actionName);
      actions[actionName]?.();
      return true;
    }
  });
};

window.addEventListener('keyup', (ev) => {
  const { altKey: alt, ctrlKey: ctrl, metaKey: meta, shiftKey: shift, key, code } = ev;
  keyHandler({ alt, ctrl, meta, shift, key, code });
}, false);

addMessageHandler('keyUp', keyHandler);
