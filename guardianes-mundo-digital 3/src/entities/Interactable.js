import Phaser from 'phaser';
import { makeText } from '../ui/helpers.js';
import { input } from '../systems/InputManager.js';

// Punto de interacción: muestra un aviso cuando el jugador está cerca.
export default class Interactable {
  constructor(scene, { x, y, radius = 110, label = 'Hablar', promptY = -150, onInteract, enabled = true, id = '' }) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.onInteract = onInteract;
    this.enabled = enabled;
    this.id = id;
    this.near = false;

    this.prompt = scene.add.container(x, y + promptY).setDepth(30).setAlpha(0);
    const key = scene.add.image(0, 0, 'prompt_key').setScale(0.9);
    this.keyText = makeText(scene, 0, -3, 'E', { size: 26, color: '#16303a', weight: '800' }).setOrigin(0.5);
    this.labelText = makeText(scene, 0, 40, label, { size: 20, color: '#ffffff', weight: '800', stroke: '#16303a', strokeThickness: 5 }).setOrigin(0.5);
    this.prompt.add([key, this.keyText, this.labelText]);
    this.bob = scene.tweens.add({ targets: this.prompt, y: this.prompt.y - 8, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  setLabel(label) {
    this.labelText.setText(label);
  }

  setEnabled(v) {
    this.enabled = v;
    if (!v) this.setNear(false);
  }

  distanceTo(player) {
    return Phaser.Math.Distance.Between(player.x, player.y - 50, this.x, this.y);
  }

  setNear(v) {
    if (this.near === v) return;
    this.near = v;
    this.keyText.setText(input.usingKeyboard() ? 'E' : '');
    if (!input.usingKeyboard()) this.keyText.setText('!');
    this.scene.tweens.add({ targets: this.prompt, alpha: v ? 1 : 0, duration: 160 });
  }

  destroy() {
    this.bob?.remove();
    this.prompt.destroy();
  }
}
