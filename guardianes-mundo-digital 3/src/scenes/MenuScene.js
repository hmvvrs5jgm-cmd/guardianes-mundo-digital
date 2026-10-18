import Phaser from 'phaser';
import Button from '../ui/Button.js';
import { makeText, fadeTo, reducedMotion } from '../ui/helpers.js';
import { FocusGroup, focusManager } from '../systems/FocusManager.js';
import { save } from '../systems/SaveManager.js';
import { audio } from '../systems/AudioManager.js';
import { buildLevelArt, buildAlex } from '../art/index.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this._leaving = false;
    const { width, height } = this.scale;
    buildLevelArt(this, 1);
    buildAlex(this, save.progress.avatar);
    buildAlex(this, save.progress.avatar, 'big', 2.4);
    this.cameras.main.fadeIn(500, 6, 26, 30);
    audio.music('menu');

    // Fondo animado
    this.add.image(0, 0, 'bg_l1_sky').setOrigin(0).setDisplaySize(width, height);
    this.far = this.add.tileSprite(0, height - 900 + 80, width, 900, 'bg_l1_far').setOrigin(0);
    this.mid = this.add.tileSprite(0, height - 900 + 120, width, 900, 'bg_l1_mid').setOrigin(0);
    this.near = this.add.tileSprite(0, height - 900 + 120, width, 900, 'bg_l1_near').setOrigin(0);
    this.add.tileSprite(0, height - 70, width, 64, 'ground_top_l1').setOrigin(0);
    this.add.tileSprite(0, height - 6, width, 64, 'ground_fill_l1').setOrigin(0);
    this.add.particles(0, 0, 'p_glow', {
      x: { min: 0, max: width }, y: { min: 100, max: height - 80 }, lifespan: 4000,
      speedY: { min: -20, max: -5 }, scale: { start: 0.4, end: 0 }, alpha: { start: 0.9, end: 0 },
      tint: [0xf6e27a, 0x7ff5dc], blendMode: 'ADD', frequency: reducedMotion() ? 600 : 140
    });

    // Héroes
    const alex = this.add.sprite(250, height - 56, 'big_idle_0').setOrigin(0.5, 1).setScale(2 / 2.4).play('big_idle');
    const bit = this.add.image(380, height - 300, 'bit_happy').setScale(1.8);
    if (!reducedMotion()) this.tweens.add({ targets: bit, y: bit.y - 18, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.alex = alex;

    // Cristal y título
    const crystal = this.add.image(200, 150, 'crystal_knowledge_big').setScale(0.6);
    const crystal2 = this.add.image(110, 210, 'crystal_protection_big').setScale(0.45);
    const crystal3 = this.add.image(290, 210, 'crystal_trust_big').setScale(0.45);
    if (!reducedMotion()) [crystal, crystal2, crystal3].forEach((c, i) => this.tweens.add({ targets: c, y: c.y - 12, duration: 1500 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.InOut' }));
    const title = makeText(this, width / 2 + 160, 90, 'Guardianes del\nMundo Digital', {
      size: 66, weight: '800', color: '#ffffff', align: 'center', stroke: '#0b2e33', strokeThickness: 12, shadow: true, lineSpacing: -18
    }).setOrigin(0.5, 0);
    const sub = makeText(this, width / 2 + 160, 248, 'La Fortaleza de los Secretos', {
      size: 32, weight: '800', color: '#f6c945', stroke: '#0b2e33', strokeThickness: 8
    }).setOrigin(0.5, 0);
    title.setDepth(2); sub.setDepth(2);

    // Botones
    const hasProgress = save.hasProgress();
    const bx = width / 2 + 160;
    const items = [];
    const add = (label, color, fn, y, w = 380, h = 68, size = 28) => {
      const b = new Button(this, bx, y, { label, width: w, height: h, color, size, onClick: fn });
      items.push(b);
      return b;
    };
    let y = 340;
    if (hasProgress) {
      add('Continuar aventura', 0xf6c945, () => this.continueGame(), y);
      y += 84;
    }
    add('Nueva aventura', hasProgress ? 0x2fd6b5 : 0xf6c945, () => this.newGame(), y);
    y += 84;
    const row = y;
    const opt = new Button(this, bx - 98, row, { label: 'Opciones', width: 184, height: 60, size: 22, color: 0x9fe8da, onClick: () => this.overlay('OptionsScene') });
    const help = new Button(this, bx + 98, row, { label: '¿Necesitas ayuda?', width: 184, height: 60, size: 19, color: 0xff8aa8, onClick: () => this.overlay('HelpScene') });
    items.push(opt, help);
    y += 74;
    const cred = new Button(this, bx - 98, y, { label: 'Créditos', width: 184, height: 52, size: 20, color: 0x9fe8da, onClick: () => this.overlay('HelpScene', { mode: 'credits' }) });
    items.push(cred);
    if (hasProgress) {
      const reset = new Button(this, bx + 98, y, { label: 'Reiniciar progreso', width: 184, height: 52, size: 18, color: 0xff8a65, onClick: () => this.resetProgress() });
      items.push(reset);
    }

    makeText(this, width / 2, height - 30, 'Una iniciativa educativa de Naveguemos Seguros · ChildFund Ecuador', {
      size: 18, color: '#e8fff8', weight: '700', stroke: '#0b2e33', strokeThickness: 5
    }).setOrigin(0.5);

    // Botón de sonido
    const snd = new Button(this, width - 50, 46, { icon: save.settings.muted ? 'icon_mute' : 'icon_sound', width: 64, height: 60, color: 0x1c5560, radius: 22, iconScale: 0.85,
      onClick: () => {
        save.updateSettings({ muted: !save.settings.muted });
        snd.icon.setTexture(save.settings.muted ? 'icon_mute' : 'icon_sound');
        audio.unlock();
      } });
    items.push(snd);

    this.group = new FocusGroup();
    this.group.setItems(items);
    focusManager.push(this.group);
    this.events.once('shutdown', () => focusManager.remove(this.group));
  }

  update(time) {
    this.far.tilePositionX = time * 0.006;
    this.mid.tilePositionX = time * 0.015;
    this.near.tilePositionX = time * 0.03;
  }

  overlay(key, data = {}) {
    this.scene.launch(key, { ...data, onClose: () => {} });
    this.scene.bringToTop(key);
  }

  confirm(opts) {
    return new Promise((resolve) => {
      this.scene.launch('ConfirmScene', { ...opts, onClose: (r) => resolve(!!r) });
      this.scene.bringToTop('ConfirmScene');
    });
  }

  async newGame() {
    if (save.hasProgress()) {
      const ok = await this.confirm({ title: 'Nueva aventura', text: 'Empezar de nuevo borrará tu progreso guardado. ¿Quieres continuar?', yes: 'Empezar', no: 'Cancelar', danger: true });
      if (!ok) return;
    }
    focusManager.remove(this.group);
    fadeTo(this, 'AvatarScene', { fresh: true });
  }

  continueGame() {
    focusManager.remove(this.group);
    fadeTo(this, 'MapScene');
  }

  async resetProgress() {
    const ok = await this.confirm({ title: 'Reiniciar progreso', text: 'Se borrarán tus misiones, herramientas e insignias. Tus opciones de sonido se mantienen.', yes: 'Borrar', no: 'Cancelar', danger: true });
    if (!ok) return;
    save.resetProgress();
    this.scene.restart();
  }
}
