import Phaser from 'phaser';
import { makeText, drawPanel, reducedMotion } from '../ui/helpers.js';

// Bit: compañero robot que sigue al jugador, reacciona y da pistas breves.
export default class Bit extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.sprite = scene.add.image(0, 0, 'bit_neutral');
    this.add(this.sprite);
    this.setDepth(12);
    scene.add.existing(this);
    this.emotion = 'neutral';
    this.vx = 0;
    this.trail = scene.add.particles(0, 0, 'p_glow', {
      lifespan: 500, speed: { min: 5, max: 25 }, angle: { min: 70, max: 110 },
      scale: { start: 0.45, end: 0 }, alpha: { start: 0.5, end: 0 }, tint: [0x6ff7e0, 0xf6c945],
      frequency: reducedMotion() ? 260 : 90, blendMode: 'ADD'
    }).setDepth(11);
    this.trail.startFollow(this, 0, 22);

    this.bubble = scene.add.container(0, 0).setDepth(40).setVisible(false);
    this.bubbleBg = scene.add.graphics();
    this.bubbleText = makeText(scene, 0, 0, '', { size: 20, color: '#16303a', wrap: 260, align: 'center', scaleWithSetting: true }).setOrigin(0.5);
    this.bubble.add([this.bubbleBg, this.bubbleText]);
    this.emote = scene.add.image(0, 0, 'icon_alert').setDepth(41).setVisible(false).setScale(0.7);
  }

  setEmotion(e) {
    if (this.emotion === e) return;
    this.emotion = e;
    this.sprite.setTexture(`bit_${e}`);
  }

  follow(target, time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    const tx = target.x - 62 * (target.facing || 1);
    const ty = target.y - 128 + Math.sin(time / 420) * 7;
    const k = 1 - Math.pow(0.004, dt);
    const nx = Phaser.Math.Linear(this.x, tx, k);
    this.vx = (nx - this.x) / Math.max(dt, 0.001);
    this.x = nx;
    this.y = Phaser.Math.Linear(this.y, ty, k);
    this.sprite.rotation = Phaser.Math.Clamp(this.vx * 0.0006, -0.25, 0.25);
    this.updateBubble();
  }

  // Comentario corto que no detiene el juego.
  say(text, ms = 2600, emotion = 'neutral') {
    this.setEmotion(emotion);
    this.bubbleText.setText(text);
    const w = Math.max(120, this.bubbleText.width + 30);
    const h = this.bubbleText.height + 20;
    this.bubbleBg.clear();
    drawPanel(this.bubbleBg, -w / 2, -h / 2, w, h, { fill: 0xffffff, border: 0x2fd6b5, radius: 16, borderWidth: 3, glow: false });
    this.bubbleBg.fillStyle(0xffffff, 1);
    this.bubbleBg.fillTriangle(-10, h / 2 - 2, 10, h / 2 - 2, 0, h / 2 + 14);
    this.bubbleH = h;
    this.bubble.setVisible(true).setAlpha(0);
    this.scene.tweens.add({ targets: this.bubble, alpha: 1, duration: 160 });
    this.bubbleTimer?.remove();
    this.bubbleTimer = this.scene.time.delayedCall(ms, () => {
      this.scene.tweens.add({ targets: this.bubble, alpha: 0, duration: 200, onComplete: () => this.bubble.setVisible(false) });
      this.setEmotion('neutral');
    });
  }

  updateBubble() {
    if (this.bubble.visible) this.bubble.setPosition(this.x, this.y - 40 - this.bubbleH / 2);
    if (this.emote.visible) this.emote.setPosition(this.x + 22, this.y - 34);
  }

  showAlert(v) {
    if (this.emote.visible === v) return;
    this.emote.setVisible(v);
  }

  destroy(fromScene) {
    this.trail?.destroy();
    this.bubble?.destroy();
    this.emote?.destroy();
    super.destroy(fromScene);
  }
}
