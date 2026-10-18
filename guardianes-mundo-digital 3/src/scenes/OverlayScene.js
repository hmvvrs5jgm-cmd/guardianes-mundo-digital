import Phaser from 'phaser';
import { FocusGroup, focusManager } from '../systems/FocusManager.js';
import { overlay, drawPanel, makeText } from '../ui/helpers.js';
import { input } from '../systems/InputManager.js';

// Base para ventanas superpuestas (pausa, opciones, ayuda, mochila, confirmación).
export default class OverlayScene extends Phaser.Scene {
  init(data) {
    this.params = data || {};
    this.closing = false;
  }

  buildWindow(title, w = 760, h = 560, border = 0x2fd6b5) {
    const { width, height } = this.scale;
    this.veil = overlay(this, 0.7);
    this.win = this.add.container(width / 2, height / 2);
    const g = this.add.graphics();
    drawPanel(g, -w / 2, -h / 2, w, h, { fill: 0x10343d, border, radius: 30 });
    this.win.add(g);
    this.winW = w;
    this.winH = h;
    if (title) {
      const t = makeText(this, 0, -h / 2 + 44, title, { size: 38, weight: '800', color: '#ffffff' }).setOrigin(0.5);
      this.win.add(t);
    }
    this.win.setScale(0.92).setAlpha(0);
    this.tweens.add({ targets: this.win, scale: 1, alpha: 1, duration: 200, ease: 'Back.Out' });
    this.group = new FocusGroup({ onBack: () => this.close() });
    return this.win;
  }

  focus(items, first) {
    this.group.setItems(items);
    if (!focusManager.stack.includes(this.group)) focusManager.push(this.group);
    if (first) this.group.focus(first);
  }

  // Abre otra ventana encima de esta.
  openChild(key, data = {}) {
    this.scene.launch(key, { ...data, onClose: () => {} });
    this.scene.bringToTop(key);
  }

  close(result) {
    if (this.closing) return;
    this.closing = true;
    focusManager.remove(this.group);
    input.clearPressed();
    this.tweens.add({
      targets: this.win, scale: 0.94, alpha: 0, duration: 140,
      onComplete: () => {
        this.scene.stop();
        this.params.onClose?.(result);
      }
    });
  }
}
