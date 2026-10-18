import Phaser from 'phaser';

// Entrada unificada: teclado y controles táctiles escriben en el mismo estado.
// Los menús y acertijos usan los eventos 'key' a través de FocusManager.

const KEYMAP = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  jump: ['Space', 'ArrowUp', 'KeyW', 'KeyK'],
  interact: ['KeyE', 'Enter', 'KeyJ'],
  tool: ['KeyQ', 'KeyL'],
  run: ['ShiftLeft', 'ShiftRight'],
  pause: ['Escape', 'KeyP'],
  inventory: ['KeyI', 'KeyB'],
  hint: ['KeyH'],
  confirm: ['Enter', 'Space', 'NumpadEnter'],
  back: ['Escape', 'Backspace'],
  tab: ['Tab'],
  num1: ['Digit1', 'Numpad1'],
  num2: ['Digit2', 'Numpad2'],
  num3: ['Digit3', 'Numpad3']
};

const PREVENT = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace']);
const REPEATABLE = new Set(['left', 'right', 'up', 'down', 'tab']);

class InputManager extends Phaser.Events.EventEmitter {
  constructor() {
    super();
    this.held = new Set();
    this.touch = {};
    this.pressed = {};
    this.lastKeyboardTime = 0;
    this.blockGameplay = () => false;
    this.started = false;
    this.isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }

  init() {
    if (this.started) return;
    this.started = true;
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.held.delete(e.code));
    window.addEventListener('blur', () => this.releaseAll());
    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') this.isTouchDevice = true;
      this.emit('pointer');
    });
  }

  actionsFor(code) {
    const out = [];
    for (const [action, codes] of Object.entries(KEYMAP)) if (codes.includes(code)) out.push(action);
    return out;
  }

  onKeyDown(e) {
    if (PREVENT.has(e.code)) e.preventDefault();
    this.lastKeyboardTime = performance.now();
    const actions = this.actionsFor(e.code);
    if (!e.repeat) this.held.add(e.code);
    const menuActive = this.blockGameplay();
    const emitted = [];
    for (const action of actions) {
      if (e.repeat && !REPEATABLE.has(action)) continue;
      emitted.push(action === 'tab' && e.shiftKey ? 'tabBack' : action);
      if (!menuActive && !e.repeat) this.pressed[action] = true;
    }
    if (emitted.length) this.emit('keys', emitted);
  }

  isDown(action) {
    if (this.touch[action]) return true;
    const codes = KEYMAP[action];
    return codes ? codes.some((c) => this.held.has(c)) : false;
  }

  justPressed(action) {
    if (this.pressed[action]) {
      this.pressed[action] = false;
      return true;
    }
    return false;
  }

  setTouch(action, down) {
    if (down && !this.touch[action]) this.pressed[action] = true;
    this.touch[action] = down;
  }

  clearPressed() {
    this.pressed = {};
  }

  releaseAll() {
    this.held.clear();
    this.touch = {};
    this.pressed = {};
  }

  usingKeyboard() {
    return performance.now() - this.lastKeyboardTime < 15000 || !this.isTouchDevice;
  }

  // Textos de controles que se insertan en los diálogos.
  labels() {
    if (this.isTouchDevice && !(performance.now() - this.lastKeyboardTime < 15000)) {
      return {
        MOVE: 'las flechas de la pantalla',
        JUMP: 'el botón de salto',
        INTERACT: 'el botón de acción',
        TOOL: 'el botón de la Lupa',
        RUN: 'mantener presionada una flecha'
      };
    }
    return {
      MOVE: 'las flechas o A y D',
      JUMP: 'Espacio o la flecha arriba',
      INTERACT: 'la tecla E',
      TOOL: 'la tecla Q',
      RUN: 'Shift'
    };
  }

  format(text) {
    const l = this.labels();
    return String(text).replace(/\{(MOVE|JUMP|INTERACT|TOOL|RUN)\}/g, (_, k) => l[k]);
  }
}

export const input = new InputManager();
