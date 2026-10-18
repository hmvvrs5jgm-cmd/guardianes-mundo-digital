import Phaser from 'phaser';
import { makeText, drawPanel, reducedMotion, textScale } from '../ui/helpers.js';
import Button from '../ui/Button.js';
import { FocusGroup, focusManager } from '../systems/FocusManager.js';
import { audio } from '../systems/AudioManager.js';
import { input } from '../systems/InputManager.js';

const FEEDBACK = {
  info: { border: 0x2fd6b5, emotion: 'neutral' },
  good: { border: 0x4cd38a, emotion: 'happy', icon: 'icon_check' },
  retry: { border: 0x6c8cff, emotion: 'think', icon: 'icon_retry' },
  alert: { border: 0xffb347, emotion: 'surprised', icon: 'icon_alert' }
};

// Base de los acertijos: marco visual, Bit con retroalimentación,
// botón para salir sin perder progreso y navegación por teclado.
export default class PuzzleScene extends Phaser.Scene {
  init(data) {
    this.params = data || {};
    this.finished = false;
  }

  buildFrame(title, instruction, accent = 0x2fd6b5) {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(250, 6, 26, 30);
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0b2e38, 0x0b2e38, 0x14424a, 0x0f3640, 1);
    bg.fillRect(0, 0, width, height);
    // destellos decorativos
    for (let i = 0; i < 40; i++) {
      const s = this.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 'p_star')
        .setScale(Phaser.Math.FloatBetween(0.2, 0.5)).setAlpha(0.25).setTint(i % 2 ? 0x6ff7e0 : 0xf6c945);
      if (!reducedMotion()) this.tweens.add({ targets: s, alpha: 0.05, duration: Phaser.Math.Between(900, 2200), yoyo: true, repeat: -1 });
    }
    const band = this.add.graphics();
    band.fillStyle(accent, 0.18);
    band.fillRect(0, 0, width, 104);
    band.fillStyle(accent, 1);
    band.fillRect(0, 104, width, 4);
    this.titleText = makeText(this, 40, 16, title, { size: 34, weight: '800', color: '#ffffff' });
    this.instrText = makeText(this, 40, 62, instruction, { size: 20, weight: '600', color: '#d8fff6', wrap: width - 300, scaleWithSetting: true });

    this.group = new FocusGroup({ onBack: () => this.exitPuzzle() });
    this.exitBtn = new Button(this, width - 100, 52, { label: 'Salir', icon: 'icon_arrow_left', iconScale: 0.5, width: 150, height: 56, size: 22, color: 0x9fe8da, onClick: () => this.exitPuzzle() });

    // Bit y su globo de retroalimentación
    const fy = height - 112;
    this.fbBg = this.add.graphics();
    this.bitImg = this.add.image(78, fy + 52, 'bit_neutral').setScale(1.6);
    if (!reducedMotion()) this.tweens.add({ targets: this.bitImg, y: this.bitImg.y - 8, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.fbIcon = this.add.image(190, fy + 52, 'icon_check').setScale(0.8).setVisible(false);
    this.fbText = makeText(this, 160, fy + 52, '', { size: 22, weight: '600', color: '#f4fffb', wrap: width - 360, scaleWithSetting: true, lineSpacing: 2 }).setOrigin(0, 0.5);
    this.fbY = fy;
    this.feedback('', 'info');
  }

  feedback(text, kind = 'info') {
    const { width } = this.scale;
    const k = FEEDBACK[kind] || FEEDBACK.info;
    this.fbBg.clear();
    drawPanel(this.fbBg, 136, this.fbY, width - 170, 104, { fill: 0x0f2f38, border: k.border, radius: 22, borderWidth: 4 });
    this.fbBg.fillStyle(0x0f2f38, 1);
    this.fbBg.fillTriangle(138, this.fbY + 40, 138, this.fbY + 66, 116, this.fbY + 54);
    this.bitImg.setTexture(`bit_${k.emotion}`);
    const hasIcon = !!k.icon && !!text;
    this.fbIcon.setVisible(hasIcon);
    if (hasIcon) this.fbIcon.setTexture(k.icon);
    this.fbText.setX(hasIcon ? 222 : 164);
    this.fbText.setWordWrapWidth(width - (hasIcon ? 420 : 360), true);
    this.fbText.setText(input.format(text));
    let s = Math.round(22 * textScale());
    this.fbText.setFontSize(`${s}px`);
    while (this.fbText.height > 94 && s > 15) { s -= 1; this.fbText.setFontSize(`${s}px`); }
    if (text && !reducedMotion()) {
      this.tweens.add({ targets: this.bitImg, scale: { from: 1.85, to: 1.6 }, duration: 300, ease: 'Back.Out' });
    }
    if (kind === 'good') audio.sfx('correct');
    if (kind === 'retry') audio.sfx('retry');
  }

  activateFocus(items, focusItem) {
    this.group.setItems([...items, this.exitBtn]);
    if (!focusManager.stack.includes(this.group)) focusManager.push(this.group);
    if (focusItem) this.group.focus(focusItem);
  }

  shake(target) {
    if (reducedMotion()) return;
    const x = target.x;
    this.tweens.add({ targets: target, x: x + 10, duration: 50, yoyo: true, repeat: 3, onComplete: () => { target.x = x; } });
  }

  celebrate(x, y) {
    const p = this.add.particles(x, y, 'p_star', {
      speed: { min: 80, max: 300 }, lifespan: 900, scale: { start: 0.8, end: 0 },
      tint: [0xf6c945, 0x6ff7e0, 0xffffff, 0xff8aa8], emitting: false, blendMode: 'ADD'
    }).setDepth(100);
    p.explode(reducedMotion() ? 12 : 36);
    this.time.delayedCall(1200, () => p.destroy());
  }

  exitPuzzle() {
    this.finish(false);
  }

  finish(completed) {
    if (this.finished) return;
    this.finished = true;
    focusManager.remove(this.group);
    const done = this.params.onDone;
    this.cameras.main.fadeOut(200, 6, 26, 30);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop();
      done?.({ completed });
    });
  }
}

