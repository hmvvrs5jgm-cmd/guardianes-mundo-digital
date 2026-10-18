import Phaser from 'phaser';
import DialogueManager from '../systems/DialogueManager.js';
import RewardManager from '../systems/RewardManager.js';
import { quests } from '../systems/QuestManager.js';
import { inventory } from '../systems/InventoryManager.js';
import { input } from '../systems/InputManager.js';
import { save } from '../systems/SaveManager.js';
import { audio } from '../systems/AudioManager.js';
import { FocusGroup, focusManager } from '../systems/FocusManager.js';
import { makeText, drawPanel, reducedMotion } from '../ui/helpers.js';
import Button from '../ui/Button.js';
import { PLAYER } from '../config.js';

// Interfaz superpuesta a los niveles: HUD, controles táctiles,
// diálogos, recompensas, avisos y resumen de nivel.
export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  init(data) {
    this.levelKey = data.levelKey;
    this.levelId = data.levelId;
    this.overlayOpen = false;
    this.hudHidden = false;
  }

  create() {
    this.dialogue = new DialogueManager(this);
    this.reward = new RewardManager(this);
    this.buildHud();
    this.buildTouch();

    const onObjective = (o) => this.setObjective(o);
    const onInv = () => this.refreshCrystals();
    const offSave = save.on((type) => { if (type === 'settings') this.applyTouchVisibility(); });
    quests.on('objective', onObjective);
    inventory.on('change', onInv);
    this.events.once('shutdown', () => {
      quests.off('objective', onObjective);
      inventory.off('change', onInv);
      offSave();
      input.releaseAll();
    });
    if (quests.objective) this.setObjective(quests.objective);
  }

  isBusy() {
    return this.dialogue.active || this.reward.active || this.overlayOpen || !!this.completeOpen;
  }

  // ---------- HUD ----------
  buildHud() {
    const { width } = this.scale;
    this.hud = this.add.container(0, 0).setDepth(100);
    const bar = this.add.graphics();
    drawPanel(bar, 14, 12, 430, 60, { fill: 0x0b2a31, alpha: 0.82, border: 0x2fd6b5, radius: 22, borderWidth: 3, glow: false });
    this.hud.add(bar);

    this.hearts = [];
    for (let i = 0; i < PLAYER.maxHearts; i++) {
      const h = this.add.image(46 + i * 44, 42, 'heart_full').setScale(0.9);
      this.hearts.push(h);
      this.hud.add(h);
    }
    this.crystalSlots = ['crystal_knowledge', 'crystal_protection', 'crystal_trust'].map((key, i) => {
      const slot = this.add.image(200 + i * 42, 42, `${key}_empty`).setScale(0.62);
      this.hud.add(slot);
      return { key, slot };
    });
    this.shardIcons = ['shard_a', 'shard_b', 'shard_c'].map((k, i) => {
      const s = this.add.image(190 + i * 10, 42 - 6 + i * 6, k).setScale(0.4).setVisible(false);
      this.hud.add(s);
      return s;
    });
    const orb = this.add.image(346, 42, 'orb').setScale(1.1);
    this.orbText = makeText(this, 366, 42, '0', { size: 24, weight: '800' }).setOrigin(0, 0.5);
    this.hud.add([orb, this.orbText]);

    // Objetivo
    this.objBox = this.add.container(14, 84);
    this.objBg = this.add.graphics();
    this.objIcon = this.add.image(36, 26, 'icon_target').setScale(0.62);
    this.objText = makeText(this, 64, 26, '', { size: 21, weight: '700', wrap: 520, scaleWithSetting: true }).setOrigin(0, 0.5);
    this.objBox.add([this.objBg, this.objIcon, this.objText]);
    this.objBox.setVisible(false);
    this.hud.add(this.objBox);

    // Botones
    const mk = (x, icon, onClick, label) => {
      const b = new Button(this, x, 44, { icon, width: 64, height: 60, color: 0x1c5560, radius: 22, onClick, iconScale: 0.85 });
      b.setName(label);
      this.hud.add(b);
      return b;
    };
    this.btnHint = mk(width - 206, 'icon_help', () => this.playHint(), 'Pista');
    this.btnBag = mk(width - 128, 'icon_bag', () => this.openOverlay('InventoryScene'), 'Mochila');
    this.btnPause = mk(width - 50, 'icon_pause', () => this.openOverlay('PauseScene'), 'Pausa');

    // Aviso emergente
    this.toastBox = this.add.container(width / 2, -60).setDepth(400);
    this.toastBg = this.add.graphics();
    this.toastIcon = this.add.image(0, 0, 'icon_star').setScale(0.75);
    this.toastText = makeText(this, 0, 0, '', { size: 24, weight: '800', color: '#0b2e33' }).setOrigin(0, 0.5);
    this.toastBox.add([this.toastBg, this.toastIcon, this.toastText]);

    this.refreshCrystals();
  }

  setHearts(n) {
    this.hearts.forEach((h, i) => {
      const full = i < n;
      const was = h.texture.key === 'heart_full';
      h.setTexture(full ? 'heart_full' : 'heart_empty');
      if (was !== full && !reducedMotion()) this.tweens.add({ targets: h, scale: { from: 1.4, to: 0.9 }, duration: 300, ease: 'Back.Out' });
    });
  }

  setOrbs(n, total) {
    this.orbText.setText(total ? `${n}/${total}` : `${n}`);
    if (!reducedMotion()) this.tweens.add({ targets: this.orbText, scale: { from: 1.3, to: 1 }, duration: 200 });
  }

  setShards(count, crystalId = 'crystal_knowledge', keys = ['shard_a', 'shard_b', 'shard_c']) {
    const slotIndex = this.crystalSlots.findIndex((c) => c.key === crystalId);
    const baseX = 190 + Math.max(0, slotIndex) * 42;
    this.shardIcons.forEach((s, i) => {
      s.setTexture(keys[i]).setX(baseX + i * 10);
      s.setVisible(i < count && !inventory.hasCrystal(crystalId));
    });
  }

  refreshCrystals() {
    for (const { key, slot } of this.crystalSlots) slot.setTexture(inventory.hasCrystal(key) ? key : `${key}_empty`);
  }

  setObjective(o) {
    if (!o || !o.text) {
      this.objBox.setVisible(false);
      return;
    }
    this.objText.setText(input.format(o.text));
    const w = Math.min(640, this.objText.width + 86);
    this.objBg.clear();
    drawPanel(this.objBg, 0, 0, w, 52, { fill: 0x0b2a31, alpha: 0.82, border: 0xff8a65, radius: 20, borderWidth: 3, glow: false });
    this.objBox.setVisible(!this.hudHidden);
    if (!reducedMotion()) this.tweens.add({ targets: this.objBox, x: { from: -40, to: 14 }, alpha: { from: 0, to: 1 }, duration: 350, ease: 'Back.Out' });
  }

  playHint() {
    if (this.isBusy()) return;
    const level = this.scene.get(this.levelKey);
    if (level?.isBusy?.()) return;
    const o = quests.objective;
    const t = o?.hint || '¡Explora el bosque y habla con quienes encuentres!';
    this.dialogue.play([{ s: 'bit', e: 'think', t }]);
  }

  setHudVisible(v) {
    this.hudHidden = !v;
    this.hud.setVisible(v);
    this.applyTouchVisibility();
  }

  toast(text, icon = 'icon_star', ms = 2200) {
    this.toastText.setText(text);
    this.toastIcon.setTexture(icon);
    const w = this.toastText.width + 90;
    this.toastBg.clear();
    drawPanel(this.toastBg, -w / 2, -30, w, 60, { fill: 0xfff3c4, border: 0xf6c945, radius: 24, borderWidth: 4, glow: false });
    this.toastIcon.setX(-w / 2 + 34);
    this.toastText.setX(-w / 2 + 62);
    this.tweens.killTweensOf(this.toastBox);
    this.toastBox.y = -60;
    this.tweens.add({ targets: this.toastBox, y: 150, duration: 320, ease: 'Back.Out' });
    this.tweens.add({ targets: this.toastBox, y: -60, duration: 260, delay: ms, ease: 'Sine.In' });
  }

  // ---------- Controles táctiles ----------
  buildTouch() {
    const { width, height } = this.scale;
    this.touch = this.add.container(0, 0).setDepth(90);
    const mk = (x, y, key, action, scale = 1) => {
      const img = this.add.image(x, y, key).setScale(scale).setAlpha(0.8);
      img.setInteractive(new Phaser.Geom.Circle(60, 60, 62), Phaser.Geom.Circle.Contains);
      const down = () => { input.setTouch(action, true); img.setScale(scale * 0.92).setAlpha(1); };
      const up = () => { input.setTouch(action, false); img.setScale(scale).setAlpha(0.8); };
      img.on('pointerdown', down);
      img.on('pointerup', up);
      img.on('pointerout', up);
      img.on('pointerupoutside', up);
      this.touch.add(img);
      return img;
    };
    mk(100, height - 100, 'touch_left', 'left');
    mk(236, height - 100, 'touch_right', 'right');
    mk(width - 100, height - 112, 'touch_jump', 'jump', 1.05);
    this.touchInteract = mk(width - 236, height - 84, 'touch_interact', 'interact', 0.9);
    this.touchTool = mk(width - 120, height - 250, 'touch_tool', 'tool', 0.8);
    this.applyTouchVisibility();
    this.events.on('dialogue', () => this.applyTouchVisibility());
    this.events.on('reward', () => this.applyTouchVisibility());
  }

  applyTouchVisibility() {
    if (!this.touch) return;
    const mode = save.settings.touchControls;
    const want = mode === 'always' || (mode === 'auto' && input.isTouchDevice);
    const blocked = this.hudHidden || this.dialogue?.active || this.reward?.active;
    this.touch.setVisible(want && !blocked);
    this.touchTool.setVisible(inventory.has('lupa'));
  }

  setInteractAvailable(v) {
    if (this.interactAvail === v) return;
    this.interactAvail = v;
    this.tweens.killTweensOf(this.touchInteract);
    this.touchInteract.setScale(0.9);
    if (v && !reducedMotion()) this.tweens.add({ targets: this.touchInteract, scale: 1.02, duration: 420, yoyo: true, repeat: -1 });
    this.touchInteract.setTint(v ? 0xffffff : 0x9aa7aa);
  }

  // ---------- Escenas superpuestas (pausa, mochila, ayuda) ----------
  openOverlay(key, data = {}) {
    if (this.isBusy() || this.scene.isActive(key)) return;
    const level = this.scene.get(this.levelKey);
    if (level?.isBusy?.()) return;
    this.overlayOpen = true;
    input.releaseAll();
    this.scene.pause(this.levelKey);
    this.scene.launch(key, {
      ...data,
      levelKey: this.levelKey,
      onClose: () => {
        this.overlayOpen = false;
        if (this.scene.isPaused(this.levelKey)) this.scene.resume(this.levelKey);
        input.clearPressed();
        this.applyTouchVisibility();
      }
    });
    this.scene.bringToTop(key);
  }

  // ---------- Resumen de nivel ----------
  showLevelComplete({ title, subtitle, skills = [], badge, nextLabel = 'Continuar' }) {
    const { width, height } = this.scale;
    this.completeOpen = true;
    this.setHudVisible(false);
    audio.sfx('reward');
    const root = this.add.container(0, 0).setDepth(700).setAlpha(0);
    const veil = this.add.rectangle(width / 2, height / 2, width, height, 0x061a1e, 0.85).setInteractive();
    const panel = this.add.graphics();
    drawPanel(panel, 140, 50, width - 280, height - 100, { fill: 0x10343d, border: 0xf6c945, radius: 30 });
    const t = makeText(this, width / 2, 100, title, { size: 46, color: '#f6c945', weight: '800' }).setOrigin(0.5);
    const st = makeText(this, width / 2, 150, subtitle, { size: 24, color: '#d8fff6' }).setOrigin(0.5);
    root.add([veil, panel, t, st]);
    if (badge) {
      const b = this.add.image(width / 2 - 360, 270, badge).setScale(2);
      root.add(b);
      if (!reducedMotion()) this.tweens.add({ targets: b, angle: { from: -6, to: 6 }, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
    const head = makeText(this, width / 2 - 250, 200, 'Lo que aprendiste:', { size: 28, color: '#6ff7e0', weight: '800' });
    root.add(head);
    skills.forEach((s, i) => {
      const ic = this.add.image(width / 2 - 230, 268 + i * 64, 'icon_check').setScale(0.7);
      const tx = makeText(this, width / 2 - 196, 268 + i * 64, s, { size: 23, weight: '600', wrap: 620, scaleWithSetting: true }).setOrigin(0, 0.5);
      root.add([ic, tx]);
    });
    const group = new FocusGroup({ confirmActions: ['confirm', 'interact'] });
    return new Promise((resolve) => {
      const done = (v) => {
        focusManager.remove(group);
        this.completeOpen = false;
        resolve(v);
      };
      const next = new Button(this, width / 2 + 170, height - 120, { label: nextLabel, width: 380, height: 74, color: 0xf6c945, size: 26, onClick: () => done('next') });
      const map = new Button(this, width / 2 - 220, height - 120, { label: 'Mapa de mundos', width: 300, height: 74, color: 0x9fe8da, size: 24, onClick: () => done('map') });
      root.add([next, map]);
      group.setItems([next, map]);
      focusManager.push(group);
      this.tweens.add({ targets: root, alpha: 1, duration: 400 });
    });
  }
}
