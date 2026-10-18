import BaseLevelScene from './BaseLevelScene.js';
import { save } from '../systems/SaveManager.js';
import { quests } from '../systems/QuestManager.js';
import { fadeTo } from '../ui/helpers.js';

const G = 860;

// NIVEL 3 — La Fortaleza de los Secretos (en construcción).
// Aquí se añadirán las misiones 7, 8 y 9 y el paso a EndingScene.
export default class Level3Scene extends BaseLevelScene {
  constructor() {
    super('Level3Scene', 3);
  }

  get worldWidth() { return 2000; }
  get music() { return 'calm'; }

  buildLevel() {
    this.addGround(0, 2000, G);
    this.addCheckpoint(150, G);
    this.addPlatform(600, G - 140, 170);
    this.addOrbArc(620, G - 190, 4, 40, 15);
    this.addDecor('pedestal', 1100, G + 6, { depth: 3 });
    this.addDecor('portal_arch', 1700, G + 8, { depth: 2 });
    this.addInteractable({ x: 1700, y: G - 90, radius: 140, label: 'Volver al mapa', promptY: -150, onInteract: () => fadeTo(this, 'MapScene') });
  }

  refreshObjective() {
    quests.setObjective({ text: 'Próximamente: La Fortaleza de los Secretos', hint: 'Las puertas de la fortaleza aún están cerradas. Vuelve al mapa por el arco.' });
  }

  onStart() {
    if (!save.getFlag('l3_soon')) {
      save.setFlag('l3_soon');
      this.cut(() => this.say('l3_soon'));
    }
  }
}
