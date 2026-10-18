import OverlayScene from './OverlayScene.js';
import Button from '../ui/Button.js';
import { makeText } from '../ui/helpers.js';
import { focusManager } from '../systems/FocusManager.js';

// Pausa: el nivel queda detenido hasta continuar.
export default class PauseScene extends OverlayScene {
  constructor() {
    super('PauseScene');
  }

  create() {
    const win = this.buildWindow('Pausa', 560, 600);
    win.add(makeText(this, 0, -205, 'Tu progreso se guarda automáticamente.', { size: 19, color: '#9fe8da' }).setOrigin(0.5));
    const defs = [
      ['Continuar', 0x2fd6b5, () => this.close()],
      ['Opciones', 0x9fe8da, () => this.child('OptionsScene')],
      ['¿Necesitas ayuda?', 0xff8aa8, () => this.child('HelpScene')],
      ['Mapa de mundos', 0x9fe8da, () => this.leave('MapScene')],
      ['Menú principal', 0x9fe8da, () => this.leave('MenuScene')]
    ];
    const buttons = defs.map(([label, color, fn], i) => {
      const b = new Button(this, 0, -130 + i * 86, { label, width: 380, height: 68, color, onClick: fn });
      win.add(b);
      return b;
    });
    this.focus(buttons, buttons[0]);
  }

  child(key) {
    this.scene.launch(key, { onClose: () => {} });
    this.scene.bringToTop(key);
  }

  leave(target) {
    focusManager.remove(this.group);
    const levelKey = this.params.levelKey;
    if (levelKey) this.scene.stop(levelKey);
    this.scene.stop('UIScene');
    this.scene.start(target);
  }
}
