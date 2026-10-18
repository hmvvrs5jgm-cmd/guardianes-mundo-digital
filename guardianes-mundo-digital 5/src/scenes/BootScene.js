import Phaser from 'phaser';
import { EXTERNAL_ASSETS } from '../config.js';
import { save } from '../systems/SaveManager.js';
import { buildCoreArt, buildLevelArt } from '../art/index.js';
import { makeText } from '../ui/helpers.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const { width, height } = this.scale;
    const label = makeText(this, width / 2, height / 2 + 50, 'Preparando Conexia…', { size: 26 }).setOrigin(0.5);
    const bar = this.add.rectangle(width / 2 - 200, height / 2, 0, 14, 0x2fd6b5).setOrigin(0, 0.5);
    this.add.rectangle(width / 2, height / 2, 404, 18).setStrokeStyle(2, 0xffffff, 0.6);
    this.load.on('progress', (v) => { bar.width = 400 * v; });
    this.load.on('loaderror', (file) => {
      // Si un recurso externo falla, el generador procedural lo reemplaza.
      console.warn('No se pudo cargar', file.key);
    });
    for (const a of EXTERNAL_ASSETS) {
      if (a.type === 'image') this.load.image(a.key, a.url);
      else if (a.type === 'audio') this.load.audio(a.key, a.url);
    }
    this.label = label;
  }

  create() {
    buildCoreArt(this, save.progress.avatar);
    buildLevelArt(this, 1);
    this.scene.start('MenuScene');
  }
}
