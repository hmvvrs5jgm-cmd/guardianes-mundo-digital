import Phaser from 'phaser';
import Button from '../ui/Button.js';
import { makeText, drawPanel, fadeTo, reducedMotion } from '../ui/helpers.js';
import { FocusGroup, focusManager } from '../systems/FocusManager.js';
import { audio } from '../systems/AudioManager.js';

const SLIDES = [
  'En Conexia, un mundo de bosques luminosos, islas flotantes y portales mágicos, todo estaba protegido por el Cristal de la Confianza.',
  'Pero los engaños, los mensajes hirientes y las trampas digitales causaron un gran desequilibrio...',
  '¡El cristal se partió! Sus tres fragmentos se dispersaron por tres mundos: Conocimiento, Protección y Confianza.',
  'Ahora tú eres un Guardián Digital. Con la ayuda de Bit recuperarás los cristales y activarás la Fortaleza de los Secretos.'
];

// Introducción narrativa breve con ilustraciones animadas.
export default class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create() {
    this._leaving = false;
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(500, 6, 26, 30);
    audio.music('calm');
    this.add.image(0, 0, 'bg_l1_sky').setOrigin(0).setDisplaySize(width, height);
    this.add.tileSprite(0, height - 900 + 120, width, 900, 'bg_l1_far').setOrigin(0);
    this.stage = this.add.container(0, 0);

    const g = this.add.graphics();
    drawPanel(g, 80, height - 210, width - 160, 150, { fill: 0x0f2f38, border: 0x2fd6b5, radius: 26 });
    this.text = makeText(this, 120, height - 135, '', { size: 28, weight: '700', wrap: width - 520, scaleWithSetting: true }).setOrigin(0, 0.5);
    this.dots = this.add.graphics();

    this.next = new Button(this, width - 220, height - 135, { label: 'Siguiente', icon: 'icon_arrow_right', iconScale: 0.6, width: 220, height: 70, color: 0xf6c945, onClick: () => this.advance() });
    const skip = new Button(this, width - 90, 46, { label: 'Saltar', width: 140, height: 54, size: 22, color: 0x9fe8da, onClick: () => this.finish() });
    this.group = new FocusGroup({ onBack: () => this.finish(), confirmActions: ['confirm', 'interact'] });
    this.group.setItems([this.next, skip]);
    focusManager.push(this.group);
    this.events.once('shutdown', () => focusManager.remove(this.group));

    this.index = -1;
    this.advance();
  }

  advance() {
    this.index += 1;
    if (this.index >= SLIDES.length) return this.finish();
    if (this.index === SLIDES.length - 1) this.next.setLabel('¡Vamos!');
    this.text.setText(SLIDES[this.index]);
    this.text.setAlpha(0);
    this.tweens.add({ targets: this.text, alpha: 1, duration: 400 });
    const { width } = this.scale;
    this.dots.clear();
    SLIDES.forEach((_, i) => {
      this.dots.fillStyle(i === this.index ? 0xf6c945 : 0x5a7b80, 1);
      this.dots.fillCircle(width / 2 - 45 + i * 30, this.scale.height - 36, 8);
    });
    this.illustrate(this.index);
  }

  illustrate(i) {
    const { width } = this.scale;
    const cx = width / 2, cy = 260;
    const rm = reducedMotion();
    this.stage.removeAll(true);
    const add = (o) => { this.stage.add(o); return o; };
    if (i === 0) {
      const rays = add(this.add.image(cx, cy, 'rays').setScale(0.9).setAlpha(0.7).setBlendMode('ADD'));
      if (!rm) this.tweens.add({ targets: rays, angle: 360, duration: 16000, repeat: -1 });
      ['crystal_protection_big', 'crystal_knowledge_big', 'crystal_trust_big'].forEach((k, j) => {
        const c = add(this.add.image(cx + (j - 1) * 34, cy + Math.abs(j - 1) * 14, k).setScale(j === 1 ? 1.2 : 0.95));
        if (!rm) this.tweens.add({ targets: c, y: c.y - 14, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      });
      add(this.add.image(cx - 380, cy + 120, 'tree_l1').setScale(0.6));
      add(this.add.image(cx + 380, cy + 120, 'tree_messenger').setScale(0.5));
    } else if (i === 1) {
      const c = add(this.add.image(cx, cy - 10, 'crystal_knowledge_big').setScale(1).setTint(0xb8a6ff));
      if (!rm) this.tweens.add({ targets: c, angle: { from: -5, to: 5 }, duration: 120, yoyo: true, repeat: -1 });
      const villains = [['glitch_0', cx - 330, 1.8], ['eco', cx + 330, 1.5], ['nubarron', cx, 1.3]];
      villains.forEach(([k, x, s], j) => {
        const v = add(this.add.image(x, j === 2 ? cy - 160 : cy + 30, k).setScale(s).setAlpha(0));
        this.tweens.add({ targets: v, alpha: 1, duration: 500, delay: 200 + j * 250 });
        if (!rm) this.tweens.add({ targets: v, y: v.y - 12, duration: 1000 + j * 150, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      });
      add(makeText(this, cx - 330, cy + 110, 'Glitch', { size: 24, weight: '800', color: '#d9c2ff' }).setOrigin(0.5));
      add(makeText(this, cx + 330, cy + 110, 'Eco', { size: 24, weight: '800', color: '#ffb3ec' }).setOrigin(0.5));
      add(makeText(this, cx + 100, cy - 160, 'Nubarrón', { size: 24, weight: '800', color: '#c7d6ea' }).setOrigin(0, 0.5));
    } else if (i === 2) {
      const names = [['crystal_knowledge_big', 'Conocimiento'], ['crystal_protection_big', 'Protección'], ['crystal_trust_big', 'Confianza']];
      if (!rm) this.cameras.main.flash(300, 255, 255, 255);
      audio.sfx('crystal');
      names.forEach(([k, n], j) => {
        const c = add(this.add.image(cx, cy, k).setScale(0.3));
        const tx = cx + (j - 1) * 340;
        this.tweens.add({ targets: c, x: tx, y: cy - 20, scale: 0.9, angle: 360, duration: 900, ease: 'Cubic.Out' });
        const t = add(makeText(this, tx, cy + 90, n, { size: 28, weight: '800', color: '#f6c945', stroke: '#0b2e33', strokeThickness: 6 }).setOrigin(0.5).setAlpha(0));
        this.tweens.add({ targets: t, alpha: 1, delay: 700, duration: 400 });
      });
    } else {
      const a = add(this.add.sprite(cx - 80, cy + 140, 'big_idle_0').setOrigin(0.5, 1).play('big_cheer'));
      const b = add(this.add.image(cx + 90, cy - 30, 'bit_happy').setScale(2));
      if (!rm) this.tweens.add({ targets: b, y: b.y - 16, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      add(this.add.image(cx + 300, cy, 'crystal_knowledge').setScale(1.4));
      add(this.add.image(cx + 380, cy + 40, 'crystal_protection').setScale(1.2));
      add(this.add.image(cx + 460, cy, 'crystal_trust').setScale(1.4));
      void a;
    }
  }

  finish() {
    focusManager.remove(this.group);
    fadeTo(this, 'Level1Scene');
  }
}
