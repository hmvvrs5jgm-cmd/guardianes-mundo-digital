import BaseLevelScene from './BaseLevelScene.js';
import { save } from '../systems/SaveManager.js';
import { quests } from '../systems/QuestManager.js';
import { fadeTo } from '../ui/helpers.js';

const G = 860;

// NIVEL 2 — El Laberinto de las Trampas (en construcción).
// La escena ya usa el motor común; aquí se añadirán las misiones 4, 5 y 6
// (portal del premio, visitante misterioso y palabras que pesan).
export default class Level2Scene extends BaseLevelScene {
  constructor() {
    super('Level2Scene', 2);
  }

  get worldWidth() { return 2200; }
  get music() { return 'calm'; }

  buildLevel() {
    this.addGround(0, 2200, G);
    this.addCheckpoint(150, G);
    this.addPlatform(520, G - 130, 170);
    this.addPlatform(760, G - 240, 150);
    this.addOrbArc(540, G - 180, 4, 40, 15);
    this.addOrbArc(780, G - 290, 3, 45, 10);
    this.addDecor(`tree_l2`, 1200, G + 14, { depth: -20, scale: 0.9 });
    const glitch = this.add.sprite(1500, G - 200, 'glitch_0').setDepth(5).play('glitch_jitter');
    this.tweens.add({ targets: glitch, y: G - 230, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.addDecor('portal_arch', 1900, G + 8, { depth: 2 });
    const portal = this.add.container(1900, G - 128).setDepth(1).setScale(0.62, 0.86);
    const swirl = this.add.image(0, 0, 'portal_swirl').setBlendMode('ADD');
    portal.add(swirl);
    this.updaters.push((t, d) => { swirl.angle += d * 0.09; });
    this.addInteractable({ x: 1900, y: G - 90, radius: 140, label: 'Volver al mapa', promptY: -150, onInteract: () => fadeTo(this, 'MapScene') });
  }

  refreshObjective() {
    quests.setObjective({ text: 'Próximamente: El Laberinto de las Trampas', hint: 'Este mundo aún se está construyendo. Usa el portal para volver al mapa.' });
  }

  onStart() {
    if (!save.getFlag('l2_soon')) {
      save.setFlag('l2_soon');
      this.cut(() => this.say('l2_soon'));
    }
  }
}