// Tarjeta seleccionable (texto + ícono) compatible con FocusGroup.
export class Card extends Phaser.GameObjects.Container {
  constructor(scene, x, y, { width, height, text, icon = null, fill = 0xffffff, textColor = '#16303a', size = 21, onClick, align = 'left', label = null }) {
    super(scene, x, y);
    this.w = width;
    this.h = height;
    this.fill = fill;
    this.border = 0x9fc7c0;
    this.focused = false;
    this.enabled = true;
    this.onClick = onClick;
    this.bg = scene.add.graphics();
    this.add(this.bg);
    let tx = -width / 2 + 18;
    if (icon) {
      this.icon = scene.add.image(-width / 2 + 40, 0, icon).setScale(Math.min(1, (height - 14) / 64));
      this.add(this.icon);
      tx = -width / 2 + 78;
    }
    const content = label ? `${label}: ${text}` : text;
    this.text = makeText(scene, align === 'center' ? 0 : tx, 0, content, {
      size, color: textColor, weight: '700', wrap: width - (icon ? 100 : 40) - (align === 'center' ? 0 : 30), align, scaleWithSetting: true
    }).setOrigin(align === 'center' ? 0.5 : 0, 0.5);
    let s = parseInt(this.text.style.fontSize, 10);
    while (this.text.height > height - 10 && s > 13) { s -= 1; this.text.setFontSize(`${s}px`); }
    this.add(this.text);
    this.marker = scene.add.image(width / 2 - 24, -height / 2 + 4, 'icon_check').setScale(0.6).setVisible(false);
    this.add(this.marker);
    this.draw();
    this.setSize(width, height);
    this.setInteractive({ useHandCursor: true });
    this.on('pointerover', () => { this.hover = true; this.draw(); });
    this.on('pointerout', () => { this.hover = false; this.draw(); });
    this.on('pointerup', () => this.activate());
    scene.add.existing(this);
  }

  draw() {
    const { w, h } = this;
    const g = this.bg;
    g.clear();
    g.fillStyle(0x000000, 0.25);
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, 16);
    g.fillStyle(this.fill, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    g.lineStyle(this.focused ? 5 : 3, this.focused ? 0xfff3a0 : this.hover ? 0x2fd6b5 : this.border, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    if (this.selected) {
      g.lineStyle(5, 0xf6c945, 1);
      g.strokeRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 18);
    }
  }

  setState({ fill, border, marker } = {}) {
    if (fill !== undefined) this.fill = fill;
    if (border !== undefined) this.border = border;
    if (marker !== undefined) {
      this.marker.setVisible(!!marker);
      if (marker) this.marker.setTexture(marker);
    }
    this.draw();
  }

  setSelected(v) { this.selected = v; this.draw(); }
  setFocused(v) { this.focused = v; this.draw(); }
  isEnabled() { return this.enabled && this.visible; }
  setEnabled(v) { this.enabled = v; this.setAlpha(v ? 1 : 0.55); }

  activate() {
    if (!this.enabled) return;
    audio.sfx('click');
    this.onClick?.(this);
  }
}
