import Phaser from 'phaser';
import Button from '../ui/Button.js';
import DialogueManager from '../systems/DialogueManager.js';
import { makeText, drawPanel, fadeTo, reducedMotion } from '../ui/helpers.js';
import { FocusGroup, focusManager } from '../systems/FocusManager.js';
import { quests } from '../systems/QuestManager.js';
import { inventory } from '../systems/InventoryManager.js';
import { audio } from '../systems/AudioManager.js';
import { buildLevelArt, buildAlex } from '../art/index.js';
import { save } from '../systems/SaveManager.js';

// Final: los tres cristales se unen y Conexia recupera su equilibrio.
export default class EndingScene extends Phaser.Scene {
  constructor() {
    super('EndingScene');
  }

  async create() {
    this._leaving = false;
    const { width, height } = this.scale;
    buildLevelArt(this, 3);
    buildAlex(this, save.progress.avatar, 'big', 2.4);
    this.cameras.main.fadeIn(600, 6, 26, 30);
    audio.music('calm');
    this.add.image(0, 0, 'bg_l3_sky').setOrigin(0).setDisplaySize(width, height);
    this.add.tileSprite(0, height - 900 + 160, width, 900, 'bg_l3_far').setOrigin(0);
    const rays = this.add.image(width / 2, 250, 'rays').setScale(1.4).setAlpha(0).setBlendMode('ADD');
    const keys = ['crystal_knowledge_big', 'crystal_protection_big', 'crystal_trust_big'];
    const crystals = keys.map((k, i) => this.add.image(width / 2 + (i - 1) * 300, 260, k).setScale(0.8));
    this.add.sprite(width / 2 - 260, height - 240, 'big_idle_0').setOrigin(0.5, 1).setScale(2 / 2.4).play('big_cheer');
    this.add.image(width / 2 - 120, height - 380, 'bit_happy').setScale(1.6);
    this.add.image(width / 2 + 260, height - 330, 'luma').setScale(1.2);

    this.dialogue = new DialogueManager(this);
    await this.wait(700);
    audio.sfx('crystal');
    await Promise.all(crystals.map((c) => new Promise((r) => this.tweens.add({ targets: c, x: width / 2, y: 240, duration: 1200, ease: 'Cubic.InOut', onComplete: r }))));
    this.cameras.main.flash(600, 255, 250, 220);
    this.tweens.add({ targets: rays, alpha: 0.9, duration: 800 });
    if (!reducedMotion()) this.tweens.add({ targets: rays, angle: 360, duration: 14000, repeat: -1 });
    crystals.forEach((c, i) => c.setScale(1.1 - i * 0.15));
    await this.dialogue.play('ending');
    inventory.addBadge('badge_guardian');
    this.showSummary();
  }

  wait(ms) {
    return new Promise((r) => this.time.delayedCall(ms, r));
  }

  showSummary() {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    drawPanel(g, 140, 50, width - 280, height - 100, { fill: 0x10343d, border: 0xf6c945, radius: 30 });
    makeText(this, width / 2, 100, '¡Eres un Guardián Digital!', { size: 44, weight: '800', color: '#f6c945' }).setOrigin(0.5);
    this.add.image(285, 230, 'badge_guardian').setScale(2.2);
    ['crystal_knowledge', 'crystal_protection', 'crystal_trust'].forEach((k, i) => this.add.image(225 + i * 60, 350, k).setScale(0.8));
    makeText(this, 420, 150, 'Misiones superadas:', { size: 24, weight: '800', color: '#6ff7e0' });
    quests.all.forEach((m, i) => {
      const x = 420 + Math.floor(i / 5) * 360, y = 200 + (i % 5) * 38;
      this.add.image(x + 12, y, 'icon_check').setScale(0.45);
      makeText(this, x + 32, y, `${m.number}. ${m.title}`, { size: 19, weight: '700' }).setOrigin(0, 0.5);
    });
    makeText(this, width / 2, 420, 'La verdadera fuerza de un guardián es reconocer riesgos, protegerse, respetar a los demás y pedir ayuda.', {
      size: 22, weight: '700', color: '#fff3c4', align: 'center', wrap: 860, scaleWithSetting: true
    }).setOrigin(0.5, 0);
    makeText(this, width / 2, height - 170, 'Una iniciativa educativa de Naveguemos Seguros · ChildFund Ecuador', { size: 20, color: '#9fe8da', weight: '700' }).setOrigin(0.5);
    const replay = new Button(this, width / 2 - 170, height - 110, { label: 'Volver a jugar', width: 300, height: 66, color: 0xf6c945, onClick: () => fadeTo(this, 'MapScene') });
    const menu = new Button(this, width / 2 + 170, height - 110, { label: 'Menú principal', width: 300, height: 66, color: 0x9fe8da, onClick: () => fadeTo(this, 'MenuScene') });
    const group = new FocusGroup();
    group.setItems([replay, menu]);
    focusManager.push(group);
    this.events.once('shutdown', () => focusManager.remove(group));
  }
}
