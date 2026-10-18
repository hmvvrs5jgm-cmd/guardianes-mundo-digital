import PuzzleScene, { Card } from './PuzzleScene.js';
import { quests } from '../systems/QuestManager.js';
import { makeText, drawPanel, reducedMotion } from '../ui/helpers.js';
import Button from '../ui/Button.js';
import { audio } from '../systems/AudioManager.js';

// MISIÓN 3 — El puente de confianza: elegir acciones de protección
// (cada acción correcta es una tabla) y personas adultas de confianza.
export default class BridgePuzzleScene extends PuzzleScene {
  constructor() {
    super('BridgePuzzleScene');
  }

  create() {
    this.d = quests.content('m3');
    this.buildFrame(this.d.title, this.d.instruction, 0xff8a65);
    this.planksPlaced = 0;
    this.adultsFound = 0;
    this.buildScene();
    this.showActions();
    this.feedback('Tiko necesita apoyo. Elige las acciones que lo protegen. ¡No hay prisa!', 'info');
  }

  buildScene() {
    const g = this.add.graphics();
    // orillas
    g.fillStyle(0x2f9a5d, 1);
    g.fillRoundedRect(-20, 300, 420, 60, 18);
    g.fillRoundedRect(880, 300, 420, 60, 18);
    g.fillStyle(0x5c3f2f, 1);
    g.fillRect(0, 330, 400, 30);
    g.fillRect(880, 330, 400, 30);
    this.add.tileSprite(400, 316, 480, 44, 'water').setOrigin(0).setAlpha(0.95);
    this.add.image(410, 300, 'bridge_post').setOrigin(0.5, 1);
    this.add.image(870, 300, 'bridge_post').setOrigin(0.5, 1);

    // ranuras de tablones
    this.slots = [490, 640, 790].map((x) => {
      const s = this.add.graphics();
      s.lineStyle(3, 0xffffff, 0.7);
      s.strokeRoundedRect(x - 70, 290, 140, 22, 6);
      return { x, s };
    });
    // faroles (fase 2)
    this.lanterns = [490, 640, 790].map((x) => {
      const pole = this.add.rectangle(x, 262, 8, 50, 0x7a5236).setStrokeStyle(2, 0x1e2a36);
      const light = this.add.image(x, 232, 'p_glow').setScale(1.2).setTint(0x8aa0a8).setAlpha(0.5);
      pole.setVisible(false); light.setVisible(false);
      return { pole, light };
    });

    this.tiko = this.add.image(310, 304, 'tiko_sad').setOrigin(0.5, 1).setScale(1.2);
    this.add.image(1000, 304, 'pedestal').setOrigin(0.5, 1).setScale(0.6).setAlpha(0.8);

    // globo con la situación
    const bubble = this.add.graphics();
    drawPanel(bubble, 30, 120, 540, 112, { fill: 0xffffff, border: 0xff8a65, radius: 20, borderWidth: 4, glow: false });
    bubble.fillStyle(0xffffff, 1);
    bubble.fillTriangle(280, 228, 320, 228, 300, 252);
    makeText(this, 50, 132, this.d.situation, { size: 18, weight: '700', color: '#16303a', wrap: 500, scaleWithSetting: true });
  }

  showActions() {
    this.cards?.forEach((c) => c.destroy());
    this.cards = this.d.actions.map((a, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const c = new Card(this, 230 + col * 410, 410 + row * 98, { width: 390, height: 86, text: a.text, size: 20, fill: 0xfff6dc, onClick: (card) => this.chooseAction(a, card) });
      return c;
    });
    this.activateFocus(this.cards, this.cards[0]);
  }

  chooseAction(a, card) {
    if (card.done) return;
    if (!a.correct) {
      card.setState({ fill: 0xdde4f7, marker: 'icon_retry', border: 0x6c8cff });
      this.shake(card);
      this.feedback(a.feedback, 'retry');
      return;
    }
    card.done = true;
    card.setState({ fill: 0xd9f7e6, marker: 'icon_check', border: 0x4cd38a });
    card.setEnabled(false);
    card.setAlpha(1);
    const slot = this.slots[this.planksPlaced];
    this.planksPlaced += 1;
    const plank = this.add.image(card.x, card.y, 'plank').setScale(0.5);
    this.tweens.add({ targets: plank, x: slot.x, y: 301, scaleX: 3, scaleY: 1.4, duration: 550, ease: 'Back.Out', onComplete: () => audio.sfx('click') });
    slot.s.clear();
    this.feedback(a.feedback, 'good');
    if (this.planksPlaced === 3) {
      this.time.delayedCall(1300, () => this.showAdults());
    }
  }

  showAdults() {
    this.cards.forEach((c) => this.tweens.add({ targets: c, alpha: 0, duration: 250, onComplete: () => c.destroy() }));
    this.cards = [];
    this.instrText.setText(this.d.adultsQuestion);
    this.feedback('¡El puente tiene sus tres tablas! Ahora encendamos los faroles: ¿quién puede ayudar a Tiko?', 'good');
    this.lanterns.forEach((l) => { l.pole.setVisible(true); l.light.setVisible(true); });
    this.time.delayedCall(300, () => {
      this.cards = this.d.adults.map((a, i) => {
        const row = i < 3 ? 0 : 1;
        const x = row === 0 ? 230 + i * 410 : 435 + (i - 3) * 410;
        const c = new Card(this, x, 410 + row * 98, { width: 390, height: 86, text: a.text, icon: a.icon, size: 19, fill: 0xfff6dc, onClick: (card) => this.chooseAdult(a, card) });
        c.setAlpha(0);
        this.tweens.add({ targets: c, alpha: 1, duration: 300, delay: i * 80 });
        return c;
      });
      this.activateFocus(this.cards, this.cards[0]);
    });
  }

  chooseAdult(a, card) {
    if (card.done) return;
    if (!a.correct) {
      card.setState({ fill: 0xdde4f7, marker: 'icon_retry', border: 0x6c8cff });
      this.shake(card);
      this.feedback(a.feedback, 'retry');
      return;
    }
    card.done = true;
    card.setState({ fill: 0xd9f7e6, marker: 'icon_check', border: 0x4cd38a });
    card.setEnabled(false);
    card.setAlpha(1);
    const l = this.lanterns[this.adultsFound];
    this.adultsFound += 1;
    l.light.setTint(0xfff3a0).setAlpha(1).setBlendMode('ADD');
    this.tweens.add({ targets: l.light, scale: { from: 3, to: 2 }, duration: 500, ease: 'Back.Out' });
    audio.sfx('checkpoint');
    this.feedback(a.feedback, 'good');
    if (this.adultsFound === 3) this.time.delayedCall(1200, () => this.lumaArrives());
  }

  lumaArrives() {
    this.cards.forEach((c) => c.setEnabled(false));
    this.tiko.setTexture('tiko_happy');
    const luma = this.add.image(640, -80, 'luma').setScale(1.1);
    audio.sfx('reveal');
    this.tweens.add({ targets: luma, y: 190, duration: 1200, ease: 'Sine.Out' });
    if (!reducedMotion()) this.tweens.add({ targets: luma, angle: { from: -3, to: 3 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.celebrate(640, 300);
    this.feedback(this.d.lesson, 'info');
    this.tweens.killTweensOf(this.bitImg);
    this.bitImg.setTexture('luma').setScale(0.75);
    const done = new Button(this, 1085, 52, { label: '¡Reconstruir el puente!', width: 300, height: 60, color: 0xf6c945, size: 21, onClick: () => this.finish(true) });
    this.exitBtn.setVisible(false);
    this.activateFocus([done], done);
  }
}
