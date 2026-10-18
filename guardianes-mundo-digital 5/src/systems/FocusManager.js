import { input } from './InputManager.js';

// Navegación por teclado para botones de menús, diálogos y acertijos.
// Solo el grupo superior de la pila recibe las teclas.

export class FocusGroup {
  constructor({ columns = 0, onBack = null, wrap = true, confirmActions = ['confirm'] } = {}) {
    this.confirmActions = confirmActions;
    this.items = [];
    this.index = 0;
    this.columns = columns;
    this.onBack = onBack;
    this.wrap = wrap;
    this.active = false;
  }

  add(item) {
    this.items.push(item);
    return item;
  }

  setItems(items) {
    this.items = items;
    this.index = Math.min(this.index, Math.max(0, items.length - 1));
    this.refresh();
  }

  enabledItems() {
    return this.items.filter((i) => i && i.active !== false && i.isEnabled?.() !== false && i.visible !== false);
  }

  current() {
    const list = this.enabledItems();
    if (!list.length) return null;
    this.index = Math.min(this.index, list.length - 1);
    return list[this.index];
  }

  focus(item) {
    const list = this.enabledItems();
    const i = list.indexOf(item);
    if (i >= 0) this.index = i;
    this.refresh();
  }

  move(delta) {
    const list = this.enabledItems();
    if (!list.length) return;
    let i = this.index + delta;
    if (this.wrap) i = (i + list.length) % list.length;
    else i = Math.max(0, Math.min(list.length - 1, i));
    this.index = i;
    this.refresh();
    focusManager.onMove?.();
  }

  refresh() {
    const cur = this.current();
    const show = focusManager.keyboardMode && this.active;
    for (const it of this.items) it?.setFocused?.(show && it === cur);
  }

  handle(action) {
    const cols = this.columns;
    switch (action) {
      case 'left': this.move(-1); break;
      case 'right': this.move(1); break;
      case 'up': this.move(cols ? -cols : -1); break;
      case 'down': this.move(cols ? cols : 1); break;
      case 'tab': this.move(1); break;
      case 'tabBack': this.move(-1); break;
      case 'confirm': this.current()?.activate?.(); break;
      case 'back': this.onBack?.(); break;
      default: break;
    }
  }
}

class FocusManager {
  constructor() {
    this.stack = [];
    this.keyboardMode = false;
    this.onMove = null;
    input.on('keys', (actions) => this.onKeys(actions));
    input.on('pointer', () => {
      if (this.keyboardMode) {
        this.keyboardMode = false;
        this.top()?.refresh();
      }
    });
    input.blockGameplay = () => this.stack.length > 0;
  }

  top() {
    return this.stack[this.stack.length - 1] || null;
  }

  push(group) {
    this.top() && (this.top().active = false, this.top().refresh());
    this.stack.push(group);
    group.active = true;
    group.refresh();
    return group;
  }

  remove(group) {
    const i = this.stack.indexOf(group);
    if (i >= 0) this.stack.splice(i, 1);
    group.active = false;
    group.refresh();
    const t = this.top();
    if (t) { t.active = true; t.refresh(); }
  }

  onKeys(actions) {
    const group = this.top();
    if (!group) return;
    const nav = actions.find((a) => ['left', 'right', 'up', 'down', 'tab', 'tabBack'].includes(a));
    if (nav) {
      if (!this.keyboardMode) {
        // La primera pulsación solo muestra el foco.
        this.keyboardMode = true;
        group.refresh();
        return;
      }
      group.handle(nav);
      return;
    }
    if (actions.some((a) => group.confirmActions.includes(a))) {
      group.handle('confirm');
      return;
    }
    if (actions.includes('back')) group.handle('back');
    const num = actions.find((a) => a.startsWith('num'));
    if (num) group.onNumber?.(Number(num.slice(3)));
  }
}

export const focusManager = new FocusManager();
