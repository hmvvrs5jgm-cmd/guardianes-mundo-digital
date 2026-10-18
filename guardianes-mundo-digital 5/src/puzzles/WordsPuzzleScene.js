import Phaser from 'phaser';
import PuzzleScene, { Card } from './PuzzleScene.js';
import { quests } from '../systems/QuestManager.js';
import { makeText, drawPanel, reducedMotion } from '../ui/helpers.js';
import Button from '../ui/Button.js';
import { audio } from '../systems/AudioManager.js';

// MISIÓN 6 — Las palabras que pesan: ordenar los pasos ante el ciberacoso
// y elegir mensajes de apoyo para Pío.
export default class WordsPuzzleScene extends PuzzleScene {
  constructor() {
    super('WordsPuzzleScene');
  }

  create() {
    this.d = quests.content('m6');
    this.buildFrame(this.d.title, this.d.instruction, 0x6cc8ff);
    this.next = 0;

    // Escena: Pío bajo la nube de Nubarrón
    const g = this.add.graphics();
    drawPanel(g, 40, 120, 420, 270, { fill: 0x1c3f5a, border: 0x6cc8ff, radius: 20 });
    this.pio = this.add.image(250, 290, 'pio_sad').setScale(1.4);
    this.cloud = this.add.image(250, 175, 'nubarron').setScale(1.2);
    if (!reducedMotion()) this.tweens.add({ targets: this.cloud, x: 270, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.rain = this.time.addEvent({
      delay: reducedMotion() ? 1400 : 650, loop: true, callback: () => {
        const b = this.add.image(Phaser.Math.Between(150, 350), 205, 'msg_bubble').setScale(0.7);
        this.tweens.add({ targets: b, y: 260, alpha: 0, duration: 1200, onComplete: () => b.destroy() });
      }
    });
    makeText(this, 250, 365, this.d.situation, { size: 16, weight: '600', color: '#d8f0ff', align: 'center', wrap: 390 }).setOrigin(0.5);

    // Ranuras numeradas
    this.slots = this.d.steps.map((s, i) => {
      const x = 590 + i * 180, y = 250;
      const sg = this.add.graphics();
      sg.lineStyle(3, 0xffffff, 0.6);
      sg.strokeRoundedRect(x - 82, y - 66, 164, 132, 16);
      const n = makeText(this, x, y - 86, `${i + 1}`, { size: 28, weight: '800', color: '#f6c945' }).setOrigin(0.5);
      return { x, y, sg, n };
    });

    const order = Phaser.Utils.Array.Shuffle(this.d.steps.map((s, i) => i));
    this.cards = order.map((idx, k) => {
      const c = new Card(this, 165 + k * 316, 486, { width: 300, height: 92, text: this.d.steps[idx].text, size: 19, fill: 0xfff6dc, onClick: (card) => this.pick(idx, card) });
      return c;
    });
    this.feedback('¿Qué conviene hacer primero? Toca la tarjeta del paso 1.', 'info');
    this.activateFocus(this.cards, this.cards[0]);
  }

  pick(idx, card) {
    if (card.done) return;
    if (idx !== this.next) {
      card.setState({ fill: 0xdde4f7, border: 0x6c8cff });
      this.shake(card);
      this.feedback(this.d.orderFeedback, 'retry');
      this.time.delayedCall(600, () => card.setState({ fill: 0xfff6dc, border: 0x9fc7c0 }));
      return;
    }
    card.done = true;
    card.setEnabled(false);
    const slot = this.slots[idx];
    this.tweens.add({ targets: card, x: slot.x, y: slot.y, scaleX: 164 / 300, scaleY: 130 / 92, alpha: 0, duration: 350, onComplete: () => card.setVisible(false) });
    const t = makeText(this, slot.x, slot.y, this.d.steps[idx].text, { size: 16, weight: '700', color: '#16303a', align: 'center', wrap: 150 }).setOrigin(0.5);
    const bg = this.add.graphics();
    bg.fillStyle(0xd9f7e6, 1).fillRoundedRect(slot.x - 80, slot.y - 64, 160, 128, 14);
    bg.lineStyle(3, 0x4cd38a, 1).strokeRoundedRect(slot.x - 80, slot.y - 64, 160, 128, 14);
    t.setDepth(1); bg.setDepth(0.5);
    bg.setAlpha(0); t.setAlpha(0);
    this.tweens.add({ targets: [bg, t], alpha: 1, duration: 300, delay: 250 });
    this.feedback(this.d.steps[idx].feedback, 'good');
    this.next += 1;
    if (this.next === this.d.steps.length) this.time.delayedCall(1500, () => this.kindPhase());
    else this.activateFocus(this.cards.filter((c) => !c.done));
  }

  kindPhase() {
    this.instrText.setText(this.d.kindTitle);
    this.cards.forEach((c) => c.destroy());
    this.kindFound = 0;
    this.feedback('¡Ordenaste todos los pasos! Ahora, ¿qué mensajes apoyan a Pío?', 'good');
    this.kindCards = this.d.kind.map((k, i) => {
      const c = new Card(this, 330 + (i % 2) * 620, 450 + Math.floor(i / 2) * 76, { width: 600, height: 66, text: k.text, size: 18, fill: 0xfff6dc, onClick: (card) => this.kind(k, card) });
      return c;
    });
    this.activateFocus(this.kindCards, this.kindCards[0]);
  }

  kind(k, card) {
    if (card.done || this.kindFound >= 2) return;
    if (!k.correct) {
      card.setState({ fill: 0xdde4f7, marker: 'icon_retry', border: 0x6c8cff });
      this.shake(card);
      this.feedback(k.feedback, 'retry');
      return;
    }
    card.done = true;
    card.setState({ fill: 0xd9f7e6, marker: 'icon_check', border: 0x4cd38a });
    card.setEnabled(false); card.setAlpha(1);
    this.kindFound += 1;
    // un mensaje amable viaja hacia Pío
    const b = this.add.image(card.x, card.y, 'kind_bubble');
    this.tweens.add({ targets: b, x: 250, y: 260, scale: 1.3, duration: 700, ease: 'Sine.InOut', onComplete: () => { audio.sfx('orb'); b.destroy(); } });
    this.feedback(k.feedback, 'good');
    if (this.kindFound === 2) this.time.delayedCall(900, () => this.end());
  }

  end() {
    this.rain.remove();
    this.pio.setTexture('pio_happy');
    this.tweens.killTweensOf(this.cloud);
    this.tweens.add({ targets: this.cloud, y: 150, scale: 0.6, alpha: 0, duration: 1200 });
    if (!reducedMotion()) this.tweens.add({ targets: this.pio, y: 270, duration: 300, yoyo: true, repeat: 2 });
    this.celebrate(250, 290);
    this.feedback(this.d.summary, 'good');
    const done = new Button(this, 1085, 52, { label: '¡Listo!', width: 220, height: 60, color: 0xf6c945, size: 24, onClick: () => this.finish(true) });
    this.exitBtn.setVisible(false);
    this.activateFocus([done], done);
  }
}
