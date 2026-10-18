import { inventory } from './InventoryManager.js';
import { makeText, drawPanel, reducedMotion } from '../ui/helpers.js';
import Button from '../ui/Button.js';
import { FocusGroup, focusManager } from './FocusManager.js';
import { audio } from './AudioManager.js';
import { input } from './InputManager.js';

const TITLES = { item: '¡Nueva herramienta!', crystal: '¡Cristal recuperado!', badge: '¡Nueva insignia!' };

// Celebración al conseguir herramientas, cristales e insignias.
export default class RewardManager {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.queue = Promise.resolve();
  }

  // Otorga y muestra la recompensa. Devuelve una promesa que termina al cerrar.
  give(id) {
    const def = inventory.lookup(id);
    if (!def) return Promise.resolve();
    if (def.kind === 'item') inventory.addItem(id);
    else if (def.kind === 'crystal') inventory.addCrystal(id);
    else inventory.addBadge(id);
    return this.show(id);
  }

  show(id) {
    this.queue = this.queue.then(() => this.display(id));
    return this.queue;
  }

  display(id) {
    const def = inventory.lookup(id);
    if (!def) return Promise.resolve();
    const s = this.scene;
    const { width, height } = s.scale;
    this.active = true;
    s.events.emit('reward', true);
    audio.sfx(def.kind === 'crystal' ? 'crystal' : 'reward');

    const root = s.add.container(0, 0).setDepth(800);
    const veil = s.add.rectangle(width / 2, height / 2, width, height, 0x061a1e, 0.78).setInteractive();
    const rays = s.add.image(width / 2, height / 2 - 70, 'rays').setScale(1.1).setAlpha(0.85).setBlendMode('ADD');
    const iconKey = def.kind === 'crystal' ? `${def.icon}_big` : def.icon;
    const icon = s.add.image(width / 2, height / 2 - 70, iconKey).setScale(0.2);
    const panel = s.add.graphics();
    drawPanel(panel, width / 2 - 360, height / 2 + 40, 720, 210, { fill: 0x10343d, border: 0xf6c945, radius: 26 });
    const title = makeText(s, width / 2, height / 2 + 72, TITLES[def.kind], { size: 26, color: '#f6c945', weight: '800' }).setOrigin(0.5);
    const name = makeText(s, width / 2, height / 2 + 110, def.name, { size: 38, weight: '800' }).setOrigin(0.5);
    const desc = makeText(s, width / 2, height / 2 + 160, input.format(def.description + (def.kind === 'item' && def.usable && def.level === 1 ? ` ${def.usage}` : '')), {
      size: 22, color: '#d8fff6', weight: '600', align: 'center', wrap: 660, scaleWithSetting: true
    }).setOrigin(0.5, 0);
    const burst = s.add.particles(width / 2, height / 2 - 70, 'p_star', {
      speed: { min: 120, max: 360 }, lifespan: 1000, scale: { start: 0.9, end: 0 }, rotate: { min: 0, max: 360 },
      tint: [0xf6c945, 0x6ff7e0, 0xffffff, 0xff8aa8], emitting: false
    });
    const button = new Button(s, width / 2, height / 2 + 300, { label: '¡Genial!', width: 260, height: 70, color: 0xf6c945, size: 30 });
    root.add([veil, rays, icon, panel, title, name, desc, burst, button]);
    root.setAlpha(0);

    s.tweens.add({ targets: root, alpha: 1, duration: 200 });
    s.tweens.add({ targets: icon, scale: def.kind === 'crystal' ? 1.1 : 2.4, duration: reducedMotion() ? 1 : 600, ease: 'Back.Out' });
    if (!reducedMotion()) {
      s.tweens.add({ targets: rays, angle: 360, duration: 12000, repeat: -1 });
      s.tweens.add({ targets: icon, y: icon.y - 10, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay: 600 });
      burst.explode(40);
    }

    const group = new FocusGroup({ confirmActions: ['confirm', 'interact'] });
    group.setItems([button]);
    return new Promise((resolve) => {
      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        focusManager.remove(group);
        s.tweens.add({
          targets: root, alpha: 0, duration: 200,
          onComplete: () => {
            root.destroy();
            this.active = false;
            s.events.emit('reward', false);
            input.clearPressed();
            resolve();
          }
        });
      };
      button.onClick = close;
      // Evita cerrar por accidente con la misma pulsación que lo abrió.
      s.time.delayedCall(450, () => { if (!closed) focusManager.push(group); });
      group.onBack = close;
    });
  }
}
