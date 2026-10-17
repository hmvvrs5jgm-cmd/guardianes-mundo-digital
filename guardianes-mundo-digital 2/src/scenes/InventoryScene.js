import OverlayScene from './OverlayScene.js';
import Button from '../ui/Button.js';
import { makeText, drawPanel } from '../ui/helpers.js';
import { inventory } from '../systems/InventoryManager.js';
import { input } from '../systems/InputManager.js';
import { Card } from '../puzzles/PuzzleScene.js';

// Mochila: herramientas, cristales e insignias con su descripción.
export default class InventoryScene extends OverlayScene {
  constructor() {
    super('InventoryScene');
  }

  create() {
    const win = this.buildWindow('Mochila del Guardián', 1100, 660, 0xf6c945);
    const slots = [];
    const section = (title, y) => win.add(makeText(this, -510, y, title, { size: 24, weight: '800', color: '#9fe8da' }).setOrigin(0, 0.5));
    const slot = (x, y, owned, icon, def) => {
      const c = new Card(this, x, y, { width: 96, height: 96, text: '', fill: owned ? 0x1c5560 : 0x0b2a31, onClick: () => this.describe(def, owned) });
      c.border = owned ? 0x2fd6b5 : 0x3c5a60;
      c.draw();
      c.add(this.add.image(0, 0, owned ? icon : 'item_locked').setScale(owned ? 1.15 : 0.9));
      win.add(c);
      slots.push(c);
      return c;
    };
    section('Herramientas', -230);
    inventory.allItems().forEach((it, i) => slot(-440 + i * 112, -168, inventory.has(it.id), it.icon, it));
    section('Cristales', -90);
    inventory.allCrystals().forEach((c, i) => slot(-440 + i * 112, -28, inventory.hasCrystal(c.id), c.icon, c));
    section('Insignias', 50);
    inventory.allBadges().forEach((b, i) => slot(-440 + i * 112, 112, inventory.hasBadge(b.id), b.icon, b));

    const g = this.add.graphics();
    drawPanel(g, -510, 176, 1020, 98, { fill: 0x0b2a31, border: 0x2fd6b5, radius: 18, borderWidth: 3, glow: false });
    win.add(g);
    this.descTitle = makeText(this, -488, 200, 'Toca un objeto para ver qué hace.', { size: 23, weight: '800', color: '#f6c945' }).setOrigin(0, 0.5);
    this.descText = makeText(this, -488, 238, '', { size: 19, weight: '600', wrap: 970, scaleWithSetting: true }).setOrigin(0, 0.5);
    win.add([this.descTitle, this.descText]);

    const close = new Button(this, 440, -282, { label: 'Cerrar', width: 160, height: 54, size: 22, color: 0x9fe8da, onClick: () => this.close() });
    win.add(close);
    this.focus([...slots, close], slots[0]);
    this.group.columns = 0;
    this.input.keyboard?.on('keydown-I', () => this.close());
  }

  describe(def, owned) {
    if (!owned) {
      this.descTitle.setText('Aún no lo encuentras');
      this.descText.setText('Sigue explorando Conexia para descubrirlo.');
      return;
    }
    this.descTitle.setText(def.name);
    const extra = def.usage && def.level === 1 ? ` ${def.usage}` : '';
    this.descText.setText(input.format(def.description + extra));
  }
}
