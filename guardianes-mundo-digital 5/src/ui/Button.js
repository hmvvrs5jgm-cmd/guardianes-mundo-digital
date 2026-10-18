import Phaser from 'phaser';
import { makeText } from './helpers.js';
import { audio } from '../systems/AudioManager.js';

// Botón grande y táctil con foco de teclado.
export default class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, opts = {}) {
    super(scene, x, y);
    const {
      label = '', width = 300, height = 72, color = 0x2fd6b5, textColor = '#0b2e33',
      size = 28, icon = null, iconScale = 1, onClick = null, radius = 20, wrap = 0, align = 'center', sound = 'click'
    } = opts;
    this.w = width;
    this.h = height;
    this.color = color;
    this.radius = radius;
    this.onClick = onClick;
    this.sound = sound;
    this.enabled = true;
    this.focused = false;
    this.selected = false;

    this.bg = scene.add.graphics();
    this.ring = scene.add.graphics();
    this.add([this.ring, this.bg]);

    let textX = 0;
    if (icon) {
      this.icon = scene.add.image(label ? -width / 2 + 22 + 24 * iconScale : 0, 0, icon).setScale(iconScale);
      this.add(this.icon);
      if (label) textX = 24 * iconScale;
    }
    if (label) {
      const wrapW = wrap || width - (icon ? 80 * iconScale : 36);
      this.text = makeText(scene, textX, 0, label, { size, color: textColor, weight: '800', align, wrap: wrapW, scaleWithSetting: true });
      this.text.setOrigin(0.5);
      // Ajusta el tamaño si el texto no cabe.
      let s = this.text.style.fontSize ? parseInt(this.text.style.fontSize, 10) : size;
      while (this.text.height > height - 10 && s > 14) {
        s -= 2;
        this.text.setFontSize(s);
      }
      this.add(this.text);
    }

    this.draw();
    this.setSize(width, height);
    this.setInteractive({ useHandCursor: true });
    this.on('pointerover', () => { if (this.enabled) { this.hover = true; this.draw(); } });
    this.on('pointerout', () => { this.hover = false; this.pressedDown = false; this.draw(); });
    this.on('pointerdown', () => { if (this.enabled) { this.pressedDown = true; this.draw(); } });
    this.on('pointerup', () => {
      if (this.enabled && this.pressedDown) { this.pressedDown = false; this.activate(); }
    });
    scene.add.existing(this);
  }

  draw() {
    const { w, h, radius } = this;
    const g = this.bg;
    g.clear();
    const lift = this.pressedDown ? 2 : 0;
    const base = this.enabled ? this.color : 0x5a6b70;
    const c = Phaser.Display.Color.IntegerToColor(base);
    const dark = Phaser.Display.Color.GetColor(c.red * 0.6, c.green * 0.6, c.blue * 0.6);
    const light = Phaser.Display.Color.GetColor(Math.min(255, c.red + 50), Math.min(255, c.green + 50), Math.min(255, c.blue + 50));
    g.fillStyle(dark, 1);
    g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, radius);
    g.fillStyle(this.hover || this.focused ? light : base, 1);
    g.fillRoundedRect(-w / 2, -h / 2 + lift, w, h - 4, radius);
    g.fillStyle(0xffffff, 0.22);
    g.fillRoundedRect(-w / 2 + 8, -h / 2 + 5 + lift, w - 16, Math.min(18, h * 0.28), Math.max(4, radius - 8));
    if (this.selected) {
      g.lineStyle(5, 0xffffff, 1);
      g.strokeRoundedRect(-w / 2, -h / 2 + lift, w, h - 4, radius);
    }
    this.ring.clear();
    if (this.focused) {
      this.ring.lineStyle(5, 0xfff3a0, 1);
      this.ring.strokeRoundedRect(-w / 2 - 7, -h / 2 - 7, w + 14, h + 18, radius + 6);
    }
    if (this.text) this.text.y = lift - 1;
    if (this.icon) this.icon.y = lift - 1;
  }

  setFocused(v) {
    if (this.focused === v) return;
    this.focused = v;
    this.draw();
  }

  setSelected(v) {
    this.selected = v;
    this.draw();
  }

  setEnabled(v) {
    this.enabled = v;
    this.setAlpha(v ? 1 : 0.6);
    this.draw();
    return this;
  }

  isEnabled() {
    return this.enabled && this.visible;
  }

  setLabel(str) {
    this.text?.setText(str);
  }

  setColor(color) {
    this.color = color;
    this.draw();
  }

  activate() {
    if (!this.enabled) return;
    if (this.sound) audio.sfx(this.sound);
    this.scene.tweens.add({ targets: this, scale: { from: 0.94, to: 1 }, duration: 140, ease: 'Back.Out' });
    this.onClick?.(this);
  }
}
