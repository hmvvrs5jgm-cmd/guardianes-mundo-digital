import Phaser from 'phaser';
import Button from '../ui/Button.js';
import { makeText, drawPanel, fadeTo, reducedMotion } from '../ui/helpers.js';
import { FocusGroup, focusManager } from '../systems/FocusManager.js';
import { save } from '../systems/SaveManager.js';
import { quests } from '../systems/QuestManager.js';
import { inventory } from '../systems/InventoryManager.js';
import { audio } from '../systems/AudioManager.js';
import { LEVELS } from '../config.js';

// Mapa de los tres mundos de Conexia.
export default class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene');
  }

  create() {
    this._leaving = false;
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(400, 6, 26, 30);
    audio.music('menu');
    this.add.image(0, 0, 'bg_l1_sky').setOrigin(0).setDisplaySize(width, height);
    makeText(this, width / 2, 50, 'Mapa de Conexia', { size: 44, weight: '800', stroke: '#0b2e33', strokeThickness: 8 }).setOrigin(0.5);

    const pos = [[250, 290], [640, 230], [1030, 290]];
    const path = this.add.graphics();
    path.lineStyle(6, 0xfff3c4, 0.6);
    for (let i = 0; i < 2; i++) {
      const [x1, y1] = pos[i], [x2, y2] = pos[i + 1];
      for (let t = 0; t < 1; t += 0.08) {
        const x = Phaser.Math.Linear(x1, x2, t), y = Phaser.Math.Linear(y1, y2, t) - Math.sin(t * Math.PI) * 60;
        path.fillStyle(0xfff3c4, 0.7);
        path.fillCircle(x, y, 5);
      }
    }

    const items = [];
    LEVELS.forEach((lvl, i) => {
      const [x, y] = pos[i];
      const unlocked = lvl.id <= save.progress.unlockedLevel;
      const g = this.add.graphics();
      // isla flotante
      g.fillStyle(0x0b2a31, 0.5);
      g.fillEllipse(x, y + 120, 260, 40);
      g.fillStyle(unlocked ? lvl.color : 0x50656a, 1);
      g.fillEllipse(x, y + 20, 280, 80);
      g.fillStyle(0x5c3f2f, 1);
      g.fillTriangle(x - 130, y + 30, x + 130, y + 30, x, y + 130);
      g.fillStyle(unlocked ? 0x57cf6a : 0x6d7f84, 1);
      g.fillEllipse(x, y + 10, 270, 60);
      const deco = [['tree_l1', 0.32, -28], ['portal_arch', 0.36, -30], ['pedestal', 0.55, -14]][i];
      this.add.image(x + 70, y + deco[2] + 20, deco[0]).setOrigin(0.5, 1).setScale(deco[1]).setAlpha(unlocked ? 1 : 0.5);
      const icon = this.add.image(x - 30, y - 50, unlocked ? `${lvl.crystal}_big` : `${lvl.crystal}_empty`).setScale(unlocked ? 0.6 : 1.4);
      if (!inventory.hasCrystal(lvl.crystal) && unlocked) icon.setAlpha(0.55);
      if (unlocked && !reducedMotion()) this.tweens.add({ targets: [icon], y: icon.y - 10, duration: 1400 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      const prog = quests.levelProgress(lvl.id);
      const card = this.add.graphics();
      drawPanel(card, x - 170, y + 140, 340, 130, { fill: 0x10343d, border: unlocked ? lvl.color : 0x50656a, radius: 22 });
      makeText(this, x, y + 166, `Mundo ${lvl.id}`, { size: 20, color: '#9fe8da', weight: '800' }).setOrigin(0.5);
      makeText(this, x, y + 196, lvl.name, { size: 22, weight: '800', align: 'center', wrap: 320 }).setOrigin(0.5);
      makeText(this, x, y + 232, unlocked ? `Misiones: ${prog.done}/${prog.total}` : 'Bloqueado', { size: 19, color: unlocked ? '#f6c945' : '#a8b8bb', weight: '700' }).setOrigin(0.5);
      const b = new Button(this, x, y + 310, {
        label: unlocked ? (save.progress.levelsCompleted.includes(lvl.id) ? 'Volver a jugar' : 'Jugar') : 'Bloqueado',
        width: 240, height: 62, size: 24, color: unlocked ? 0xf6c945 : 0x5a6b70,
        onClick: () => unlocked && this.go(lvl.sceneKey)
      });
      b.setEnabled(unlocked);
      items.push(b);
    });

    const back = new Button(this, 110, 46, { label: 'Menú', icon: 'icon_arrow_left', iconScale: 0.5, width: 160, height: 56, size: 22, color: 0x9fe8da, onClick: () => this.go('MenuScene') });
    items.push(back);
    if (save.progress.levelsCompleted.length === LEVELS.length) {
      const end = new Button(this, width - 160, 46, { label: 'Ver el final', width: 240, height: 56, size: 22, color: 0xf6c945, onClick: () => this.go('EndingScene') });
      items.push(end);
    }
    this.group = new FocusGroup({ onBack: () => this.go('MenuScene') });
    this.group.setItems(items);
    focusManager.push(this.group);
    const current = items[Math.min(save.progress.unlockedLevel, LEVELS.length) - 1];
    this.group.focus(current);
    this.events.once('shutdown', () => focusManager.remove(this.group));
  }

  go(key) {
    focusManager.remove(this.group);
    fadeTo(this, key);
  }
}
