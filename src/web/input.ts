export const bindings = {
  keyboard: {},
  mouse: {},
};

const IS_READER = window.parent !== window;

window.addEventListener('keyup', (ev) => {
  if (!IS_READER) {
    console.warn('keyup', ev);
  }
}, false);

if (IS_READER) {
  window.addEventListener('mousedown', (ev) => {
    console.warn('mousedown', ev);
  }, false);
}
