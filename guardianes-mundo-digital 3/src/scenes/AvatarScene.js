import Phaser from 'phaser';
import Button from '../ui/Button.js';
import { makeText, drawPanel, fadeTo, reducedMotion } from '../ui/helpers.js';
import { FocusGroup, focusManager } from '../systems/FocusManager.js';
import { save, AVATAR_LIMITS } from '../systems/SaveManager.js';
import { buildAlex } from '../art/index.js';
import { OUTFITS, HAIR_STYLES } from '../art/characters.js';

// Personalización de Alex con opciones predeterminadas (sin nombre ni datos).
export default class AvatarScene extends Phaser.Scene {
  constructor() {
    super('AvatarScene');
  }

  create() {
    this._leaving = false;
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(400, 6, 26, 30);
    this.avatar = { ...save.progress.avatar };
    this.add.image(0, 0, 'bg_l1_sky').setOrigin(0).setDisplaySize(width, height);
    this.add.tileSprite(0, height - 900 + 140, width, 900, 'bg_l1_mid').setOrigin(0).setAlpha(0.8);

    makeText(this, width / 2, 44, 'Elige cómo se ve tu guardián', { size: 40, weight: '800', stroke: '#0b2e33', strokeThickness: 8 }).setOrigin(0.5);

    // vista previa
    const g = this.add.graphics();
    drawPanel(g, 90, 110, 420, 520, { fill: 0x10343d, border: 0x2fd6b5, radius: 30 });
    this.add.image(300, 560, 'shadow').setScale(3, 2);
    this.preview = this.add.sprite(300, 580, 'alex_idle_0').setOrigin(0.5, 1);
    this.bit = this.add.image(430, 230, 'bit_happy').setScale(1.4);
    if (!reducedMotion()) this.tweens.add({ targets: this.bit, y: 214, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    makeText(this, 300, 600, 'Alex · Guardián Digital', { size: 24, weight: '800', color: '#f6c945' }).setOrigin(0.5);

    const p2 = this.add.graphics();
    drawPanel(p2, 560, 110, 640, 520, { fill: 0x10343d, border: 0xf6c945, radius: 30 });
    const rows = [
      { key: 'skin', label: 'Tono de piel', max: AVATAR_LIMITS.skin, name: (v) => `${v + 1} de ${AVATAR_LIMITS.skin}` },
      { key: 'hairStyle', label: 'Peinado', max: AVATAR_LIMITS.hairStyle, name: (v) => HAIR_STYLES[v] },
      { key: 'hair', label: 'Color de cabello', max: AVATAR_LIMITS.hair, name: (v) => `${v + 1} de ${AVATAR_LIMITS.hair}` },
      { key: 'outfit', label: 'Traje', max: AVATAR_LIMITS.outfit, name: (v) => OUTFITS[v].name }
    ];
    const items = [];
    rows.forEach((r, i) => {
      const y = 170 + i * 96;
      makeText(this, 600, y, r.label, { size: 25, weight: '800' }).setOrigin(0, 0.5);
      const value = makeText(this, 1010, y + 40, r.name(this.avatar[r.key]), { size: 22, color: '#9fe8da', weight: '700' }).setOrigin(0.5);
      const change = (d) => {
        this.avatar[r.key] = (this.avatar[r.key] + d + r.max) % r.max;
        value.setText(r.name(this.avatar[r.key]));
        this.refresh();
      };
      const prev = new Button(this, 900, y + 2, { icon: 'icon_arrow_left', width: 70, height: 56, color: 0x2fd6b5, iconScale: 0.7, onClick: () => change(-1) });
      const next = new Button(this, 1120, y + 2, { icon: 'icon_arrow_right', width: 70, height: 56, color: 0x2fd6b5, iconScale: 0.7, onClick: () => change(1) });
      prev.setName(`${r.label} anterior`);
      next.setName(`${r.label} siguiente`);
      items.push(prev, next);
    });
    makeText(this, 880, 548, 'No necesitas escribir tu nombre ni ningún dato personal.', { size: 19, color: '#d8fff6', weight: '600' }).setOrigin(0.5);

    const back = new Button(this, 300, 672, { label: 'Volver', width: 220, height: 62, color: 0x9fe8da, onClick: () => this.leave('MenuScene') });
    const go = new Button(this, 880, 672, { label: '¡Comenzar aventura!', width: 420, height: 70, color: 0xf6c945, size: 30, onClick: () => this.start() });
    items.push(back, go);
    this.group = new FocusGroup({ columns: 2, onBack: () => this.leave('MenuScene') });
    this.group.setItems(items);
    focusManager.push(this.group);
    this.group.focus(go);
    this.events.once('shutdown', () => focusManager.remove(this.group));
    this.refresh();
  }

  refresh() {
    this.preview.stop();
    buildAlex(this, this.avatar, 'prev', 3.6);
    this.preview.play('prev_idle');
    if (!reducedMotion()) this.tweens.add({ targets: this.preview, scaleY: { from: 0.92, to: 1 }, duration: 200, ease: 'Back.Out' });
  }

  leave(key) {
    fadeTo(this, key);
  }

  start() {
    save.newGame(this.avatar);
    buildAlex(this, this.avatar);
    buildAlex(this, this.avatar, 'big', 2.4);
    fadeTo(this, 'IntroScene');
  }
}
